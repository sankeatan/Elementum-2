import Phaser from 'phaser';
import ElementumBrowser from "./game/scenes/browser";
import ElementumLobby from "./game/scenes/lobby";



const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "phaser",
    scene: [ElementumBrowser, ElementumLobby],
    physics: {
        default: "matter",
        matter: {
            // debug: true
            gravity: { y: 0 }
        }
    }
};

export default config;
