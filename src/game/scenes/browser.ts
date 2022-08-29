// main menu, settings, lobby browser, etc.
import Phaser from "phaser";
import shared from "../../../shared/shared";
import { io, Socket } from 'socket.io-client'
import config from "./../../config";
import Button from "../components/button";
import ElementumLobby from "./lobby";
import browser_bg from "../../assets/openai-bg.png";

class ElementumBrowser extends Phaser.Scene {
    constructor() {
        super("ElementumBrowser");
    }

    preload() {
        this.load.image("browser_bg", browser_bg);
    }

    create() {
        this.add.sprite(0, 0, "browser_bg").setOrigin(0, 0).setDisplaySize(config.width, config.height);

        new Button(200, 200, "Join Lobby", this, ()=>{
            console.log("Join Lobby");
            this.scene.start("ElementumLobby");
        });

        new Button(200, 300, "Create Lobby", this, ()=>{
            console.log("Create Lobby");
        });
    }

    update() {
    }
}

export default ElementumBrowser;
