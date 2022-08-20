import Phaser from "phaser";
import cards_png from "../assets/cards.png"
import { setupCardSlots } from "./setup";

class playGame extends Phaser.Scene {
  constructor() {
    super("PlayGame");
  }

  preload() {
    this.load.image("cards", cards_png);
    this.dragOffset = {x: 0, y: 0};
  }

  create() {
    let rot_start = -Math.PI / 4;
    let rot_end = Math.PI / 4;
    for(let col=0; col<3; col++) {
      let x = (705 / 3) * col;
      for(let row=0; row<2; row++) {
        let y = (650 / 2) * row;
        let rot = rot_start + (col + 3 * row) * (rot_end - rot_start) / 5;
        let x_off = 150 * Math.cos(rot - Math.PI/2);
        let y_off = 200 + 150 * Math.sin(rot - Math.PI/2);
        let obj = this.add.tileSprite(x_off + this.game.config.width/2, y_off + this.game.config.height/2, 705/3, 650/2, "cards")
          .setTilePosition(x, y)
          .setScale(0.5)
          .setRotation(rot)
          .setInteractive();
        obj.depth = x_off;
      }
    }
    // setupCardSlots();
    // this.add.image(
    //   this.game.config.width * .5,
    //   this.game.config.height * .5,
    //   "cards"
    // ).setInteractive();
    this.input.on('pointerdown', this.startDrag, this);
    this.input.on('pointerup', this.stopDrag);
  }

  startDrag = (pointer, targets) => {
    if(!this.dragObj && (this.dragObj = targets[0])) {
      this.input.on('pointermove', this.doDrag, this);
      this.dragOffset.x = this.dragObj.x - pointer.x;
      this.dragOffset.y = this.dragObj.y - pointer.y;
    }
  }

  doDrag = (pointer) => {
    if(this.dragObj) {
      this.dragObj.x = pointer.x + this.dragOffset.x;
      this.dragObj.y = pointer.y + this.dragOffset.y;
    }
  }

  stopDrag = () => {
    this.input.off('pointermove', this.doDrag, this);
    this.dragObj = undefined;
  }

  update = () => {
    if(this.dragObj) {
      this.dragObj.setRotation(this.dragObj.rotation + Math.PI * 0.01);
    }
  }
}

export default playGame;
