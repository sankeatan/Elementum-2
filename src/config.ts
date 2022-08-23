import Phaser from 'phaser';
import ElementumMain from "./game/main";



const config = {
    type: Phaser.AUTO,
    parent: "phaser",
    width: 800,
    height: 600,
    scene: ElementumMain,
    physics: {
        default: "matter",
        matter: {
            // debug: true
            gravity: { y: 0 }
        }
    }
};

export default config;
