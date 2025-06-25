/*jslint browser*/
/*jslint indent2*/
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
let dt = 0;

let render_rect = {height: 720, s: 1, width: 1280, x: 0, y: 0};
let particle_arr = Array.from({length: 256}, () => ({alive: false, dx: 0, dy: 0, s: 0, t: 0, x: 0, y: 0})); //jslint-ignore-line
/*
let parsx = new Array(256).fill(0);
let parsy = new Array(256).fill(0);
let parsdx = new Array(256).fill(0);
let parsdy = new Array(256).fill(0);
let parst = new Array(256).fill(0);
let parsalive = new Array(256).fill(0);
*/

let block_arr = new Array(12 * 9).fill(0);
let moving_block_arr = Array.from({length: 5}, () => ({alive: false, arr: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0], x: 0, y: 0 })); //jslint-ignore-line

let bullet_speed = 1440;
let player_speed = 240;
let player_x = 10;
let player_y = 0;
let player_alive = true;
let bullet_x = 0;
let bullet_y = 0;
let bullet_alive = false;

let player_size = 32;
let particle_size = 8;
let bullet_size = 16;

let game_height = 720;
let game_width = 16 * game_height / 9;
let gravity = 0.1;

function resizecanvas() {
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
  render_rect.s = render_rect.height / game_height;
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

function doplay() {
//  if (clicked && (mx > canvas.width / 2) && (my < canvas.height / 2)) {
  if (player_alive === false) {
    tostate = 2;
    timer = 0;
    transition = 1;
  } else {
    if (clicked && (bullet_alive === false)) {
      bullet_alive = true;
      bullet_x = player_x;
      bullet_y = player_y + player_size / 2 - bullet_size / 2;
      addsplash(rx(bullet_x + player_size), ry(bullet_y), 0, 5, 5);
    }

    if (bullet_alive) {
      bullet_x += bullet_speed * dt;
      if (bullet_x > game_width) {
        bullet_alive = false;
        addsplash(rx(bullet_x - bullet_size), ry(bullet_y), 1);
      }
    }

    player_y += player_speed * dt;
    if ((player_y + player_size) > game_height) {
      player_y = game_height - player_size;
      player_speed *= -1;
    } else if (player_y < 0) {
      player_y = 0;
      player_speed *= -1;
    }

    /* player_y = (game_height - player_size) * 0.5 //
      * (1 + Math.cos(2 * 3.14159 * 0.225 * timer));
    */
  }
}

function drawplay() {
  ctx.fillText("Play", 10, 30);
  if (bullet_alive) {
    ctx.fillRect(rx(bullet_x), ry(bullet_y), rs(bullet_size), rs(bullet_size));
  }

  if (player_alive) {
    ctx.fillRect(rx(player_x), ry(player_y), rs(player_size), rs(player_size));
  }
}

function doyellow() {
  if ((timer > 1) && clicked) {
    tostate = 0;
    timer = 0;
    transition = 1;
  }
}


function drawyellow() {
  ctx.fillText("yellow", 10, 30);
  ctx.fillText(`${timer}`, 10, 60);
  if (timer > 1) {
    ctx.fillText("Click To Continue", 10, 90);
  }
}

function addparticle(x, y, dx, dy, t = 1, s = 1, i = 0) {
  while (i < 256) {
    if (particle_arr[i].alive === false) {
//    if (parsalive[i] === 0) {
      break;
    }
    i += 1;
  }

  if (i === 256) {
    return i;
  }
  particle_arr[i].x = x;
  particle_arr[i].y = y;
  particle_arr[i].dx = dx;
  particle_arr[i].dy = dy;
  particle_arr[i].s = s * particle_size;
  particle_arr[i].t = t;

 // parsx = x;


  particle_arr[i].alive = true;

  return i;
}

function addsplash(x, y, type = 0, dx = 10, dy = 10, t = 1, s = 1, i = 0) {
  let j = 0;
  let a = [-1, 0, 1, 0];
  let b = [0, 1, 0, -1];
  let c = [-0.707, 0.707, 0.707, -0.707];
  let d = [0.707, 0.707, -0.707, -0.707];

  if (type === 0) {
    while (j < 4) {
      i = addparticle(x, y, dx * a[j], dy * b[j], t, s, i);
      j += 1;
    }
  } else if (type === 1) {
    i = addsplash(x, y, 2, dx, dy, t, 2 * s, i);
    i = addsplash(x, y, 2, 0.5 * dx, 0.5 * dy, t, s, i);
    i = addsplash(x, y, 0, dx * 0.5, dy * 0.5, t, s, i);
  } else if (type === 2) {
    while (j < 4) {
      i = addparticle(x, y, dx * c[j], dy * d[j], t, s, i);
      i = addparticle(x, y, dx * a[j], dy * b[j], t, s, i);
      j += 1;
    }
  }
  return i;
}


function gameloop(ts) {
  if (!lt) {
    lt = ts;
  }
  dt = (ts - lt) / 1000;
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
    if (timer > 0) {
      dostart();
    }
    drawstart();
  } else if (state === 1) {
    // play
    if (timer > 0) {
      doplay();
    }
    drawplay();
  } else {
    // yellow
    if (timer > 0) {
      doyellow();
    }
    drawyellow();
  }

  if (clicked) {
    addsplash(mx, my, 0, 5, 5);
    //particle_arr[0].x = 100;
  }


  // render_rect boundary temperory
  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.rect(rx(0), ry(0), rs(1280), rs(720));
  ctx.stroke();

  // mouse pointer temperory
  //ctx.fillRect(mx, my, 10, 10);

  // fullsceeen btn
  ctx.beginPath();
  ctx.rect(canvas.width - rs(128), //
    canvas.height - rs(128), rs(128), rs(128));
  ctx.stroke();

  // temperory debuggibg
  ctx.fillText(`${canvas.width}, ${canvas.height}, \
      ${render_rect.width}, ${render_rect.height},  \
      ${render_rect.s} ${mx}, ${my}`, 0, canvas.height);



  // particles
  let i = 0;
  while (i < 256) {
    if (particle_arr[i].alive) {
      particle_arr[i].t -= dt;
      if (particle_arr[i].t <= 0) {
        particle_arr[i].alive = false;
      } else {
        particle_arr[i].dx *= 0.9;
        particle_arr[i].dy *= 0.9;
        particle_arr[i].dx -= gravity;
        particle_arr[i].x += rs(particle_arr[i].dx);
        particle_arr[i].y += rs(particle_arr[i].dy);
        ctx.fillRect(particle_arr[i].x, particle_arr[i].y, //
          particle_arr[i].t * rs(particle_arr[i].s), //
          particle_arr[i].t * rs(particle_arr[i].s));
      }
    }
    i += 1;
  }

  // transition
  if (transition > 0) {
    ctx.fillStyle = "#333";
    if (transition > 0.5) {
      ctx.fillRect(0, 0, canvas.width, //
         canvas.height * (2 * (1 - transition)));
    } else {
      if (tostate > -1) {
        state = tostate;
        tostate = -1;
      }
      ctx.fillRect(0, canvas.height * (1 - 2 * transition), //
        canvas.width, canvas.height * (2 * transition));
    }
  }

  clicked = false;
  window.requestAnimationFrame(gameloop);

}

window.addEventListener("resize", resizecanvas);
window.addEventListener("click", onclick);
resizecanvas();
transition = 1;
window.requestAnimationFrame(gameloop);
