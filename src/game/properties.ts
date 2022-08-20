const props = {
    elements: {
        "fire": {
            style: {
                strokeStyle: "orange",
                fillStyle: 0xff4500
            },
            alternateColor: "orange",
            alternateColorHex: 0xff5611,
        },
        "water": {
            style: {
                strokeStyle: "aqua",
                fillStyle: 0x0000ff
            },
            alternateColor: 0x1111ff
        },
        "earth": {
            style: {
                strokeStyle: "darkgreen",
                fillStyle: 0x776600
            },
            alternateColor: 0x226622
        },
        "electricity": {
            style: {
                strokeStyle: "blue",
                fillStyle: 0xdddd33
            },
            alternateColor: 0x0000ff,
        },
        "nether": {
            style: {
                strokeStyle: 0xa000c8,
                fillStyle: 0x330033
            },
            alternateColor: 0xa000c8
        },
    },

    cardSlots: {
        "attack1": {
            style: {
                fillStyle: 0xff0000,
            }
        },
        "attack2": {
            style: {
                fillStyle: 0xff0000,
            }
        },
        "defend": {
            style: {
                fillStyle: 0x0000ff,
            }
        },
    },

    cards: {
        "fire": {
            elementType: "fire",
            style: {
                fillStyle: 0xff0000,
            }
        },
        "water": {
            elementType: "water",
            style: {
                fillStyle: 0x0000ff,
            }
        },
        "earth": {
            elementType: "earth",
            style: {
                fillStyle: 0x776600,
            }
        },
        "electricity": {
            elementType: "electricity",
            style: {
                fillStyle: 0xffff00,
            }
        },
        "nether": {
            elementType: "nether",
            style: {
                fillStyle: 0xa000c8,
            }
        },
        "wand": {
            elementType: undefined,
            style: {
                fillStyle: 0x000000,
            }
        },
        "HIDDEN": {
            elementType: undefined,
            style: {
                fillStyle: 0xcccccc,
                strokeStyle: "red"
            }
        },
    }
}

export default props;
