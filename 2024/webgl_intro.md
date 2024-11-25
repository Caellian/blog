---
title: "Uvod u WebGL"
summary: "RG - Vježbe 3: Uvod u WebGL"
topic: "računalna grafika"
lang: hr
tags:
  - WebGL
---

## Zadatak 1: usporedba OpenGLa i WebGLa

<div class="strong-cols row-titles"></div>

| |WebGL|OpenGL|
|-:|:-|:-|
| Upotreba | prikaz grafičkih komponenti u okruženju s ograničenim pristupom karakteristikama hardvera | grafički prikaz uz nesiguran pristup hardveru |
| Programski dizajn | web aplikacije | nativne aplikacije |
| Programski jezik | JS | C |
| Značajke i funkcije | WebGL2: [OpenGL ES 3.0](https://registry.khronos.org/OpenGL/specs/es/3.0/es_spec_3.0.pdf) + [izmjene](https://registry.khronos.org/webgl/specs/latest/2.0/)<br/> WebGL: [OpenGL ES 2.0](https://registry.khronos.org/OpenGL/specs/es/2.0/es_full_spec_2.0.pdf) + [izmjene](https://registry.khronos.org/webgl/specs/latest/1.0/) | [OpenGL 4.5](https://registry.khronos.org/OpenGL-Refpages/gl4/) |

Grafički cjevovod je identičan, samo ima ograničenja s WebGL strane - nema
`double` tip realnih brojeva i 3D teksture. WebGL je hardenana varijanta GLESa
koji je OpenGL prilagođen za mobilne uređaje.

I naravno, veselimo se [WebGPU](https://www.w3.org/TR/webgpu/) standardu, kojim
će biti izglađene implementacijske razlike!

## Zadatak 2: lokalno razvojno okruženje

Doradio sam infrastrukturu stranice jer je dinamičko izvođenje JSa i tako bilo u
planu za blog (iako ne u ovom razmjeru).

Svi zadaci su riješeni u ovom Markdown dokumentu, koji funkcionira poput
[Jupyter](https://jupyter.org/) bilježnica, samo s HTMLom i JSom umjesto
Pythona, te se pokreće u pregledniku.

Za pisanje koda je korišten OSSCode.

## Zadatak 3: canvas element i crtanje kvadrata


```html
<!--#! name:"index.html"-->
<html>
<head>
  <title>WebGL intro</title>
</head>
<body onload="main()">
  <canvas id="glcanvas" width="500" height="500">
    Canvas HTML komponenta nije podržana
  </canvas>

<style>
  canvas {
    border: 3px solid black;
    background-color: lightgray;
  }
</style>
</body>
</html>
```

<style>
canvas {
  border: 3px solid black;
  background-color: lightgray;
}
</style>

<script class="show">
//#! name:"index.js"
function main() {
  const canvas = document.querySelector("canvas#glcanvas");
  if (!window.HTMLCanvasElement) {
    console.log("non-standard browser HTMLCanvasElement support");
    return;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.style.display = "block";
    canvas.innerText = "2D kontekst crtanja nije podržan";
    console.log("Context2D not supported by browser");
    return;
  }

  ctx.fillStyle = "blue";
  ctx.fillRect(200, 300, 100, 100);
  
  ctx.strokeStyle = "yellow";
  ctx.beginPath();
  ctx.moveTo(200, 300);
  ctx.lineTo(300, 400);
  ctx.stroke();

  ctx
}
</script>

<canvas id="glcanvas" width="500" height="500">
Canvas HTML komponenta nije podržana
</canvas>

<script>
// umjesto `body onload="main()"`
main()
</script>

## Zadatak 4: renderiranje praznog platna za crtanje

```html
<!--#! name:"WebGL_template.html" -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Draw Multiple Points</title>
  </head>

  <body onload="main()">
    <canvas id="clean" width="400" height="400">
    Please use a browser that supports "canvas"
    </canvas>

    <script src="./lib/webgl-utils.js"></script>
    <script src="./lib/webgl-debug.js"></script>
    <script src="./lib/cuon-utils.js"></script>
    <script src="zadatak1.js"></script>
  </body>
</html>
```

<script src="./lib/webgl-utils.js"></script>
<script src="./lib/webgl-debug.js"></script>
<script src="./lib/cuon-utils.js"></script>

<script class="show">
//#! name:"WebGL_template.js"
// Vertex shader program
function main() {
  // Dohvacanje <canvas> elementa
  var canvas = document.getElementById('webgl-z4');

  // Postavljanje konteksta renderiranja za WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Specificiranje boje za brisanje <canvas>
  gl.clearColor(0, 0, 0, 1);

  // Brisanje <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}
</script>

<canvas id="webgl-z4" width="400" height="400">
Please use a browser that supports "canvas"
</canvas>

<script>
// umjesto `body onload="main()"`
main()
</script>


## Zadatak 5: crtanje točke (korištenje shadera)

<script class="show">
//#! name:"zadatak1.js"
// Vertex shader program
var VSHADER_SOURCE =`
void main() {
  gl_Position = vec4(0.2, 0.3, 0.0, 1.0);
  gl_PointSize = 10.0;
}`;

// Fragment shader program
var FSHADER_SOURCE = `
void main() {
  gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
}`;

function main() {
  // Dohvacanje <canvas> elementa
  var canvas = document.getElementById('webgl-z5');

  // Postavljanje konteksta renderiranja za WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.error('Failed to get the rendering context for WebGL');
    return;
  }

  // Inicijalizacija shadera
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.error('Failed to intialize shaders.');
    return;
  }

  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Crtanje tocaka
  gl.drawArrays(gl.POINTS, 0, 1);
}
</script>

<canvas id="webgl-z5" width="500" height="500">
Please use a browser that supports "canvas"
</canvas>

<script>
// umjesto `body onload="main()"`
main()
</script>

## Zadatak 6: korištenje varijable atributa i uniformne varijable

<script class="show">
// Vertex shader program
var VSHADER_SOURCE =`
attribute vec2 a_Position;
void main() {
  gl_Position = vec4(a_Position, 0.0, 1.0);
  gl_PointSize = 10.0;
}`;

// Fragment shader program
var FSHADER_SOURCE = `
void main() {
  gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
}`;
</script>
<script class="show">
function main() {
  // Dohvacanje <canvas> elementa
  var canvas = document.getElementById('webgl-z6');

  // Postavljanje konteksta renderiranja za WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Inicijalizacija shadera
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }
  gl.vertexAttrib2f(a_Position, 0.5, 0.2);

  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Crtanje tocaka
  gl.drawArrays(gl.POINTS, 0, 1);
}
</script>

<canvas id="webgl-z6" width="500" height="500">
Please use a browser that supports "canvas"
</canvas>

<script>
// umjesto `body onload="main()"`
main()
</script>

## Zadatak 7: pretvorba koordinata točke

<script class="show">
function DeviceToNormalised(canvas, pos) {
  const xPx = 2.0 / canvas.width;
  const yPx = -2.0 / canvas.height;
  return {
    x: Math.round((pos.x - canvas.width/2) * xPx * 100) / 100,
    y: Math.round((pos.y - canvas.height/2) * yPx * 100) / 100,
  };
}
</script>

<script class="show">
function init(canvas, vertex = ArticleScope.VSHADER_SOURCE, fragment = ArticleScope.FSHADER_SOURCE) {
  if (canvas == null) {
    return
  }

  // Postavljanje konteksta renderiranja za WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Inicijalizacija shadera
  if (!initShaders(gl, vertex, fragment)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  return gl;
}
</script>
<script class="show">
function draw_point(gl, position) {
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }
  gl.vertexAttrib2f(a_Position, position.x, position.y);

  gl.clear(gl.COLOR_BUFFER_BIT);

  // Crtanje tocaka
  gl.drawArrays(gl.POINTS, 0, 1);
}
</script>

<canvas id="webgl-z7" width="500" height="500">
Please use a browser that supports "canvas"
</canvas>

<script class="show">
let canvas = document.getElementById("webgl-z7");
let ctx = init(canvas);
draw_point(ctx, DeviceToNormalised(canvas, {
  x: 200,
  y: 300,
}));
</script>

## Zadatak 8: korištenje event handlera

<canvas id="webgl-z8" width="500" height="500">
Please use a browser that supports "canvas"
</canvas>

<script class="show">
let canvas = document.getElementById("webgl-z8");
let ctx = init(canvas);
canvas.onclick = (ev) => {
  let rect = canvas.getBoundingClientRect();
  let pos = {
    x: ev.clientX - rect.x,
    y: ev.clientY - rect.y,
  };
  draw_point(ctx, DeviceToNormalised(canvas, pos));
}
</script>

## Zadatak 9: ePortfolio

<script class="show">
var VSHADER_SOURCE =`
attribute vec2 a_Position;
attribute float a_boxSize;
void main() {
  gl_Position = vec4(a_Position, 0.0, 1.0);
  gl_PointSize = a_boxSize;
}`;
</script>

<script class="show">
function draw_point(gl, position, size) {
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }
  gl.vertexAttrib2f(a_Position, position.x, position.y);
  var a_boxSize = gl.getAttribLocation(gl.program, 'a_boxSize');
  if (a_boxSize < 0) {
    console.log('Failed to get the storage location of a_boxSize');
    return;
  }
  gl.vertexAttrib1f(a_boxSize, size);

  gl.clear(gl.COLOR_BUFFER_BIT);

  // Crtanje tocaka
  gl.drawArrays(gl.POINTS, 0, 1);
}
</script>

<div style="display:flex;align-items:center;height:min-content">

<canvas id="webgl-z9" width="400" height="300">
Please use a browser that supports "canvas"
</canvas>

<div style="width:100%">
<div style="display:flex;align-content:center;justify-content:space-evenly;padding-bottom:1ch">
  <code class="language-math">x_\mathrm{px},\ y_\mathrm{px}</code>
  <code class="language-math">\to</code>
  <code class="language-math">x_\mathrm{GL},\ y_\mathrm{GL}</code>
</div>
<div id="points">
</div>

<style>
#points {
  display: grid;
  max-height: 250px;
  overflow-y: auto;
  grid-template-columns: 1fr auto 1fr 1fr auto 1fr;
  justify-content: start;

  span:nth-child(3n-2) {
    text-align: right;
  }
  span:nth-child(3n-1) {
    margin-right: 0.5ch;
  }
}
</style>
</div>
</div>

<div style="display:grid;grid:auto auto/auto 1fr;grid-auto-flow: row;align-items:center;gap:2ch;width:100%">
  <span>Boja pozadine:</span>
  <input style="--current-color:red" type="range" min="0" max="360" value="0" id="bgColorPicker">
  <span>Veličina točke:</span>
  <input style="--box-size:20px" type="range" step="0.2" min="20" max="60" value="20" id="pointSize">

  <style>
    #bgColorPicker {
      appearance: none;
      flex-grow: 1;
      height: 0.7rem;
      border-radius: 100vw;
      background: linear-gradient(
        90deg,
        rgba(255, 0, 0, 1) 0%,
        rgba(255, 154, 0, 1) 10%,
        rgba(208, 222, 33, 1) 20%,
        rgba(79, 220, 74, 1) 30%,
        rgba(63, 218, 216, 1) 40%,
        rgba(47, 201, 226, 1) 50%,
        rgba(28, 127, 238, 1) 60%,
        rgba(95, 21, 242, 1) 70%,
        rgba(186, 12, 248, 1) 80%,
        rgba(251, 7, 217, 1) 90%,
        rgba(255, 0, 0, 1) 100%
      );
      border: 2px solid white;
      outline: none;
      
      &::-webkit-slider-thumb,
      &::-moz-range-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 1rem;
        height: 1rem;
        border-radius: 100vw;
        background: var(--current-color);
        cursor: pointer;
        outline: 2px solid white;
        border: 1px solid black;
      }
    }
    #pointSize {
      appearance: none;
      flex-grow: 1;
      height: 0.1rem;
      background: var(--fg);
      margin: 58px;

      &::-webkit-slider-thumb,
      &::-moz-range-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: calc(var(--box-size) - 8px);
        height: calc(var(--box-size) - 8px);
        border-radius: 0;
        background: var(--bg);
        cursor: pointer;
        outline: 2px solid white;
        border: 2px solid black;
      }
    }
  </style>
</div>

<script>
// IZVOR: https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
const { abs, min, max, round } = Math;
function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1/3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1/3);
  }

  return [r, g, b];
}

function hueToRgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1/6) return p + (q - p) * 6 * t;
  if (t < 1/2) return q;
  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  return p;
}
</script>

<script class="show" defer>
let canvas = document.getElementById("webgl-z9");
let ctx = init(canvas);
let lastPos = { x: Math.random() * canvas.width, y: Math.random() * canvas.height };
let lastSize = 20 + 40 * Math.random();

let bgSlider = document.getElementById("bgColorPicker");
bgSlider.oninput = () => {
  bgSlider.style = `--current-color:hsl(${bgSlider.value}deg 100% 50%)`;
  let [r, g, b] = hslToRgb(bgSlider.value / 360, 0.5, 0.5);
  ctx.clearColor(r, g, b, 1);
  draw_point(ctx, DeviceToNormalised(canvas, lastPos), lastSize);
}
bgSlider.value = Math.random() * 360;
bgSlider.oninput();

let sizeSlider = document.getElementById("pointSize");
sizeSlider.oninput = () => {
  sizeSlider.style = `--box-size:${sizeSlider.value}px`;
  lastSize = sizeSlider.value;
  draw_point(ctx, DeviceToNormalised(canvas, lastPos), lastSize);
}
sizeSlider.value = lastSize;
sizeSlider.oninput();

let ps = document.getElementById("points");
function main() {
  lastPos = { x: Math.round(Math.random() * canvas.width), y: Math.round(Math.random() * canvas.height) };
  let norm = DeviceToNormalised(canvas, lastPos);
  draw_point(ctx, norm, lastSize);
  ps.innerHTML = ps.innerHTML + `<span>${lastPos.x}</span><span>,</span><span>${lastPos.y}</span><span>${norm.x}</span><span>,</span><span>${norm.y}</span>\n`;
  ps.scrollTop = ps.scrollHeight;
  
}
</script>

<script>
// Simulacija ponovog pokretanja.
setTimeout(function update() {
  main();
  setTimeout(update, 3000);
}, 10);
</script>
