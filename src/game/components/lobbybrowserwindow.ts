import config from "../../config"
import shared from "../../../shared/shared"



function getRowText(data: shared.LobbyInfo) {
    if(data == null) {
        return ""
    }

    let str =
        `${data.lobby_name.padEnd(28)}`+
        `${`${data.players}/2 (${data.spectators})`.padEnd(24)}`+
        `${`${data.ping}`.padStart(6)}`

    return str;
}

export class LobbyBrowserWindow {
    data: shared.LobbyInfo[] = [];
    readonly width: number = config.width * .75;
    readonly height: number = config.height * .75;
    readonly x: number = (config.width - this.width) / 2;
    readonly y: number = (config.height - this.height) / 2 + 25;
    readonly header_height = 30;
    readonly rows_height = this.height-this.header_height;
    readonly num_rows_displayed = 10;
    readonly scrollbar_w = 10;
    top_row_index = 0;
    container;
    scrollbar;
    header;
    rows: Phaser.GameObjects.Container[] = [];

    set_data(data: shared.LobbyInfo[]) {
        this.data = data;
        this.top_row_index = 0;
        this.update_rows_text();
    };

    scroll(jump: number) {

        if(this.data.length <= this.num_rows_displayed) {
            return
        }
        this.top_row_index += jump;
        this.top_row_index = Math.max(0, this.top_row_index);
        this.top_row_index = Math.min(this.top_row_index, this.data.length - this.num_rows_displayed);
        this.update_rows_text();
    };

    update_rows_text() {
        for(let i=this.top_row_index; i<this.top_row_index+this.num_rows_displayed; i++) {
            const row_slot = i - this.top_row_index;
            const row_text = this.rows[row_slot].getByName("rowtext") as Phaser.GameObjects.Text
            if(i >= this.data.length) {
                row_text.setText("");
            }
            else {
                row_text.setText(getRowText(this.data[i]));
            }
        }

        const scrollbar_h = this.rows_height * Math.min(1, this.num_rows_displayed/this.data.length);

        const scrollbar_y = 
            this.header.height/2 +
            (this.container.height - this.header.height - scrollbar_h) *
            (-.5 + this.top_row_index/(this.data.length-this.num_rows_displayed));

        this.scrollbar
            .setX(this.width/2 - this.scrollbar_w/2)
            .setY(scrollbar_y)
            .setDisplaySize(this.scrollbar_w, scrollbar_h)
    };

    constructor(scene: Phaser.Scene) {
        const background = scene.add
            .rectangle(0, 0, this.width, this.height, 0x000000)
            .setStrokeStyle(1, 0xffffff)
            .setAlpha(.5)

        this.container = scene.add
            .container(this.x + this.width/2, this.y + this.height/2, [background])
            .setSize(this.width, this.height)
            .setInteractive()
            .setName("lobbyBrowserWindow")
    
        this.header = scene.add
            .container(0, 0)
            .setSize(this.width, this.header_height)

        const header_bg = scene.add
            .rectangle(0, this.header_height/2-this.height/2, this.width, this.header_height, 0x222222)
            .setStrokeStyle(1, 0xffffff)
            .setAlpha(0.8)

        const header_text_lobby = scene.add
            .text(10-this.width/2, 8-this.height/2, "lobby name")

        const header_text_players = scene.add
            .text(0-80, 8-this.height/2, "players (spectators)")

        const header_text_ping = scene.add
            .text(this.width/2 - 65, 8-this.height/2, "ping")

        this.header.add(header_bg)
        this.header.add(header_text_lobby)
        this.header.add(header_text_players)
        this.header.add(header_text_ping)
        this.container.add(this.header)

        this.scrollbar = scene.add
            .rectangle(0, 0, 1, 1, 0xffffff)
            .setAlpha(0.5)
        
        this.container.add(this.scrollbar);
    
        for(let i=0; i<this.num_rows_displayed; i++) {
            const row_height = this.rows_height/this.num_rows_displayed;
            const row_container = scene.add
                .container(this.x, this.y+this.header_height+i * (this.rows_height/this.num_rows_displayed))
                .setSize(this.width, row_height)

            const text_obj = scene.add
                .text(10, 10, "", {
                    align: "center",

                })
                .setName("lobbyBrowserRow" + i)
                .setName("rowtext")

            const bg_obj = scene.add
                .rectangle(this.width/2-this.scrollbar_w/2, row_height/2, this.width-this.scrollbar_w, row_height, 0x000)
                .setStrokeStyle(1, 0xffffff)
                .setAlpha(0.5)

            row_container.add(bg_obj);
            row_container.add(text_obj);
            this.rows.push(row_container);
        }

        this.update_rows_text();
    }
}
