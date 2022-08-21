import Phaser, { GameObjects } from "phaser";
import config from "../config";
import cards_png from "../assets/cards.png";
import init from "./setup";

class playGame extends Phaser.Scene {
    dragOffset: { x: number; y: number; } = { x: 0, y: 0 };
    dragObj: any;
    // interactive objects sorted by depth. last always has depth=1000
    depthTracker: {name: string, depth: number}[] = [];

    constructor() {
        super("PlayGame");
    }

    preload() {
        this.load.image("cards", cards_png);
        this.dragOffset = { x: 0, y: 0 };
    }

    create() {


        init(this);

        this.input.on('pointerdown', this.startDrag, this);
        this.input.on('pointerup', this.stopDrag, this);
    }

    startDrag(pointer: { x: number; y: number; }, targets: any[]) {
        this.replaceDragObj(targets[0]);
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
        this.replaceDragObj(null);
        this.input.off('pointermove', this.doDrag, this);
    }

    replaceDragObj(newObj: any) {
        this.dragObj = newObj;

        if(newObj) {
            let maxDepth = 1000;
            let depthLimit = maxDepth;
            let removeIndex = -1;
            for(let i=this.depthTracker.length-1; i>=0; i--) {
                if(this.depthTracker[i].name === newObj.name) {
                    removeIndex = i;
                }
                else if(this.depthTracker[i].depth >= depthLimit) {
                    depthLimit = depthLimit - 1;
                    this.depthTracker[i].depth = depthLimit;
                }
            }

            if(removeIndex >= 0) {
                this.depthTracker.splice(removeIndex, 1);
            }

            newObj.depth = maxDepth;
            this.depthTracker.push(newObj);
        }
    }

    update() {
        if (this.dragObj) {
            this.dragObj.setRotation(this.dragObj.rotation + Math.PI * 0.01);
        }
    }
}

export default playGame;