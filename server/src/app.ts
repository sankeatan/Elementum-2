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

interface Game {
    "player1": shared.ElementCluster,
    "player2": shared.ElementCluster,
}

var mem_db: {[lobby_id: number]: [lobby_id: string]} = {};

function toggleElement(game: Game, playerSlot: shared.PlayerSlot, cardType: shared.CardType): void {
    try {
        game[playerSlot][cardType] = !game[playerSlot][cardType]
    }
    catch (e) {
        console.error(`Failed to toggle ${playerSlot}: ${cardType}`)
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
                reject("database error"); // don't leak internal deatils to client by returning err
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

function updateGameState(lobby_id) {
    // get info for lobby_id
    db.all("SELECT player1_submission, player2_submission, game_state FROM lobbies WHERE lobby_id = ?", [lobby_id], (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }

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
            console.log(err);
            socket.emit("loginReply", { success: false, error: err })
        })      
    })

    socket.on("getLoginStatus", (data: {token_str: string, player_id: string}) => {
        console.log(data);
    })

    socket.on("refreshToken", (data: {token_str: string, player_id: string}) => {
        db.all("SELECT s.player_id, s.expiration, p.player_name from sessions s JOIN players p on p.player_id=s.player_id WHERE s.token_str = ?", [data.player_id, data.token_str], (err, rows) => {
            if (err) {
                console.error(err);
                socket.emit("tokenRefreshReply"); // don't leak internal deatils to client by returning err
            }
            else if(rows.length>0){
                let token = generateToken(rows[0].player_name, rows[0].player_id);
                db.run("UPDATE s set s.expiration=date('now', '+30 second') FROM session s WHERE s.player_id=? and s.expiration > date('now', '+30 second')", [data.player_id], (err) => {
                    if (err) {
                        return
                    }
                    else {
                        db.run("INSERT into sessions (player_id, token_str, expiration) values (?, ?, ?)", [token.player_id, token.str, token.expiration], (err) => {
                            if(err) {
                            }
                            else {
                                socket.emit("tokenRefreshReply", {player_id: token.player_id, player_name: token.player_name, str: token.str, expiration: token.expiration});
                            }
                        })
                    }
                })
            }
            else {
                console.log("incorrect player_name or password");
                socket.emit("tokenRefreshReply");
            }
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
        // validate the player
        console.log("Received submitAction...")
        try {
            db.all("SELECT player_id FROM sessions WHERE player_id = ? AND token_str = ? AND expiration > date('now')", [data.auth.player_id, data.auth.token_str], (err, rows) => {
                if(err) {
                    console.error(err);
                    return;
                }
                else if(rows.length>0) {
                    let action = data.gameAction;
                    // query the db to determine which slot the player is in
                    db.all("SELECT player1, player2 FROM lobbies WHERE lobby_id = ?", [data.auth.lobby_id], (err, rows) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        else if(rows.length>0){
                            let playerSlot: shared.PlayerSlot;
                            if(rows[0].player1 == data.auth.player_id) {
                                playerSlot = "player1";
                            }
                            else if(rows[0].player2 == data.auth.player_id) {
                                playerSlot = "player2";
                            }
                            else {
                                console.log("Player is not in this lobby");
                                return;
                            }

                            // store player action in db
                            db.run(`UPDATE l set l.${playerSlot}=? from lobbies l WHERE l.lobby_id=?`, [JSON.stringify(action), data.auth.lobby_id], (err) => {
                                if (err) {
                                    console.error(err);
                                    return;
                                }
                                else {
                                    // if both player1 and player2 have submitted actions, update the game state
                                    db.all("SELECT player1, player2 FROM lobbies WHERE lobby_id = ?", [data.auth.lobby_id], (err, rows) => {
                                        if (err) {
                                            console.error(err);
                                            return;
                                        }
                                        else if(rows.length>0){
                                            if(rows[0].player1 && rows[0].player2) {
                                                updateGameState(socket, data.auth.lobby_id);
                                            }
                                        }
                                    })
                                }
                            }
                        }
                    })
                }
            })
        }
        catch(e) {
            console.log(e.message)
        }
        finally {
            console.log("Processing complete.")
        }
    })
})

Http.listen(3000, () => {
    console.log("Listening at :3000...");
})
