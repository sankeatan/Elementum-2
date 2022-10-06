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

type Token = {str: string, expiration: number}

function generateToken(): Token {
    let token_str = "xyzmagicaltoken";

    let expiration = Date.now() + 1000 * 60 * 60 * 0.5; // 30 minutes

    return {str: token_str, expiration: expiration};
}

async function loginAuthentication(username: String, password: String): Promise<Token> {
    console.log(username, password);
    let token = new Promise<Token>((resolve, reject) => {
        db.all("SELECT * FROM players WHERE player_name = ? AND password = ?", [username, password], (err, rows) => {
            if (err) {
                console.error(err);
                reject("database error"); // don't leak internal deatils to client by returning err
            }
            else if(rows.length>0){
                let token = generateToken();
                resolve(token);
            }
            else {
                console.log("incorrect username or password");
                reject("incorrect username or password");
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

    socket.on("login", (data: {username: string, password: string}) => {
        console.log(data);
        loginAuthentication(data.username, data.password).then((token) => {
            console.log(token);
            socket.emit("loginReply", { success: true, token: token })
        }).catch((err) => {
            console.log(err);
            socket.emit("loginReply", { success: false, error: err })
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
