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

function getLobbiesInfo(): shared.LobbyInfo[] {
    db.all("SELECT lobby_id, lobby_name FROM lobbies", (err, rows) => {
        if (err) {
            console.error(err);
            return [];
        }

        console.log(rows);
        return rows;
    })

    return [];
}

Socketio.on("connection", (socket: Socket) => {
    console.log("Client connected");

    socket.on("getLobbiesInfo", () => {
        const data = getLobbiesInfo();
        console.log(data);
        socket.emit("lobbiesInfo", data);
    }),

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
