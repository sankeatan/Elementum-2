import Phaser from 'phaser';
import ElementumMainMenu from "./game/scenes/mainmenu";
import ElementumLobby from "./game/scenes/lobby";
import ElementumLobbyBrowser from './game/scenes/lobbybrowser';



const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "phaser",
    scene: [ElementumMainMenu, ElementumLobby, ElementumLobbyBrowser],
    physics: {
        default: "matter",
        matter: {
            // debug: true
            gravity: { y: 0 }
        }
    }
};

export default config;
