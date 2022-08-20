import config from '../config';
import props from './properties';

function initCards(scene: Phaser.Scene): void {
    let center_x = .3 * config.width
    let center_y = 1.1 * config.height
    let radius = 0.1 * Math.sqrt(Math.pow(config.height, 2) + Math.pow(config.width, 2))
    let start_angle = Math.PI * 1 / 4
    let end_angle = -Math.PI * 1 / 4
    let angle_inc = (end_angle - start_angle) / (Object.keys(props.cards).length - 1 - 1) // extra -1 to exclude HIDDEN
    let angle = start_angle
    for (const [cardType, vals] of Object.entries(props.cards)) {
        if (cardType == "HIDDEN") continue
        let x = center_x + radius * Math.cos(angle + Math.PI / 2)
        let y = center_y - radius * Math.sin(angle + Math.PI / 2)
        // let card = new CardEntity(x, y, cardType as CardType, config.playerSlot)
        scene.add.rectangle(x, y, 100, 150, vals.style.fillStyle).setRotation(angle)
        angle += angle_inc
    }
}

function initCardSlots(scene: Phaser.Scene) {
    let card_height = config.height * .17
    let card_width = card_height * .7159
    let xstart = config.width * .18
    let xpad = config.width * 0.03
    let ypad = 60
    for (let i = 0; i < 3; i++) {
        let xPos = xstart + (card_width + xpad) * i
        for (const offset_mult of [-1, 1]) {
            let yPos = config.height / 2 + offset_mult * (card_height + ypad) / 2
            // let entity = new CardSlotEntity(xPos, yPos, i == 0 ? "attack1" : i == 1 ? "attack2" : "defend", offset_mult == 1 ? config.playerSlot : config.enemySlot)
            scene.add.rectangle(xPos, yPos, card_width, card_height, offset_mult == 1 ? 0xff0000 : 0x0000ff).setRotation(offset_mult == 1 ? 0 : Math.PI)
        }
    }
}

function initElements(scene: Phaser.Scene) {
    for (const params of [
        { name: "player1", x: config.width * 3 / 4, y: config.height * 3 / 4, rotation: 0 },
        { name: "player2", x: config.width * 3 / 4, y: config.height * 1 / 4, rotation: Math.PI }
    ]) {
        let center_distance = config.width * 1 / 8
        let element_radius = config.width * 1 / 19
        let angle_increment = 2 * Math.PI / Object.keys(props.elements).length
        let angle = 0
        for (const [elementName, vals] of Object.entries(props.elements)) {
            let x = center_distance * Math.cos(-Math.PI / 2 + angle + params.rotation) + params.x
            let y = center_distance * Math.sin(-Math.PI / 2 + angle + params.rotation) + params.y

            // scene.add(new ElementEntity(x, y, elementName as ElementName, params.name))
            scene.add.circle(x, y, element_radius, vals.style.fillStyle).setRotation(angle)

            angle += angle_increment
        }
    }
}

export default function init(scene: Phaser.Scene) {
    initCards(scene)
    initCardSlots(scene)
    initElements(scene)
}
