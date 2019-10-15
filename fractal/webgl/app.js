const zoomIncreaseRatioPerSecond = 1.01
const mandelbrotMaxIteration = 100

let fps;
let info;
let canvas, context, program, buffer;
let vertices;
let lastLoop=0;
let width, height;
let zoom = .4;
let position = {x:1.7, y:-1};
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
uniform float dx;
uniform float dy;

float mandelbrot(float x, float y) {
	float temp;
	float real = x;
	float imaginary =y;
	for (float i = 0.0; i < 100.0; i++)
	{
		temp = real;
		real = temp*temp - imaginary*imaginary + x;
		imaginary = 2.0 * temp * imaginary + y;

		if(real * imaginary > 200.0*zoom) 
		{
			return i/100.0;
		}
	}
	return 0.0;
}

void main() {

	vec2 xy = gl_FragCoord.xy / vec2(width, height);
	
	float x = xy[0];
	float y = xy[1];
	float red = (y);
	float green = (x);
	float value = mandelbrot(x/zoom - dx,y/zoom + dy);

	gl_FragColor = vec4(value*red,value*green, value,1.0);
}
`;


function loadShader(context, type, source)
{
	const shader = context.createShader(type);
	context.shaderSource(shader, source);
	context.compileShader(shader);
	return shader;
}

function init()
{
	info = document.getElementById('fps');
	canvas = document.getElementById('canvas');
	context = canvas.getContext("webgl");
	height = canvas.height;
	width = canvas.width;

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
	locations.dx = context.getUniformLocation(program, 'dx');
	locations.dy = context.getUniformLocation(program, 'dy');

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
		zoom *= zoomIncreaseRatioPerSecond;
		position.x -= (mouse.x - width/2) / (width*fps*zoom);
		position.y -= (mouse.y - height/2) / (height*fps*zoom);
	}

	// display fps
	info.innerHTML = fps.toFixed(2);

	// save timestamp
	lastLoop=timestamp;
}


function draw()
{
	context.uniform1f(locations.zoom, zoom);
	context.uniform1f(locations.dx, position.x);
	context.uniform1f(locations.dy, position.y);
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