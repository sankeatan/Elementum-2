// main menu, settings, lobby mainmenu, etc.
import Phaser, { GameObjects } from "phaser";
import shared from "../../../shared/shared";
import { io, Socket } from 'socket.io-client'
import config from "./../../config";
import Button from "../components/button";
import browser_bg from "../../assets/openai-bg.png";
import {LobbyBrowserWindow} from "../components/lobbybrowserwindow";
import { environment } from "../environment";

class ElementumLobbyBrowser extends Phaser.Scene {
    socket: Socket;
    lobbyBrowserWindow?: LobbyBrowserWindow;

    constructor() {
        super("ElementumLobbyBrowser");
        this.socket = io(environment.serverURL, environment.IoConnectionOptions)
    }

    init() {
        this.socket.on("connect_error", (err: any) => {
          console.error(err)
        })
    
        window.addEventListener("beforeunload", () => {
          this.socket.close()
        })

        this.socket.emit("getLobbiesInfo");
    }

    preload() {
        this.load.image("browser_bg", browser_bg);

        this.socket.on("lobbiesInfo", (lobbies: shared.LobbyInfo[]) => {
            this.lobbyBrowserWindow?.set_data(lobbies);
        });
    }

    create() {
        this.add.sprite(0, 0, "browser_bg").setOrigin(0, 0).setDisplaySize(config.width, config.height);

        new Button(100, 50, "Back to Menu", this, ()=>{
            this.scene.start("ElementumMainMenu");
        });

        this.lobbyBrowserWindow = new LobbyBrowserWindow(this);

        this.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: any, deltaX: number, deltaY: number, deltaZ: number) => {

            if(this.lobbyBrowserWindow == null) {
                return;
            }

            let browserBounds = this.lobbyBrowserWindow.container.getBounds();

            if( pointer.x < browserBounds.left || pointer.x > browserBounds.right ||
                pointer.y < browserBounds.top  || pointer.y > browserBounds.bottom )
            {
                return
            }
            
            deltaY > 0 ? this.lobbyBrowserWindow.scroll(1) : this.lobbyBrowserWindow.scroll(-1);
        } );
    }

    update() {
    }
}

export default ElementumLobbyBrowser;
