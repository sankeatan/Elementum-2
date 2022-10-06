// main menu, settings, lobby mainmenu, etc.
import Phaser from "phaser";
import shared from "../../../shared/shared";
import { io, Socket } from 'socket.io-client'
import config from "./../../config";
import Button from "../components/button";
import Login from "../components/login";
import ElementumLobby from "./lobby";
import browser_bg from "../../assets/openai-bg.png";
import { ElementumSceneBase } from "./scenebase"


class ElementumMainMenu extends ElementumSceneBase {
    constructor(socket?: Socket) {
        super("ElementumMainMenu", socket);
    }

    preload() {
        this.load.image("browser_bg", browser_bg);
    }

    create() {
        this.add.sprite(0, 0, "browser_bg").setOrigin(0, 0).setDisplaySize(config.width, config.height);
        
        new Login (725, 50, "Login", this)

        new Button(200, 200, "Join Lobby", this, ()=>{
            this.scene.start("ElementumLobbyBrowser");
        });

        new Button(200, 300, "Create Lobby", this, ()=>{
            this.scene.start("ElementumCreateLobby");
        });

        new Button(200, 400, "Demo", this, ()=>{
            this.scene.start("ElementumLobby");
        });
    }

    update() {
    }
}

export default ElementumMainMenu;
