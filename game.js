/*jslint browser*/
const canvas = document.getElementById("game_canvas");
const ctx = canvas.getContext("2d");
let lt = 0;
let fullscreenchanged = false;
let clicked = false;
let timer = 0;
let transition = 0;
let state = 0;
let tostate = -1;
let mx = 0;
let my = 0;

let render_rect = {height: 720, s: 1, width: 1280, x: 0, y: 0};

function resizecanvas() {
/*    if ((16 * window.innerHeight / 9) < window.innerWidth) {
        canvas.width = 16 * window.innerHeight / 9;
        canvas.height = window.innerHeight;
    } else {
        canvas.width = window.innerWidth;
        canvas.height = 9 * window.innerWidth / 16;
    }
*/
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if ((16 * canvas.height / 9) < canvas.width) {
        render_rect.width = 16 * canvas.height / 9;
        render_rect.height = canvas.height;
    } else {
        render_rect.width = canvas.width;
        render_rect.height = 9 * canvas.width / 16;
    }

    render_rect.x = canvas.width / 2 - render_rect.width / 2;
    render_rect.y = canvas.height / 2 - render_rect.height / 2;
    render_rect.s = render_rect.height / 720;
}

function togglefullscreen() {
    if (!document.fullscreenElement) {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen();
        } else if (canvas.mozRequestFullScreen) { /* Firefox */
            canvas.mozRequestFullScreen();
        } else if (canvas.webkitRequestFullscreen) { /* Chrome,
            Safari & Opera */
            canvas.webkitRequestFullscreen();
        } else if (canvas.msRequestFullscreen) { /* IE/Edge */
            canvas.msRequestFullscreen();
        }
        resizecanvas();
    } else {
        //exitfullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
        resizecanvas();
    }
}

function onclick(event) {
    mx = event.clientX;
    my = event.clientY;
    if ((mx > (canvas.width - rs(128))) && //
        (my > (canvas.height - rs(128)))) {
        togglefullscreen();
    } else {
        clicked = true;
    }
}

function rx(x) {
    return render_rect.x + rs(x);
}

function ry(y) {
    return render_rect.y + rs(y);
}

function rs(s) {
    return s * render_rect.s;
}
function dostart() {
    if (clicked) {
        tostate = 1;
        timer = 0;
        transition = 1;
    }
}
function drawstart() {
    ctx.fillText("Start", rx(10), ry(32));
    ctx.fillText("Click to Play", rx(10), ry(64));
}
function gameloop(ts) {
    if (!lt) {
        lt = ts;
    }
    const dt = (ts - lt) / 1000;
    lt = ts;

    ctx.clearRect(0, 0, canvas.width, canvas.height);


    if (transition > 0) {
        transition = transition - dt;
    } else {
        timer = timer + dt;
    }

    ctx.fillStyle = "white";
    ctx.font = `${rs(32)}px Arial`;
    if (state === 0) {
        if (transition < 0) {
            dostart();
        }
        drawstart();
    } else if (state === 1) {
    // play
        if (timer > 1) {
            tostate = 2;
            timer = 0;
            transition = 1;
        } else {
            ctx.fillText("Play", 10, 30);
        }
    } else {
        // end
        if ((timer > 1) && clicked) {
            tostate = 0;
            timer = 0;
            transition = 1;
        } else {
            ctx.fillText("yellow", 10, 30);
            ctx.fillText(`${timer}`, 10, 60);
            if (timer > 1) {
                ctx.fillText("Click To Continue", 10, 90);
            }
        }
    }

    if (transition > 0) {
        ctx.fillStyle = "white";
        if (transition > 0.5) {
            ctx.fillRect(0, 0, canvas.width, //
                2 * canvas.height * (1 - transition));
        } else {
            if (tostate > -1) {
                state = tostate;
                tostate = -1;
            }
            ctx.fillRect(0, canvas.height * (1 - 2 * transition), //
                canvas.width, canvas.height * 2 * transition);
        }
    }

    // render_rect boundary
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.rect(rx(0), ry(0), rs(1280), rs(720));
    ctx.stroke();

    // mouse pointer temperory
    ctx.fillRect(mx, my, 10, 10);

    // fullsceeen btn
    ctx.beginPath();
    ctx.fillRect(canvas.width - rs(128), //
        canvas.height - rs(128), rs(128), rs(128));
    //ctx.stroke();

    ctx.fillText(`${canvas.width}, ${canvas.height}, \
      ${render_rect.width}, ${render_rect.height},  \
      ${render_rect.s} ${mx}, ${my}`, 0, canvas.height);


    clicked = false;
    window.requestAnimationFrame(gameloop);

}

window.addEventListener("resize", resizecanvas);
window.addEventListener("click", onclick);
resizecanvas();
transition = 1;
window.requestAnimationFrame(gameloop);
