import Phaser from 'phaser';
import config from './config';
import GameScene from './game/main';

new Phaser.Game(
    Object.assign(config, {
        scene: [GameScene]
    })
);
