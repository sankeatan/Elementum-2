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

        this.input.on('pointerdown', this.mouseDown, this);
        this.input.on('pointerup', this.mouseUp, this);
    }

    mouseDown(pointer: { x: number; y: number; }, targets: any[]) {
        let target = targets[0] || null;

        if(target?.getData("card")) {
            this.replaceDragObj(targets[0]);
        }

        if(target?.getData("cardSlot") && target.getData("occupied")) {
            let occupiedComponent = target.getData("occupied");
            this.replaceDragObj(occupiedComponent.card);
            this.dragObj.setRotation(occupiedComponent.rotation);
            target.setData("occupied", null);
        }

        if (this.dragObj) {
            this.dragObj.removeInteractive();
            this.dragOffset.x = this.dragObj.x - pointer.x;
            this.dragOffset.y = this.dragObj.y - pointer.y;
            this.input.on('pointermove', this.drag, this);
        }
    }

    drag(pointer: { x: number; y: number; }) {
        this.dragObj.x = pointer.x + this.dragOffset.x;
        this.dragObj.y = pointer.y + this.dragOffset.y;
    }

    mouseUp(pointer: { x: number; y: number; }, targets: any[]) {
        if(this.dragObj == null) {
            return;
        }

        if(this.dragObj.getData("card")) {
            let dropTarget = targets[0] || null;
            if(dropTarget?.getData("cardSlot") && !dropTarget.getData("occupied")) {
                dropTarget.setData("occupied", {"card": this.dragObj, "rotation": this.dragObj.rotation});
                this.dragObj.setRotation(0);
                this.dragObj.x = dropTarget.x;
                this.dragObj.y = dropTarget.y;
                this.dragObj.removeInteractive();
            }
            else {
                this.dragObj.setInteractive();
            }
        }

        this.replaceDragObj(null);
        this.input.off('pointermove', this.drag, this);
    }

    replaceDragObj(newObj: any) {
        if(this.dragObj) {
        }

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
    }
}

export default playGame;