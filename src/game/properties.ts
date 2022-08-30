namespace props {
    export const elements: {[key:string]: any} = {
        "fire": {
            type: "fire",
            color: 0x882211,
            alternateColor: 0xff4500,
            positive: ["lightning", "nether"],
            negative: ["water", "earth"],
        },
        "water": {
            type: "water",
            color: 0x223399,
            alternateColor: 0x1111ff,
            positive: ["lightning", "earth"],
            negative: ["fire", "nether"],
        },
        "earth": {
            type: "earth",
            color: 0x554411,
            alternateColor: 0x775500,
            positive: ["nether"],
            negative: ["water", "lightning"],
        },
        "lightning": {
            type: "lightning",
            color: 0xaaaa00,
            alternateColor: 0xffff00,
            positive: ["water", "fire"],
            negative: ["earth"],
        },
        "nether": {
            type: "nether",
            color: 0x552255,
            alternateColor: 0xa000c8,
            positive: ["earth", "fire"],
            negative: ["water"],
        },
    }

    export const cardSlots: {[key:string]: any} = {
        "attack1": {
            type: "attack",
            color: 0xaa2222,
        },
        "attack2": {
            type: "attack",
            color: 0xaa2222,
        },
        "defend": {
            type: "defend",
            color: 0x1133bb,
        },
    }

    export const cards: {[key:string]: any} = {
        "fire": {
            type: "fire"
        },
        "lightning": {
            type: "lightning"
        },
        "water": {
            type: "water"
        },
        "nether": {
            type: "nether"
        },
        "earth": {
            type: "earth"
        },
        "wand": {
            type: "wand"
        },
    }
}

export default props;
