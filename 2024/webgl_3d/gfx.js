/**
 * Copyright 2024 Tin Švagelj <tin.svagelj@live.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the “Software”), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { vec2, vec3, vec4, mat3, mat4 } from "./gl_matrix/index.js";
import WebGLDebugUtils from "./webgl-debug.mjs";

/** @typedef {(WebGL2RenderingContext | WebGLRenderingContext) & GraphicsContext} GL */
/**
 * @type {GL}
 */
const GL = WebGL2RenderingContext || WebGLRenderingContext;

/**
 * Create the linked program object
 * @param {GL} gl GL context
 * @param {string} vshader a vertex shader program
 * @param {string} fshader a fragment shader program
 * @returns {WebGLProgram | null} created program object
 */
export function createProgram(gl, vshader, fshader) {
  // Create shader object
  var vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
  var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
  if (!vertexShader || !fragmentShader) {
    return null;
  }

  // Create a program object
  var program = gl.createProgram();
  if (!program) {
    return null;
  }

  // Attach the shader objects
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // Link the program object
  gl.linkProgram(program);

  // Check the result of linking
  var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    var error = gl.getProgramInfoLog(program);
    console.log("failed to link program: " + error);
    gl.deleteProgram(program);
    gl.deleteShader(fragmentShader);
    gl.deleteShader(vertexShader);
    return null;
  }
  return program;
}

/**
 * Create a shader object
 * @param {GL} gl GL context
 * @param {GLenum} type the type of the shader object to be created
 * @param {string} source shader program
 * @returns {WebGLShader | null} created shader object
 */
export function loadShader(gl, type, source) {
  // Create shader object
  var shader = gl.createShader(type);
  if (shader == null) {
    console.warn("unable to create shader");
    return null;
  }

  // Set the shader program
  gl.shaderSource(shader, source);
  // Compile the shader
  gl.compileShader(shader);

  // Check the result of compilation
  var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    var error = gl.getShaderInfoLog(shader);
    console.error("failed to compile shader: " + error);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

/**
 * Graphics mode configures the GL context to draw
 * @enum {"2D" | "3D"}
 */
export const GraphicsMode = Object.freeze({
  GRAPHICS_2D: "2D",
  GRAPHICS_3D: "3D",
});

/**
 * @enum {GLenum | null}
 */
export const FaceCulling = Object.freeze({
  NONE: null,
  FRONT: GL.FRONT,
  BACK: GL.BACK,
  FRONT_AND_BACK: GL.FRONT_AND_BACK,
});

const BLACK = [0, 0, 0];
const DEFAULT_EXTENSIONS = [];

/**
 * @typedef {object} GraphicsContextOptions
 * @property {GraphicsMode} [mode="2D"] rendering mode
 * @property {[number, number, number]} [clearColor=BLACK] color to use for clearing
 * @property {FaceCulling} [faceCulling=FaceCulling.BACK] which faces to cull
 * @property {string} vertex sources for vertex shader
 * @property {string} fragment sources for fragment shader
 * @property {string[]} [extensions=DEFAULT_EXTENSIONS] WebGL extensions to enable.
 *
 * See: https://registry.khronos.org/webgl/extensions/
 */
/**
 * @typedef {object} GraphicsContext extensions to GL context that the rest of
 * the code relies on
 * @property {WebGLProgram} [program] currently used GL program.
 * @property {HTMLCanvasElement} canvas element that the context was created
 * for.
 * @property {(bits?: GLbitfield) => void} clear clears the framebuffer.
 * Extended to support default clear flags.
 * @property {boolean} visible whether canvas is currently visible.
 * @property {()=>void} destroy stop listening to DOM events.
 *
 * Called automatically when canvas is removed from the DOM.
 * @property {(string)=>boolean} hasExtension returns `true` if extension is enabled
 */

/**
 * @param {string | HTMLCanvasElement} canvas
 * @param {GraphicsContextOptions} [options]
 * @returns {GL}
 */
export function canvasContext(canvas, options = {}) {
  if (typeof canvas === "string") {
    canvas = document.querySelector(canvas);
  } else if (canvas instanceof HTMLCanvasElement) {
    // exactly what we need
  } else if (canvas == null) {
    throw new Error("canvas is null");
  } else {
    throw new TypeError("invalid canvas argument", {
      cause: {
        canvas,
      },
    });
  }

  /**
   * @type {GL}
   */
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    throw new Error("failed to get the rendering context for WebGL");
  }

  const extensions = options.extensions || DEFAULT_EXTENSIONS;
  const enabledExtensions = [];
  for (const ext of extensions) {
    const result = gl.getExtension(ext);
    if (result === null) {
      console.warn("WebGL 2 extension not available: " + ext);
    } else {
      enabledExtensions.push(ext.toLowerCase());
    }
  }
  gl.hasExtension = (ext) => enabledExtensions.includes(ext.toLowerCase());

  gl = WebGLDebugUtils.makeDebugContext(gl, (_error, _f, _args) => {
    // do nothing
  });
  gl.canvas = canvas;

  const originalUseProgram = gl.useProgram;
  gl.useProgram = (program, ...args) => {
    originalUseProgram(program, ...args);
    gl.program = program;
  };
  gl.program = null;

  const vertex = options.vertex;
  if (vertex == null) {
    throw new Error("vertex shader not defined");
  } else if (typeof vertex !== "string") {
    throw new TypeError("invalid vertex shader argument; expected a string", {
      cause: { vertex },
    });
  }
  const fragment = options.fragment;
  if (fragment == null) {
    throw new Error("fragment shader not defined");
  } else if (typeof fragment !== "string") {
    throw new TypeError("invalid fragment shader argument; expected a string", {
      cause: { fragment },
    });
  }
  const program = createProgram(gl, vertex, fragment);
  if (!program) {
    throw new Error("failed to intialize shaders", {
      cause: {
        gl,
        vertex,
        fragment,
        program,
      },
    });
  }
  gl.useProgram(program);

  let clearColor = options.clearColor || BLACK;
  gl.clearColor(clearColor[0], clearColor[1], clearColor[2], 1);

  let mode = options.mode.toUpperCase() || GraphicsMode.GRAPHICS_2D;
  let clearBits = gl.COLOR_BUFFER_BIT;
  if (mode === GraphicsMode.GRAPHICS_3D) {
    clearBits |= gl.DEPTH_BUFFER_BIT;
    gl.enable(gl.DEPTH_TEST);
  }
  const originalClear = gl.clear;
  gl.clear = (bits = clearBits) => {
    originalClear(bits);
  };

  const culling = options.faceCulling;
  if (culling !== null) {
    gl.enable(gl.CULL_FACE);
    gl.frontFace(GL.CCW);
    gl.cullFace(culling || gl.BACK);
  } else {
    gl.disable(gl.CULL_FACE);
  }

  gl.viewport(0, 0, canvas.width, canvas.height);

  // update viewport when canvas size changes
  const resizeObserver = new ResizeObserver(() => {
    gl.viewport(0, 0, canvas.width, canvas.height);
  });
  resizeObserver.observe(canvas);

  gl.visible = false;
  // discard draws when canvas isn't visible
  const intersectObserver = new IntersectionObserver((entries) => {
    entries.forEach((canvas) => {
      gl.visible = canvas.isIntersecting;
      if (gl.visible) {
        gl.disable(GL.RASTERIZER_DISCARD);
      } else {
        gl.enable(GL.RASTERIZER_DISCARD);
      }
    });
  });
  intersectObserver.observe(canvas);

  // automatic cleanup
  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (node === canvas) {
          gl.destroy();
        }
      });
    });
  });
  mutationObserver.observe(canvas.parentNode, { childList: true });

  gl.destroy = () => {
    resizeObserver.disconnect();
    intersectObserver.disconnect();
    mutationObserver.disconnect();
    gl.destroy = () => {};
  };

  gl.clear();
  return gl;
}
canvasContext.DEFAULT_EXTENSIONS = DEFAULT_EXTENSIONS;

/**
 * @param {GLuint} type a GL type
 * @returns {GLuint | null} size (in bytes) of the provided type
 */
function glTypeBytes(type) {
  return (
    {
      [GL.BOOL]: 1,
      [GL.BYTE]: 1,
      [GL.UNSIGNED_BYTE]: 1,
      [GL.SHORT]: 2,
      [GL.UNSIGNED_SHORT]: 2,
      [GL.INT]: 4,
      [GL.UNSIGNED_INT]: 4,
      [GL.FLOAT]: 4,
    }[type] || null
  );
}

/**
 * @typedef {object} Float16Array array of 16-bit floats; mixed supported
 * @property {ArrayBuffer} buffer
 * @property {number} byteLength
 * @property {number} byteOffset
 * @property {number} length
 * @property {number} BYTES_PER_ELEMENT
 * @property {...any} constructor
 */

// I just love there's no actual TypedArray type...
/**
 * @typedef {Int8Array | Uint8Array | Uint8ClampedArray | Int16Array |
 * Uint16Array | Int32Array | Uint32Array | Float16Array | Float32Array |
 * Float64Array | BigInt64Array | BigUint64Array} TypedArray
 */

/**
 * @param {any} value any value
 * @returns {boolean} true if value is a typed array
 */
function isTypedArray(value) {
  return (
    value instanceof Int8Array ||
    value instanceof Uint8Array ||
    value instanceof Uint8ClampedArray ||
    value instanceof Int16Array ||
    value instanceof Uint16Array ||
    value instanceof Int32Array ||
    value instanceof Uint32Array ||
    value instanceof Float32Array ||
    value instanceof Float64Array ||
    value instanceof BigInt64Array ||
    value instanceof BigUint64Array ||
    (typeof Float16Array !== "undefined" && value instanceof Float16Array) ||
    false
  );
}

/**
 * // https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/bufferData
 * @typedef {ArrayBuffer | SharedArrayBuffer | TypedArray | DataView} GLBuffer
 */

/**
 * @param {any} value any value
 * @returns {boolean} true if value can be used as a GL buffer
 */
function isGLBuffer(value) {
  return (
    value instanceof ArrayBuffer ||
    value instanceof DataView ||
    (typeof SharedArrayBuffer !== "undefined" &&
      value instanceof SharedArrayBuffer) ||
    isTypedArray(value)
  );
}

/**
 * @callback SetUniform
 * @param {GL} gl rendering context
 * @param {GLuint} location uniform location
 * @param {GLBuffer} data uniform data
 * @param {boolean} [transpose=false] whether to transpose matrices
 */

/**
 * @template {boolean} [P=false]
 * @callback SetAttribute
 * @param {GL} gl rendering context
 * @param {P extends false ? GLuint : GLuint[]} location attribute location
 */

const KNOWN_FORMATS = [];

/**
 * @typedef {object} SingleFormat
 * @property {TypedArray} bufferType backing storage
 * @property {number | [number, number]} size dimensions of this format
 * @property {number} valueCount number of elements this format stores
 * @property {GLuint} glType GL type representation
 * @property {GLuint} byteLength size of data in bytes
 * @property {()=>GLBuffer} default default data constructor
 * @property {SetUniform} glSetUniform uniform setter
 * @property {SetAttribute} glSetAttributePointer attribute setter
 * @property {boolean} [normalize=false] whether to normalize value
 * @property {false} isPacked whether format is packed
 */
/**
 * @typedef {object} CompoundFormat
 * @property {ArrayBuffer} bufferType backing storage
 * @property {SingleFormat[]} items sub-formats
 * @property {GLuint} byteLength size of data in bytes
 * @property {number[]} formatOffsets offsets of each contained {@link Format}
 * @property {()=>GLBuffer} default default data constructor
 * @property {SetAttribute<true>} glSetAttributePointer attribute setter
 * @property {true} isPacked whether format is packed
 */
/**
 * @template {object} Obj
 * @template {keyof Obj} Keys
 * @typedef {Pick<Obj, Exclude<keyof Obj, Keys>>} OmitTyped
 */
/**
 * @typedef {OmitTyped<SingleFormat, "isPacked"> & {
 *   name: string,
 *   default: Float32Array
 * }} SingleFormatOptions
 */
/**
 * @typedef {OmitTyped<CompoundFormat, "bufferType" | "isPacked" | "default"> & {
 *   leadingPadding: number,
 *   items: (SingleFormat | CompoundFormat)[]
 * }} CompoundFormatOptions
 */
/**
 * @typedef {string | Format | Format[] | SingleFormatOptions | CompoundFormatOptions} IntoFormat
 */

/**
 * @implements {(SingleFormat | CompoundFormat) & {
 *  [format: string]: SingleFormat
 * }}
 */
export class Format {
  /**
   * @param {IntoFormat} options construction parameters
   */
  constructor(options) {
    if (typeof options === "string") {
      if (Format[options]) {
        return Format[options];
      } else {
        throw new Error("unknown format: " + options);
      }
    } else if (options instanceof Format) {
      // no special copy handling; format is immutable
      return options;
    }
    if (options.name && Format[options.name]) {
      return Format[options.name];
    }
    if (Array.isArray(options)) {
      options = {
        items: options,
      };
    }
    if (
      options.items &&
      Array.isArray(options.items) &&
      options.items.length != 0
    ) {
      /**
       * @type {Format[]}
       */
      this.items = options.items;
      if (this.items.length == 1) {
        return new Format(this.items[0]);
      }

      this.isPacked = true;
      this.items = options.items.map((it) => it.items || it).flat();

      this.formatOffsets = [];
      let currentOffset = options.leadingPadding || 0;
      for (const format of this.items) {
        this.formatOffsets.push(currentOffset);
        currentOffset += format.byteLength;
      }

      this.byteLength = this.items.reduce((sum, it) => sum + it.byteLength, 0);

      this.glSetAttributePointer =
        options.glSetAttributePointer?.bind(this) ||
        ((gl, location) => {
          for (let i = 0; i < this.items.length; i++) {
            /**
             * @type {CompoundFormat}
             */
            const format = this.items[i];
            format.glSetAttributePointer.call(
              this,
              gl,
              location[i],
              this.byteLength,
              this.formatOffsets[i]
            );
          }
        }).bind(this);
      this.default = () => new Uint8Array(byteLength);
    } else if (options.items) {
      throw new TypeError(
        "format items must be an array; got " + typeof options.items,
        {
          cause: {
            items,
          },
        }
      );
    } else {
      this.bufferType = options.bufferType;

      this.size = options.size || 0;
      if (typeof this.size === "number") {
        this.valueCount = this.size;
      } else if (Array.isArray(this.size) && this.size.length === 2) {
        this.valueCount = this.size[0] * this.size[1];
      } else {
        throw new Error("unsupported format shape: " + this.size, {
          cause: { size: this.size, options },
        });
      }

      if (!options.glType) {
        throw new Error("format GL type not specified", {
          cause: { options },
        });
      }

      this.glType = options.glType;
      this.byteLength = glTypeBytes(this.glType);
      if (this.byteLength == null) {
        throw new Error("unsupported format GL type", {
          cause: { glType: this.glType, options },
        });
      }
      this.byteLength *= this.valueCount;
      this.normalize = options.normalize;
    }

    if (!this.default) {
      if (typeof options.default !== "function") {
        this.default = () => options.default.slice();
      } else {
        this.default =
          options.default?.bind(this) ||
          (() => {
            throw new Error("no default value", {
              cause: {
                format: this,
              },
            });
          }).bind(this);
      }
    }

    if (!this.items) {
      this.glSetUniform =
        options.glSetUniform?.bind(this) ||
        (() => {
          throw new Error("uniform setter not defined", {
            cause: {
              format: this,
            },
          });
        }).bind(this);
    }

    if (!this.glSetAttributePointer) {
      this.glSetAttributePointer =
        options.glSetAttributePointer?.bind(this) ||
        ((gl, location, stride = 0, offset = 0) => {
          gl.vertexAttribPointer(
            location,
            this.size,
            this.glType,
            this.normalize || false,
            stride,
            offset
          );
        }).bind(this);
    }

    if (!this.items) {
      if (options.name) {
        Format[options.name] = this;
      }
      KNOWN_FORMATS.push(this);
    }
  }

  static isFormat(value) {
    if (value.items) {
      return value.items.every(Format.isFormat);
    } else {
      return KNOWN_FORMATS.includes(value);
    }
  }
}

const U8 = new Format({
  name: "U8",
  bufferType: Uint8Array,
  size: 1,
  glType: GL.UNSIGNED_BYTE,
  default: () => 0,
});
const U16 = new Format({
  name: "U16",
  bufferType: Uint16Array,
  size: 1,
  glType: GL.UNSIGNED_SHORT,
  default: () => 0,
});
const U32 = new Format({
  name: "U32",
  bufferType: Uint32Array,
  size: 1,
  glType: GL.UNSIGNED_INT,
  default: () => 0,
});
const Vec2F = new Format({
  name: "Vec2F",
  bufferType: Float32Array,
  size: 2,
  glType: GL.FLOAT,
  glSetUniform: (gl, l, data) => gl.uniform2fv(l, data),
  default: vec2.create,
});
const Vec3F = new Format({
  name: "Vec3F",
  bufferType: Float32Array,
  size: 3,
  glType: GL.FLOAT,
  glSetUniform: (gl, l, data) => gl.uniform3fv(l, data),
  default: vec3.create,
});
const Vec4F = new Format({
  name: "Vec4F",
  bufferType: Float32Array,
  size: 4,
  glType: GL.FLOAT,
  glSetUniform: (gl, l, data) => gl.uniform4fv(l, data),
  default: vec4.create,
});
const Mat3F = new Format({
  name: "Mat3F",
  bufferType: Float32Array,
  size: [3, 3],
  glType: GL.FLOAT,
  glSetUniform: (gl, l, data, transpose = false) =>
    gl.uniformMatrix3fv(l, transpose, data),
  default: mat3.create,
});
const Mat4F = new Format({
  name: "Mat4F",
  bufferType: Float32Array,
  size: [4, 4],
  glType: GL.FLOAT,
  glSetUniform: (gl, l, data, transpose = false) =>
    gl.uniformMatrix4fv(l, transpose, data),
  default: mat4.create,
});

/**
 * @typedef {GLBuffer | (number | Float32Array)[]} InputData
 */

/**
 * @param {InputData} data
 * @param {Format} format
 * @returns {GLBuffer}
 */
function flattenData(data, format) {
  if (data == null) {
    return null;
  }

  if (data instanceof format.bufferType) {
    return data;
  } else if (data.buffer instanceof ArrayBuffer) {
    // target buffer type expects some other data format
    return new format.bufferType(Array.from(data));
  } else if (Array.isArray(data)) {
    const flat = [];
    for (const entry of data) {
      if (typeof entry === "number") {
        flat.push(entry);
      } else if (typeof entry.toArray === "function") {
        flat.push(...entry.toArray().slice(0, format.size));
      } else if (entry[Symbol.iterator] != null) {
        flat.push(...[...entry].slice(0, format.size));
      }
    }
    return new format.bufferType(flat);
  } else {
    throw new Error("invalid uniform data", {
      cause: {
        dataType: typeof data,
        data,
      },
    });
  }
}

/**
 * @param {GL} gl
 * @param {string} name
 * @param {SingleFormat} format
 * @param {WebGLProgram} [program=gl.program]
 */
export function uniform(gl, name, format, program = undefined) {
  if (!Format.isFormat(format)) {
    throw new Error("invalid uniform format", {
      cause: {
        format,
      },
    });
  }

  const glProgram = program || gl.program;
  var location = gl.getUniformLocation(glProgram, name);
  if (location < 0) {
    console.error(`failed to get the storage location of ${name}`);
    return;
  }

  const usedFormat = new Format(format);
  if (usedFormat.isPacked) {
    throw new Error("packed uniforms not supported");
  }

  const self = {
    name,
    location,
    format: usedFormat,
    length: 0,
    context: gl,
    program: glProgram,
    data: null,
    set(data, transpose = false) {
      self.data = flattenData(data, self.format);
      self.length = self.format.valueCount;
      self.format.glSetUniform(
        self.context,
        self.location,
        self.data,
        transpose
      );
      return self;
    },
    clear() {
      self.format.glSetUniform(
        self.context,
        self.location,
        self.format.default(),
        false
      );
      return self;
    },
  };
  self.clear();
  return self;
}

/**
 * @param {GL} gl
 * @param {WebGLProgram} program
 * @param {string} name
 * @returns {GLint}
 */
function attributeLocation(gl, program, name) {
  const result = gl.getAttribLocation(program, name);
  if (result === -1) {
    console.warn(
      `failed to get the storage location of ${name}; variable missing or optimized away`
    );
  }
  return result;
}

/**
 * @typedef {object} ZipFormatDataOptions
 * @property {boolean} [warnNonUniformLengths=false] produce warnings if input lengths
 * do not match
 * @property {boolean} [async=false] perform packing asynchronously and return
 * the result later
 */

/**
 * Iterleaves `data` entries
 * @param {InputData | InputData[]} data content to interleave
 * @param {SingleFormat | CompoundFormat} formats data format information
 * @param {ZipFormatDataOptions} [options] additional options for the function
 * @returns {GLBuffer | Promise<GLBuffer>} interleaved input data
 */
export function interleaveFormatData(data, formats, options = {}) {
  if (!formats.isPacked) {
    // simple case where there's only a single format
    return flattenData(data, formats);
  }
  if (!Array.isArray(data)) {
    // provided already packed data
    return data;
  }
  if (formats.items.length !== data.length) {
    throw new TypeError(
      "invalid input data; expected an array of length " + formats.items.length
    );
  }

  /**
   * @returns {ArrayBuffer} interleaved buffers
   */
  function workload() {
    let rowCount = 0;
    let rowLength = 0;
    let dataBuffers = [];
    for (let i = 0; i < formats.items.length; i++) {
      const format = formats.items[i];
      const raw = new Uint8Array(flattenData(data[i], format).buffer);
      const rows = Math.ceil(raw.byteLength / format.byteLength);
      if (rows > rowCount) {
        if (options.warnNonUniformLengths && i != 0) {
          console.warn(`format #${i} data has more entries than any previous`);
        }
        rowCount = rows;
      } else if (options.warnNonUniformLengths && i != 0 && rows < rowCount) {
        console.warn(`format #${i} data has fewer entries than any previous`);
      }
      rowLength += format.byteLength;
      dataBuffers.push(raw);
    }
    let result = new Uint8Array(rowCount * rowLength);
    let targetPosition = 0;
    for (let row = 0; row < rowCount; row++) {
      for (let fi = 0; fi < formats.items.length; fi++) {
        const sourceBuffer = dataBuffers[fi];
        const formatOffset = formats.formatOffsets[fi];
        const format = formats.items[fi];
        const sourcePosition = format.byteLength * row;

        const targetBuffer = result.subarray(
          targetPosition + formatOffset,
          targetPosition + formatOffset + format.byteLength
        );
        targetBuffer.set(
          sourceBuffer.subarray(
            sourcePosition,
            sourcePosition + format.byteLength
          )
        );
      }
      targetPosition += formats.byteLength;
    }
    return result.buffer;
  }

  if (options.async) {
    return new Promise((resolve, reject) => {
      try {
        const result = workload();
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  } else {
    return workload();
  }
}

/**
 * @enum {GLenum}
 */
const GLDrawPrimitive = Object.freeze({
  POINTS: GL.POINTS,
  LINE_STRIP: GL.LINE_STRIP,
  LINE_LOOP: GL.LINE_LOOP,
  LINES: GL.LINES,
  TRIANGLE_STRIP: GL.TRIANGLE_STRIP,
  TRIANGLE_FAN: GL.TRIANGLE_FAN,
  TRIANGLES: GL.TRIANGLES,
});

/**
 * @enum {GLenum}
 */
const GLUsage = Object.freeze({
  STATIC_DRAW: GL.STATIC_DRAW,
  DYNAMIC_DRAW: GL.DYNAMIC_DRAW,
  STREAM_DRAW: GL.STREAM_DRAW,
  STATIC_READ:
    (typeof WebGL2RenderingContext !== "undefined" &&
      WebGL2RenderingContext.STATIC_READ) ||
    GL.STATIC_DRAW,
  DYNAMIC_READ:
    (typeof WebGL2RenderingContext !== "undefined" &&
      WebGL2RenderingContext.DYNAMIC_READ) ||
    GL.DYNAMIC_DRAW,
  STREAM_READ:
    (typeof WebGL2RenderingContext !== "undefined" &&
      WebGL2RenderingContext.STREAM_READ) ||
    GL.STREAM_DRAW,
  STATIC_COPY:
    (typeof WebGL2RenderingContext !== "undefined" &&
      WebGL2RenderingContext.STATIC_COPY) ||
    GL.STATIC_DRAW,
  DYNAMIC_COPY:
    (typeof WebGL2RenderingContext !== "undefined" &&
      WebGL2RenderingContext.DYNAMIC_COPY) ||
    GL.DYNAMIC_DRAW,
  STREAM_COPY:
    (typeof WebGL2RenderingContext !== "undefined" &&
      WebGL2RenderingContext.STREAM_COPY) ||
    GL.STREAM_DRAW,
});

/**
 * @typedef {object} VertexBuffer
 * @property {Format} format
 * @property {number | number[]} location
 * @property {WebGLBuffer} buffer
 * @property {GLUsage} usage
 * @property {number} length
 * @property {GL} context
 * @property {WebGLProgram} program
 * @property {GLBuffer | null} data
 * @property {() => ElementBuffer} bind
 * @property {(data: InputData) => ElementBuffer} set
 * @property {() => ElementBuffer} enable
 * @property {() => ElementBuffer} disable
 * @property {() => ElementBuffer} delete
 * @property {(
 *   mode: GLDrawPrimitive = GLDrawPrimitive.TRIANGLES,
 *   first: number = 0,
 *   count: number = this.length - first,
 * ) => ElementBuffer} draw calls `gl.drawArrays` with this vertex buffer
 * length.
 * @property {(
 *   instanceCount: number = 1,
 *   mode: GLDrawPrimitive = GLDrawPrimitive.TRIANGLES,
 *   first: number = 0,
 *   count: number = this.length - first,
 * ) => ElementBuffer} drawInstanced calls `gl.drawArraysInstanced` with this
 * vertex buffer length.
 */

/**
 * @callback VertexBufferInit
 * @param {GL} gl
 * @param {string} name
 * @param {IntoFormat} format
 * @param {GLUsage} [usage=GLUsage.STATIC_DRAW]
 * @param {WebGLProgram} [program=gl.program]
 * @returns {VertexBuffer}
 */
/**
 * @callback VertexBufferInitPacked
 * @param {GL} gl
 * @param {[string, IntoFormat][]} formats
 * @param {GLUsage} [usage=GLUsage.STATIC_DRAW]
 * @param {WebGLProgram} [program=gl.program]
 * @returns {VertexBuffer}
 */

/**
 * @type {VertexBufferInit | VertexBufferInitPacked}
 * @param {GL} gl
 * @param {[string, IntoFormat, GLUsage, WebGLProgram]
 * | [[string, IntoFormat][], GLUsage, WebGLProgram]} args
 * @returns {VertexBuffer}
 */
export function vertexBuffer(gl, ...args) {
  let isPacked = Array.isArray(args[0]);
  /**
   * @type {string | string[]}
   */
  let name;
  /**
   * @type {IntoFormat | IntoFormat[]}
   */
  let format;
  let usage = GLUsage.STATIC_DRAW;
  let program = gl.program;
  if (isPacked) {
    name = [];
    format = [];
    for (const param of args[0]) {
      name.push(param[0]);
      format.push(param[1]);
    }
    usage = args[1] || usage;
    program = args[2] || program;
  } else {
    name = args[0];
    format = args[1];
    usage = args[2] || usage;
    program = args[3] || program;
  }

  if (!Format.isFormat(format) && !Array.isArray(format)) {
    throw new Error("invalid vertex format: " + typeof format, {
      cause: { format },
    });
  }

  const glProgram = program || gl.program;

  /**
   * @type {GLint | GLint[]}
   */
  let location;
  if (isPacked) {
    location = [];
    for (const n of name) {
      location.push(attributeLocation(gl, glProgram, n));
    }
  } else {
    location = attributeLocation(gl, glProgram, name);
  }

  const buffer = gl.createBuffer();
  const self = {
    name,
    location,
    format: new Format(format),
    buffer,
    usage,
    length: 0,
    context: gl,
    program: glProgram,
    configured: false,
    data: null,
    bind() {
      self.context.bindBuffer(GL.ARRAY_BUFFER, self.buffer);
      return self;
    },
    set(data, transpose = false) {
      self.data = interleaveFormatData(data, self.format);
      self.length = self.data.byteLength / self.format.byteLength;
      self.context.bindBuffer(GL.ARRAY_BUFFER, self.buffer);
      self.context.bufferData(GL.ARRAY_BUFFER, self.data, self.usage);
      if (!self.configured) {
        self.format.glSetAttributePointer(self.context, location);
        self.configured = true;
      }
      return self;
    },
    enable() {
      if (isPacked) {
        for (const location of self.location) {
          self.context.enableVertexAttribArray(location);
        }
      } else {
        self.context.enableVertexAttribArray(self.location);
      }
      return self;
    },
    disable() {
      if (isPacked) {
        for (const location of self.location) {
          self.context.disableVertexAttribArray(location);
        }
      } else {
        self.context.disableVertexAttribArray(self.location);
      }
      return self;
    },
    delete() {
      self.disable();
      self.context.deleteBuffer(self.buffer);
      return self;
    },
    draw(mode = GLDrawPrimitive.TRIANGLES, first = 0, count = undefined) {
      self.context.drawArrays(mode, first, count || self.length - first);
    },
    drawInstanced(
      instanceCount,
      mode = GLDrawPrimitive.TRIANGLES,
      first = 0,
      count = undefined
    ) {
      self.context.drawArraysInstanced(
        mode,
        first,
        count || self.length - first,
        instanceCount
      );
    },
  };
  return self;
}

/**
 * @typedef {object} ElementBuffer
 * @property {SingleFormat} format
 * @property {WebGLBuffer} buffer
 * @property {GLUsage} usage
 * @property {number} length
 * @property {GL} context
 * @property {Uint16Array | Uint32Array | null} data
 * @property {() => ElementBuffer} bind
 * @property {(data: InputData) => ElementBuffer} set
 * @property {() => ElementBuffer} delete
 * @property {(
 *   mode: GLDrawPrimitive = GLDrawPrimitive.TRIANGLES,
 *   first: number = 0,
 *   count: number = this.length - first,
 * ) => ElementBuffer} draw calls `gl.drawElements` with this element buffer
 * count.
 * @property {(
 *   instanceCount: number = 1,
 *   mode: GLDrawPrimitive = GLDrawPrimitive.TRIANGLES,
 *   first: number = 0,
 *   count: number = this.length - first,
 * ) => ElementBuffer} drawInstanced calls `gl.drawElementsInstanced` with this
 * element buffer count.
 */

/**
 * @param {GL} gl
 * @param {SingleFormat} [format]
 * @param {SingleFormat} [usage=GLUsage.STATIC_DRAW]
 * @returns {ElementBuffer}
 */
export function elementBuffer(gl, format, usage) {
  let bufferUsage = usage || GLUsage.STATIC_DRAW;
  if (!(format === U8 || format === U16 || format === U32)) {
    throw new Error("invalid element format: " + typeof format, {
      cause: { format },
    });
  } else if (format === U32 && !gl.hasExtension("OES_element_index_uint")) {
    throw new Error(
      "UNSIGNED_INT element buffer format requires 'OES_element_index_uint' extension",
      {
        cause: { format },
      }
    );
  }

  const buffer = gl.createBuffer();
  const self = {
    format: new Format(format),
    buffer,
    usage: bufferUsage,
    length: 0,
    context: gl,
    data: null,
    bind() {
      self.context.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, self.buffer);
      return self;
    },
    set(data) {
      self.data = flattenData(data, self.format);
      self.length = data.length;
      self.context.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, self.buffer);
      self.context.bufferData(GL.ELEMENT_ARRAY_BUFFER, self.data, self.usage);
      return self;
    },
    delete() {
      self.context.deleteBuffer(self.buffer);
      return self;
    },
    draw(mode = GLDrawPrimitive.TRIANGLES, first = 0, count = undefined) {
      self.context.drawElements(
        mode,
        count || self.length - first,
        self.format.glType,
        first
      );
    },
    drawInstanced(
      instanceCount = 1,
      mode = GLDrawPrimitive.TRIANGLES,
      first = 0,
      count = undefined
    ) {
      self.context.drawElementsInstanced(
        mode,
        count || self.length - first,
        self.format.glType,
        first,
        instanceCount
      );
    },
  };
  return self;
}

const RAD_DEG_RATIO = Math.PI / 180;
export const rad2deg = (radian) => radian / RAD_DEG_RATIO;
export const deg2rad = (degrees) => degrees * RAD_DEG_RATIO;

/**
 * Computes centroid of given vertices and translates them to origin using
 * centroid distance from origin.
 * @param {vec3[]} vertices mesh to center
 * @param {vec3} [around=origin] new center
 * @returns {vec3[]} provided vertices
 */
export function centerVertices(vertices, around = vec3.create()) {
  let centroid = vec3.create();
  for (const v of vertices) {
    vec3.add(centroid, centroid, v);
  }
  vec3.scale(centroid, centroid, 1 / vertices.length);
  let offset = vec3.create();
  vec3.sub(offset, around, centroid);
  for (const v of vertices) {
    vec3.add(v, v, offset);
  }
  return vertices;
}

const numberFixedWidth = (number, places = 2) => {
  let text = number.toString().split(".");
  if (text.length === 1) {
    text[1] = "0".repeat(places);
  } else {
    const decimals = text[1].length;
    if (decimals > places) {
      text[1] = text[1].slice(0, places);
    } else {
      text[1] = text[1] + "0".repeat(places - decimals);
    }
  }
  let prefix = "";
  if (number >= 0) {
    prefix = " ";
  }
  return prefix + text.join(".");
};
export function formatMatrix(matrix) {
  const f = numberFixedWidth;
  let m = matrix;
  if (matrix.length === 16) {
    return (
      `| ${f(m[0])} ${f(m[1])} ${f(m[2])} ${f(m[3])} |\n` +
      `| ${f(m[4])} ${f(m[5])} ${f(m[6])} ${f(m[7])} |\n` +
      `| ${f(m[8])} ${f(m[9])} ${f(m[10])} ${f(m[11])} |\n` +
      `| ${f(m[12])} ${f(m[13])} ${f(m[14])} ${f(m[15])} |`
    );
  } else if (matrix.length === 9) {
    return (
      `| ${f(m[0])} ${f(m[1])} ${f(m[2])} |\n` +
      `| ${f(m[3])} ${f(m[4])} ${f(m[5])} |\n` +
      `| ${f(m[6])} ${f(m[7])} ${f(m[8])} |`
    );
  } else if (matrix.length === 4) {
    return `| ${f(m[0])} ${f(m[1])} |\n| ${f(m[2])} ${f(m[3])} |`;
  } else {
    return m.toString();
  }
}
export function formatVector(vector) {
  const f = numberFixedWidth;
  let v = vector;
  if (vector.length === 4) {
    return `[ ${f(m[0])}, ${f(m[1])}, ${f(m[2])}, ${f(m[3])} ]`;
  } else if (vector.length === 3) {
    return `[ ${f(m[0])}, ${f(m[1])}, ${f(m[2])} ]`;
  } else if (vector.length === 2) {
    return `[ ${f(m[0])}, ${f(m[1])} ]`;
  } else {
    return v.toString();
  }
}

/**
 * @returns {number} time value in milliseconds
 */
export const timeNow =
  window.performance?.now.bind(window.performance) || Date.now;

export function fractionTime(cb, duration) {
  const startTime = timeNow();
  let stopped = false;
  const tick = () => {
    const delta = timeNow() - startTime;
    const t = delta / duration;
    cb(t);
    if (!stopped && t < 1) {
      requestAnimationFrame(tick);
    }
  };

  tick();
  return () => {
    stopped = true;
  };
}

export function animation(frame, options = {}) {
  const self = {
    frame,
  };
  self.lastFrame = timeNow();
  self.running = options.autostart;
  if (self.running === undefined) {
    self.running = true;
  } else {
    self.running = !!self.running;
  }
  if (options.fps != null) {
    options.targetFrametime = 1000 / options.fps;
  }
  self.targetFrametime = options.targetFrametime || 0;
  self.step = () => {
    const now = timeNow();
    const deltaT = now - self.lastFrame;
    if (deltaT >= self.targetFrametime) {
      self.frame(deltaT);
      self.lastFrame = now;
    }
    if (self.running) requestAnimationFrame(self.step);
    return deltaT;
  };
  if (self.running) requestAnimationFrame(self.step);
  self.start = () => {
    self.running = true;
    self.lastFrame = performance.now();
    requestAnimationFrame(self.step);
    return self;
  };
  self.stop = () => {
    self.running = false;
    return self;
  };
  return self;
}
