---
title: "Crtanje primitiva"
summary: "RG - Vježbe 4: Crtanje primitiva u WebGL-u"
topic: "računalna grafika"
lang: hr
tags:
  - WebGL
---

## Zadatak 1: iscrtavanje više točaka korištenjem međuspremnika

U prethodnim vježbama smo se oslanjali na gotove skripte koje apstraktiraju neke
operacije u radu s WebGLom:

<script src="https://caellian.github.io/blog/2024/webgl_intro/lib/webgl-utils.js"></script>
<script src="https://caellian.github.io/blog/2024/webgl_intro/lib/webgl-debug.js"></script>
<script src="https://caellian.github.io/blog/2024/webgl_intro/lib/cuon-utils.js"></script>

U ovim vježbama gradimo na to uporabom transformacijskih matrica koje
ujedinstvuju afine transformacije koje se mogu provesti na geometriji prilikom prikaza.

Za prvi zadatak je cilj koristiti međuspremnik za pohranu pozicija točaka
umjesto njihovog izražavanja u kodu. Ovaj korak je neophodan za prikaz složenije
grafike jer oslanjanje na JS objekte i ručan unos znatno usporava izvođenje
grafičkih programa. I kod nativnih aplikacija je cilj što veću količinu podataka
pohraniti na grafičkoj kartici što je ranije moguće jer je sam prijenos podataka
često ograničavajuć faktor.

S obzirom da je slaganje atributa vrlo repetitivno, a niti jedan API za crtanje
ne zahtijeva velik broj jedinstvenih svojstava za atribute, smisleno je složiti
generalne konstruktore za ove objekte. 

Koristimo atribute koji su generalno sličnog uređenja:
```ts
// #! name:"Format atributa"
type DataSource = ArrayBuffer | SharedArrayBuffer | TypedArray | DataView;

/** duljina vektora, matrice ili tenzora */
type Dim = number | [number, number] | [number, number, number];

interface AttributeFormat {
  source: DataSource;
  size: Dim;
  glType: GLenum;
  normalize?: boolean;
  stride?: GLsizei;
  offset?: GLintptr;
}
```

`stride` i `offset` još ne koristimo je su svi atributi pohranjeni u zasebne
međuspremnike. Također, generalni `Format`i koje ćemo koristiti ih nebi trebali
navoditi. No korisno je navesti ih u formatu jer nam to dozvoljava da ih kasnije
umetnemo. Slično vrijedi i za `normalize` koji se primjenjuje samo za `byte`,
`short`, `unsigned_byte` i `unsigned_short` tipove podataka te ovisi o primjeni.

`size` će skoro uvijek biti običan broj jer, iako možemo spremiti matrice u
atribute, u kontekstu jednostavne (i pravovremene) grafike je to rijetko
korisno.

Sada kada je definiran format, možemo složiti `Format` enum sa svim formatima
koje ćemo koristiti:
<script class="show">
// #! name:"Definicija Format enumeracije"
const GL = WebGL2RenderingContext;

/**
 * @type {Readonly<Record<string, AttributeFormat>>}
 */
const Format = Object.freeze({
  "Vec2F": {
    source: Float32Array,
    size: 2,
    glType: GL.FLOAT,
  },
  "Vec3F": {
    source: Float32Array,
    size: 3,
    glType: GL.FLOAT,
  },
  "Vec4F": {
    source: Float32Array,
    size: 4,
    glType: GL.FLOAT,
  }
  // Nije puno za sada :)
})
</script>

Znamo da generalno atribute dohvaćamo i podešavamo vrlo sličnim postupkom:
```js
// #! name:"Procedura inicijalizacije atributa"
// dohvaćamo poziciju attributa
var a_FragColor = gl.getAttribLocation(gl.program, "a_FragColor");
if (a_FragColor < 0) {
  // provjeravamo pogreške
  console.log("Failed to get the storage location of a_FragColor");
  return;
}
let buffer = gl.createBuffer(); // stvaramo handle
gl.bindBuffer(gl.ARRAY_BUFFER, buffer); // povezujemo buffer
let v = new Float32Array(data); // pretvaramo inicijalne podatke u neki ffi kompatibilan Array
gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW); // pohranjujemo ih
gl.vertexAttribPointer(state.a_FragColor, 3, gl.FLOAT, false, 0, 0); // postavljamo format
gl.enableVertexAttribArray(state.a_FragColor); // uključujemo 
```

Tako da to možemo zapisati u obliku funkcije koja obavlja dijelove iste
procedure po potrebi, a javlja nam detaljne informacije o pogreškama prilikom
uporabe. Primjer takve funkcije slijedi:
<script>
function vertexBuffer(gl, name, format, usage = GL.STATIC_DRAW, program = undefined) {
  if (typeof format !== "object") {
    throw new Error("invalid vertex format", {
      cause: { format }
    });
  }
  if (typeof format.size !== "number") {
    throw new Error("format size not a number", {
      cause: { format }
    });
  }
  const glProgram = program || gl.program;
  const location = gl.getAttribLocation(glProgram, name);
  if (location < 0) {
    throw new Error(`failed to get the storage location of ${name}`, {
      cause: {
        attribute: name,
        context: gl,
        program: glProgram,
      }
    });
    return;
  }
  const buffer = gl.createBuffer();
  const result = {
    name,
    location,
    format,
    buffer,
    usage,
    length: 0,
    context: gl,
    program: glProgram,
    configured: false,
    bind() {
      result.context.bindBuffer(GL.ARRAY_BUFFER, result.buffer);
      return result;
    },
    set(data, transpose = false) {
      let arrayBuffer;
      if (data == null) {
        return result;
      } else if (data instanceof result.format.source) {
        arrayBuffer = data;
      } else if (Array.isArray(data)) {
        const flat = [];
        for (const entry of data) {
          if (typeof entry === "number") {
            flat.push(entry);
          } else if (typeof entry.toArray === "function") {
            flat.push(...entry.toArray().slice(0, result.format.size));
          } else if (entry[Symbol.iterator] != null) {
            flat.push(...[...entry].slice(0, result.format.size));
          }
        }
        arrayBuffer = new result.format.source (flat);
      } else {
        throw new Error("invalid attribute data", {
          cause: {
            dataType: typeof data,
            data
          }
        });
      }
      result.data = arrayBuffer;
      result.length = result.data.length / result.format.size;
      result.context.bindBuffer(GL.ARRAY_BUFFER, result.buffer);
      result.context.bufferData(GL.ARRAY_BUFFER, arrayBuffer, result.usage);
      if (!result.configured) {
        result.context.vertexAttribPointer(
          location, format.size, format.glType,
          format.normalize || false,
          format.stride || 0, format.offset || 0
        );
        result.configured = true;
      }
      return result;
    },
    enable(doEnable = true) {
      result.context.enableVertexAttribArray(result.location);
      return result;
    },
    disable() {
      result.context.disableVertexAttribArray(result.location);
      return result;
    },
    delete() {
      result.context.disableVertexAttribArray(result.location);
      result.context.deleteBuffer(result.buffer);
      return result;
    },
    forContext(gl, program = undefined) {
      return vertexBuffer(gl, result.name, result.format, result.usage, program || gl.program).set(result.data);
    }
  };
  return result;
}
</script>

Ako se koriste međuspremnici za pohranu atributa vrhova, **obavezno je** njihovo
podešavanje prilikom inicijalizacije ispravnim redoslijedom:
1. [`GL.bufferData(target, srcData, usage)`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData)
2. [`GL.vertexAttribPointer(index, size, type, normalized, stride, offset)`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer)

Postoji i `GL.bufferData(target, size, usage)` varijanta prve funkcije, no ona
nam i dalje ne dopušta da postavimo format attributa prije nego li je potporni
spremnik povezan i sadrži podatke. To je zato što `GL.vertexAttribPointer`
zapravo anotira trenutno povezani (_engl._ bound) međuspremnik, a ne sam
atribut.

Fragment i vertex shaderi za iscrtavanje točaka iz prethodnih vježbi za sada ostaje isti:

```vert
//#! name:"VERTEX_SHADER" store-dynamic:true
attribute vec2 a_Position;
void main() {
  gl_Position = vec4(a_Position, 0.0, 1.0);
  gl_PointSize = 10.0; // vraćena je konačna veličina
}
```
```frag
//#! name:"FRAGMENT_SHADER" store-dynamic:true
void main() {
  gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
}
```

Prethodnoj funkciji za inicijalizaciju WebGL konteksta je dodan
`gl.DEPTH_BUFFER_BIT` u `GL.clear(bits)` pozivu za svrhu ove i narednih vježbi.

<script src="./init_context.js"></script>

<canvas width="600" height="400" id="zad1">
Vaš preglednik ne podržava Canvas elemente za prikaz
</canvas>

Uz te izmjene, crtanje većeg broja točaka je trivijalno:

<script class="show">
let gl = init(document.getElementById("zad1"));
let points = [
  -1, -1,
  -1,  1,
   1, -1,
   1,  1,
];
const position = vertexBuffer(gl, "a_Position", Format.Vec2F);
position.set(points);
position.enable();
gl.drawArrays(gl.POINTS, 0, position.length);
</script>

Bitno je napomenuti da je moguće pohraniti nekoliko atributa i usti
međuspremnik, jedan za drugim. Za to služe `stride` i `offset`. Moguće je
urediti `vertexBuffer` konstruktor da podrži i takvu uporabu, no to za sada nije
potrebno.

## Zadatak 2: crtanje trokuta

Prilikom crtanja trokuta nije više potrebno postaviti `gl_PointSize` vrijednost.
Pa ju možemo ukloniti iz vertex shadera:
```vert
//#! name:"VERTEX_SHADER" store-dynamic:true
attribute vec2 a_Position;
void main() {
  gl_Position = vec4(a_Position, 0.0, 1.0);
}
```

Za izračun treće točke možemo samo zarotirati jednu točku oko druge za 60°.

Uključujem svoj modul za rad s linearnom algebrom jer mi se ne sviđa kako se
`cuon` nimalo ne osnanja na dinamičnost jezika u kojem je napisan.

<script src="./linalg.js" type="module"></script>

Moj modul koristi u pozadini
[`vectorious`](https://github.com/Caellian/vectorious/tree/master) za osnovne
operacije te služi samo kao omotač (_engl._ wrapper) koji apstaktira česte
operacije.

<script class="show">
let A = vec2(0, 0.5);
let B = vec2(-0.5, -0.5);
let C = mxMul(
  translate(A), rotate(deg2rad(60)), translate(A.copy().scale(-1)),
  vec3(B.x, B.y, 1.0)
);
C.x = Math.round(C.x * 1000) / 1000;
C.y = Math.round(C.y * 1000) / 1000;
document.getElementById("thirdPoint").innerText = `~(${C.x}, ${C.y})`;
</script>

Time dobivamo da su koordinate treće točke: <span id="thirdPoint"></span>

<canvas width="500" height="500" id="zad2">
Vaš preglednik ne podržava Canvas elemente za prikaz
</canvas>

Kako bi bilo vidljivo da je trokut zaista jednakostraničan, `<canvas>` mora biti
uniformnih dimenzija je ne primjenjujemo nikakvu projekciju na njega.

<script class="show">
let gl = init(document.getElementById("zad2"));
const position = vertexBuffer(gl, "a_Position", Format.Vec2F);
position.set([A, B, C]);
position.enable();
gl.drawArrays(gl.TRIANGLES, 0, position.length);
</script>

## Zadatak 3: crtanje linija korištenjem gl.LINES

WebGL ima i druge načine crtanja...

<canvas width="600" height="400" id="zad3">
Vaš preglednik ne podržava Canvas elemente za prikaz
</canvas>

<script class="show">
let gl = init(document.getElementById("zad3"));
const position = vertexBuffer(gl, "a_Position", Format.Vec2F);
position.set([
  /* od */ -0.9, 0.8, /* do */ -0.4, -0.8,
  /* od */ -0.2, 0.6, /* do */ 0.4, 0.2,
  /* od */ 0.8, -0.2, /* do */ 0.8, 0.8,
]);
position.enable();
gl.drawArrays(gl.LINES, 0, position.length);
</script>

## Zadatak 4: crtanje linija korištenjem gl.LINE_STRIP i gl.LINE_LOOP

<canvas width="600" height="400" id="zad4_1">
Vaš preglednik ne podržava Canvas elemente za prikaz
</canvas>

<script class="show">
let gl = init(document.getElementById("zad4_1"));
const position = vertexBuffer(gl, "a_Position", Format.Vec2F);
position.set([
  /* od */ 0, 0, /* do */ 0, 0.5,
  /* i između */
  /* od */ -0.5, 0.5, /* do */ -0.5, -0.5,
  /* i između */
  /* od */ 0, -0.5, /* do */ 0, 0,
]);
position.enable();
gl.drawArrays(gl.LINE_STRIP, 0, position.length);
</script>

<canvas width="600" height="400" id="zad4_2">
Vaš preglednik ne podržava Canvas elemente za prikaz
</canvas>

<script class="show">
let gl = init(document.getElementById("zad4_2"));
const position = vertexBuffer(gl, "a_Position", Format.Vec2F);
const H = 0.25 * Math.sqrt(3);
position.set([
  /* od */ -0.5, 0, /* do */ -0.25, H,
  /* od */ 0, 0, /* do */ 0.25, H,
  /* od */ 0.5, 0, /* do početka */
]);
position.enable();
gl.drawArrays(gl.LINE_LOOP, 0, position.length);
</script>

## Zadatak 5: translacija

Dodajemo `u_Translation` uniformnu varijablu u vertex shader:
```vert
//#! name:"VERTEX_SHADER" store-dynamic:true
uniform vec2 u_Translation;

attribute vec2 a_Position;

void main() {
  gl_Position = vec4(a_Position + u_Translation, 0.0, 1.0);
}
```

Poželjno je definirati funkciju koja nam dozvoljava jednostavnije baratanje
uniformnim varijablama, kao i proširiti prethodno definirane `Format`e.

<script>
const Format = Object.freeze({
  "Vec2F": {
    source: Float32Array,
    size: 2,
    glType: GL.FLOAT,
    glSetUniform: (gl, l, data) => gl.uniform2fv(l, data),
  },
  "Vec3F": {
    source: Float32Array,
    size: 3,
    glType: GL.FLOAT,
    glSetUniform: (gl, l, data) => gl.uniform3fv(l, data),
  },
  "Vec4F": {
    source: Float32Array,
    size: 4,
    glType: GL.FLOAT,
    glSetUniform: (gl, l, data) => gl.uniform4fv(l, data),
  },
  "Mat3F": {
    source: Float32Array,
    size: [3, 3],
    glType: GL.FLOAT,
    glSetUniform: (gl, l, data, transpose = false) => gl.uniformMatrix3fv(l, transpose, data),
  },
  "Mat4F": {
    source: Float32Array,
    size: [4, 4],
    glType: GL.FLOAT,
    glSetUniform: (gl, l, data, transpose = false) => gl.uniformMatrix4fv(l, transpose, data),
  }
})

function uniform(gl, name, format, program = undefined) {
  const glProgram = program || gl.program
  var location = gl.getUniformLocation(glProgram, name);
  if (location < 0) {
    console.log(`Failed to get the storage location of ${name}`);
    return;
  }
  let I;
  let baseLength;
  if (typeof format.size === "number") {
    I = vecN(Array(format.size).fill(0));
    baseLength = format.size;
  } else if (Array.isArray(format.size)) {
    I = identity(format.size[0], format.size[1]);
    baseLength = format.size[0] * format.size[1];
  }
  const result = {
    name,
    location,
    format,
    length: 0,
    context: gl,
    program: glProgram,
    set(data, transpose = false) {
      let arrayBuffer;
      if (data == null) {
        return result;
      } else if (data instanceof result.format.source) {
        arrayBuffer = data;
      } else if (data instanceof NDArray) {
        arrayBuffer = data.data;
      } else if (Array.isArray(data)) {
        const flat = [];
        for (const entry of data) {
          if (typeof entry === "number") {
            flat.push(entry);
          } else if (typeof entry.toArray === "function") {
            flat.push(...entry.toArray().slice(0, result.format.size));
          } else if (entry[Symbol.iterator] != null) {
            flat.push(...[...entry].slice(0, result.format.size));
          }
        }
        arrayBuffer = new result.format.source (flat);
      } else {
        throw new Error("invalid uniform data", {
          cause: {
            dataType: typeof data,
            data
          }
        });
      }
      result.data = arrayBuffer;
      result.length = baseLength;
      result.format.glSetUniform(result.context, result.location, arrayBuffer, transpose);
      return result;
    },
    clear() {
      result.format.glSetUniform(result.context, result.location, I.data, false);
      return result;
    },
    forContext(gl, program = undefined) {
      const result2 = uniform(gl, result.name, result.format, program || gl.program);
      result2.set(result.data);
      return result2;
    }
  };
  result.clear();
  return result;
}
</script>

<canvas width="500" height="500" id="zad5">
Vaš preglednik ne podržava Canvas elemente za prikaz
</canvas>

<script class="show">
let gl = init(document.getElementById("zad5"));
const position = vertexBuffer(gl, "a_Position", Format.Vec2F);
position.set([
  -0.5, -0.5,
  0.5, -0.5,
  0, H,
]);
position.enable();
const translation = uniform(gl, "u_Translation", Format.Vec2F);
translation.set([0.2, 0.2]);
gl.drawArrays(gl.TRIANGLES, 0, position.length);
</script>

## Zadatak 6: skaliranje

Dodajemo `u_Translation` uniformnu varijablu u vertex shader:
```vert
//#! name:"VERTEX_SHADER" store-dynamic:true
uniform mat4 u_Transform;

attribute vec2 a_Position;

void main() {
  gl_Position = u_Transform * vec4(a_Position, 0.0, 1.0);
}
```

<canvas width="500" height="500" id="zad6">
Vaš preglednik ne podržava Canvas elemente za prikaz
</canvas>

<script class="show">
let gl = init(document.getElementById("zad6"));
const position2 = position.forContext(gl).enable();
uniform(gl, "u_Transform", Format.Mat4F).set(
  scale(1.5, 0.4, 0)
);
gl.drawArrays(gl.TRIANGLES, 0, position.length);
</script>

## Zadatak 7: rotacija

<canvas width="500" height="500" id="zad7">
Vaš preglednik ne podržava Canvas elemente za prikaz
</canvas>

<script class="show">
let gl = init(document.getElementById("zad7"));
const position2 = position.forContext(gl).enable();
uniform(gl, "u_Transform", Format.Mat4F).set(
  rotate(deg2rad(20), "z").T
);
gl.drawArrays(gl.TRIANGLES, 0, position.length);
</script>

## Zadatak 8: animirana rotacija

Jer često koristimo animacije, definiram funkciju koja će olakšati njihovo korištenje:

<script>
function animation(frame, autostart = true) {
  const result = {
    frame
  }
  result.lastFrame = performance.now();
  result.running = autostart;
  result.step = () => {
    const timeNow = performance.now();
    const deltaT = timeNow - result.lastFrame;
    result.frame(deltaT);
    result.lastFrame = timeNow;
    if (result.running) requestAnimationFrame(result.step);
    return deltaT;
  }
  if (result.running) requestAnimationFrame(result.step);
  result.start = () => {
    result.running = true;
    result.lastFrame = performance.now();
    requestAnimationFrame(result.step);
    return result;
  };
  result.stop = () => {
    result.running = false;
    return result;
  }
  return result;
}
</script>

<canvas width="500" height="500" id="zad8">
Vaš preglednik ne podržava Canvas elemente za prikaz
</canvas>

<div style="display:flex;gap:0.5rem;justify-content:center;align-items:center">
<p style="width:max-content;padding:0">Centar rotacije:</p>
<button class="sharp active" id="z8_i_btn">Ishodište</button>
<span>/</span>
<button class="sharp" id="z8_v_btn">Vrh</button>
</div>

<script class="show">
let gl = init(document.getElementById("zad8"));
const position2 = position.forContext(gl).enable();
const T = uniform(gl, "u_Transform", Format.Mat4F);

let translation = identity(4);
let btn_i = document.getElementById("z8_i_btn");
let btn_v = document.getElementById("z8_v_btn");
btn_i.onclick = () => {
  translation = identity(4);
  btn_i.classList.add("active");
  btn_v.classList.remove("active");
};
btn_v.onclick = () => {
  translation = translate(0, -H, 0).T;
  btn_v.classList.add("active");
  btn_i.classList.remove("active");
};

const step = 0.001;
let theta = 0.1;
animation((delta) => {
  theta += delta * step;
  if (theta > 2*Math.PI) {
    theta -= 2*Math.PI;
  }
  T.set(translation.multiply(rotate(theta, "z")));
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, position.length);
});
</script>

## Zadatak 9: pravokutnik

```vert
//#! name:"VERTEX_SHADER" store-dynamic:true
attribute vec2 a_Position;

void main() {
  gl_Position = vec4(a_Position, 0.0, 1.0);
}
```

<canvas width="500" height="500" id="zad9">
Vaš preglednik ne podržava Canvas elemente za prikaz
</canvas>

<script class="show">
let gl = init(document.getElementById("zad9"));
const position = vertexBuffer(gl, "a_Position", Format.Vec2F);
position.set([
  -0.7, 0.5,
  -0.7, -0.3,
  0.5, 0.5,
  0.5, 0.5,
  -0.7, -0.3,
  0.5, -0.3,
]);
position.enable();
const translation = uniform(gl, "u_Translation", Format.Vec2F);
translation.set([0.2, 0.2]);
gl.drawArrays(gl.TRIANGLES, 0, position.length);
</script>
