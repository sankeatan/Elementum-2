// main menu, settings, lobby browser, etc.
import Phaser from "phaser";
import shared from "../../../shared/shared";
import { io, Socket } from 'socket.io-client'
import config from "./../../config";
import Button from "../components/button";
import ElementumLobby from "./lobby";

class ElementumBrowser extends Phaser.Scene {
    constructor() {
        super("ElementumBrowser");
    }

    preload() {
        new Button(200, 200, "Join Lobby", this, ()=>{
            console.log("Join Lobby");
            this.scene.start("ElementumLobby");
        });

        new Button(200, 300, "Create Lobby", this, ()=>{
            console.log("Create Lobby");
        });
    }

    create() {
    }

    update() {
    }
}

export default ElementumBrowser;
