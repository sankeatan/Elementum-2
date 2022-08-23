import { Socket } from 'socket.io'
import shared from '../../shared/shared'

const Express = require("express")()
const Http = require("http").Server(Express)
const Socketio = require("socket.io")(Http)

var game = {
    "player1": new shared.ElementCluster(),
    "player2": new shared.ElementCluster()
}

function toggleElement(playerSlot: shared.PlayerSlot, cardType: shared.CardType): void {
    try {
        game[playerSlot][cardType] = !game[playerSlot][cardType]
    }
    catch (e) {
        console.error(`Failed to toggle ${playerSlot}: ${cardType}`)
    }
}

Socketio.on("connection", (socket: Socket) => {
    console.log("Client connected")

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
    console.log("Listening at :3000...")
})
