import Phaser from "phaser";
import logoImg from "../assets/logo.png";

class playGame extends Phaser.Scene {
  constructor() {
    super("PlayGame");
  }

  preload() {
    this.load.image("logo", logoImg);
    this.dragOffset = {x: 0, y: 0};
  }

  create() {
    this.add.image(
      this.game.config.width * .5,
      this.game.config.height * .5,
      "dot"
    ).setInteractive();
    this.input.on('pointerdown', this.startDrag, this);
  }

  startDrag(pointer, targets) {
    this.input.off('pointerdown', this.startDrag, this);
    this.dragObj = targets[0];
    if(this.dragObj) {
      this.dragOffset.x = this.dragObj.x - pointer.x;
      this.dragOffset.y = this.dragObj.y - pointer.y;
      this.input.on('pointermove', this.doDrag, this);
      this.input.on('pointerup', this.stopDrag, this);
    }
  }

  doDrag(pointer) {
    this.dragObj.x = pointer.x + this.dragOffset.x;
    this.dragObj.y = pointer.y + this.dragOffset.y;
  }

  stopDrag() {
    this.input.on('pointerdown', this.startDrag, this);
    this.input.off('pointermove', this.doDrag, this);
    this.input.off('pointerup', this.stopDrag, this);
  }
}

export default playGame;
