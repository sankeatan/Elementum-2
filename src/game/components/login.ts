import Button from './button'
import { ElementumSceneBase } from '../scenes/scenebase';

class Login extends Button {
    constructor(
        x: number,
        y: number,
        label: string,
        scene: ElementumSceneBase,
    )
    {
        super(x, y, label, scene);
        this.button.on("", ()=>{})
            .on('pointerdown', () => {
                this.button.setStyle({ fill: '#f39c12'})
                document.getElementById("login")!.classList.toggle('hide');
                document.getElementById("login_button")!.onclick = function() {
                    let username = (<HTMLInputElement> document.getElementById("username")).value;
                    let password = (<HTMLInputElement> document.getElementById("password")).value;

                    scene.socket.emit("login", {username: username, password: password})


                }
                console.log('test')
            });
    }
}

export default Login;
