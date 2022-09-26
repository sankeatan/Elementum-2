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

        this.input.on('pointerdown', this.showData, this);
    }

    update() {
    }

    // mouseDown() {
    //     let target = targets[0] || null;
    //     let target2 = targets[1] || null;
    //     console.log(target);
    //     console.log(target2);
    // }
    
    showData(pointer: { x: number; y: number; }, targets: any[]) {
        if(this.lobbyBrowserWindow == null) {
            return;
        }

        let x = this.lobbyBrowserWindow.x;
        let y = this.lobbyBrowserWindow.y + this.lobbyBrowserWindow.header_height;
        let width = this.lobbyBrowserWindow.width - this.lobbyBrowserWindow.scrollbar_w;
        let height = this.lobbyBrowserWindow.height - this.lobbyBrowserWindow.header_height;

        if(pointer.x >= x && pointer.y >= y && pointer.x <= x + width && pointer.y <= y + height) {
            console.log("inside!");

            let row_height = height / 10;
            let row_num = Math.floor((pointer.y - y) / row_height);
            let index = this.lobbyBrowserWindow.top_row_index + row_num;
            console.log(this.lobbyBrowserWindow.data[index]);
        }
        else {
            console.log("outside");
        }
    }
}

export default ElementumLobbyBrowser;
