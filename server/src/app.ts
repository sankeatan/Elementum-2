import { Socket } from 'socket.io'
import shared from '../../shared/shared'
import { performance } from 'perf_hooks';

const sqlite3 = require('sqlite3').verbose();
const path = require('path')
const dbPath = path.resolve(__dirname, '../db/db.sqlite3')
const db = new sqlite3.Database(dbPath)

const Express = require("express")()
const Http = require("http").Server(Express)
const Socketio = require("socket.io")(Http)

interface GameState {
    "player1": shared.ElementCluster,
    "player2": shared.ElementCluster,
}

var mem_db: {[lobby_id: number]: [lobby_id: string]} = {};

function toggleElement(game: GameState, playerSlot: shared.PlayerSlot, cardType: shared.CardType): void {
    try {
        game[playerSlot][cardType] = !game[playerSlot][cardType]
    }
    catch (e) {
        console.error(`Failed to toggle ${playerSlot}: ${cardType}`)
    }
}

function handleErrorReply(socket: Socket, socketEvent: string, err: string | object): void {
    console.log(err);
    if(typeof err === "string") {
        socket.emit("errorReply", {error: err});
    }
    else {
        socket.emit("errorReply", {error: "Unknown error"});
    }
}

function generateToken(player_name, player_id): shared.Token {
    let token_str = "xyzmagicaltoken";

    let date = new Date();
    let now_utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(),
                    date.getUTCDate(), date.getUTCHours(),
                    date.getUTCMinutes() + 15, date.getUTCSeconds());

    let expiration = (new Date(now_utc)).toISOString().slice(0, 19).replace('T', ' ');
    
    return {str: token_str, expiration: expiration, player_name: player_name, player_id: player_id}
}

async function authenticateLogin(player_name: String, password: String): Promise<shared.Token> {
    console.log(player_name, password);
    let token = new Promise<shared.Token>((resolve, reject) => {
        db.all("SELECT player_id FROM players WHERE player_name = ? AND password = ?", [player_name, password], (err, rows) => {
            if (err) {
                console.error(err);
                reject("Database error"); // don't leak internal deatils to client by returning err
            }
            else if(rows.length>0){
                let token = generateToken(player_name, rows[0].player_id);
                resolve(token);
            }
            else {
                console.log("incorrect player_name or password");
                reject("incorrect player_name or password");
            }
        })

    })

    return token;
}

function replyWithLobbiesInfo(socket: Socket): void {
    db.all("SELECT lobby_id, lobby_name, iif(ifnull(player1, 0)=0, 0, 1) + iif(ifnull(player2, 0)=0, 0, 1) 'players', 0 'spectators' FROM lobbies", (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }

        socket.emit("lobbiesInfo", rows);
    })
}

async function refreshToken(auth: {token_str: string, player_id: number}): Promise<shared.Token> {
    return new Promise((resolve, reject) => {
        db.all("SELECT s.player_id, s.expiration, p.player_name from sessions s JOIN players p on p.player_id=s.player_id WHERE s.token_str = ?", [auth.player_id, auth.token_str], (err, rows) => {
            if (err) {
                console.error(err);
                reject("Database error");
            }
            else if(rows.length>0){
                let new_token = generateToken(rows[0].player_name, rows[0].player_id);
                db.run("UPDATE s set s.expiration=date('now', '+30 second') FROM session s WHERE s.player_id=? and s.expiration > date('now', '+30 second')", [auth.player_id], (err) => {
                    if (err) {
                        console.error(err);
                        reject("Database error");
                    }
                    else {
                        db.run("INSERT into sessions (player_id, token_str, expiration) values (?, ?, ?)", [new_token.player_id, new_token.str, new_token.expiration], (err) => {
                            if(err) {
                                console.error(err);
                                reject("Database error");
                            }
                            else {
                                resolve(new_token);
                            }
                        })
                    }
                })
            }
            else {
                console.log("Invalid token");
                reject("Invalid token");
            }
        })
    })
}

async function authenticatePlayer(auth: {token_str: string, player_id: number}): Promise<void> {
    return new Promise((resolve, reject) => {
        db.all("SELECT player_id FROM sessions WHERE token_str = ? AND player_id = ? AND expiration > date('now')", [auth.token_str, auth.player_id], (err, rows) => {
            if (err) {
                console.error(err);
                reject("Database error");
            }
            else if(rows.length>0){
                resolve();
            }
            else {
                console.log("Invalid token");
                reject("Invalid token");
            }
        })
    })
}

async function submitAction(lobby_id: number, player_id: number, action: shared.PlayerAction): Promise<void> {
    return new Promise((resolve, reject) => {
        // query the db to determine which slot the player is in
        db.all("SELECT player1, player2 FROM lobbies WHERE lobby_id = ?", [lobby_id], (err, rows) => {
            if (err) {
                console.error(err);
                reject("Database error");
                return;
            }
            else if(rows.length>0) {
                let playerSlot: shared.PlayerSlot;
                if(rows[0].player1 == player_id) {
                    playerSlot = "player1";
                }
                else if(rows[0].player2 == player_id) {
                    playerSlot = "player2";
                }
                else {
                    reject("Player is not in this lobby");
                    return;
                }

                // store player action in db
                db.run(`UPDATE l set l.${playerSlot}=? from lobbies l WHERE l.lobby_id=?`, [JSON.stringify(action), lobby_id], (err) => {
                    if (err) {
                        console.error(err);
                        reject("Database error");
                        return;
                    }
                    else {
                        resolve();
                    }
                })
            }
            else {
                console.log("Invalid lobby_id");
                reject("Invalid lobby_id");
            }
        })
    })
}

async function updateGameState(lobby_id): Promise<GameState> {
    // get info for lobby_id
    return new Promise<GameState>((resolve, reject) => {
        db.all("SELECT player1_submission, player2_submission, game_state FROM lobbies WHERE lobby_id = ?", [lobby_id], (err, rows) => {
            if (err) {
                console.error(err);
                reject("Database error");
            }
            else if(rows.length>0) {
                let game = JSON.parse(rows[0].game_state);
                let player1_submission = JSON.parse(rows[0].player1_submission);
                let player2_submission = JSON.parse(rows[0].player2_submission);

                toggleElement(game, "player1", player1_submission.defend);
                toggleElement(game, "player2", player1_submission.attack1);
                toggleElement(game, "player2", player1_submission.attack2);

                toggleElement(game, "player2", player2_submission.defend);
                toggleElement(game, "player1", player2_submission.attack1);
                toggleElement(game, "player1", player2_submission.attack2);

                // did somebody win?

                resolve(game);
            }
            else {
                console.log("Invalid lobby_id");
                reject("Invalid lobby_id");
            }
        })
    })
}

Socketio.on("connection", (socket: Socket) => {
    console.log("Client connected");

    socket.on("login", (data: {player_name: string, password: string}) => {
        console.log(data);
        authenticateLogin(data.player_name, data.password).then((token) => {
            console.log(token);
            socket.emit("loginReply", { success: true, token: token })
        }).catch((err) => {
            handleErrorReply(socket, "loginReply", err);
        })      
    })

    socket.on("getLoginStatus", (data: {token_str: string, player_id: string}) => {
        console.log(data);
    })

    socket.on("refreshToken", (data: {token_str: string, player_id: number}) => {
        refreshToken({token_str: data.token_str, player_id: data.player_id})
        .then((token) => {
            console.log(token);
            socket.emit("refreshTokenReply", { success: true, token: token })
        })
        .catch((err) => {
            console.log(err);
            socket.emit("refreshTokenReply", { success: false, error: err })
        })
    })

    socket.on("getLobbiesInfo", () => {
        replyWithLobbiesInfo(socket);
    })

    socket.on("joinLobby", (data: {"lobbyInfo": shared.LobbyInfo}) => {
        if(data.lobbyInfo.lobby_id) {
            socket.join(`${data.lobbyInfo.lobby_id}`);
            console.log(`Joined Lobby: ${data.lobbyInfo.lobby_id}`);
        }
        else {
            console.log(`Did not connect`);
        }
    })

    socket.on("submitAction", (data: {
        "auth": {
            "player_id": number,
            "lobby_id": number,
            "token_str": string,
        },
        "gameAction": shared.PlayerAction,
    }) => {
        // validate the player and the move

        console.log("Received submitAction...")

        authenticatePlayer(data.auth).then(() => {
            console.log("Player authenticated");
            submitAction(data.auth.lobby_id, data.auth.player_id, data.gameAction).then(() => {
                console.log("Action submitted");
            })
            .catch((err) => {
                handleErrorReply(socket, "submitActionReply", err);
            })
        })
        .then(() => {
            socket.emit("submitActionReply", { success: true });
            console.log("Processing complete.");
        })
        .catch((err) => {
            handleErrorReply(socket, "submitActionReply", err);
        })
    })
})

Http.listen(3000, () => {
    console.log("Listening at :3000...");
})
