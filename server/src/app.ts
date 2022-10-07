import { Socket } from 'socket.io'
import shared from '../../shared/shared'

const sqlite3 = require('sqlite3').verbose();
const path = require('path')
const dbPath = path.resolve(__dirname, '../db/db.sqlite3')
const db = new sqlite3.Database(dbPath)

const Express = require("express")()
const Http = require("http").Server(Express)
const Socketio = require("socket.io")(Http)

var game = {
    "player1": new shared.ElementCluster(),
    "player2": new shared.ElementCluster()
}

var mem_db: {[lobby_id: number]: [lobby_name: string]} = {};

function toggleElement(playerSlot: shared.PlayerSlot, cardType: shared.CardType): void {
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
    db.all("SELECT lobby_id, lobby_name, 1 'players', 1 'spectators', 30 'ping' FROM lobbies", (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }

        socket.emit("lobbiesInfo", rows);
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

    socket.on("joinLobby", (data: {lobby_id: number}) => {
        if(data.lobby_id){
        socket.join(`${data.lobby_id}`);
        console.log(`Joined Lobby: ${data.lobby_id}`);
        }
        else {
            console.log(`Did not connect`)
        }
    })

    socket.on("submitAction", (data: {playerSlot: shared.PlayerSlot, playerAction: shared.PlayerAction}) => {
        console.log("Received submitAction...")
        try {
            let enemySlot: shared.PlayerSlot = data.playerSlot == "player1" ? "player2" : "player1"

            toggleElement(data.playerSlot, data.playerAction.defend)
            toggleElement(enemySlot, data.playerAction.attack1)
            toggleElement(enemySlot, data.playerAction.attack2)

            let returnObj = {
                "player": game[data.playerSlot],
                "enemy": game[enemySlot]
            };
            socket.emit("gameUpdate", returnObj)
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
