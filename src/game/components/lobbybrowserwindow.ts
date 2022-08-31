import config from "../../config"
import shared from "../../../shared/shared"

function getRowText(data: shared.LobbyInfo) {
    if(data == null) {
        return ""
    }

    let str =
        `${data.lobbyname.padEnd(28)}`+
        `${`${data.players}/2 (${data.spectators})`.padEnd(24)}`+
        `${`${data.ping}`.padStart(6)}`

    return str;
}

export class LobbyBrowserWindow {
    top_row_index = 0;
    data: shared.LobbyInfo[] = [
        {lobbyname: "one", players: Math.floor(((Math.random() * 2)+1)), spectators: 0, ping: 30},
        {lobbyname: "two", players: Math.floor(((Math.random() * 2)+1)), spectators: 0, ping: 30},
        {lobbyname: "three", players: Math.floor(((Math.random() * 2)+1)), spectators: 0, ping: 30},
    ];
    container;
    scrollbar;
    header;
    rows: Phaser.GameObjects.Container[] = [];
    readonly num_rows_displayed = 10;

    set_data(data: shared.LobbyInfo[]) {
        this.data = data;
        this.top_row_index = 0;
        this.redraw();
    };
    scroll(jump: number) {

        if(this.data.length <= this.num_rows_displayed) {
            return
        }
        this.top_row_index += jump;
        this.top_row_index = Math.max(0, this.top_row_index);
        this.top_row_index = Math.min(this.top_row_index, this.data.length - this.num_rows_displayed);
        this.redraw();
    };

    redraw() {
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

        this.scrollbar.setY(
            this.header.height/2 +
            (this.container.height - this.header.height - this.scrollbar.height) *
            (-.5 + this.top_row_index/(this.data.length-this.num_rows_displayed))
        )
    };

    constructor(scene: Phaser.Scene) {
        const width: number = config.width * .75;
        const height: number = config.height * .75;
        const x: number = (config.width - width) / 2;
        const y: number = (config.height - height) / 2 + 25;
        const header_height = 30;
        const rows_height = height-header_height;
        const background = scene.add
            .rectangle(0, 0, width, height, 0x000000)
            .setStrokeStyle(1, 0xffffff)
            .setAlpha(.5)
        this.container = scene.add
            .container(x + width/2, y + height/2, [background])
            .setSize(width, height)
            .setInteractive()
            .setName("lobbyBrowserWindow")
    
        this.header = scene.add
            .container(0, 0)
            .setSize(width, header_height)

        const header_bg = scene.add
            .rectangle(0, header_height/2-height/2, width, header_height, 0x222222)
            .setStrokeStyle(1, 0xffffff)
            .setAlpha(0.8)

        const header_text_lobby = scene.add
            .text(10-width/2, 8-height/2, "lobby name")

        const header_text_players = scene.add
            .text(0-80, 8-height/2, "players (spectators)")

        const header_text_ping = scene.add
            .text(width/2 - 65, 8-height/2, "ping")

        this.header.add(header_bg)
        this.header.add(header_text_lobby)
        this.header.add(header_text_players)
        this.header.add(header_text_ping)
        this.container.add(this.header)

        const scrollbar_w = 10;
        const scrollbar_h = rows_height * Math.min(1, this.num_rows_displayed/this.data.length);
        this.scrollbar = scene.add
            .rectangle(0, 0, 0, 0, 0xffffff)
            .setPosition(width/2 - scrollbar_w/2, header_height/2-rows_height/2 +scrollbar_h/2)
            .setSize(scrollbar_w, scrollbar_h)
            .setAlpha(0.5)
        
        this.container.add(this.scrollbar);
    
        for(let i=0; i<this.num_rows_displayed; i++) {
            const row_height = rows_height/this.num_rows_displayed;
            const row_container = scene.add
                .container(x, y+header_height+i * (rows_height/this.num_rows_displayed))
                .setSize(width, row_height)

            const text_obj = scene.add
                .text(10, 10, "", {
                    align: "center",

                })
                .setName("lobbyBrowserRow" + i)
                .setInteractive()
                .setName("rowtext")

            const bg_obj = scene.add
                .rectangle(width/2-scrollbar_w/2, row_height/2, width-scrollbar_w, row_height, 0x000)
                .setStrokeStyle(1, 0xffffff)
                .setAlpha(0.5)

            row_container.add(bg_obj);
            row_container.add(text_obj);
            this.rows.push(row_container);
        }

        this.redraw();
    }
}
