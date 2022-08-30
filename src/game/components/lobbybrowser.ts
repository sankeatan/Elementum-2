import config from "../../config"

export function createLobbyBrowserWindow(scene: Phaser.Scene, data: string[] = []) {
    const width: number = config.width * .75;
    const height: number = config.height * .75;
    const x: number = (config.width - width) / 2;
    const y: number = (config.height - height) / 2;        
    const background = scene.add
        .rectangle(0, 0, width, height, 0x000000)
        .setAlpha(.5)
    const container = scene.add
        .container(x + width/2, y + height/2, [background])
        .setSize(width, height)
        .setInteractive()
        .setName("lobbyBrowserWindow")

    const num_rows_displayed = 10;
    const rows: Phaser.GameObjects.Text[] = [];

    for(let i=0; i<num_rows_displayed; i++) {
        rows.push(scene.add
            .text(x, y+i * (height/num_rows_displayed), data[i] || "", {
                font: "24px Arial",
                backgroundColor: "#000",
                align: "center"
            })
            .setName("lobbyBrowserRow" + i)
            .setInteractive()
            .setSize(width, height / num_rows_displayed)
        )
    }

    const lobbyBrowserWindow: any = {
        top_row_index: 0,
        data: data,
        background: background,
        list_items: undefined,
        scroll_bar: undefined,
        refresh_data() {
            // socket request
        },
        scroll(jump: number) {
            this.top_row_index += jump;
            this.top_row_index = Math.max(0, this.top_row_index);
            this.top_row_index = Math.min(this.top_row_index, this.data.length - num_rows_displayed);
            for(let i=this.top_row_index; i<this.top_row_index+num_rows_displayed; i++) {
                const row_slot = i - this.top_row_index;
                if(i >= this.data.length) {
                    rows[row_slot].setText("").setColor("#fff");
                }
                else {
                    rows[row_slot].setText(data[i]);
                }
            }
        },

    };

    let list_items: any = [];

    return lobbyBrowserWindow;
}