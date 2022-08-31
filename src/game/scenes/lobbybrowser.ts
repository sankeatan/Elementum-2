// main menu, settings, lobby mainmenu, etc.
import Phaser, { GameObjects } from "phaser";
import shared from "../../../shared/shared";
import { io, Socket } from 'socket.io-client'
import config from "./../../config";
import Button from "../components/button";
import ElementumLobby from "./lobby";
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
    
        window.addEventListener('beforeunload', () => {
          this.socket.close()
        })

        // this.lobbyBrowserWindow = new LobbyBrowserWindow(this);

        this.socket.emit("getLobbiesInfo");
    }

    preload() {
        this.load.image("browser_bg", browser_bg);

        this.socket.on("lobbiesInfo", (lobbies: shared.LobbyInfo[]) => {
            console.log("got lobbiesInfo");
            console.log(lobbies);
            this.lobbyBrowserWindow?.set_data(lobbies);
        });
    }

    create() {
        this.add.sprite(0, 0, "browser_bg").setOrigin(0, 0).setDisplaySize(config.width, config.height);

        new Button(100, 50, "Back to Menu", this, ()=>{
            this.scene.start("ElementumMainMenu");
        });

        this.lobbyBrowserWindow = new LobbyBrowserWindow(this);
        // this.lobbyBrowserWindow.set_data( [
        //     {lobbyname: "one", players: Math.floor(((Math.random() * 2)+1)), spectators: 0, ping: 30},
        //     {lobbyname: "two", players: Math.floor(((Math.random() * 2)+1)), spectators: 0, ping: 30},
        //     {lobbyname: "three", players: Math.floor(((Math.random() * 2)+1)), spectators: 0, ping: 30},
        //     {lobbyname: "four", players: Math.floor(((Math.random() * 2)+1)), spectators: 0, ping: 30},
        //     {lobbyname: "five", players: Math.floor(((Math.random() * 2)+1)), spectators: 0, ping: 30},
        //     {lobbyname: "six", players: Math.floor(((Math.random() * 2)+1)), spectators: 0, ping: 30},
        //     {lobbyname: "seven", players: Math.floor(((Math.random() * 2)+1)), spectators: 0, ping: 30},
        //     {lobbyname: "eight", players: Math.floor(((Math.random() * 2)+1)), spectators: 0, ping: 30},
        //     {lobbyname: "nine", players: Math.floor(((Math.random() * 2)+1)), spectators: 0, ping: 30},
        //     {lobbyname: "ten", players: Math.floor(((Math.random() * 2)+1)), spectators: 0, ping: 30},
        //     {lobbyname: "eleven", players: Math.floor(((Math.random() * 2)+1)), spectators: 0, ping: 30},
        //     {lobbyname: "twelve", players: Math.floor(((Math.random() * 2)+1)), spectators: 0, ping: 30},
        //     {lobbyname: "thirteen", players: Math.floor(((Math.random() * 2)+1)), spectators: 0, ping: 30},
        //     {lobbyname: "fourteen", players: Math.floor(((Math.random() * 2)+1)), spectators: 0, ping: 30},
        //     {lobbyname: "fifteen", players: Math.floor(((Math.random() * 2)+1)), spectators: 0, ping: 30},
        //     {lobbyname: "sixteen", players: Math.floor(((Math.random() * 2)+1)), spectators: 0, ping: 30},
        //     {lobbyname: "seventeen", players: Math.floor(((Math.random() * 2)+1)), spectators: 0, ping: 30},
        //     {lobbyname: "eighteen", players: Math.floor(((Math.random() * 2)+1)), spectators: 0, ping: 30},
        //     {lobbyname: "nineteen", players: Math.floor(((Math.random() * 2)+1)), spectators: 0, ping: 30},
        //     {lobbyname: "twenty", players: Math.floor(((Math.random() * 2)+1)), spectators: 0, ping: 30},
        // ]);

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
