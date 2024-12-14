---
title: "Crtanje 3D oblika"
summary: "RG - Vježbe 5: Crtanje 3D oblika"
topic: "računalna grafika"
lang: hr
tags:
  - WebGL
---

<script src="./webgl-debug.mjs" type="module"></script>
<script src="./gl_matrix/index.js" type="module"></script>
<script src="./gfx.js" type="module"></script>

<script>
// Uklonio sam ArticleScope is ESM modulea, pa redefiniram canvasContext da
// koristi ArticleScope s ove objave.
// Sada se ./gfx.js može koristiti i van okruženja mog bloga.
function init(canvas, options = {}) {
  return canvasContext(canvas, {
    ...options,
    mode: "3D", // koristimo 3D grafiku u ovoj objavi
    vertex: options.vertex || window.ArticleScope.VERTEX_SHADER,
    fragment: options.fragment || window.ArticleScope.FRAGMENT_SHADER,
  });
};
</script>

Za ove vježbe sam sa `vectorious` prešao na [`gl-matrix`](https://glmatrix.net)
biblioteku jer je `vectorious` column-major a WebGL row-major, i to mi je
prethodno uzrokovalo muke. `gl-matrix` ima veći fokus na performanse i složena
je upravo za primjenu s WebGLom te radi s poljima određenih tipova podataka
(engl. [Typed Arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)).

Ima dosta prednosti, i potpunija je biblioteka, iako zahtjeva malo više koda.
`vectorious` je još dosta nova biblioteka i ima dosta pogrešaka u njoj, a s
obzirom da je i moj kod za ovaj kolegij u izradi, teško mi je bilo odrediti
griješim li ja ili se radi o bugu i biblioteci koji koristim.

## Zadatak 1: crtanje kocke i njena rotacija

Jer različite stranice kocke želimo pobojati različitim bojama, potrebno je
duplicirati sve vrhove 3 puta. Postoje složenija rješenja koja se oslanjaju na
računanje normala stranica u fragment shaderu, no po zadanoj JS datoteci vidim
da je očekivano dupliciranje. Ovaj dio mi je oduzeo dosta vremena na kolokviju
jer nisam bio upoznat s `quad` funkcijom jer sam zadaću pisao bez gledanja u popratne
materijale za vježbu.


U biti, `quad` radi sljedeće:
<script class="show">
const CUBE_VERTICES = [
    vec3.fromValues(-0.5, -0.5,  0.5), // 0
    vec3.fromValues( 0.5, -0.5,  0.5), // 1
    vec3.fromValues( 0.5,  0.5,  0.5), // 2
    vec3.fromValues(-0.5,  0.5,  0.5), // 3
    vec3.fromValues(-0.5, -0.5, -0.5), // 4
    vec3.fromValues( 0.5, -0.5, -0.5), // 5
    vec3.fromValues( 0.5,  0.5, -0.5), // 6
    vec3.fromValues(-0.5,  0.5, -0.5), // 7
];
const CUBE_INDICES = [
    // Front               // Back
    0, 1, 2, 0, 2, 3,      4, 6, 5, 4, 7, 6,
    // Left                // Right
    0, 3, 4, 3, 7, 4,      1, 5, 6, 1, 6, 2,
    // Top                 // Bottom
    3, 2, 6, 3, 6, 7,      5, 1, 0, 4, 5, 0,
];
const FLAT_CUBE = CUBE_INDICES.map(i => CUBE_VERTICES[i]);
</script>

Jer su ideksi raspoređeni redoslijedom kojim želimo pobojati stranice, lagano je
definirati vrijednosti međuspremnika za boje:

<script class="show">
const CUBE_COLORS = (() => {
  const third = CUBE_INDICES.length / 3;
  return [
    ...Array(third).fill(vec3.fromValues(1.0, 0.0, 1.0)),
    ...Array(third).fill(vec3.fromValues(0.0, 1.0, 0.0)),
    ...Array(third).fill(vec3.fromValues(0.0, 0.0, 1.0)),
  ]
})();
</script>

Dodajemo `a_Color` u shadere kako bismo mogli prikazati svaku stranicu u drugoj
boji. A uporabom `varying` proslijeđujemo boju iz vertex shadera u fragment
shader:

```vert
//#! name:"VERTEX_SHADER" store-dynamic:true
attribute vec3 a_Position;
attribute vec3 a_Color;

uniform mat4 u_View;

varying vec3 color;

void main() {
  gl_Position = u_View * vec4(a_Position, 1.0);
  color = a_Color;
}
```
```frag
//#! name:"FRAGMENT_SHADER" store-dynamic:true
precision mediump float;

varying vec3 color;

void main() {
  gl_FragColor = vec4(color, 1.0);
}
```

Također je definirana `u_View` uniformna varijabla kojom možemo primjeniti
željenu transformaciju na kocku.

<canvas width="600" height="400" id="zad1">
Vaš preglednik ne podržava Canvas elemente za prikaz
</canvas>

<script class="show">
const gl = init("#zad1");

const position = vertexBuffer(gl, "a_Position", Format.Vec3F);
position.set(FLAT_CUBE);
position.enable();
const color = vertexBuffer(gl, "a_Color", Format.Vec3F);
color.set(CUBE_COLORS);
color.enable();

// transformacija koju ćemo kasnije definirati, za sada je identiteta
const T = uniform(gl, "u_View", Format.Mat4F);
gl.drawArrays(gl.TRIANGLES, 0, position.length);
</script>

Na prikazanoj kocki se vidi samo prednja stranica te trebamo primjeniti
projekciju i tražene transformacije. Prilikom izrade projekcije ćemo pomnožiti
`left` i `right` plohe s omjerom širine i visine kako kocka nebi izgledala
izduljeno. Time izbjegavamo potrebu za `<canvas>` elementom jednakih dimenzija.

<script class="show">
// projekcija
const orthoFor = (gl) => {
  const aspect = gl.canvas.width / gl.canvas.height;
  return mat4.orthoNO(
    mat4.create(),
    -1 * aspect, // left
    1 * aspect,  // right
    1,           // bottom
    -1,          // top
    0.001,       // near
    1000,        // far
  )
}
let P = orthoFor(gl);
// pogled
const onlyRotation = (rotation) => mat4.fromRotationTranslationScale(
  mat4.create(),
  rotation,
  vec3.fromValues(0, 0, -10),
  vec3.fromValues(1, 1, 1),
);
let V = onlyRotation(quat.fromEuler(quat.create(), 30, 10, 0));
mat4.multiply(V, P, V);
// računamo umnožak matrica na procesoru
</script>

Time dobivamo sljedeću transformacijsku matricu:
<pre><code id="cubeTransform"></code></pre>
<script>document.getElementById("cubeTransform").innerText = formatMatrix(V);</script>

Kada primjenimo dobivenu matricu na kocku, možemo vidjeti i njene druge stranice.

<button id="applyCubeTransform">Primjeni</button>

<script>
function doCubeTransform() {
  gl.canvas.scrollIntoView({ behavior: "smooth" });
  const startRotation = quat.create();
  const targetRotation = quat.fromEuler(quat.create(), 30, 10, 0);
  
  T.set(V);
  setTimeout(() => {
    fractionTime((t) => {
      let rotation = quat.lerp(quat.create(), startRotation, targetRotation, t);
      V = onlyRotation(rotation);
      mat4.multiply(V, P, V);
      T.set(V);
      gl.clear(); // moja init funkcija vrati izmjenjeni WebGL2RenderingContext
      // tako da ne trebam navesti bitove za clearanje je default vrijednosti ovise
      // o kontekstu crtanja (2d - color; 3d - color & depth).
      gl.drawArrays(gl.TRIANGLES, 0, position.length);
    }, 2000);
  }, 500);
}
document.getElementById("applyCubeTransform").onclick = doCubeTransform;
</script>

## Zadatak 2: dodavanje interaktivnosti

Uz malo dodatnog koda, možemo učiniti rotaciju kocke potpuno interaktivnom.

<script class="show">
const gl = init("#zad2");
const position = vertexBuffer(gl, "a_Position", Format.Vec3F);
position.set(FLAT_CUBE);
position.enable();
const color = vertexBuffer(gl, "a_Color", Format.Vec3F);
color.set(CUBE_COLORS);
color.enable();

// transformacija koju ćemo kasnije definirati, za sada je identiteta
const T = uniform(gl, "u_View", Format.Mat4F);
const P = orthoFor(gl);
T.set(P);
gl.drawArrays(gl.TRIANGLES, 0, position.length);

const step = 0.0007;
function drawWithArrays(gl, n) {
  gl.drawArrays(gl.TRIANGLES, 0, n)
}
function setupRotation(gl, T, n, x, y, z, draw = drawWithArrays) {
  const rotation = quat.create();
  let currentAxis = quat.rotateX;
  animation((deltaTime) => {
    if (gl.visible) {
      currentAxis(rotation, rotation, step * deltaTime);
      const V = onlyRotation(rotation);
      mat4.multiply(V, P, V);
      T.set(V);
    }
    gl.clear();
    draw(gl, n);
  });

  x.onclick = () => {
    currentAxis = quat.rotateX;
  }
  y.onclick = () => {
    currentAxis = quat.rotateY;
  }
  z.onclick = () => {
    currentAxis = quat.rotateZ;
  }
}
setupRotation(
  gl, T, position.length,
  document.getElementById("xButton"),
  document.getElementById("yButton"),
  document.getElementById("zButton")
)
</script>

<canvas width="600" height="400" id="zad2">
Vaš preglednik ne podržava Canvas elemente za prikaz
</canvas>

<div style="display:flex;gap:0.5rem;justify-content:center;margin-bottom:2rem">
<button class="sharp" id="xButton">Rotiraj po x-osi</button>
<button class="sharp" id="yButton">Rotiraj po y-osi</button>
<button class="sharp" id="zButton">Rotiraj po z-osi</button>
</div>

Osi rotacije su relativne na virtualni predmet jer ažuriram isti kvaternion.
Kada bi umjesto toga njega množio s dodatnom rotacijom s lijeva, konačna
rotacija bi bila relativna na globalne osi.

## Zadatak 3: crtanje tetraedra i interpoliranje boje u poligonu

Definiramo vrhove i boje tetraedra:

<script class="show">
const t60 = Math.sqrt(3);
const H = 0.5 * t60;
const VERTICES = [
  vec3.fromValues(-0.5, -0.5, 0.5),
  vec3.fromValues(0.5, -0.5, 0.5),
  vec3.fromValues(0, -0.5, 0.5 - H),
];
const inner = Math.sqrt(0.25 + (1 - H) * (1 - H));
const height = inner * t60;
VERTICES.push(vec3.fromValues(0, height - 0.5, 0.5 - H + inner));
// pomakne sve vrhove za (ishodište - geometrijska sredina)
centerVertices(VERTICES);
</script>

Definiramo <span id="indices-definition">indekse tetraedra</span> kako bi mogli duplicirati njegove vrhove:

<script class="show">
const INDICES = [
  0, 1, 2, 1, 0, 3, 2, 1, 3, 0, 2, 3
];
const REGULAR_TETRAHEDRON = INDICES.map(i => VERTICES[i]);
const REGULAR_TETRAHEDRON_COLORS = [
  ...Array(3).fill(vec3.fromValues(1.0, 0.5, 0)),
  ...Array(3).fill(vec3.fromValues(0.2, 0.8, 0.2)),
  ...Array(3).fill(vec3.fromValues(0.0, 0.5, 0.5)),
  ...Array(3).fill(vec3.fromValues(1.0, 0.5, 1.0)),
];
</script>

Shader ostaje isti.

<canvas width="600" height="400" id="zad3-1">
Vaš preglednik ne podržava Canvas elemente za prikaz
</canvas>

<div style="display:flex;gap:0.5rem;justify-content:center;margin-bottom:2rem">
<button class="sharp" id="xButton1">Rotiraj po x-osi</button>
<button class="sharp" id="yButton1">Rotiraj po y-osi</button>
<button class="sharp" id="zButton1">Rotiraj po z-osi</button>
</div>

<script class="show">
const gl = init("#zad3-1");
const position = vertexBuffer(gl, "a_Position", Format.Vec3F);
position.set(REGULAR_TETRAHEDRON);
position.enable();
const color = vertexBuffer(gl, "a_Color", Format.Vec3F);
color.set(REGULAR_TETRAHEDRON_COLORS);
color.enable();

const T = uniform(gl, "u_View", Format.Mat4F);
const P = orthoFor(gl);
T.set(P);
gl.drawArrays(gl.TRIANGLES, 0, position.length);

setupRotation(
  gl, T, position.length,
  document.getElementById("xButton1"),
  document.getElementById("yButton1"),
  document.getElementById("zButton1")
)
</script>

Za drugi dio ovog zadatka je smisleno koristiti međuspremnik elemenata jer je
svakom vrhu pridružena jedinstvena boja. Njega postavljamo na isti način kao i
međuspremnike za atribute vrhova, samo je potrebno paziti da pohranjeni podaci
odgovaraju `GLenum` tipu podatka na koji primjenjujemo `drawElements`.

Za početak definiramo mrežu iglastog tetraedra:
<script class="show">
const POINTED_TETRAHEDRON = [
  ...VERTICES.slice(0, -1).map(vec3.clone), // potrebno kopiranje zbog centriranja
  vec3.fromValues(0, height + 0.5, 0.5 - H + inner),
];
centerVertices(POINTED_TETRAHEDRON);
</script>
Zatim svakom vrhu dodjeljujemo boju:
<script class="show">
const POINTED_TETRAHEDRON_COLORS = [
  vec3.fromValues(0, 1, 1),
  vec3.fromValues(1, 0, 1),
  vec3.fromValues(1, 1, 0),
  vec3.fromValues(0.5, 0.5, 0.5),
];
</script>

<script>
const gl = init("#zad3-2");
const position = vertexBuffer(gl, "a_Position", Format.Vec3F);
position.set(POINTED_TETRAHEDRON);
position.enable();
const color = vertexBuffer(gl, "a_Color", Format.Vec3F);
color.set(POINTED_TETRAHEDRON_COLORS);
color.enable();
const T = uniform(gl, "u_View", Format.Mat4F);
const P = orthoFor(gl);
T.set(P);
</script>

Koristit ćemo prethodno definirani popis indeksa [`INDICES`](#indices-definition) kao vrijednosti međuspremnika elemenata:

<script class="show">
const elements = elementBuffer(gl, Format.U8);
elements.set(INDICES);
// ne trebamo pozivati gl.enableVertexAttribArray jer se podrazumijeva
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elements.buffer);
// ili nadalje elements.bind()

gl.drawElements(gl.TRIANGLES, 0, gl.UNSIGNED_BYTE, elements.length);
// ili nadalje elements.draw()
</script>

<canvas width="600" height="400" id="zad3-2">
Vaš preglednik ne podržava Canvas elemente za prikaz
</canvas>

<div style="display:flex;gap:0.5rem;justify-content:center;margin-bottom:2rem">
<button class="sharp" id="xButton2">Rotiraj po x-osi</button>
<button class="sharp" id="yButton2">Rotiraj po y-osi</button>
<button class="sharp" id="zButton2">Rotiraj po z-osi</button>
</div>

<script>
setupRotation(
  gl, T, position.length,
  document.getElementById("xButton2"),
  document.getElementById("yButton2"),
  document.getElementById("zButton2"),
  (gl, n) => {
    elements.draw()
  }
)
</script>

## Zadatak 4: krnja piramida

Krnju piramidu možemo jednostavno konstruirati od postojećih vrhova kocke, tako
što pomaknemo gordnje vrhove (s pozitivnijim Y koordinatama) bliže Y osi:

<script class="show">
const SCALE_XZ = mat4.fromValues(
  0.5, 0, 0, 0,
  0, 0.3, 0, 0,
  0, 0, 0.5, 0,
  0, 0, 0, 1,
);
const TRUNCATED_PYRAMID_VERTICES = CUBE_VERTICES.map(vec3.clone).map((v) => {
  if (v[1] > 0) {
    vec3.transformMat4(v, v, SCALE_XZ)
  }
  return v;
});
centerVertices(TRUNCATED_PYRAMID_VERTICES);
// indeksi ostaju isti kao i za kocku
const TRUNCATED_PYRAMID = CUBE_INDICES.map(i => TRUNCATED_PYRAMID_VERTICES[i]);
const TP_COLORS = (() => {
  const face = CUBE_INDICES.length / 6;
  const c = (r, g, b) => vec3.fromValues(r / 255, g / 255, b / 255);
  const fc = (r, g, b) => Array(face).fill(c(r, g, b));
  return [
    ...fc(51, 186, 204),
    ...fc(81, 145, 255),
    ...fc(255, 120, 219),
    ...fc(192, 193, 255),
    ...fc(108, 83, 187),
    ...fc(210, 155, 61),
  ]
})();
</script>

```vert
//#! name:"VERTEX_SHADER" store-dynamic:true
attribute vec3 a_Position;
attribute vec3 a_Color;

uniform mat4 u_Projection;
uniform mat4 u_Model;

varying vec3 color;

void main() {
  gl_Position = u_Projection * u_Model * vec4(a_Position, 1.0);
  color = a_Color;
}
```

<canvas width="600" height="400" id="zad4">
Vaš preglednik ne podržava Canvas elemente za prikaz
</canvas>

<div id="trackpoint" role="slider" title="Rotiraj krnju piramidu">
<span class="left"></span>
<span class="right"></span>
<span class="up"></span>
<span class="down"></span>
</div>

<script class="show">
const gl = init("#zad4");
const points = vertexBuffer(gl, "a_Position", Format.Vec3F)
  .set(TRUNCATED_PYRAMID)
  .enable();
vertexBuffer(gl, "a_Color", Format.Vec3F)
  .set(TP_COLORS)
  .enable();
const aspect = gl.canvas.width / gl.canvas.height;
uniform(gl, "u_Projection", Format.Mat4F).set(
  mat4.multiply(
    mat4.create(),
    mat4.perspectiveNO(
      mat4.create(),
      Math.PI / 3, // fovy
      aspect,        // aspect ratio
      0.001,         // near
      1000           // far
    ),
    mat4.fromTranslation(mat4.create(), vec3.fromValues(0, 0, -2))
  )
);
const M = uniform(gl, "u_Model", Format.Mat4F);

let xState = 0;
let yState = 0;
let rotationState = mat4.create();
const SENSITIVITY = 0.3;
function addRotation(x, y) {
  let xState = x * SENSITIVITY;
  let yState = y * SENSITIVITY;
  const change = mat4.fromQuat(
    mat4.create(),
    quat.fromEuler(quat.create(), yState, xState, 0)
  );
  mat4.multiply(rotationState, change, rotationState);
}
const autorotation = animation(() => {
  addRotation(5, 2);
}, { fps: 30 });
animation(() => {
  M.set(rotationState);
  gl.clear();
  points.draw();
})
</script>

<style>
#trackpoint {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto 1fr auto;
  align-items: center;
  width: 4rem;
  height: 4rem;
  padding: 0.4rem;
  background-color: var(--fg);
  margin: 1rem auto;
  border-radius: 100vw;
  border: 4px solid var(--accent-7);
  cursor: grab;
  &:hover {
    border: 4px solid var(--accent-4);
  }
  &:active {
    border: 4px solid var(--accent-3);
    cursor: all-scroll;
  }
}
#trackpoint>span {
  display: block;
  background: linear-gradient(45deg, var(--bg), var(--bg) 50%, transparent 50%, transparent);
  width: 1ch;
  height: 1ch;
  margin: auto;
  &.up {
    grid-area: 1 / 2 / 2 / 3;
    transform: rotate(135deg);
  }
  &.down {
    grid-area: 3 / 2 / 4 / 3;
    transform: rotate(-45deg);
  }
  &.left {
    grid-area: 2 / 1 / 3 / 2;
    transform: rotate(45deg);
  }
  &.right {
    grid-area: 2 / 3 / 3 / 4;
    transform: rotate(225deg);
  }
}
</style>
<script>
const trackpoint = document.getElementById("trackpoint");
function moveListener(e) {
  const x = e.clientX;
  const y = e.clientY;
  const deltaX = x - this.lastX;
  const deltaY = (y - this.lastY) * -1;
  addRotation(deltaX, -deltaY);
  this.lastX = x;
  this.lastY = y;
}
function setupMoveHandler(e) {
  autorotation.stop();
  document.body.style.cursor = "all-scroll";
  document.body.style.userSelect = "none";
  const state = {
    lastX: e.clientX,
    lastY: e.clientY,
  };
  const listener = moveListener.bind(state);
  document.addEventListener("mousemove", listener);
  document.addEventListener("mouseup", function resetState() {
    autorotation.start();
    document.body.style.cursor = null;
    document.body.style.userSelect = null;
    document.removeEventListener("mousemove", listener);
    document.removeEventListener("mouseup", resetState);
    document.removeEventListener("mousedown", resetState);
    document.removeEventListener("scroll", resetState); // zoom?
    trackpoint.addEventListener("mousedown", setupMoveHandler);
  });
  trackpoint.removeEventListener("mousedown", setupMoveHandler);
}
trackpoint.addEventListener("mousedown", setupMoveHandler);
</script>