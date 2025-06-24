/*jslint browser*/
const canvas = document.getElementById("game_canvas");
const ctx = canvas.getContext("2d");
let lt = 0;
let fullscreenchanged = false;
let clicked = false;
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
//  ctx.fillStyle = 'black'
//  ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Canvas: ${canvas.width}x${canvas.height}`, 10, 30);
    ctx.fillText(`dt: ${dt}`, 10, 60);
    ctx.fillText(`${fullscreenchanged} , ${clicked}`, 10, 90);


    ctx.strokeStyle = "red"
    ctx.beginPath();
    ctx.rect(0,0,canvas.width, canvas.height);
//    ctx.rect(10,100,100,100);;
    ctx.stroke();

    window.requestAnimationFrame(gameloop);
}

window.addEventListener("resize", resizecanvas);
canvas.onclick = onclick;
resizecanvas();
window.requestAnimationFrame(gameloop);
