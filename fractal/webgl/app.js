

const zoomIncreaseRatioPerSecond = 1
const mandelbrotMaxIteration = 100

let fps;
let info;
let lastLoop=0;
let canvas, context, program, buffer;
let vertices;
let width, height;
let zoom = 300;
let position = {x:800, y:400};
let mouse = {
	down:false,
	x:0, 
	y:0
}


let locations = {}

const vertexShader = `
attribute vec4 aVertexPosition;

void main() {
  gl_Position = aVertexPosition;
}
`;

const fragmentShader = `
precision highp float;

uniform float width;
uniform float height;
uniform float zoom;
uniform float position_x;
uniform float position_y;

float mandelbrot(float x, float y) {
	float temp;
	float real = x;
	float imaginary = y;
	for (float i = 0.0; i < 100.0; i++)
	{
		temp = real;
		real = temp*temp - imaginary*imaginary + x;
		imaginary = 2.0 * temp * imaginary + y;

		if(real * imaginary > zoom) 
		{
			return i/40.0;
		}
	}
	return 0.0;
}


void main() {

	float x = gl_FragCoord.xy[0];
	float y = height-gl_FragCoord.xy[1];

	float red = y/height;
	float green = x/width;
	float value = mandelbrot((x-position_x)/zoom, (position_y-y)/zoom);

	gl_FragColor = vec4(value*red,value*green, value,1.0);
}
 `;

function loadShader(context, type, source)
{
	const shader = context.createShader(type);
	context.shaderSource(shader, source);
	context.compileShader(shader);
	if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
	    alert(context.getShaderInfoLog(shader));
	}
	return shader;
}


function init()
{
	info = document.getElementById('fps');
	canvas = document.getElementById('canvas');
	context = canvas.getContext("webgl");
	height = canvas.height;
	width = canvas.width;


	canvas.onmousedown = mousedown;
	canvas.onmouseleave = mouseup;
	canvas.onmouseup = mouseup;
	canvas.onmousemove = mousemove;

	vertices = [
		-1.0,  1.0,
		1.0,  1.0,
		-1.0, -1.0,
		1.0, -1.0,
	]

	canvas.onmousedown = mousedown;
	canvas.onmouseleave = mouseup;
	canvas.onmouseup = mouseup;
	canvas.onmousemove = mousemove;

	// prepare program and shaders
	program = context.createProgram();
	context.attachShader(program, loadShader(context, context.VERTEX_SHADER, vertexShader));
	context.attachShader(program, loadShader(context, context.FRAGMENT_SHADER, fragmentShader));
	context.linkProgram(program);


	// prepare buffer
	buffer = context.createBuffer();
	context.bindBuffer(context.ARRAY_BUFFER, buffer);
	context.bufferData(context.ARRAY_BUFFER, new Float32Array(vertices), context.STATIC_DRAW);

	// prepare locations
	locations.width = context.getUniformLocation(program, 'width');
	locations.height = context.getUniformLocation(program, 'height');
	locations.zoom = context.getUniformLocation(program, 'zoom');
	locations.position_x = context.getUniformLocation(program, 'position_x');
	locations.position_y = context.getUniformLocation(program, 'position_y');

	// bind constants and init context usage
  	const position = context.getAttribLocation(program, 'aVertexPosition');
    context.bindBuffer(context.ARRAY_BUFFER, buffer);
    context.vertexAttribPointer(position,2,context.FLOAT,false,0,0);
    context.enableVertexAttribArray(position);
  	context.useProgram(program);

	context.uniform1f(locations.width, width);
	context.uniform1f(locations.height, height);
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

	// display fps
	info.innerHTML = fps.toFixed(2);

	// save timestamp
	lastLoop=timestamp;
}


function draw()
{
	context.uniform1f(locations.zoom, zoom);
	context.uniform1f(locations.canvas_width, width);
	context.uniform1f(locations.canvas_height, height);
	context.uniform1f(locations.position_x, position.x);
	context.uniform1f(locations.position_y, position.y);
    context.drawArrays(context.TRIANGLE_STRIP, 0, 4);
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