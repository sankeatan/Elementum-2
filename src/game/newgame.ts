import config from '../config';
import ElementumLobby from './scenes/lobby';
import props from './properties';

const cardSheetLayout: [string[],string[]] = [
    ["fire", "lightning", "water"],
    ["nether", "earth", "wand"]
]

function initCards(scene: ElementumLobby): void {
    let rot_start = -Math.PI / 4;
    let rot_end = Math.PI / 4;
    for (let col = 0; col < 3; col++) {
        let x = (705 / 3) * col;
        for (let row = 0; row < 2; row++) {
            let y = (650 / 2) * row;
            let rot = rot_start + (col + 3 * row) * (rot_end - rot_start) / 5;
            let x_off = 150 * Math.cos(rot - Math.PI / 2);
            let y_off = 200 + 150 * Math.sin(rot - Math.PI / 2);
            let cardType = cardSheetLayout[row][col];
            let card = scene.add.
                tileSprite (
                    x_off + config.width / 2,
                    y_off + config.height / 2,
                    705 / 3,
                    650 / 2,
                    "cards"
                )
                .setTilePosition(x, y)
                .setDisplaySize(config.height * .17 * .7159, config.height * .17)
                .setRotation(rot)
                .setInteractive()
                .setName(`card_${cardType}`)
                .setData("card", {type: cardType})

            card.depth = x_off + 200;
        }
    }
}

function initCardSlots(scene: ElementumLobby): void {
    let card_height = config.height * .17
    let card_width = card_height * .7159
    let xstart = config.width * .18
    let xpad = config.width * 0.03
    let ypad = 60
    for (let i = 0; i < 3; i++) {
        let xPos = xstart + (card_width + xpad) * i
        for (const offset_mult of [-1, 1]) {
            let yPos = config.height / 2 + offset_mult * (card_height + ypad) / 2
            let cardSlot = scene.add
                .rectangle(
                    xPos,
                    yPos,
                    card_width,
                    card_height,
                    i == 2 ? 0x0000ff : 0xff0000
                )
                .setRotation(offset_mult == 1 ? 0 : Math.PI)
                .setName(`card_slot_${i}`)
                .setData("cardSlot", {"type": i == 0 ? "attack1" : i == 1 ? "attack2" : "defend"})

            // make only the player's slots interactive
            if(offset_mult == 1) {
                cardSlot.setInteractive();
            }
        }
    }
}

function initElements(scene: ElementumLobby): void {
    for (const params of [
        { name: "player", x: config.width * 3 / 4, y: config.height * 3 / 4, rotation: 0 },
        { name: "enemy", x: config.width * 3 / 4, y: config.height * 1 / 4, rotation: Math.PI }
    ]) {
        let center_distance = config.width * 1 / 8
        let element_radius = config.width * 1 / 19
        let angle_increment = 2 * Math.PI / Object.keys(props.elements).length
        let angle = 0
        for (const data of Object.values(props.elements)) {
            let objName = `element_${params.name}_${data.type}`;
            console.log(objName);
            let element = scene.add
                .circle(
                    center_distance * Math.cos(-Math.PI / 2 + angle + params.rotation) + params.x,
                    center_distance * Math.sin(-Math.PI / 2 + angle + params.rotation) + params.y,
                    element_radius,
                    data.color
                )
                .setRotation(angle)
                .setName(objName)
                .setData("element", data)

            element.depth = 200
            
            for (const positive of Object.values(data.positive)){
                let connection = `element_${params.name}_${positive}`
                let otherElement: Phaser.GameObjects.Shape = scene.children.getByName(connection) as Phaser.GameObjects.Shape;
                if (otherElement){
                    let line = scene.add.line(
                        Math.sqrt(center_distance)/2,
                        Math.sqrt(center_distance)/2,
                        element.x, 
                        element.y,
                        otherElement.x,
                        otherElement.y,
                        0x0000ff,)
                        .setOrigin(0, 0)
                        .setName(`pos_${params.name}_${positive}`)
                        .setLineWidth(3)
                    
                    line.depth=0;
                }
            }

            for (const negative of Object.values(data.negative)){
                let connection = `element_${params.name}_${negative}`
                let otherElement: Phaser.GameObjects.Shape = scene.children.getByName(connection) as Phaser.GameObjects.Shape;
                if (otherElement){
                    scene.add.line(
                        Math.sqrt(center_distance)/2,
                        Math.sqrt(center_distance)/2,
                        element.x, 
                        element.y,
                        otherElement.x,
                        otherElement.y,
                        0xff0000,)
                        .setOrigin(0, 0)
                        .setName(`neg_${params.name}_${negative}`)
                        .setLineWidth(3)
                        .depth=100;
                }
            }

            angle += angle_increment;
        }
    }
}

function addSubmitButton(scene: ElementumLobby): void {
    // add a gray submit button to the bottom middle of the screen
    let x = config.width / 2
    let y = config.height - config.height * 0.1

    let button = scene.add
        .rectangle(
            x,
            y,
            config.width * 1 / 6,
            config.height * 1 / 10,
            0xdddddd
        )
        .setInteractive()
        .setName("submit_button")
        .setData("button", {})

    // add text to the button
    scene.add
        .text(
            x,
            y,
            "Submit",
            {
                fontSize: `${config.height * 1 / 20}px`,
                fontStyle: "bold",
                color: "#223344",
                fontFamily: "Calibri",
            }
        )
        .setOrigin(0.5)
        .setAlign("center")
        .setDepth(button.depth + 1)

    // highlight button on hover
    button.on("pointerover", () => {
        button.setFillStyle(0xeeeeee)
    }).on("pointerout", () => {
        button.setFillStyle(0xdddddd)
    }).on("pointerdown", () => {
        button.setFillStyle(0xcccccc)
    }).on("pointerup", () => {
        button.setFillStyle(0xeeeeee)
            scene.submitAction();
    }).on("pointerupoutside", () => {
        button.setFillStyle(0xdddddd)
    })
}

export default function init(scene: ElementumLobby) {
    initCardSlots(scene)
    initElements(scene)
    initCards(scene)
    addSubmitButton(scene)
}
