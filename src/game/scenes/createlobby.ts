// main menu, settings, lobby mainmenu, etc.
import Phaser, { GameObjects } from "phaser";
import shared from "../../../shared/shared";
import { io, Socket } from 'socket.io-client'
import config from "./../../config";
import Button from "../components/button";
import ElementumLobby from "./lobby";
import browser_bg from "../../assets/openai-bg.png";

class ElementumCreateLobby extends Phaser.Scene {
    constructor() {
        super("ElementumCreateLobby");
    }

    preload() {
        this.load.image("browser_bg", browser_bg);
    }

    create() {
        this.add.sprite(0, 0, "browser_bg").setOrigin(0, 0).setDisplaySize(config.width, config.height);

        new Button(100, 50, "Back to Menu", this, ()=>{
            this.scene.start("ElementumMainMenu");
        });
    }

    update() {
    }
}

export default ElementumCreateLobby;
