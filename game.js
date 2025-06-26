/*jslint browser*/
/*jslint indent2*/
/*global console*/
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
let shake = 0;
let shake_rec_x = 0;
let shake_rec_y = 0;
let shake_default_time = 0.2;
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

let block_arr = new Array(16 * 9).fill(0);
let moving_block_arr = Array.from({length: 5}, () => ({alive: false, arr: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0], x: 0, y: 0 })); //jslint-ignore-line

let bullet_speed = 1440;
let player_speed = 240;
let player_x = 10;
let player_y = 0;
let player_alive = true;
let bullet_arr = Array.from({length: 5}, () => ({alive: false, x: 0, y: 0}));
let cur_bullet_count = 0;

let player_size = 32;
let particle_size = 8;
let bullet_size = 16;
let moving_block_size = 80;

let blocktimer = 0;
let blockspawntimer = 0;

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

  shake_rec_x = render_rect.x;
  shake_rec_y = render_rect.y;
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

function collision(x1, y1, w1, h1, x2, y2, w2, h2) {
  if (((x1 + w1) > x2) && (x1 < (x2 + w2)) && //
    ((y1 + h1) > y2) && (y1 < (y2 + h2))) {
    return true;
  }
  return false;
}


function checktetris() {
  let i = 0;
  let j = 0;
  let nope = false;
  i = 0;
  while (i < 16) {
    nope = false;
    j = 0;
    while (j < 9) {
      if (block_arr[i * 9 + j] === 0) {
        nope = true;
        break;
      }
      j += 1;
    }
    if (nope === false) {
      j = i * 9;
      while (j < 15 * 9) {
        block_arr[j] = block_arr[j + 9];
        j += 1;
      }
      j = 15 * 9;
      while (j < 9) {
        block_arr[j] = 0;
      }
      j = 0;
      while (j < 9) {
        addsplash(rx(i * moving_block_size + moving_block_size / 2), //
          ry(j * moving_block_size + moving_block_size / 2), 1);
        j += 1;
      }
    }
    i += 1;
  }
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
  let i = 0;
  let j = 0;
  let k = 0;
  let l = 0;
  //  if (clicked && (mx > canvas.width / 2) && (my < canvas.height / 2)) {
  if (player_alive === false) {
    tostate = 2;
    timer = 0;
    transition = 1;
  } else {
    if (clicked && cur_bullet_count < 5) {
      i = 0;
      while (i < 5) {
        if (bullet_arr[i].alive === false) {
          break;
        }
        i += 1;
      }
      if (i < 5) {
        cur_bullet_count += 1;
        //player_speed *= -1;
        shake = shake_default_time;
        bullet_arr[i].alive = true;
        bullet_arr[i].x = player_x;
        bullet_arr[i].y = player_y + player_size / 2 - bullet_size / 2;
        addsplash(rx(bullet_arr[i].x + player_size),//
          ry(bullet_arr[i].y), 0, 5, 5);
      }
    }
    k = 0;
    while (k < 5) {
      if (bullet_arr[k].alive) {
        bullet_arr[k].x += bullet_speed * dt;
        if (bullet_arr[k].x > game_width) {
          cur_bullet_count -= 1;
          bullet_arr[k].alive = false;
          addsplash(rx(bullet_arr[k].x - bullet_size), ry(bullet_arr[k].y), 1);
        } else {
          let done = false;
          i = 0;
          while (i < 5) {
            if (moving_block_arr[i].alive === true) {
              if (collision(bullet_arr[k].x, bullet_arr[k].y, //
                bullet_size, bullet_size, //
                moving_block_arr[i].x * moving_block_size, //
                moving_block_arr[i].y * moving_block_size, //
                moving_block_size * 4, moving_block_size * 4)) {
                j = 0;
                while (j < 16) {
                  if (moving_block_arr[i].arr[j] === 1) {
                    if (collision(bullet_arr[k].x, //
                      bullet_arr[k].y, bullet_size, bullet_size, //
                      moving_block_size * (Math.floor(j / 4) + //
                        moving_block_arr[i].x), //
                      moving_block_size * ((j % 4) + moving_block_arr[i].y), //
                      moving_block_size, moving_block_size)) {
                      cur_bullet_count -= 1;
                      bullet_arr[k].alive = false;
                      addsplash(rx(bullet_arr[k].x - bullet_size), //
                        ry(bullet_arr[k].y), 1);
                      moving_block_arr[i].arr[j] = 0;
                      addsplash(rx(bullet_arr[k].x), ry(bullet_arr[k].y), 4);

                      l = 0;
                      while (l < 16) {
                        if (moving_block_arr[i].arr[l]) {
                          break;
                        }
                        l += 1;
                      }
                      if (l === 16) {
                        moving_block_arr[i].alive = false;
                      }
                      done = true;
                    }
                  }
                  if (done) {
                    break;
                  }
                  j += 1;
                }
              }
              if (done) {
                break;
              }
            }
            i += 1;
          }
        }
      }
      k += 1;
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

    blocktimer += dt;
    if (blocktimer > 1) {

      //block moves and collides with world
      i = 0;
      while (i < 5) {
        if (moving_block_arr[i].alive) {
          moving_block_arr[i].x -= 1;

          if ((moving_block_arr[i].x < 1) && (moving_block_arr[i].x > -4)) {
            l = 0;
            while (l < 4) {
              if (moving_block_arr[i].arr[l - //
                4 * moving_block_arr[i].x] === 1) {
                moving_block_arr[i].alive = false;

                k = 0;
                while (k < 16) {
                  if (moving_block_arr[i].arr[k] === 1) {
                    block_arr[(moving_block_arr[i].x * 9)//
                      + moving_block_arr[i].y + (k % 4) + //
                      Math.floor(k / 4) * 9] = 1;
                  }
                  k += 1;
                }
                checktetris();
                break;
              }
              l += 1;
            }

          } else if (moving_block_arr[i].x < -3) {
            console.log("see this line");
            moving_block_arr[i].alive = false;
          } else {
            //collision
            j = 0;
            while (j < 16) {
              if (moving_block_arr[i].arr[j] === 1) {
                if (block_arr[(moving_block_arr[i].x * 9) //
                  + moving_block_arr[i].y + (j % 4) + //
                  Math.floor(j / 4) * 9] === 1) {
                  // collision
                  moving_block_arr[i].alive = false;
                  k = 0;
                  while (k < 16) {
                    if (moving_block_arr[i].arr[k] === 1) {
                      block_arr[((moving_block_arr[i].x + 1) * 9) + //
                        moving_block_arr[i].y + (k % 4) + //
                        Math.floor(k / 4) * 9] = 1;
                    }
                    k += 1;
                  }
                  checktetris();
                  break;
                }
              }
              j += 1;
            }
          }
        }
        i += 1;
      }

      blocktimer = 0;
    }
    blockspawntimer += dt;
    if (blockspawntimer > 5) {
      blockspawntimer = 0;
      spawnrandomblock();
    }
  }
}

function drawplay() {
  ctx.fillText("Play", 10, 30);
  let i = 0;

  ctx.fillStyle = "#333";
  ctx.strokeStyle = "black";

  i = 0;
  while (i < 16 * 9) {
    if (block_arr[i] === 1) {
      ctx.fillRect(rx(moving_block_size * Math.floor(i / 9)),//
        ry(moving_block_size * (i % 9)), rs(moving_block_size),//
        rs(moving_block_size));
      ctx.beginPath();
      ctx.rect(rx(moving_block_size * Math.floor(i / 9)),//
        ry(moving_block_size * (i % 9)), rs(moving_block_size),//
        rs(moving_block_size));
      ctx.stroke();
    }
    i += 1;
  }
  i = 0;
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  while (i < 5) {
    if (moving_block_arr[i].alive) {
      let j = 0;
      while (j < 16) {
        if (moving_block_arr[i].arr[j] === 1) {
          ctx.fillRect(rx(moving_block_size * (moving_block_arr[i].x + //
            Math.floor(j / 4))), //
            ry(moving_block_size * (moving_block_arr[i].y + //
              (j % 4))), rs(moving_block_size), rs(moving_block_size));
          ctx.beginPath();
          ctx.rect(rx(moving_block_size * (moving_block_arr[i].x + //
            Math.floor(j / 4))), //
            ry(moving_block_size * (moving_block_arr[i].y + //
              (j % 4))), rs(moving_block_size), rs(moving_block_size));

          ctx.stroke();
        }
        j += 1;
      }
    }
    i += 1;
  }

  i = 0;
  while (i < 5) {
    if (bullet_arr[i].alive) {
      ctx.fillRect(rx(bullet_arr[i].x), //
        ry(bullet_arr[i].y), rs(bullet_size), rs(bullet_size));
    }
    i += 1;
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
    // plus
    j = 0;
    while (j < 4) {
      i = addparticle(x, y, dx * a[j], dy * b[j], t, s, i);
      j += 1;
    }
  } else if (type === 1) {
    // round and small round and tiny plus
    i = addsplash(x, y, 2, dx, dy, t, 2 * s, i);
    i = addsplash(x, y, 2, dx * 0.5, dy * 0.5, t, s, i);
    i = addsplash(x, y, 0, dx * 0.25, dy * 0.25, t, 0.5 * s, i);
  } else if (type === 2) {
    // round
    i = addsplash(x, y, 3, dx, dy, t, s, i);
    i = addsplash(x, y, 0, dx, dy, t, s, i);
    j += 1;
  } else if (type === 3) {
    // cross
    j = 0;
    while (j < 4) {
      i = addparticle(x, y, dx * c[j], dy * d[j], t, s, i);
      j += 1;
    }
  } else if (type === 4) {
    // big block broken and falling down
    let k = (moving_block_size / particle_size) * s * 0.5;

    i = addsplash(x, y, 3, dx, dy, t, k, i);

    /*i = addparticle(x, y, -1 * dx, dy, t, k, i);

    i = addparticle(x, y + k, -1 * dx, dy, t, k, i);

    i = addparticle(x + k, y, dx, dy, t, k, i);

    i = addparticle(x + k, y + k, dx, dy, t, k, i);
    */
  }
  return i;
}

function spawnrandomblock() {
  let i = 0;
  while (i < 5) {
    if (moving_block_arr[i].alive === false) {
      break;
    }
    i += 1;
  }

  if (i === 5) {
    return;
  }

  moving_block_arr[i].x = 15;
  moving_block_arr[i].y = Math.floor(Math.random() * 8);
  let r = Math.floor(Math.random() * 4);
  if (r === 0) {
    moving_block_arr[i].arr = [1, 1, 1, 1, //
      0, 0, 0, 0, //
      0, 0, 0, 0, //
      0, 0, 0, 0];
    if (moving_block_arr[i].y > 5) {
      moving_block_arr[i].y -= 3;
    }
  } else if (r === 1) {
    moving_block_arr[i].arr = [1, 1, 0, 0, //
      0, 1, 1, 0, //
      0, 0, 0, 0, //
      0, 0, 0, 0];
    if (moving_block_arr[i].y > 6) {
      moving_block_arr[i].y -= 2;
    }
  } else if (r === 2) {
    moving_block_arr[i].arr = [1, 1, 0, 0, //
      1, 1, 0, 0, //
      0, 0, 0, 0, //
      0, 0, 0, 0];
    if (moving_block_arr[i].y > 7) {
      moving_block_arr[i].y -= 1;
    }
  } else if (r === 3) {
    moving_block_arr[i].arr = [0, 0, 1, 1, //
      0, 0, 0, 1, //
      0, 0, 0, 1, //
      0, 0, 0, 0];
    if (moving_block_arr[i].y > 5) {
      moving_block_arr[i].y -= 3;
    } else {
      moving_block_arr[i].y -= 2;
    }
  }

  moving_block_arr[i].alive = true;
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

  if (shake > 0) {
    shake -= dt;
    //render_rect.x = shake_rec_x + rs(8) * Math.sin((1 -shake) * 8* 3.14159);
    render_rect.y = shake_rec_y + rs(8) * Math.sin((1 - shake) * 8 * 3.14159);
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
  // letterbox before particles
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, render_rect.x, canvas.height);
  ctx.fillRect(render_rect.x + render_rect.width, 0, //
    canvas.width - render_rect.x - render_rect.width, canvas.height);
  ctx.fillRect(0, 0, canvas.width, render_rect.y);
  ctx.fillRect(0, render_rect.y + render_rect.height, //
    canvas.width, canvas.height - render_rect.y - render_rect.height);

  ctx.fillStyle = "white";



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
