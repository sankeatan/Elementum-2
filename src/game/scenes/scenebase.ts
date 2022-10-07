import Phaser from 'phaser';
import { io, Socket } from 'socket.io-client'
import { environment } from '../environment';
import shared from '../../../shared/shared';

export class ElementumSceneBase extends Phaser.Scene {
    socket!: Socket;
    refreshTokenTimeoutId: number | null = null;

    getCookie(key: string) {
        var match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
        return match ? match[2] : "";
    }

    getTokenFromCookie(): shared.Token {
        return {
            str: this.getCookie("token_str"),
            expiration: this.getCookie("player_token_exp"),
            player_name: this.getCookie("player_name"),
            player_id: parseInt(this.getCookie("player_id"))
        }
    }

    getLoginStatus(): void{
        this.socket.emit("getLoginStatus", {data: {token_str: this.getCookie("token_str"),  player_token_exp: this.getCookie("player_token_exp")}});
    }

    constructor(key: string, socket?: Socket) {
        super(key);
        if(socket == undefined) {
            this.socket = io(environment.serverURL, environment.IoConnectionOptions);
        }
        else {
            socket.removeAllListeners();
        }

        if(this.refreshTokenTimeoutId == null) {
            this.refreshTokenTimeoutId = window.setInterval(() => {
                this.socket.emit("refreshToken", {data: {player_token: this.getCookie("player_token"),  player_id: this.getCookie("player_id"), player_name: this.getCookie("player_name")}});
            }, 1000 * 60 * 10 /* 10 minutes */);
        }

        this.socket.on("loginReply", (data: {token: shared.Token}) => {
            console.log(data);
            document.cookie = "player_token=" + data.token.str;
            document.cookie = "player_token_exp=" + data.token.expiration;
            document.cookie = "player_name=" + data.token.player_name;
            document.cookie = "player_id=" + data.token.player_id;
        });

        this.socket.on("tokenRefreshReply", (token: {player_id: string, player_name: string, str: string, expiration: string}) => {
            document.cookie = "player_token=" + token.str;
            document.cookie = "player_token_exp=" + token.expiration;
            document.cookie = "player_name=" + token.player_name;
            document.cookie = "player_id=" + token.player_id;
        });

        this.socket.on("lobbiesInfo", (data: shared.LobbyInfo[]) => {
            console.log(data);
        });
    }
}
