// main menu, settings, lobby mainmenu, etc.
import Phaser, { GameObjects } from "phaser";
import shared from "../../../shared/shared";
import { io, Socket } from 'socket.io-client'
import config from "./../../config";
import Button from "../components/button";
import ElementumLobby from "./lobby";
import browser_bg from "../../assets/openai-bg.png";
import {LobbyBrowserWindow} from "../components/lobbybrowserwindow";

class ElementumLobbyBrowser extends Phaser.Scene {
    constructor() {
        super("ElementumLobbyBrowser");
    }

    preload() {
        this.load.image("browser_bg", browser_bg);
    }

    create() {
        this.add.sprite(0, 0, "browser_bg").setOrigin(0, 0).setDisplaySize(config.width, config.height);

        new Button(100, 50, "Back to Menu", this, ()=>{
            this.scene.start("ElementumMainMenu");
        });

        let lobbyBrowserWindow = new LobbyBrowserWindow(this, [
            "one                        1/2 (0)                        30",
            "two                        1/2 (0)                        30",
            "three                      1/2 (0)                        30",
            "four                       1/2 (0)                        30",
            "five                       1/2 (0)                        30",
            // "six                        1/2 (0)                        30",
            // "seven                      1/2 (0)                        30",
            // "eight                      1/2 (0)                        30",
            // "nine                       1/2 (0)                        30",
            // "ten                        1/2 (0)                        30",
            // "eleven                     1/2 (0)                        30",
            // "twelve                     1/2 (0)                        30",
            // "thirteen                   1/2 (0)                        30",
            // "fourteen                   1/2 (0)                        30",
            // "fifteen                    1/2 (0)                        30",
            // "sixteen                    1/2 (0)                        30",
            // "seventeen                  1/2 (0)                        30",
            // "eighteen                   1/2 (0)                        30",
            // "nineteen                   1/2 (0)                        30",
            // "twenty                     1/2 (0)                        30",
        ]);

        this.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: any, deltaX: number, deltaY: number, deltaZ: number) => {
            let browserBounds = lobbyBrowserWindow.container.getBounds();
            if( pointer.x < browserBounds.left || pointer.x > browserBounds.right ||
                pointer.y < browserBounds.top  || pointer.y > browserBounds.bottom )
            {
                    return
            }
            
            deltaY > 0 ? lobbyBrowserWindow.scroll(1) : lobbyBrowserWindow.scroll(-1);
        } );
    }

    update() {
    }
}

export default ElementumLobbyBrowser;
