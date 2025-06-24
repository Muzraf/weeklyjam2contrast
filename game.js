/*jslint browser*/
const canvas = document.getElementById("game_canvas");
const ctx = canvas.getContext("2d");
let lt = 0;
let fullscreenchanged = false;
let clicked = false;
let timer = 0;
let transition = 0;
let state = 0;

function resizecanvas() {
    if ((16 * window.innerHeight / 9) < window.innerWidth) {
        canvas.width = 16 * window.innerHeight / 9;
        canvas.height = window.innerHeight;
    } else {
        canvas.width = window.innerWidth;
        canvas.height = 9 * window.innerWidth / 16;
    }
}

function onclick() {
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
        fullscreenchanged = true;
    }
    if (clicked) {
        clicked = false;
    } else {
        clicked = true;
    }
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
    ctx.font = "20px Arial";
    if (state === 0) {
        // start
        if (timer > 1) {
            state = 1;
            timer = 0;
            transition = 1;
        } else {
            ctx.fillText("Start", 10, 30);

        }
    } else if (state === 1) {
    // play
        if (timer > 1) {
            state = 2;
            timer = 0;
            transition = 1;
        } else {
            ctx.fillText("Play", 10, 30);
        }
    } else {
        // end
        if ((timer > 1) && clicked) {
            state = 0;
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
            ctx.fillRect(0, 0, canvas.width, 2 * canvas.height * (1 - transition));
        } else {
            ctx.fillRect(0, canvas.height * (1 - 2 * transition), canvas.width, canvas.height * 2 * transition);
        }
    }


    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.stroke();



    window.requestAnimationFrame(gameloop);

    clicked = false;
}

window.addEventListener("resize", resizecanvas);
window.addEventListener("click", onclick);
resizecanvas();
transition = 1;
window.requestAnimationFrame(gameloop);
