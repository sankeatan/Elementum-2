class Button {
    button: Phaser.GameObjects.Text;
    constructor(
        x: number,
        y: number,
        label: string,
        scene: Phaser.Scene,
        callback?: Function
    ) {
        this.button = scene.add.text(x, y, label)
            .setOrigin(0.5)
            .setPadding(10)
            .setStyle({ backgroundColor: '#111' })
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.button.setStyle({ fill: '#f39c12' }))
            .on('pointerout', () => this.button.setStyle({ fill: '#FFF' }));

        if(callback) {
            this.button.on('pointerdown', () => callback())
        }
    }
}

export default Button;