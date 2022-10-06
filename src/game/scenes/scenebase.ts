import Phaser from 'phaser';
import { io, Socket } from 'socket.io-client'
import { environment } from '../environment';

export class ElementumSceneBase extends Phaser.Scene {
    socket!: Socket;
    constructor(key: string, socket?: Socket) {
        super(key);
        if(socket == undefined) {
            this.socket = io(environment.serverURL, environment.IoConnectionOptions);
        }

        this.socket.on("loginReply", (data: any) => {
            console.log(data);
            document.cookie = "token=" + data.token;
        });
    }
}
