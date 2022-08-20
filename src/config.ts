import Phaser from 'phaser';
import playGame from "./game/main";



const config = {
    type: Phaser.AUTO,
    parent: "phaser",
    width: 800,
    height: 600,
    scene: playGame,
    physics: {
        default: "matter",
        matter: {
            // debug: true
            gravity: { y: 0 }
        }
    }
};

export default config;
