import Phaser, { GameObjects } from "phaser";
import cards_png from "../../assets/cards.png";
import init from "./../newgame";
import shared from "../../../shared/shared";
import { io, Socket } from 'socket.io-client'
import { environment } from "./../environment";
import Button from "../components/button";

class ElementumLobby extends Phaser.Scene {
    dragOffset: { x: number; y: number; } = { x: 0, y: 0 };
    dragObj: any;
    // interactive objects sorted by depth. last always has depth=1000
    depthTracker: {name: string, depth: number}[] = [];
    playerAction: shared.PlayerAction = {
        attack1: null,
        attack2: null,
        defend: null
    };
    socket: Socket;

    constructor() {
        super("ElementumLobby");
        this.socket = io(environment.serverURL, environment.IoConnectionOptions)
    }

    init() {
        this.socket.on("connect_error", (err: any) => {
          console.error(err)
        })
    
        window.addEventListener('beforeunload', () => {
          this.socket.close()
        })

        this.socket.on("gameUpdate", (update: {[key:string]: shared.ElementCluster}) => {
            console.log(update["enemy"]);
            for(const playerStr of ["player", "enemy"]) {
                for(const [elementName, active] of Object.entries(update[playerStr])) {
                    let objName = `element_${playerStr}_${elementName}`
                    let obj = this.children.getByName(objName) as Phaser.GameObjects.Shape;
                    let color = active ? obj?.getData("element").alternateColor : obj?.getData("element").color;
                    obj?.setFillStyle(color);
                }
            }
        })
    }

    preload() {
        this.load.image("cards", cards_png);
        this.dragOffset = { x: 0, y: 0 };
    }

    create() {
        init(this);

        new Button(100, 50, "Back to Menu", this, () => {
            this.scene.start("ElementumMainMenu");
        })

        this.input.on('pointerdown', this.mouseDown, this);
        this.input.on('pointerup', this.mouseUp, this);
    }

    mouseDown(pointer: { x: number; y: number; }, targets: any[]) {
        let target = targets[0] || null;
        console.log(target);

        if(target?.getData("card")) {
            this.replaceDragObj(targets[0]);
        }

        if(target?.getData("cardSlot") && target.getData("occupied")) {
            let occupiedComponent = target.getData("occupied");
            this.replaceDragObj(occupiedComponent.card);
            this.dragObj.setRotation(occupiedComponent.rotation);
            target.setData("occupied", null);

            // reset player action
            let cardSlot = target.getData("cardSlot").type as keyof shared.PlayerAction;
            this.playerAction[cardSlot] = null;
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

            // drop card on card slot
            if(dropTarget?.getData("cardSlot") && !dropTarget.getData("occupied")) {
                dropTarget.setData("occupied", {"card": this.dragObj, "rotation": this.dragObj.rotation});
                this.dragObj.setRotation(0);
                this.dragObj.x = dropTarget.x;
                this.dragObj.y = dropTarget.y;
                this.dragObj.removeInteractive();

                // update player action
                let cardSlot = dropTarget.getData("cardSlot").type as keyof shared.PlayerAction;
                let cardType = this.dragObj.getData("card").type as shared.ElementName;
                this.playerAction[cardSlot] = cardType;
                console.log(this.playerAction);
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
            console.log(newObj.depth);
        }
    }

    update() {
    }
}

export default ElementumLobby;
