const canvas = document.getElementById('game_canvas');
const ctx = canvas.getContext('2d');
let lt = 0

function resizecanvas () {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}


function gameloop(ts) {
	if (!lt) {lt = ts;}
	const dt = (ts - lt)/1000;
	lt = ts;
//	ctx.fillStyle = 'black'
//	ctx.fillRect(0,0,canvas.width,canvas.height);
	ctx.clearRect(0,0,canvas.width, canvas.height);
	ctx.fillStyle = 'white';
	ctx.font ='20px Arial';
	ctx.fillText(`Canvas: ${canvas.width}x${canvas.height}`, 10, 30);
	ctx.fillText(`dt: ${dt}`, 10, 60);
	requestAnimationFrame(gameloop);
}

window.addEventListener('resize', resizecanvas);
resizecanvas();
requestAnimationFrame(gameloop);
