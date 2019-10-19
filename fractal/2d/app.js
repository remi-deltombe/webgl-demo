const zoomIncreaseRatioPerSecond = .5
const mandelbrotMaxIteration = 100

let fps;
let info;
let canvas, context;
let lastLoop=0;
let bitmap, pixels;
let width, height;
let zoom = 300;
let position = {x:800, y:400};
let mouse = {
	down:false,
	x:0, 
	y:0
}

function mandelbrot(x,y)
{
    let real = x;
    let imaginary = y;
	for(let i = 0; i < mandelbrotMaxIteration; i++)
	{
		const temp = real;
		real = temp**2 - imaginary**2 + x;
		imaginary = 2 * temp * imaginary + y;
		if(real * imaginary > zoom)
		{
			return (i/40);
		}
    }
    return 0;      
}   

function init()
{
	info = document.getElementById('fps');
	canvas = document.getElementById('canvas');
	context = canvas.getContext("2d");
	height = canvas.height;
	width = canvas.width;
	bitmap = context.createImageData(width, height);
	pixels = bitmap.data;

	canvas.onmousedown = mousedown;
	canvas.onmouseleave = mouseup;
	canvas.onmouseup = mouseup;
	canvas.onmousemove = mousemove;
}

function update(timestamp)
{
	// compute fps
	fps = 1000/(timestamp-lastLoop);

	// if mouse is down, update zoom and position
	if(mouse.down)
	{
		let zoomIncreaseRatio = zoomIncreaseRatioPerSecond / fps;
		let dx = position.x-mouse.x
		let dy = position.y-mouse.y
		zoom += zoom * zoomIncreaseRatio;
		position.x += (dx * zoomIncreaseRatio);
		position.y += (dy * zoomIncreaseRatio);
	}

	// compute each bitmap pixels color
	for(let y=0, i=0; y<height; ++y)
	{
		for(let x=0; x<width; ++x)
		{
			let red = (y/height) * 255;
			let green = (x/width) * 255;
			let value = mandelbrot((x-position.x)/zoom, (y-position.y)/zoom);
			pixels[i++] = ~~(value * red); // red
			pixels[i++] = ~~(value * green); // green
			pixels[i++] = ~~(value * 255); // blue
			pixels[i++] = 255; // alpha

		}
	}
	// display fps
	info.innerHTML = fps.toFixed(2);

	// save timestamp
	lastLoop=timestamp;
}


function draw()
{
	console.log(position.x, position.y);
	// draw bitmap
	context.putImageData(bitmap, 0, 0);  
}

function loop(timestamp)
{
	update(timestamp);
	draw();
	window.requestAnimationFrame(loop);
}

function mousedown(e)
{
	mouse.down=true;
	mousemove(e)
}	

function mouseup()
{
	mouse.down=false;
}

function mousemove(e)
{
	mouse.x=e.offsetX;
	mouse.y=e.offsetY;
}

window.onload = ()=>{
	init();
	loop(0);
}