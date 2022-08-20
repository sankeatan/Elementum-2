import Phaser from "phaser";
import config from "../config";
import cards_png from "../assets/cards.png";
import init from "./setup"

class playGame extends Phaser.Scene {
    dragOffset: { x: number; y: number; } = { x: 0, y: 0 };
    dragObj: any;

    constructor() {
        super("PlayGame");
    }

    preload() {
        this.load.image("cards", cards_png);
        this.dragOffset = { x: 0, y: 0 };
    }

    create() {
        let rot_start = -Math.PI / 4;
        let rot_end = Math.PI / 4;
        for (let col = 0; col < 3; col++) {
            let x = (705 / 3) * col;
            for (let row = 0; row < 2; row++) {
                let y = (650 / 2) * row;
                let rot = rot_start + (col + 3 * row) * (rot_end - rot_start) / 5;
                let x_off = 150 * Math.cos(rot - Math.PI / 2);
                let y_off = 200 + 150 * Math.sin(rot - Math.PI / 2);
                this.add.tileSprite(x_off + config.width / 2, y_off + config.height / 2, 705 / 3, 650 / 2, "cards")
                    .setTilePosition(x, y)
                    .setScale(0.5)
                    .setRotation(rot)
                    .setInteractive()
                    .depth = x_off;
            }
        }

        init(this);

        this.input.on('pointerdown', this.startDrag, this);
        this.input.on('pointerup', this.stopDrag, this);
    }

    startDrag(pointer: { x: number; y: number; }, targets: any[]) {
        this.dragObj = targets[0];
        if (this.dragObj) {
            this.dragOffset.x = this.dragObj.x - pointer.x;
            this.dragOffset.y = this.dragObj.y - pointer.y;
            this.input.on('pointermove', this.doDrag, this);
        }
    }

    doDrag(pointer: { x: number; y: number; }) {
        this.dragObj.x = pointer.x + this.dragOffset.x;
        this.dragObj.y = pointer.y + this.dragOffset.y;
    }

    stopDrag() {
        console.log("test");
        this.dragObj = null;
        this.input.off('pointermove', this.doDrag, this);
    }

    update() {
        if (this.dragObj) {
            this.dragObj.setRotation(this.dragObj.rotation + Math.PI * 0.01);
        }
    }
}

export default playGame;