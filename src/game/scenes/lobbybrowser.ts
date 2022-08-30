// main menu, settings, lobby mainmenu, etc.
import Phaser, { GameObjects } from "phaser";
import shared from "../../../shared/shared";
import { io, Socket } from 'socket.io-client'
import config from "./../../config";
import Button from "../components/button";
import ElementumLobby from "./lobby";
import browser_bg from "../../assets/openai-bg.png";
import {createLobbyBrowserWindow} from "../components/lobbybrowser";

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

        let lobbyBrowserWindow = createLobbyBrowserWindow(this, [
            "one\t\t1/2 (0)",
            "two\t\t1/2 (0)",
            "three\t\t1/2 (0)",
            "four\t\t1/2 (0)",
            "five\t\t1/2 (0)",
            "six\t\t1/2 (0)",
            "seven\t\t1/2 (0)",
            "eight\t\t1/2 (0)",
            "nine\t\t1/2 (0)",
            "ten\t\t1/2 (0)",
            "eleven\t\t1/2 (0)",
            "twelve\t\t1/2 (0)",
            "thirteen\t\t1/2 (0)",
            "fourteen\t\t1/2 (0)",
            "fifteen\t\t1/2 (0)",
            "sixteen\t\t1/2 (0)",
            "seventeen\t\t1/2 (0)",
            "eighteen\t\t1/2 (0)",
            "nineteen\t\t1/2 (0)",
            "twenty\t\t1/2 (0)",
        ]);

        this.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: any, deltaX: number, deltaY: number, deltaZ: number) => {
            if(gameObjects[0]?.name != "lobbyBrowserWindow") {
                return;
            }
            
            deltaY > 0 ? lobbyBrowserWindow.scroll(1) : lobbyBrowserWindow.scroll(-1);
            console.log("scroll")
        } );
    }

    update() {
    }
}

export default ElementumLobbyBrowser;
