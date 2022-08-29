import config from "../../config"

export function createLobbyBrowserWindow(scene: Phaser.Scene, data: string[] = []) {
    const width: number = config.width * .75;
    const height: number = config.height * .75;
    const x: number = (config.width - width) / 2;
    const y: number = (config.height - height) / 2;
    const lobbyBrowserWindow: any = {
        start_index: 0,
        end_index: 10,
        items: data,
        rect: scene.add.rectangle(x, y, width, height, 0x000000).setOrigin(0, 0).setAlpha(0.5),
        list_items: undefined,
        scroll_bar: undefined,
    }

    let list_items: any = [];
}
