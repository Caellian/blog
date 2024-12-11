var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) =>
  typeof require !== "undefined"
    ? require
    : typeof Proxy !== "undefined"
      ? new Proxy(x, {
          get: (a, b) => (typeof require !== "undefined" ? require : a)[b],
        })
      : x)(function (x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) =>
  function __require2() {
    return (
      mod ||
        (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod),
      mod.exports
    );
  };
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === "object") || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod
  )
);

// node_modules/util/support/isBufferBrowser.js
var require_isBufferBrowser = __commonJS({
  "node_modules/util/support/isBufferBrowser.js"(exports, module) {
    module.exports = function isBuffer(arg) {
      return (
        arg &&
        typeof arg === "object" &&
        typeof arg.copy === "function" &&
        typeof arg.fill === "function" &&
        typeof arg.readUInt8 === "function"
      );
    };
  },
});

// node_modules/util/node_modules/inherits/inherits_browser.js
var require_inherits_browser = __commonJS({
  "node_modules/util/node_modules/inherits/inherits_browser.js"(
    exports,
    module
  ) {
    if (typeof Object.create === "function") {
      module.exports = function inherits(ctor, superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
          constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true,
          },
        });
      };
    } else {
      module.exports = function inherits(ctor, superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function () {};
        TempCtor.prototype = superCtor.prototype;
        ctor.prototype = new TempCtor();
        ctor.prototype.constructor = ctor;
      };
    }
  },
});

// node_modules/util/util.js
var require_util = __commonJS({
  "node_modules/util/util.js"(exports) {
    var formatRegExp = /%[sdj%]/g;
    exports.format = function (f31) {
      if (!isString(f31)) {
        var objects = [];
        for (var i = 0; i < arguments.length; i++) {
          objects.push(inspect2(arguments[i]));
        }
        return objects.join(" ");
      }
      var i = 1;
      var args = arguments;
      var len = args.length;
      var str = String(f31).replace(formatRegExp, function (x2) {
        if (x2 === "%%") return "%";
        if (i >= len) return x2;
        switch (x2) {
          case "%s":
            return String(args[i++]);
          case "%d":
            return Number(args[i++]);
          case "%j":
            try {
              return JSON.stringify(args[i++]);
            } catch (_) {
              return "[Circular]";
            }
          default:
            return x2;
        }
      });
      for (var x = args[i]; i < len; x = args[++i]) {
        if (isNull(x) || !isObject(x)) {
          str += " " + x;
        } else {
          str += " " + inspect2(x);
        }
      }
      return str;
    };
    exports.deprecate = function (fn, msg) {
      if (isUndefined(global.process)) {
        return function () {
          return exports.deprecate(fn, msg).apply(this, arguments);
        };
      }
      if (process.noDeprecation === true) {
        return fn;
      }
      var warned = false;
      function deprecated() {
        if (!warned) {
          if (process.throwDeprecation) {
            throw new Error(msg);
          } else if (process.traceDeprecation) {
            console.trace(msg);
          } else {
            console.error(msg);
          }
          warned = true;
        }
        return fn.apply(this, arguments);
      }
      return deprecated;
    };
    var debugs = {};
    var debugEnviron;
    exports.debuglog = function (set2) {
      if (isUndefined(debugEnviron))
        debugEnviron = process.env.NODE_DEBUG || "";
      set2 = set2.toUpperCase();
      if (!debugs[set2]) {
        if (new RegExp("\\b" + set2 + "\\b", "i").test(debugEnviron)) {
          var pid = process.pid;
          debugs[set2] = function () {
            var msg = exports.format.apply(exports, arguments);
            console.error("%s %d: %s", set2, pid, msg);
          };
        } else {
          debugs[set2] = function () {};
        }
      }
      return debugs[set2];
    };
    function inspect2(obj, opts) {
      var ctx = {
        seen: [],
        stylize: stylizeNoColor,
      };
      if (arguments.length >= 3) ctx.depth = arguments[2];
      if (arguments.length >= 4) ctx.colors = arguments[3];
      if (isBoolean(opts)) {
        ctx.showHidden = opts;
      } else if (opts) {
        exports._extend(ctx, opts);
      }
      if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
      if (isUndefined(ctx.depth)) ctx.depth = 2;
      if (isUndefined(ctx.colors)) ctx.colors = false;
      if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
      if (ctx.colors) ctx.stylize = stylizeWithColor;
      return formatValue(ctx, obj, ctx.depth);
    }
    exports.inspect = inspect2;
    inspect2.colors = {
      bold: [1, 22],
      italic: [3, 23],
      underline: [4, 24],
      inverse: [7, 27],
      white: [37, 39],
      grey: [90, 39],
      black: [30, 39],
      blue: [34, 39],
      cyan: [36, 39],
      green: [32, 39],
      magenta: [35, 39],
      red: [31, 39],
      yellow: [33, 39],
    };
    inspect2.styles = {
      special: "cyan",
      number: "yellow",
      boolean: "yellow",
      undefined: "grey",
      null: "bold",
      string: "green",
      date: "magenta",
      // "name": intentionally not styling
      regexp: "red",
    };
    function stylizeWithColor(str, styleType) {
      var style = inspect2.styles[styleType];
      if (style) {
        return (
          "\x1B[" +
          inspect2.colors[style][0] +
          "m" +
          str +
          "\x1B[" +
          inspect2.colors[style][1] +
          "m"
        );
      } else {
        return str;
      }
    }
    function stylizeNoColor(str, styleType) {
      return str;
    }
    function arrayToHash(array2) {
      var hash = {};
      array2.forEach(function (val, idx) {
        hash[val] = true;
      });
      return hash;
    }
    function formatValue(ctx, value, recurseTimes) {
      if (
        ctx.customInspect &&
        value &&
        isFunction(value.inspect) && // Filter out the util module, it's inspect function is special
        value.inspect !== exports.inspect && // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)
      ) {
        var ret = value.inspect(recurseTimes, ctx);
        if (!isString(ret)) {
          ret = formatValue(ctx, ret, recurseTimes);
        }
        return ret;
      }
      var primitive = formatPrimitive(ctx, value);
      if (primitive) {
        return primitive;
      }
      var keys = Object.keys(value);
      var visibleKeys = arrayToHash(keys);
      if (ctx.showHidden) {
        keys = Object.getOwnPropertyNames(value);
      }
      if (
        isError(value) &&
        (keys.indexOf("message") >= 0 || keys.indexOf("description") >= 0)
      ) {
        return formatError(value);
      }
      if (keys.length === 0) {
        if (isFunction(value)) {
          var name = value.name ? ": " + value.name : "";
          return ctx.stylize("[Function" + name + "]", "special");
        }
        if (isRegExp(value)) {
          return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
        }
        if (isDate(value)) {
          return ctx.stylize(Date.prototype.toString.call(value), "date");
        }
        if (isError(value)) {
          return formatError(value);
        }
      }
      var base = "",
        array2 = false,
        braces = ["{", "}"];
      if (isArray(value)) {
        array2 = true;
        braces = ["[", "]"];
      }
      if (isFunction(value)) {
        var n = value.name ? ": " + value.name : "";
        base = " [Function" + n + "]";
      }
      if (isRegExp(value)) {
        base = " " + RegExp.prototype.toString.call(value);
      }
      if (isDate(value)) {
        base = " " + Date.prototype.toUTCString.call(value);
      }
      if (isError(value)) {
        base = " " + formatError(value);
      }
      if (keys.length === 0 && (!array2 || value.length == 0)) {
        return braces[0] + base + braces[1];
      }
      if (recurseTimes < 0) {
        if (isRegExp(value)) {
          return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
        } else {
          return ctx.stylize("[Object]", "special");
        }
      }
      ctx.seen.push(value);
      var output;
      if (array2) {
        output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
      } else {
        output = keys.map(function (key) {
          return formatProperty(
            ctx,
            value,
            recurseTimes,
            visibleKeys,
            key,
            array2
          );
        });
      }
      ctx.seen.pop();
      return reduceToSingleString(output, base, braces);
    }
    function formatPrimitive(ctx, value) {
      if (isUndefined(value)) return ctx.stylize("undefined", "undefined");
      if (isString(value)) {
        var simple =
          "'" +
          JSON.stringify(value)
            .replace(/^"|"$/g, "")
            .replace(/'/g, "\\'")
            .replace(/\\"/g, '"') +
          "'";
        return ctx.stylize(simple, "string");
      }
      if (isNumber(value)) return ctx.stylize("" + value, "number");
      if (isBoolean(value)) return ctx.stylize("" + value, "boolean");
      if (isNull(value)) return ctx.stylize("null", "null");
    }
    function formatError(value) {
      return "[" + Error.prototype.toString.call(value) + "]";
    }
    function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
      var output = [];
      for (var i = 0, l = value.length; i < l; ++i) {
        if (hasOwnProperty(value, String(i))) {
          output.push(
            formatProperty(
              ctx,
              value,
              recurseTimes,
              visibleKeys,
              String(i),
              true
            )
          );
        } else {
          output.push("");
        }
      }
      keys.forEach(function (key) {
        if (!key.match(/^\d+$/)) {
          output.push(
            formatProperty(ctx, value, recurseTimes, visibleKeys, key, true)
          );
        }
      });
      return output;
    }
    function formatProperty(
      ctx,
      value,
      recurseTimes,
      visibleKeys,
      key,
      array2
    ) {
      var name, str, desc;
      desc = Object.getOwnPropertyDescriptor(value, key) || {
        value: value[key],
      };
      if (desc.get) {
        if (desc.set) {
          str = ctx.stylize("[Getter/Setter]", "special");
        } else {
          str = ctx.stylize("[Getter]", "special");
        }
      } else {
        if (desc.set) {
          str = ctx.stylize("[Setter]", "special");
        }
      }
      if (!hasOwnProperty(visibleKeys, key)) {
        name = "[" + key + "]";
      }
      if (!str) {
        if (ctx.seen.indexOf(desc.value) < 0) {
          if (isNull(recurseTimes)) {
            str = formatValue(ctx, desc.value, null);
          } else {
            str = formatValue(ctx, desc.value, recurseTimes - 1);
          }
          if (str.indexOf("\n") > -1) {
            if (array2) {
              str = str
                .split("\n")
                .map(function (line) {
                  return "  " + line;
                })
                .join("\n")
                .substr(2);
            } else {
              str =
                "\n" +
                str
                  .split("\n")
                  .map(function (line) {
                    return "   " + line;
                  })
                  .join("\n");
            }
          }
        } else {
          str = ctx.stylize("[Circular]", "special");
        }
      }
      if (isUndefined(name)) {
        if (array2 && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify("" + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = ctx.stylize(name, "name");
        } else {
          name = name
            .replace(/'/g, "\\'")
            .replace(/\\"/g, '"')
            .replace(/(^"|"$)/g, "'");
          name = ctx.stylize(name, "string");
        }
      }
      return name + ": " + str;
    }
    function reduceToSingleString(output, base, braces) {
      var numLinesEst = 0;
      var length = output.reduce(function (prev, cur) {
        numLinesEst++;
        if (cur.indexOf("\n") >= 0) numLinesEst++;
        return prev + cur.replace(/\u001b\[\d\d?m/g, "").length + 1;
      }, 0);
      if (length > 60) {
        return (
          braces[0] +
          (base === "" ? "" : base + "\n ") +
          " " +
          output.join(",\n  ") +
          " " +
          braces[1]
        );
      }
      return braces[0] + base + " " + output.join(", ") + " " + braces[1];
    }
    function isArray(ar) {
      return Array.isArray(ar);
    }
    exports.isArray = isArray;
    function isBoolean(arg) {
      return typeof arg === "boolean";
    }
    exports.isBoolean = isBoolean;
    function isNull(arg) {
      return arg === null;
    }
    exports.isNull = isNull;
    function isNullOrUndefined(arg) {
      return arg == null;
    }
    exports.isNullOrUndefined = isNullOrUndefined;
    function isNumber(arg) {
      return typeof arg === "number";
    }
    exports.isNumber = isNumber;
    function isString(arg) {
      return typeof arg === "string";
    }
    exports.isString = isString;
    function isSymbol(arg) {
      return typeof arg === "symbol";
    }
    exports.isSymbol = isSymbol;
    function isUndefined(arg) {
      return arg === void 0;
    }
    exports.isUndefined = isUndefined;
    function isRegExp(re) {
      return isObject(re) && objectToString(re) === "[object RegExp]";
    }
    exports.isRegExp = isRegExp;
    function isObject(arg) {
      return typeof arg === "object" && arg !== null;
    }
    exports.isObject = isObject;
    function isDate(d) {
      return isObject(d) && objectToString(d) === "[object Date]";
    }
    exports.isDate = isDate;
    function isError(e) {
      return (
        isObject(e) &&
        (objectToString(e) === "[object Error]" || e instanceof Error)
      );
    }
    exports.isError = isError;
    function isFunction(arg) {
      return typeof arg === "function";
    }
    exports.isFunction = isFunction;
    function isPrimitive(arg) {
      return (
        arg === null ||
        typeof arg === "boolean" ||
        typeof arg === "number" ||
        typeof arg === "string" ||
        typeof arg === "symbol" || // ES6 symbol
        typeof arg === "undefined"
      );
    }
    exports.isPrimitive = isPrimitive;
    exports.isBuffer = require_isBufferBrowser();
    function objectToString(o) {
      return Object.prototype.toString.call(o);
    }
    function pad(n) {
      return n < 10 ? "0" + n.toString(10) : n.toString(10);
    }
    var months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    function timestamp() {
      var d = /* @__PURE__ */ new Date();
      var time = [
        pad(d.getHours()),
        pad(d.getMinutes()),
        pad(d.getSeconds()),
      ].join(":");
      return [d.getDate(), months[d.getMonth()], time].join(" ");
    }
    exports.log = function () {
      console.log(
        "%s - %s",
        timestamp(),
        exports.format.apply(exports, arguments)
      );
    };
    exports.inherits = require_inherits_browser();
    exports._extend = function (origin, add2) {
      if (!add2 || !isObject(add2)) return origin;
      var keys = Object.keys(add2);
      var i = keys.length;
      while (i--) {
        origin[keys[i]] = add2[keys[i]];
      }
      return origin;
    };
    function hasOwnProperty(obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    }
  },
});

// src/util.ts
var V_MAXDIMS = 32;
var flatten = (array2) =>
  array2.reduce(
    (acc, next) => acc.concat(Array.isArray(next) ? flatten(next) : next),
    []
  );
var is_typed_array = (array2) =>
  ArrayBuffer.isView(array2) && !(array2 instanceof DataView);
var get_length = (shape) => shape.reduce((a, b) => a * b, 1);
var get_shape = (array2) =>
  Array.isArray(array2) || is_typed_array(array2)
    ? [array2.length].concat(get_shape(array2[0]))
    : [];
var get_strides = (shape) => [
  ...shape
    .slice(1)
    .map((_, i) => shape.slice(i + 1).reduce((a, b) => a * b, 1)),
  1,
];
var get_dtype = (array2) => {
  const { constructor: { name = "Float32Array" } = {} } = array2 || {};
  switch (name) {
    case "Int8Array":
      return "int8";
    case "Uint8Array":
      return "uint8";
    case "Int16Array":
      return "int16";
    case "Uint16Array":
      return "uint16";
    case "Int32Array":
      return "int32";
    case "Uint32Array":
      return "uint32";
    case "Uint8ClampedArray":
      return "uint8c";
    case "Float32Array":
      return "float32";
    case "Float64Array":
      return "float64";
    default:
      return "float64";
  }
};
var get_type = (dtype) => {
  switch (dtype) {
    case "int8":
      return Int8Array;
    case "uint8":
      return Uint8Array;
    case "int16":
      return Int16Array;
    case "uint16":
      return Uint16Array;
    case "int32":
      return Int32Array;
    case "uint32":
      return Uint32Array;
    case "uint8c":
      return Uint8ClampedArray;
    case "float32":
      return Float32Array;
    case "float64":
      return Float64Array;
    default:
      return Float64Array;
  }
};

// src/core/array.ts
var array = (...args) => new NDArray(...args);

// src/iterators/single.ts
var NDIter = class {
  /**
   * @name x
   * @memberof NDIter.prototype
   * @type NDArray
   */
  x;
  /**
   * @name shape
   * @memberof NDIter.prototype
   * @type Number[]
   */
  shape;
  /**
   * @name shapem1
   * @memberof NDIter.prototype
   * @type Number[]
   */
  shapem1;
  /**
   * @name strides
   * @memberof NDIter.prototype
   * @type Number[]
   */
  strides;
  /**
   * @name backstrides
   * @memberof NDIter.prototype
   * @type Number[]
   */
  backstrides;
  /**
   * @name length
   * @memberof NDIter.prototype
   * @type Number
   */
  length;
  /**
   * @name lengthm1
   * @memberof NDIter.prototype
   * @type Number
   */
  lengthm1;
  /**
   * @name nd
   * @memberof NDIter.prototype
   * @type Number
   */
  nd;
  /**
   * @name ndm1
   * @memberof NDIter.prototype
   * @type Number
   */
  ndm1;
  /**
   * @name index
   * @memberof NDIter.prototype
   * @type Number
   */
  index;
  /**
   * @name coords
   * @memberof NDIter.prototype
   * @type Number[]
   */
  coords;
  /**
   * @name pos
   * @memberof NDIter.prototype
   * @type Number
   */
  pos;
  /**
   * @name factors
   * @memberof NDIter.prototype
   * @type Number[]
   */
  factors;
  constructor(x) {
    this.x = array(x);
    const { shape, strides, length } = this.x;
    this.length = length;
    this.lengthm1 = length - 1;
    this.nd = shape.length;
    this.ndm1 = this.nd - 1;
    this.shape = Array(V_MAXDIMS).fill(0);
    this.strides = Array(V_MAXDIMS).fill(0);
    this.shapem1 = Array(V_MAXDIMS).fill(0);
    this.coords = Array(V_MAXDIMS).fill(0);
    this.backstrides = Array(V_MAXDIMS).fill(0);
    this.factors = Array(V_MAXDIMS).fill(0);
    if (this.nd !== 0) {
      this.factors[this.nd - 1] = 1;
    }
    let i;
    for (i = 0; i < this.nd; i += 1) {
      this.shape[i] = shape[i];
      this.shapem1[i] = shape[i] - 1;
      this.strides[i] = strides[i];
      this.backstrides[i] = strides[i] * this.shapem1[i];
      this.coords[i] = 0;
      if (i > 0) {
        this.factors[this.ndm1 - i] =
          this.factors[this.nd - i] * shape[this.nd - i];
      }
    }
    this.index = 0;
    this.pos = 0;
  }
  /**
   * @function done
   * @memberof NDIter.prototype
   * @description Returns true if the iterator is done, false otherwise
   * @returns {Boolean}
   * @example
   * import { array } from 'vectorious/core/array';
   * import { NDIter } from 'vectorious/iterator';
   *
   * const iter = new NDIter(array([1, 2, 3]));
   * iter.done(); // false
   */
  done() {
    return this.index > this.lengthm1;
  }
  /**
   * @function current
   * @memberof NDIter.prototype
   * @description Returns the current element of the iterator
   * @returns {Object} current
   * @returns {Number} [current.value]
   * @returns {Boolean} current.done
   * @example
   * import { array } from 'vectorious/core/array';
   * import { NDIter } from 'vectorious/iterator';
   *
   * const iter = new NDIter(array([1, 2, 3]));
   * iter.current(); // { value: 1, done: false }
   */
  current() {
    const done = this.done();
    return {
      value: done ? void 0 : this.pos,
      done,
    };
  }
  /**
   * @function next
   * @memberof NDIter.prototype
   * @description
   * Steps to the next position in the iterator.
   * Returns the current index of the iterator, or undefined if done.
   * @returns {Object}
   * @example
   * import { array } from 'vectorious/core/array';
   * import { NDIter } from 'vectorious/iterator';
   *
   * const iter = new NDIter(array([1, 2, 3]));
   * iter.next(); // { value: 2, done: false }
   * iter.next(); // { value: 3, done: false }
   * iter.next(); // { done: true }
   */
  next() {
    const current = this.current();
    if (current.done) {
      return current;
    }
    const { ndm1, shapem1, strides, backstrides } = this;
    let i;
    for (i = ndm1; i >= 0; i -= 1) {
      if (this.coords[i] < shapem1[i]) {
        this.coords[i] += 1;
        this.pos += strides[i];
        break;
      }
      this.coords[i] = 0;
      this.pos -= backstrides[i];
    }
    this.index += 1;
    return current;
  }
  [Symbol.iterator]() {
    return this;
  }
};

// src/iterators/multi.ts
var NDMultiIter = class {
  /**
   * @name iters
   * @memberof NDMultiIter.prototype
   * @type NDIter[]
   */
  iters;
  /**
   * @name shape
   * @memberof NDMultiIter.prototype
   * @type Number[]
   */
  shape;
  /**
   * @name nd
   * @memberof NDMultiIter.prototype
   * @type Number
   */
  nd;
  /**
   * @name length
   * @memberof NDMultiIter.prototype
   * @type Number
   */
  length;
  /**
   * @name lengthm1
   * @memberof NDMultiIter.prototype
   * @type Number
   */
  lengthm1;
  /**
   * @name numiter
   * @memberof NDMultiIter.prototype
   * @type Number
   */
  numiter;
  /**
   * @name index
   * @memberof NDMultiIter.prototype
   * @type Number
   */
  index;
  /**
   * @name pos
   * @memberof NDMultiIter.prototype
   * @type Number[]
   */
  pos;
  constructor(...args) {
    this.iters = args.map((arg) => new NDIter(arg));
    this.numiter = args.length;
    let i;
    let nd;
    for (i = 0, nd = 0; i < this.numiter; i += 1) {
      nd = Math.max(nd, this.iters[i].x.shape.length);
    }
    this.nd = nd;
    this.shape = Array(nd).fill(0);
    let it;
    let j;
    let k;
    let tmp;
    for (i = 0; i < nd; i += 1) {
      this.shape[i] = 1;
      for (j = 0; j < this.numiter; j += 1) {
        it = this.iters[j];
        k = i + it.x.shape.length - nd;
        if (k >= 0) {
          tmp = it.x.shape[k];
          if (tmp == 1) {
            continue;
          }
          if (this.shape[i] == 1) {
            this.shape[i] = tmp;
          } else if (this.shape[i] !== tmp) {
            throw new Error("shape mismatch");
          }
        }
      }
    }
    tmp = this.shape.reduce((acc, dim) => acc * dim, 1);
    this.length = tmp;
    this.lengthm1 = tmp - 1;
    for (i = 0; i < this.numiter; i += 1) {
      it = this.iters[i];
      it.nd = this.nd;
      it.ndm1 = this.nd - 1;
      it.length = tmp;
      it.lengthm1 = tmp - 1;
      nd = it.x.shape.length;
      if (nd !== 0) {
        it.factors[this.nd - 1] = 1;
      }
      for (j = 0; j < this.nd; j += 1) {
        it.shape[j] = this.shape[j];
        it.shapem1[j] = this.shape[j] - 1;
        k = j + nd - this.nd;
        if (k < 0 || it.x.shape[k] !== this.shape[j]) {
          it.strides[j] = 0;
        } else {
          it.strides[j] = it.x.strides[k];
        }
        it.backstrides[j] = it.strides[j] * it.shapem1[j];
        if (j > 0) {
          it.factors[this.nd - j - 1] =
            it.factors[this.nd - j] * this.shape[this.nd - j];
        }
      }
    }
    this.index = 0;
    this.pos = Array(this.numiter).fill(0);
  }
  /**
   * @function done
   * @memberof NDMultiIter
   * @description Returns true if the iterator is done, false otherwise
   * @returns {Boolean}
   * @example
   * import { array } from 'vectorious/core/array';
   * import { NDMultiIter } from 'vectorious/iterator';
   *
   * const iter = new NDMultiIter(array([1, 2, 3]), array([4, 5, 6]));
   * iter.done(); // false
   */
  done() {
    return this.index > this.lengthm1;
  }
  /**
   * @function current
   * @memberof NDMultiIter
   * @description Returns the current indices of the iterators
   * @returns {Object} current
   * @returns {Number[]} [current.value]
   * @returns {Boolean} current.done
   * @example
   * import { array } from 'vectorious/core/array';
   * import { NDMultiIter } from 'vectorious/iterator';
   *
   * const iter = new NDMultiIter(array([1, 2, 3]), array([4, 5, 6]));
   * iter.current(); // { value: [0, 0], done: false }
   */
  current() {
    const done = this.done();
    return {
      value: done ? void 0 : this.pos,
      done,
    };
  }
  /**
   * @function next
   * @memberof NDMultiIter
   * @description
   * Steps to the next position in the iterator.
   * Returns the current indices of the iterators, or undefined if done.
   * @returns {Object} current
   * @returns {Number[]} [current.value]
   * @returns {Boolean} current.done
   * @example
   * import { array } from 'vectorious/core/array';
   * import { NDMultiIter } from 'vectorious/iterator';
   *
   * const iter = new NDMultiIter(array([1, 2, 3]), array([4, 5, 6]));
   * iter.next(); // { value: [0, 0], done: false }
   * iter.next(); // { value: [1, 1], done: false }
   * iter.next(); // { value: [2, 2], done: false },
   * iter.next(); // { value: undefined, done: true },
   */
  next() {
    const current = this.current();
    if (current.done) {
      return current;
    }
    this.index += 1;
    const { numiter } = this;
    let it;
    let i;
    for (i = 0; i < numiter; i += 1) {
      it = this.iters[i];
      this.pos[i] = it.pos;
      it.next();
    }
    return current;
  }
  [Symbol.iterator]() {
    return this;
  }
};

// src/core/abs.ts
var { abs: f } = Math;
var abs = (x) => array(x).abs();
function abs_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = f(d1[i]);
  }
  return this;
}

// src/core/acos.ts
var { acos: f2 } = Math;
var acos = (x) => array(x).acos();
function acos_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = f2(d1[i]);
  }
  return this;
}

// src/core/acosh.ts
var { acosh: f3 } = Math;
var acosh = (x) => array(x).acosh();
function acosh_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = f3(d1[i]);
  }
  return this;
}

// src/blas.ts
var nblas;
try {
  nblas = __require("nblas");
} catch (err) {}
var NoTrans = nblas && nblas.NoTrans;
var Trans = nblas && nblas.Trans;
function axpy(dtype, n, alpha, x, inc_x, y, inc_y) {
  if (x.length / inc_x !== n || y.length / inc_y !== n) {
    throw new Error("lengths do not match");
  }
  switch (dtype) {
    case "float64":
      return nblas.daxpy(n, alpha, x, inc_x, y, inc_y);
    case "float32":
      return nblas.saxpy(n, alpha, x, inc_x, y, inc_y);
    default:
      throw new Error("wrong dtype");
  }
}
function dot(dtype, n, x, inc_x, y, inc_y) {
  if (x.length / inc_x !== n || y.length / inc_y !== n) {
    throw new Error("lengths do not match");
  }
  switch (dtype) {
    case "float64":
      return nblas.ddot(n, x, inc_x, y, inc_y);
    case "float32":
      return nblas.sdot(n, x, inc_x, y, inc_y);
    default:
      throw new Error("wrong dtype");
  }
}
function iamax(dtype, n, x, inc_x) {
  if (x.length / inc_x !== n) {
    throw new Error("lengths do not match");
  }
  switch (dtype) {
    case "float64":
      return nblas.idamax(n, x, inc_x);
    case "float32":
      return nblas.isamax(n, x, inc_x);
    default:
      throw new Error("wrong dtype");
  }
}
function gemm(
  dtype,
  transx,
  transy,
  m,
  n,
  k,
  alpha,
  x,
  ldx,
  y,
  ldy,
  beta,
  z,
  ldz
) {
  const { length: l1 } = x;
  const { length: l2 } = y;
  const { length: l3 } = z;
  if (
    (transx === nblas.NoTrans && l1 !== ldx * m) ||
    (transx === nblas.Trans && l1 !== ldx * k)
  ) {
    throw new Error("lengths do not match");
  }
  if (
    (transy === nblas.NoTrans && l2 !== ldy * k) ||
    (transy === nblas.Trans && l2 !== ldy * n)
  ) {
    throw new Error("lengths do not match");
  }
  if (l3 !== ldz * m) {
    throw new Error("lengths do not match");
  }
  switch (dtype) {
    case "float64":
      return nblas.dgemm(
        transx,
        transy,
        m,
        n,
        k,
        alpha,
        x,
        ldx,
        y,
        ldy,
        beta,
        z,
        ldz
      );
    case "float32":
      return nblas.sgemm(
        transx,
        transy,
        m,
        n,
        k,
        alpha,
        x,
        ldx,
        y,
        ldy,
        beta,
        z,
        ldz
      );
    default:
      throw new Error("wrong dtype");
  }
}
function nrm2(dtype, n, x, inc_x) {
  if (x.length / inc_x !== n) {
    throw new Error("lengths do not match");
  }
  switch (dtype) {
    case "float64":
      return nblas.dnrm2(n, x, inc_x);
    case "float32":
      return nblas.snrm2(n, x, inc_x);
    default:
      throw new Error("wrong dtype");
  }
}
function scal(dtype, n, alpha, x, inc_x) {
  if (x.length / inc_x !== n) {
    throw new Error("lengths do not match");
  }
  switch (dtype) {
    case "float64":
      return nblas.dscal(n, alpha, x, inc_x);
    case "float32":
      return nblas.sscal(n, alpha, x, inc_x);
    default:
      throw new Error("wrong dtype");
  }
}

// src/core/add.ts
var add = (x, y, alpha = 1) => array(x).add(array(y), alpha);
function add_default(x, alpha = 1) {
  const { data: d1, length: l1, strides: st1, dtype } = this;
  const { data: d2, strides: st2 } = array(x);
  try {
    const inc_x = st2[st2.length - 1];
    const inc_y = st1[st1.length - 1];
    if (inc_x !== inc_y) {
      throw new Error("inc_x and inc_y must be equal");
    }
    axpy(dtype, l1, alpha, d2, inc_x, d1, inc_y);
  } catch (err) {
    const iter = new NDMultiIter(this, x);
    for (const [i, j] of iter) {
      d1[i] += alpha * d2[j];
    }
  }
  return this;
}

// src/core/angle.ts
var { acos: f4 } = Math;
var angle = (x, y) => array(x).angle(array(y));
function angle_default(x) {
  return f4(this.dot(array(x)) / this.norm() / array(x).norm());
}

// src/core/asin.ts
var { asin: f5 } = Math;
var asin = (x) => array(x).asin();
function asin_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = f5(d1[i]);
  }
  return this;
}

// src/core/asinh.ts
var { asinh: f6 } = Math;
var asinh = (x) => array(x).asinh();
function asinh_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = f6(d1[i]);
  }
  return this;
}

// src/core/atan.ts
var { atan: f7 } = Math;
var atan = (x) => array(x).atan();
function atan_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = f7(d1[i]);
  }
  return this;
}

// src/core/atanh.ts
var { atanh: f8 } = Math;
var atanh = (x) => array(x).atanh();
function atanh_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = f8(d1[i]);
  }
  return this;
}

// src/core/zeros.ts
var zeros = (...shape) =>
  new NDArray(new Float64Array(shape.reduce((sum2, dim) => sum2 * dim, 1)), {
    shape,
  }).fill(0);

// src/core/augment.ts
var augment = (x, y) => array(x).augment(array(y));
function augment_default(x) {
  const [r1, c1] = this.shape;
  const [r2, c2] = array(x).shape;
  const { data: d1 } = this;
  const { data: d2 } = array(x);
  if (r2 === 0 || c2 === 0) {
    return this;
  }
  if (r1 !== r2) {
    throw new Error("rows do not match");
  }
  const y = zeros(r1, c1 + c2);
  const { data: d3 } = y;
  let i;
  let j;
  for (i = 0; i < r1; i += 1) {
    for (j = 0; j < c1; j += 1) {
      d3[i * (c1 + c2) + j] = d1[i * c1 + j];
    }
  }
  for (i = 0; i < r2; i += 1) {
    for (j = 0; j < c2; j += 1) {
      d3[i * (c1 + c2) + (j + c1)] = d2[i * c2 + j];
    }
  }
  return y;
}

// src/core/binOp.ts
var binOp = (x, y, f31) => array(x).binOp(array(y), f31);
function binOp_default(x, f31) {
  const { data: d1 } = this;
  const { data: d2 } = array(x);
  const iter = new NDMultiIter(this, x);
  for (const [i, j] of iter) {
    d1[i] = f31(d1[i], d2[j], i);
  }
  return this;
}

// src/core/cbrt.ts
var { cbrt: f9 } = Math;
var cbrt = (x) => array(x).cbrt();
function cbrt_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = f9(d1[i]);
  }
  return this;
}

// src/core/ceil.ts
var { ceil: f10 } = Math;
var ceil = (x) => array(x).ceil();
function ceil_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = f10(d1[i]);
  }
  return this;
}

// src/core/check.ts
var check = (x, ...indices) => {
  array(x).check(...indices);
};
function check_default(...indices) {
  const { shape: s1, length: l1 } = this;
  if (indices.length === 1) {
    const [i] = indices;
    if (i < 0 || i > l1 - 1 || !Number.isFinite(i)) {
      throw new Error("index out of bounds");
    }
  } else if (
    !s1.every(
      (dim, i) =>
        dim > indices[i] && Number.isFinite(indices[i]) && indices[i] >= 0
    )
  ) {
    throw new Error("index out of bounds");
  }
}

// src/core/combine.ts
var combine = (x, y) => array(x).combine(array(y));
function combine_default(x) {
  if (this.shape.length !== 1 && x.shape.length !== 1) {
    throw new Error(
      "combine operation not permitted for multidimensional arrays"
    );
  }
  const { length: l1, data: d1 } = this;
  const { length: l2, data: d2 } = x;
  if (l2 === 0) {
    return this;
  }
  if (l1 === 0) {
    this.data = new (get_type(x.dtype))(d2);
    this.length = l2;
    this.dtype = x.dtype;
    return this;
  }
  const l3 = l1 + l2;
  const d3 = new (get_type(this.dtype))(l3);
  d3.set(d1);
  d3.set(d2, l1);
  this.data = d3;
  this.length = l3;
  this.shape = [l3];
  return this;
}

// src/core/copy.ts
var copy = (x) => array(x).copy();
function copy_default() {
  const x = zeros(...this.shape);
  const { data: d1 } = this;
  const { data: d2 } = x;
  const iter = new NDMultiIter(this, x);
  for (const [i, j] of iter) {
    d2[j] = d1[i];
  }
  return x;
}

// src/core/cos.ts
var { cos: f11 } = Math;
var cos = (x) => array(x).cos();
function cos_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = f11(d1[i]);
  }
  return this;
}

// src/core/cosh.ts
var { cosh: f12 } = Math;
var cosh = (x) => array(x).cosh();
function cosh_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = f12(d1[i]);
  }
  return this;
}

// src/core/cross.ts
var cross = (x, y) => array(x).cross(array(y));
function cross_default(x) {
  const { length: l1 } = this;
  const { length: l2 } = x;
  if (l1 !== 3 || l2 !== 3) {
    throw new Error("vectors must have three components");
  }
  const c1 = this.y * x.z - this.z * x.y;
  const c2 = this.z * x.x - this.x * x.z;
  const c3 = this.x * x.y - this.y * x.x;
  this.x = c1;
  this.y = c2;
  this.z = c3;
  return this;
}

// src/core/det.ts
var det = (x) => array(x).det();
function det_default() {
  this.square();
  const [n] = this.shape;
  const [LU, ipiv] = this.copy().lu_factor();
  const { data: d1 } = LU;
  let product2 = 1;
  let sign2 = 1;
  let i;
  for (i = 0; i < n; i += 1) {
    product2 *= d1[i * n + i];
    if (i !== ipiv[i] - 1) {
      sign2 *= -1;
    }
  }
  return sign2 * product2;
}

// src/core/diagonal.ts
var diagonal = (x) => array(x).diagonal();
function diagonal_default() {
  this.square();
  const { length: l1 } = this;
  const [r, c] = this.shape;
  const l2 = Math.min(r, c);
  return this.reshape(l1).slice(0, l1, l2 + 1);
}

// src/core/dot.ts
var dot2 = (x, y) => array(x).dot(array(y));
function dot_default(x) {
  const { data: d1, length: l1, strides: st1, dtype } = this;
  const { data: d2, strides: st2 } = x;
  let result = 0;
  try {
    const inc_x = st2[st2.length - 1];
    const inc_y = st1[st1.length - 1];
    if (inc_x !== inc_y) {
      throw new Error("inc_x and inc_y must be equal");
    }
    result = dot(dtype, l1, d2, inc_x, d1, inc_y);
  } catch (err) {
    const iter = new NDMultiIter(this, x);
    for (const [i, j] of iter) {
      result += d1[i] * d2[j];
    }
  }
  return result;
}

// src/core/eye.ts
var eye = (n) => {
  const x = new NDArray(new Float64Array(n * n), { shape: [n, n] });
  const { data: d1 } = x;
  let i;
  for (i = 0; i < n; i += 1) {
    d1[i * n + i] = 1;
  }
  return x;
};

// src/core/eig.ts
var nlapack;
try {
  nlapack = __require("nlapack");
} catch (err) {}
var rotate = (x, c, s, k, l, i, j) => {
  const [n] = x.shape;
  const { data: d1 } = x;
  const temp = d1[k * n + l];
  const tau = 1 / (c + s);
  d1[k * n + l] = temp - s * (d1[i * n + j] + tau * temp);
  d1[i * n + j] += s * (temp - tau * d1[i * n + j]);
};
var eig = (x) => array(x).eig();
function eig_default() {
  this.square();
  const [n] = this.shape;
  try {
    if (!["float32", "float64"].includes(this.dtype)) {
      this.dtype = "float32";
      this.data = get_type(this.dtype).from(this.data);
    }
    const jobvl = nlapack.NoEigenvector;
    const jobvr = nlapack.Eigenvector;
    const wr = zeros(n);
    const wi = zeros(n);
    const vl = zeros(n, n);
    const vr = zeros(n, n);
    const { data: d1 } = this;
    const { data: d2 } = wr;
    const { data: d3 } = wi;
    const { data: d4 } = vl;
    const { data: d5 } = vr;
    if (this.dtype === "float64") {
      nlapack.dgeev(jobvl, jobvr, n, d1, n, d2, d3, d4, n, d5, n);
    }
    if (this.dtype === "float32") {
      nlapack.sgeev(jobvl, jobvr, n, d1, n, d2, d3, d4, n, d5, n);
    }
    return [wr, vr];
  } catch (err) {
    const { data: d1 } = this;
    const p = eye(n);
    let max2 = 0;
    let i = 0;
    let j = 0;
    let k = 0;
    let l = 0;
    do {
      for (i = 0; i < n; i += 1) {
        for (j = i + 1; j < n; j += 1) {
          if (Math.abs(d1[i * n + j]) >= max2) {
            max2 = Math.abs(d1[i * n + j]);
            k = i;
            l = j;
          }
        }
      }
      let t;
      if (Math.abs(d1[k * n + l]) < Math.abs(d1[l * n + l]) * 1e-36) {
        t = d1[k * n + l] / d1[l * n + l];
      } else {
        const phi = (d1[l * n + l] / 2) * d1[k * n + l];
        t = 1 / (Math.abs(phi) + Math.sqrt(phi * phi + 1));
      }
      const c = 1 / Math.sqrt(t * t + 1);
      const s = t * c;
      const e = d1[k * n + l];
      d1[k * n + l] = 0;
      d1[k * n + k] -= t * e;
      d1[l * n + l] += t * e;
      for (i = 0; i < k; i += 1) {
        rotate(this, c, s, i, k, i, l);
      }
      for (i = k + 1; i < l; i += 1) {
        rotate(this, c, s, k, i, i, l);
      }
      for (i = l + 1; i < n; i += 1) {
        rotate(this, c, s, k, i, l, i);
      }
      for (i = 0; i < n; i += 1) {
        rotate(p, c, s, i, k, i, l);
      }
    } while (max2 >= 1e-9);
    return [this.diagonal(), p];
  }
}

// src/core/equals.ts
var equals = (x, y, tolerance = 1e-6) => array(x).equals(array(y), tolerance);
function equals_default(x, tolerance = 1e-6) {
  const { data: d1 } = this;
  const { data: d2 } = x;
  const iter = new NDMultiIter(this, x);
  for (const [i, j] of iter) {
    if (Math.abs(d1[i] - d2[j]) > tolerance) {
      return false;
    }
  }
  return true;
}

// src/core/equidimensional.ts
var equidimensional = (x, y) => {
  array(x).equidimensional(array(y));
};
function equidimensional_default(x) {
  const { shape: s1 } = this;
  const { shape: s2 } = x;
  if (!s1.every((dim, i) => dim === s2[i])) {
    throw new Error(`shapes ${s1} and ${s2} do not match`);
  }
}

// src/core/equilateral.ts
var equilateral = (x, y) => {
  array(x).equilateral(array(y));
};
function equilateral_default(x) {
  const { length: l1 } = this;
  const { length: l2 } = x;
  if (l1 !== l2) {
    throw new Error(`lengths ${l1} and ${l2} do not match`);
  }
}

// src/core/exp.ts
var { exp: f13 } = Math;
var exp = (x) => array(x).exp();
function exp_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = f13(d1[i]);
  }
  return this;
}

// src/core/expm1.ts
var { expm1: f14 } = Math;
var expm1 = (x) => array(x).expm1();
function expm1_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = f14(d1[i]);
  }
  return this;
}

// src/core/fill.ts
var fill = (x, value = 0) => array(x).fill(value);
function fill_default(value = 0) {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = value instanceof Function ? value(i) : value;
  }
  return this;
}

// src/core/floor.ts
var { floor: f15 } = Math;
var floor = (x) => array(x).floor();
function floor_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = f15(d1[i]);
  }
  return this;
}

// src/core/forEach.ts
var forEach = (x, f31) => {
  x.forEach(f31);
};
function forEach_default(f31) {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    f31.call(this, d1[i], i, d1);
  }
}

// src/core/fround.ts
var { fround: f16 } = Math;
var fround = (x) => array(x).fround();
function fround_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = f16(d1[i]);
  }
  return this;
}

// src/core/gauss.ts
var gauss = (x) => array(x).gauss();
function gauss_default() {
  const {
    shape: [r, c],
    data: d1,
  } = this;
  let lead = 0;
  let leadValue;
  let pivot;
  let i;
  let j;
  let k;
  for (i = 0; i < r; i += 1) {
    if (c <= lead) {
      return this;
    }
    j = i;
    while (d1[j * c + lead] === 0) {
      j += 1;
      if (r === j) {
        j = i;
        lead += 1;
        if (c === lead) {
          return this;
        }
      }
    }
    if (i !== j) {
      this.swap(i, j);
    }
    pivot = d1[i * c + lead];
    if (pivot !== 0) {
      for (k = 0; k < c; k += 1) {
        d1[i * c + k] /= pivot;
      }
    }
    for (j = 0; j < r; j += 1) {
      leadValue = d1[j * c + lead];
      if (j !== i) {
        for (k = 0; k < c; k += 1) {
          d1[j * c + k] -= d1[i * c + k] * leadValue;
        }
      }
    }
    lead += 1;
  }
  for (i = 0; i < r; i += 1) {
    pivot = 0;
    for (j = 0; j < c; j += 1) {
      if (pivot === 0) {
        pivot = d1[i * c + j];
      }
    }
    if (pivot !== 0) {
      for (k = 0; k < c; k += 1) {
        d1[i * c + k] /= pivot;
      }
    }
  }
  return this;
}

// src/core/get.ts
var get = (x, ...indices) => array(x).get(...indices);
function get_default(...indices) {
  this.check(...indices);
  const { data: d1, shape: s1 } = this;
  const { length: ndim } = s1;
  let index = 0;
  let i;
  for (i = 0; i < ndim; i += 1) {
    index *= s1[i];
    index += indices[i];
  }
  return d1[index];
}

// src/lapack.ts
var nlapack2;
try {
  nlapack2 = __require("nlapack");
} catch (err) {}
function getrf(dtype, m, n, x, ldx, ipiv) {
  if (x.length !== m * n) {
    throw new Error("lengths do not match");
  }
  switch (dtype) {
    case "float64":
      return nlapack2.dgetrf(m, n, x, ldx, ipiv);
    case "float32":
      return nlapack2.sgetrf(m, n, x, ldx, ipiv);
    default:
      throw new Error("wrong dtype");
  }
}
function getri(dtype, n, x, ldx, ipiv) {
  if (x.length !== n * n) {
    throw new Error("lengths do not match");
  }
  switch (dtype) {
    case "float64":
      return nlapack2.dgetri(n, x, ldx, ipiv);
    case "float32":
      return nlapack2.sgetri(n, x, ldx, ipiv);
    default:
      throw new Error("wrong dtype");
  }
}
function gesv(dtype, n, nrhs, x, ldx, ipiv, y, ldy) {
  if (x.length !== ldx * n || y.length !== ldy * nrhs) {
    throw new Error("lengths do not match");
  }
  switch (dtype) {
    case "float64":
      return nlapack2.dgesv(n, nrhs, x, ldx, ipiv, y, ldy);
    case "float32":
      return nlapack2.sgesv(n, nrhs, x, ldx, ipiv, y, ldy);
    default:
      throw new Error("wrong dtype");
  }
}

// src/core/inv.ts
var inv = (x) => array(x).inv();
function inv_default() {
  this.square();
  const {
    shape: [n],
    dtype,
  } = this;
  try {
    const { data: d1 } = this;
    const ipiv = new Int32Array(n);
    getrf(dtype, n, n, d1, n, ipiv);
    getri(dtype, n, d1, n, ipiv);
    return this;
  } catch (err) {
    const identity = eye(n);
    const rref = augment(this, identity).gauss();
    const left = zeros(n, n);
    const right = zeros(n, n);
    const { data: d1 } = rref;
    const { data: d2 } = left;
    const { data: d3 } = right;
    const iter = new NDIter(rref);
    let [ci, cj] = iter.coords;
    for (const i of iter) {
      if (cj < n) {
        d2[ci * n + cj] = d1[i];
      } else {
        d3[ci * n + (cj - n)] = d1[i];
      }
      [ci, cj] = iter.coords;
    }
    if (!left.equals(identity)) {
      throw new Error("matrix is not invertible");
    }
    return right;
  }
}

// src/core/log.ts
var { log: f17 } = Math;
var log = (x) => array(x).log();
function log_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = f17(d1[i]);
  }
  return this;
}

// src/core/log10.ts
var { log10: f18 } = Math;
var log10 = (x) => array(x).log10();
function log10_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = f18(d1[i]);
  }
  return this;
}

// src/core/log1p.ts
var { log1p: f19 } = Math;
var log1p = (x) => array(x).log1p();
function log1p_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = f19(d1[i]);
  }
  return this;
}

// src/core/log2.ts
var { log2: f20 } = Math;
var log2 = (x) => array(x).log2();
function log2_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = f20(d1[i]);
  }
  return this;
}

// src/core/lu.ts
var lu = (x) => array(x).lu();
function lu_default() {
  const [LU, ipiv] = this.copy().lu_factor();
  const L = LU.copy();
  const U = LU.copy();
  const { data: d1 } = L;
  const { data: d2 } = U;
  const iter = new NDIter(LU);
  let [ci, cj] = iter.coords;
  for (const i of iter) {
    if (cj < ci) {
      d2[i] = 0;
    } else {
      d1[i] = ci === cj ? 1 : 0;
    }
    [ci, cj] = iter.coords;
  }
  return [L, U, ipiv];
}

// src/core/lu_factor.ts
var lu_factor = (x) => array(x).lu_factor();
function lu_factor_default() {
  const {
    data: d1,
    shape: [n],
    dtype,
  } = this;
  const ipiv = new Int32Array(n);
  try {
    getrf(dtype, n, n, d1, n, ipiv);
  } catch (err) {
    let max2;
    let abs2;
    let diag;
    let p;
    let i;
    let j;
    let k;
    for (k = 0; k < n; k += 1) {
      p = k;
      max2 = Math.abs(d1[k * n + k]);
      for (j = k + 1; j < n; j += 1) {
        abs2 = Math.abs(d1[j * n + k]);
        if (max2 < abs2) {
          max2 = abs2;
          p = j;
        }
      }
      ipiv[k] = p + 1;
      if (p !== k) {
        this.swap(k, p);
      }
      diag = d1[k * n + k];
      for (i = k + 1; i < n; i += 1) {
        d1[i * n + k] /= diag;
      }
      for (i = k + 1; i < n; i += 1) {
        for (j = k + 1; j < n - 1; j += 2) {
          d1[i * n + j] -= d1[i * n + k] * d1[k * n + j];
          d1[i * n + j + 1] -= d1[i * n + k] * d1[k * n + j + 1];
        }
        if (j === n - 1) {
          d1[i * n + j] -= d1[i * n + k] * d1[k * n + j];
        }
      }
    }
  }
  return [this, ipiv];
}

// src/core/map.ts
var map = (x, f31) => array(x).map(f31);
function map_default(f31) {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  const map2 = f31.bind(this);
  const copy2 = this.copy();
  const { data: d2 } = copy2;
  for (const i of iter) {
    d2[i] = map2(d1[i], i, d1);
  }
  return copy2;
}

// src/core/max.ts
var max = (x) => array(x).max();
function max_default() {
  const { data: d1, length: l1, strides: st1, dtype } = this;
  let max2 = Number.NEGATIVE_INFINITY;
  try {
    const inc_x = st1[st1.length - 1];
    max2 = d1[iamax(dtype, l1, d1, inc_x)];
  } catch (err) {
    const iter = new NDIter(this);
    for (const i of iter) {
      const value = d1[i];
      if (max2 < value) {
        max2 = value;
      }
    }
  }
  return max2;
}

// src/core/mean.ts
var mean = (x) => array(x).mean();
function mean_default() {
  const { data: d1, length: l1 } = this;
  const iter = new NDIter(this);
  let mean2 = 0;
  for (const i of iter) {
    mean2 += d1[i];
  }
  return mean2 / l1;
}

// src/core/min.ts
var min = (x) => array(x).min();
function min_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  let min2 = Number.POSITIVE_INFINITY;
  for (const i of iter) {
    const value = d1[i];
    if (min2 > value) {
      min2 = value;
    }
  }
  return min2;
}

// src/core/matrix.ts
var matrix = (r, c) => new NDArray(new Float64Array(r * c), { shape: [r, c] });

// src/core/multiply.ts
var multiply = (x, y) => array(x).multiply(array(y));
function multiply_default(x) {
  const {
    shape: [r1, c1],
    data: d1,
    dtype,
  } = this.copy();
  const {
    shape: [r2, c2],
    data: d2,
  } = x.copy();
  if (c1 !== r2) {
    throw new Error("sizes do not match");
  }
  if (c2 == null) {
    const y2 = array(new Float64Array(r2), { shape: [r2] });
    const { data: d32 } = y2;
    for (let i = 0; i < r1; i++) {
      let sum2 = 0;
      for (let k = 0; k < c1; k++) {
        sum2 += d1[i * c1 + k] * d2[k];
      }
      d32[i] = sum2;
    }
    return y2;
  }
  const y = matrix(r1, c2);
  const { data: d3 } = y;
  try {
    gemm(dtype, NoTrans, NoTrans, r1, c2, c1, 1, d1, c1, d2, c2, 0, d3, c2);
  } catch (err) {
    const iter = new NDIter(y);
    let k;
    let [ci, cj] = iter.coords;
    for (const i of iter) {
      let sum2 = 0;
      for (k = 0; k < c1; k += 1) {
        sum2 += d1[ci * c1 + k] * d2[k * c2 + cj];
      }
      d3[i] = sum2;
      [ci, cj] = iter.coords;
    }
  }
  return y;
}

// src/core/norm.ts
var { sqrt: f21 } = Math;
var norm = (x) => array(x).norm();
function norm_default() {
  const { data: d1, length: l1, strides: st1, dtype } = this;
  let result = 0;
  try {
    const inc_x = st1[st1.length - 1];
    result = nrm2(dtype, l1, d1, inc_x);
  } catch (err) {
    result = f21(this.dot(this));
  }
  return result;
}

// src/core/normalize.ts
var normalize = (x) => array(x).normalize();
function normalize_default() {
  return this.scale(1 / this.norm());
}

// src/core/pow.ts
var { pow: f22 } = Math;
var pow = (x, exponent) => array(x).pow(exponent);
function pow_default(exponent) {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = f22(d1[i], exponent);
  }
  return this;
}

// src/core/prod.ts
var prod = (x) => array(x).prod();
function prod_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  let prod2 = 1;
  for (const i of iter) {
    prod2 *= d1[i];
  }
  return prod2;
}

// src/core/product.ts
var product = (x, y) => array(x).product(array(y));
function product_default(x) {
  const { data: d1 } = this;
  const { data: d2 } = x;
  const iter = new NDMultiIter(this, x);
  for (const [i, j] of iter) {
    d1[i] *= d2[j];
  }
  return this;
}

// src/core/project.ts
var project = (x, y) => array(x).project(array(y));
function project_default(x) {
  return x.scale(this.dot(x) / x.dot(x));
}

// src/core/push.ts
var push = (x, value) => array(x).push(value);
function push_default(value) {
  if (this.shape.length !== 1) {
    throw new Error("push operation not permitted for multidimensional arrays");
  }
  const { data: d1, length: l1 } = this;
  const l2 = l1 + 1;
  const d2 = new (get_type(this.dtype))(l2);
  d2.set(d1);
  d2[l1] = value;
  this.data = d2;
  this.length = l2;
  this.shape = [l2];
  return this;
}

// src/core/rank.ts
var rank = (x, tolerance = 1e-6) => array(x).rank(tolerance);
function rank_default(tolerance = 1e-6) {
  const { data: d1 } = this.copy().gauss();
  const iter = new NDIter(this);
  let rk = 0;
  let [ci, cj] = iter.coords;
  for (const i of iter) {
    if (rk <= ci && cj >= ci && Math.abs(d1[i]) > tolerance) {
      rk += 1;
    }
    [ci, cj] = iter.coords;
  }
  return rk;
}

// src/core/reciprocal.ts
var reciprocal = (x) => array(x).reciprocal();
function reciprocal_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = 1 / d1[i];
  }
  return this;
}

// src/core/reduce.ts
var reduce = (x, f31, initialValue) => array(x).reduce(f31, initialValue);
function reduce_default(f31, initialValue) {
  const { data: d1, length: l1 } = this;
  if (l1 === 0 && typeof initialValue === "undefined") {
    throw new Error("Reduce of empty array with no initial value.");
  }
  const iter = new NDIter(this);
  const reduce2 = f31.bind(this);
  let value;
  if (typeof initialValue === "undefined") {
    value = d1[0];
    iter.next();
  } else {
    value = initialValue;
  }
  for (const i of iter) {
    value = reduce2(value, d1[i], i, d1);
  }
  return value;
}

// src/core/reshape.ts
var reshape = (x, ...shape) => array(x).reshape(...shape);
function reshape_default(...shape) {
  const { length } = this;
  if (shape.reduce((sum2, dim) => sum2 * dim, 1) !== length) {
    throw new Error(`shape ${shape} does not match length ${length}`);
  }
  this.shape = shape;
  this.strides = get_strides(shape);
  return this;
}

// src/core/round.ts
var { round: f23 } = Math;
var round = (x) => array(x).round();
function round_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = f23(d1[i]);
  }
  return this;
}

// src/core/row_add.ts
var row_add = (x, dest, source, scalar = 1) =>
  array(x).row_add(dest, source, scalar);
function row_add_default(dest, source, scalar = 1) {
  this.check(dest, 0);
  this.check(source, 0);
  const [, c] = this.shape;
  const { data: d1 } = this;
  let j;
  for (j = 0; j < c; j += 1) {
    d1[dest * c + j] += d1[source * c + j] * scalar;
  }
  return this;
}

// src/core/scale.ts
var scale = (x, scalar) => array(x).scale(scalar);
function scale_default(scalar) {
  const { data: d1, length: l1, strides: st1, dtype } = this;
  try {
    const inc_x = st1[st1.length - 1];
    scal(dtype, l1, scalar, d1, inc_x);
  } catch (err) {
    const iter = new NDIter(this);
    for (const i of iter) {
      d1[i] *= scalar;
    }
  }
  return this;
}

// src/core/set.ts
var set = (x, ...args) => {
  x.set(...args);
};
function set_default(...args) {
  const indices = args.slice(0, -1);
  const value = args[args.length - 1];
  this.check(...indices);
  const { shape: s1 } = this;
  let index = 0;
  let i;
  for (i = 0; i < indices.length; i += 1) {
    index *= s1[i];
    index += indices[i];
  }
  this.data[index] = value;
}

// src/core/sign.ts
var { sign: f24 } = Math;
var sign = (x) => array(x).sign();
function sign_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = f24(d1[i]);
  }
  return this;
}

// src/core/sin.ts
var { sin: f25 } = Math;
var sin = (x) => array(x).sin();
function sin_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = f25(d1[i]);
  }
  return this;
}

// src/core/sinh.ts
var { sinh: f26 } = Math;
var sinh = (x) => array(x).sinh();
function sinh_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = f26(d1[i]);
  }
  return this;
}

// src/core/slice.ts
var slice = (x, begin, end, step) => array(x).slice(begin, end, step);
function slice_default(begin = 0, end = this.shape[0], step = 1) {
  const { data: d1, shape: s1 } = this;
  const nd = s1.length;
  if (begin < 0 || end < 0) {
    return this.slice(
      begin < 0 ? s1[s1.length - 1] + begin : begin,
      end < 0 ? s1[s1.length - 1] + end : end
    );
  }
  if (begin > end) {
    return this.slice(end, begin, step);
  }
  if (step <= 0) {
    throw new Error("step argument has to be a positive integer");
  }
  const s2 = [Math.ceil((end - begin) / Math.abs(step)), ...s1.slice(1)];
  const l2 = get_length(s2);
  const st2 = get_strides(s2);
  const d2 =
    nd > 1
      ? d1.subarray(begin * s2[s2.length - 1], end * s2[s2.length - 1])
      : d1.subarray(begin, end);
  st2[0] *= step;
  return new NDArray(d2, {
    shape: s2,
    length: l2,
    strides: st2,
  });
}

// src/core/solve.ts
var solve = (x, y) => array(x).solve(array(y));
function solve_default(x) {
  const { data: d1, dtype } = this;
  const {
    data: d2,
    shape: [n, nrhs],
  } = x;
  try {
    const ipiv = new Int32Array(n);
    gesv(dtype, n, nrhs, d1, n, ipiv, d2, nrhs);
  } catch (err) {
    const [LU, ipiv] = this.lu_factor();
    const { data: d12 } = LU;
    const { data: d22 } = x;
    let i;
    let j;
    let k;
    for (i = 0; i < ipiv.length; i += 1) {
      if (i !== ipiv[i] - 1) {
        x.swap(i, ipiv[i] - 1);
      }
    }
    for (k = 0; k < nrhs; k += 1) {
      for (i = 0; i < n; i += 1) {
        for (j = 0; j < i; j += 1) {
          d22[i * nrhs + k] -= d12[i * n + j] * d22[j * nrhs + k];
        }
      }
      for (i = n - 1; i >= 0; i -= 1) {
        for (j = i + 1; j < n; j += 1) {
          d22[i * nrhs + k] -= d12[i * n + j] * d22[j * nrhs + k];
        }
        d22[i * nrhs + k] /= d12[i * n + i];
      }
    }
  }
  return x;
}

// src/core/sqrt.ts
var { sqrt: f27 } = Math;
var sqrt = (x) => array(x).sqrt();
function sqrt_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = f27(d1[i]);
  }
  return this;
}

// src/core/square.ts
var square = (x) => {
  array(x).square();
};
function square_default() {
  const { length } = this.shape;
  const [r, c] = this.shape;
  if (length !== 2 || r !== c) {
    throw new Error("matrix is not square");
  }
}

// src/core/subtract.ts
var subtract = (x, y) => array(x).subtract(array(y));
function subtract_default(x) {
  return this.add(x, -1);
}

// src/core/sum.ts
var sum = (x) => array(x).sum();
function sum_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  let sum2 = 0;
  for (const i of iter) {
    sum2 += d1[i];
  }
  return sum2;
}

// src/core/swap.ts
var swap = (x, i, j) => array(x).swap(i, j);
function swap_default(i, j) {
  this.check(i, 0);
  this.check(j, 0);
  const { data: d1 } = this;
  const [, c] = this.shape;
  const d2 = d1.slice(i * c, (i + 1) * c);
  d1.copyWithin(i * c, j * c, (j + 1) * c);
  d1.set(d2, j * c);
  return this;
}

// src/core/tan.ts
var { tan: f28 } = Math;
var tan = (x) => array(x).tan();
function tan_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = f28(d1[i]);
  }
  return this;
}

// src/core/tanh.ts
var { tanh: f29 } = Math;
var tanh = (x) => array(x).tanh();
function tanh_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = f29(d1[i]);
  }
  return this;
}

// src/core/toArray.ts
var toArray = (x) => array(x).toArray();
function toArray_default(index = 0, dim = 0) {
  const { data: d1, shape: s1, strides: st1 } = this;
  const { length: ndim } = s1;
  if (dim >= ndim) {
    return d1[index];
  }
  const n = s1[dim];
  const stride = st1[dim];
  const list = [];
  for (let i = 0; i < n; i++) {
    const item = this.toArray(index, dim + 1);
    if (item === null) {
      return null;
    }
    list[i] = item;
    index += stride;
  }
  return list;
}

// src/core/toString.ts
var import_util7 = __toESM(require_util());
var toString = (x) => array(x).toString();
function toString_default() {
  return `array(${(0, import_util7.inspect)(this.toArray(), { depth: 10, breakLength: 40 })}, dtype=${this.dtype})`;
}

// src/core/trace.ts
var trace = (x) => array(x).trace();
function trace_default() {
  const [r, c] = this.shape;
  const { data: d1 } = this;
  const n = Math.min(r, c);
  let result = 0;
  let j;
  for (j = 0; j < n; j += 1) {
    result += d1[j * c + j];
  }
  return result;
}

// src/core/transpose.ts
var transpose = (x) => array(x).transpose();
function transpose_default() {
  if (this.shape.length < 2) {
    return this;
  }
  let tmp = this.shape[0];
  this.shape[0] = this.shape[1];
  this.shape[1] = tmp;
  tmp = this.strides[0];
  this.strides[0] = this.strides[1];
  this.strides[1] = tmp;
  return this;
}

// src/core/trunc.ts
var { trunc: f30 } = Math;
var trunc = (x) => array(x).trunc();
function trunc_default() {
  const { data: d1 } = this;
  const iter = new NDIter(this);
  for (const i of iter) {
    d1[i] = f30(d1[i]);
  }
  return this;
}

// src/core/magic.ts
var magic = (n) => {
  if (n < 0) {
    throw new Error("invalid n");
  }
  const d1 = new Float64Array(n * n);
  const magic2 = new NDArray(d1, { shape: [n, n] });
  const iter = new NDIter(magic2);
  let [ci, cj] = iter.coords;
  for (const i of iter) {
    const a = n - ci - 1;
    const b = n - cj - 1;
    d1[i] = ((cj + a * 2 + 1) % n) * n + ((b + a * 2 + 1) % n) + 1;
    [ci, cj] = iter.coords;
  }
  return magic2;
};

// src/core/ones.ts
var ones = (...shape) =>
  new NDArray(new Float64Array(shape.reduce((sum2, dim) => sum2 * dim, 1)), {
    shape,
  }).fill(1);

// src/core/random.ts
var random = (...shape) =>
  new NDArray(new Float64Array(shape.reduce((sum2, dim) => sum2 * dim, 1)), {
    shape,
  }).map(() => Math.random());

// src/core/range.ts
var range = (...args) => {
  const type = Float64Array;
  let backwards = false;
  let start;
  let step;
  let end;
  switch (args.length) {
    case 2:
      end = args.pop();
      step = 1;
      start = args.pop();
      break;
    case 3:
      end = args.pop();
      step = args.pop();
      start = args.pop();
      break;
    default:
      throw new Error("invalid range");
  }
  if (end - start < 0) {
    const copy2 = end;
    end = start;
    start = copy2;
    backwards = true;
  }
  if (step > end - start) {
    throw new Error("invalid range");
  }
  const data = new type(Math.ceil((end - start) / step));
  let i = start;
  let j = 0;
  if (backwards) {
    for (; i < end; i += step, j += 1) {
      data[j] = end - i + start;
    }
  } else {
    for (; i < end; i += step, j += 1) {
      data[j] = i;
    }
  }
  return new NDArray(data);
};

// src/core/index.ts
var inspectSymbol = Symbol.for("nodejs.util.inspect.custom");
var NDArray = class {
  /**
   * @name data
   * @memberof NDArray
   * @instance
   * @type TypedArray
   * @default new Float64Array(0)
   */
  data = new Float64Array(0);
  /**
   * @name dtype
   * @memberof NDArray
   * @instance
   * @type String
   * @default 'float64'
   */
  dtype = "float64";
  /**
   * @name length
   * @memberof NDArray
   * @instance
   * @type Number
   * @default 0
   */
  length = 0;
  /**
   * @name shape
   * @memberof NDArray
   * @instance
   * @type Number[]
   * @default [0]
   */
  shape = [0];
  /**
   * @name strides
   * @memberof NDArray
   * @instance
   * @type Number[]
   * @default [0]
   */
  strides = [0];
  [inspectSymbol] = toString_default;
  /**
   * @function abs
   * @memberof NDArray
   * @instance
   * @description Returns the absolute value of each element of current array.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([-1, -2, -3]).abs() // <=> array([1, 2, 3])
   */
  abs = abs_default;
  /**
   * @function acos
   * @memberof NDArray
   * @instance
   * @description Returns the arccosine of each element of current array.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([-1, 0, 1]).acos(); // <=> array([3.141592653589793, 1.5707963267948966, 0])
   */
  acos = acos_default;
  /**
   * @function acosh
   * @memberof NDArray
   * @instance
   * @description Returns the hyperbolic arccosine of each element of current array.
   * @param {NDArray} x
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).acosh(); // <=> array([0, 1.316957950592041, 1.7627471685409546])
   */
  acosh = acosh_default;
  /**
   * @function add
   * @memberof NDArray
   * @instance
   * @description
   * Adds `x` multiplied by `alpha` to the current array.
   * Accelerated with BLAS `?axpy`.
   * @param {NDArray} x
   * @param {Number} [1] alpha
   * @returns {NDArray}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).add([4, 5, 6]); // <=> array([5, 7, 9])
   */
  add = add_default;
  /**
   * @function angle
   * @memberof NDArray
   * @instance
   * @description Determines the angle between the current vector and `x`.
   * @param {NDArray} x
   * @returns {number}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).angle([4, 5, 6]); // <=> 0.22572622788897287
   */
  angle = angle_default;
  /**
   * @function asin
   * @memberof NDArray
   * @instance
   * @description Returns the arcsine of each element of current array.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([-1, 0, 1]).asin() // <=> array([-1.5707963705062866, 0, 1.5707963705062866])
   */
  asin = asin_default;
  /**
   * @function asinh
   * @memberof NDArray
   * @instance
   * @description Returns the hyperbolic arcsine of each element of current array.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([0, 1, 2]).asinh() // <=> array([0, 0.8813735842704773, 1.4436354637145996])
   */
  asinh = asinh_default;
  /**
   * @function atan
   * @memberof NDArray
   * @instance
   * @description Returns the arctangent of each element of current array.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).atan() // <=> array([0.7853981852531433, 1.1071487665176392, 1.249045729637146])
   */
  atan = atan_default;
  /**
   * @function atanh
   * @memberof NDArray
   * @instance
   * @description Returns the hyperbolic arctangent of each element of current array.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([0, -0.5]).atanh(); // <=> array([0, -0.5493061542510986])
   */
  atanh = atanh_default;
  /**
   * @function augment
   * @memberof NDArray
   * @instance
   * @description Augments `x` with current matrix.
   * @param {NDArray} x
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([[1, 2], [3, 4]]).augment(array([[1], [2]])); // <=> array([[1, 2, 1], [3, 4, 2]])
   */
  augment = augment_default;
  /**
   * @function binOp
   * @memberof NDArray
   * @instance
   * @description Perform binary operation `f` on `x` in the current array.
   * @param {NDArray} x
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).binOp([4, 5, 6], (a, b) => a + b); // => array([[5, 7, 9])
   */
  binOp = binOp_default;
  /**
   * @function cbrt
   * @memberof NDArray
   * @instance
   * @description Returns the cube root of each element of current array.
   * @returns {this}
   * @example
   * import { cbrt } from 'vectorious';
   *
   * cbrt([1, 8, 27]); // => array([1, 2, 3])
   */
  cbrt = cbrt_default;
  /**
   * @function ceil
   * @memberof NDArray
   * @instance
   * @description Returns smallest integer greater than or equal to of each element of current array.
   * @returns {NDArray}
   * @example
   * import { array } from 'vectorious';
   *
   * array([0.5, 1.5, 2.5]).ceil(); // <=> array([1, 2, 3])
   */
  ceil = ceil_default;
  /**
   * @function check
   * @memberof NDArray
   * @instance
   * @description Asserts if indices `i, j, ..., n` are within the bounds of current array
   * @param {Number[]} ...indices
   * @throws {Error} index out of bounds
   * @example
   * import { array } from 'vectorious';
   *
   * array([0.5, 1.5, 2.5]).check(3); // Error: index out of bounds
   */
  check = check_default;
  /**
   * @function combine
   * @memberof NDArray
   * @instance
   * @description Combines the current vector with `x`
   * @param {NDArray} x
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).combine([4, 5, 6]); // => array([1, 2, 3, 4, 5, 6])
   */
  combine = combine_default;
  /**
   * @function copy
   * @memberof NDArray
   * @instance
   * @description Makes a copy of the class and underlying data
   * @returns {NDArray}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).copy(); // => array([1, 2, 3])
   */
  copy = copy_default;
  /**
   * @function cos
   * @memberof NDArray
   * @instance
   * @description Returns the cosine of each element of current array.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([0, Math.PI / 2, Math.PI]).cos(); // => array([1, 0, -1])
   */
  cos = cos_default;
  /**
   * @function cosh
   * @memberof NDArray
   * @instance
   * @description Returns the hyperbolic cosine of each element of current array.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([0, 1, 2]).cosh(); // => array([1, 1.5430806875228882, 3.762195587158203])
   */
  cosh = cosh_default;
  /**
   * @function cross
   * @memberof NDArray
   * @instance
   * @description
   * Computes the cross product of the current vector and the vector `x`
   * This operation can only calculated for vectors with three components.
   * Otherwise it throws an exception.
   * @param {NDArray} x
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).cross([4, 5, 6]); // <=> array([-3, 6, -3])
   */
  cross = cross_default;
  /**
   * @function det
   * @memberof NDArray
   * @instance
   * @description Gets the determinant of current matrix using LU factorization.
   * @returns {Number}
   * @example
   * import { array } from 'vectorious';
   *
   * array([[0, 1], [2, 3]]).det(); // => -2
   */
  det = det_default;
  /**
   * @function diagonal
   * @memberof NDArray
   * @instance
   * @description Gets the diagonal of current matrix.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).diagonal(); // => array([1, 4])
   */
  diagonal = diagonal_default;
  /**
   * @function dot
   * @memberof NDArray
   * @instance
   * @description
   * Performs dot multiplication with `x` and current array
   * Accelerated with BLAS `?dot`.
   * @param {NDArray} x
   * @returns {Number}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).dot([4, 5, 6]); // => 32
   */
  dot = dot_default;
  /**
   * @function eig
   * @memberof NDArray
   * @instance
   * @description
   * Gets eigenvalues and eigenvectors of the current matrix using the Jacobi method.
   * Accelerated with LAPACK `?geev`.
   * @returns {Array<NDArray>}
   * @example
   * import { array } from 'vectorious';
   *
   * array([[1, 0, 0], [0, 2, 0], [0, 0, 3]]).eig(); // => [array([1, 2, 3]), array([[1, 0, 0], [0, 1, 0], [0, 0, 1]])]
   */
  eig = eig_default;
  /**
   * @function equals
   * @memberof NDArray
   * @instance
   * @description Checks if current array and `x` are equal.
   * @param {NDArray} x
   * @param {Number} tolerance
   * @returns {Boolean}
   * @example
   * import { equals } from 'vectorious';
   *
   * array([1, 2, 3]).equals([1, 2, 3]); // => true
   */
  equals = equals_default;
  /**
   * @deprecated
   * @function equidimensional
   * @memberof NDArray
   * @instance
   * @description Asserts if current array and `x` have the same shape
   * @param {NDArray} x
   * @throws {Error} shapes x and y do not match
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).equidimensional([1, 2]); // Error: shapes 3 and 2 do not match
   */
  equidimensional = equidimensional_default;
  /**
   * @deprecated
   * @function equilateral
   * @memberof NDArray
   * @instance
   * @description Asserts if current array and `x` have the same length
   * @param {NDArray} x
   * @throws {Error} lengths x and y do not match
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).equilateral([1, 2]); // Error: lengths 3 and 2 do not match
   */
  equilateral = equilateral_default;
  /**
   * @function exp
   * @memberof NDArray
   * @instance
   * @description
   * Returns e^x of each element of current array, where x is the argument,
   * and e is Euler's constant (2.718…), the base of the natural logarithm.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).exp(); // <=> array([2.7182817459106445, 7.389056205749512, 20.08553695678711])
   */
  exp = exp_default;
  /**
   * @function expm1
   * @memberof NDArray
   * @instance
   * @description Returns subtracting 1 from exp(x) of each element of current array.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).expm1(); // <=> array([1.7182817459106445, 6.389056205749512, 19.08553695678711])
   */
  expm1 = expm1_default;
  /**
   * @function fill
   * @memberof NDArray
   * @instance
   * @description Fills the current array with a scalar value
   * @param {Number} value
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).fill(0); // <=> array([0, 0, 0])
   */
  fill = fill_default;
  /**
   * @function floor
   * @memberof NDArray
   * @instance
   * @description Returns the largest integer less than or equal to a number of each element of current array.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1.5, 2.5, 3.5]).floor(); // <=> array([1, 2, 3])
   */
  floor = floor_default;
  /**
   * @function forEach
   * @memberof NDArray
   * @instance
   * @description Equivalent to `TypedArray.prototype.forEach`.
   * @param {Function} f
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).forEach(console.log);
   * // 1 0 [ 1, 2, 3 ]
   * // 2 1 [ 1, 2, 3 ]
   * // 3 2 [ 1, 2, 3 ]
   */
  forEach = forEach_default;
  /**
   * @function fround
   * @memberof NDArray
   * @instance
   * @description Returns the nearest single precision float representation of each element of current array.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([-5.05, 5.05]).fround(); // <=> array([-5.050000190734863, 5.050000190734863])
   */
  fround = fround_default;
  /**
   * @function gauss
   * @memberof NDArray
   * @instance
   * @description
   * Gauss-Jordan elimination (i.e. returns the reduced row echelon form) of the current matrix.
   * @returns {NDArray}
   * @example
   * import { array } from 'vectorious';
   *
   * array([[1, 2, 3], [4, 5, 6]]).gauss(); // <=> array([[1, 0, -1], [-0, 1, 2]])
   */
  gauss = gauss_default;
  /**
   * @function get
   * @memberof NDArray
   * @instance
   * @description Gets the element at `i, j, ..., n` from current vector.
   * @param {Number[]} ...indices
   * @returns {Number}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).get(2); // 3
   */
  get = get_default;
  /**
   * @function inv
   * @memberof NDArray
   * @instance
   * @description
   * Determines the inverse of current matrix using Gaussian elimination.
   * Accelerated with LAPACK `?getri`.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([[2, -1, 0], [-1, 2, -1], [0, -1, 2]]).inv(); // <=> array([[0.75, 0.5, 0.25], [0.5, 1, 0.5], [0.25, 0.5, 0.75]])
   */
  inv = inv_default;
  /**
   * @function log
   * @memberof NDArray
   * @instance
   * @description Returns the natural logarithm (log_e, also ln) of each element of current array.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).log(); // <=> array([0, 0.6931471824645996, 1.0986123085021973])
   */
  log = log_default;
  /**
   * @function log1p
   * @memberof NDArray
   * @instance
   * @description Returns the natural logarithm (log_e, also ln) of 1 + x for each element of current array.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]); // <=> array([0.6931471824645996, 1.0986123085021973, 1.3862943649291992])
   */
  log1p = log1p_default;
  /**
   * @function log10
   * @memberof NDArray
   * @instance
   * @description Returns the base 10 logarithm of each element of current array.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([10, 100, 1000]).log10(); // <=> array([1, 2, 3])
   */
  log10 = log10_default;
  /**
   * @function log2
   * @memberof NDArray
   * @instance
   * @description Returns the base 2 logarithm of each element of current array.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 4]).log2(); // => array([0, 1, 2])
   */
  log2 = log2_default;
  /**
   * @function lu_factor
   * @memberof NDArray
   * @instance
   * @description
   * Performs LU factorization on current matrix.
   * Accelerated with LAPACK `?getrf`.
   * @returns {Array<NDArray|Int32Array>}
   * @example
   * import { array } from 'vectorious';
   *
   * array([[1, 3, 5], [2, 4, 7], [1, 1, 0]]).lu_factor(); // <=> [array([[2, 4, 7], [0.5, 1, 1.5], [0.5, -1, -2]]), Int32Array([2, 2, 3])]
   */
  lu_factor = lu_factor_default;
  /**
   * @function lu
   * @memberof NDArray
   * @instance
   * @description
   * Performs full LU decomposition on current matrix.
   * Accelerated with LAPACK `?getrf`.
   * @returns {Array<NDArray|Int32Array>}
   * @example
   * import { array } from 'vectorious';
   *
   * array([[1, 3, 5], [2, 4, 7], [1, 1, 0]]).lu(); // => [array([[1, 0, 0], [0.5, 1, 0], [0.5, -1, 1]]), array([[2, 4, 7], [0, 1, 1.5], [0, 0, -2]]), Int32Array([2, 2, 3])]
   */
  lu = lu_default;
  /**
   * @function map
   * @memberof NDArray
   * @instance
   * @description Equivalent to `TypedArray.prototype.map`.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).map(value => -value); // => array([-1, -2, -3])
   */
  map = map_default;
  /**
   * @function max
   * @memberof NDArray
   * @instance
   * @description
   * Gets the maximum value (smallest) element of current array.
   * Accelerated with BLAS `i?amax`.
   * @returns {Number}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).max(); // => 3
   */
  max = max_default;
  /**
   * @function mean
   * @memberof NDArray
   * @instance
   * @description Gets the arithmetic mean of current array.
   * @returns {Number}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).mean(); // => 2
   */
  mean = mean_default;
  /**
   * @function min
   * @memberof NDArray
   * @instance
   * @description Gets the minimum value (smallest) element of current array.
   * @returns {Number}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).min(); // 1
   */
  min = min_default;
  /**
   * @function multiply
   * @memberof NDArray
   * @instance
   * @description
   * Multiplies current matrix with `x`.
   * Accelerated with BLAS `?gemm`.
   * @param {NDArray} x
   * @returns {NDArray}
   * @example
   * import { array } from 'vectorious';
   *
   * array([[1, 2]]).multiply([[1], [2]]); // <=> array([[5]])
   */
  multiply = multiply_default;
  /**
   * @function norm
   * @memberof NDArray
   * @instance
   * @description
   * Calculates the norm of current array (also called L2 norm or Euclidean length).
   * Accelerated with BLAS `?nrm2`.
   * @returns {Number}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).norm(); // => 3.7416574954986572
   */
  norm = norm_default;
  /**
   * @function normalize
   * @memberof NDArray
   * @instance
   * @description Normalizes current vector.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).normalize(); // => array([0.26726123690605164, 0.5345224738121033, 0.8017836809158325])
   */
  normalize = normalize_default;
  /**
   * @function pow
   * @memberof NDArray
   * @instance
   * @description Returns each element of current array to the exponent power, that is, element^exponent.
   * @param {Number} exponent
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).pow(2); // <=> array([1, 4, 9])
   */
  pow = pow_default;
  /**
   * @function prod
   * @memberof NDArray
   * @instance
   * @description Product of all elements of current array
   * @returns {Number}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).prod(); // => 6
   */
  prod = prod_default;
  /**
   * @function product
   * @memberof NDArray
   * @instance
   * @description Hadamard product of current matrix and `x`
   * @returns {NDArray}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).product([4, 5, 6]); // <=> array([4, 10, 18])
   */
  product = product_default;
  /**
   * @function project
   * @memberof NDArray
   * @instance
   * @description Projects the current vector onto `x` using the projection formula `(y * (x * y / y * y))`.
   * @returns {NDArray}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).project([4, 5, 6]); // <=> array([1.6623376607894897, 2.0779221057891846, 2.49350643157959])
   */
  project = project_default;
  /**
   * @function push
   * @memberof NDArray
   * @instance
   * @description Pushes a new `value` into current vector.
   * @param {Number} value
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).push(4); // => array([1, 2, 3, 4])
   */
  push = push_default;
  /**
   * @function rank
   * @memberof NDArray
   * @instance
   * @description Finds the rank of current matrix using gaussian elimination.
   * @param {Number} tolerance
   * @returns {Number}
   * @example
   * import { array } from 'vectorious';
   *
   * array([[1, 1, 1], [2, 2, 2], [3, 3, 3]]).rank(); // => 1
   * @todo Switch to SVD algorithm
   */
  rank = rank_default;
  /**
   * @function reciprocal
   * @memberof NDArray
   * @instance
   * @description Gets the element-wise reciprocal of current array.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]); // => array([1, 0.5, 0.3333333432674408])
   */
  reciprocal = reciprocal_default;
  /**
   * @function reduce
   * @memberof NDArray
   * @instance
   * @description Equivalent to `TypedArray.prototype.reduce`.
   * @param {Function} f
   * @param {Number} initialValue
   * @returns {Number}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).reduce((a, b) => a + b, 0); // => 6
   */
  reduce = reduce_default;
  /**
   * @function reshape
   * @memberof NDArray
   * @instance
   * @description Reshapes current array
   * @param {Number[]} ...shape
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3, 4]).reshape(2, 2); // <=> array([[1, 2], [3, 4]])
   */
  reshape = reshape_default;
  /**
   * @function round
   * @memberof NDArray
   * @instance
   * @description Returns the value of each element of current array rounded to the nearest integer.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1.2, 2.8, 3.5]).round(); // <=> array([1, 3, 4])
   */
  round = round_default;
  /**
   * @function row_add
   * @memberof NDArray
   * @instance
   * @description Adds a multiple of one row multiplied by `scalar` to another inside current matrix.
   * @param {Number} dest
   * @param {Number} source
   * @param {Number} scalar
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([[1, 2], [3, 4]]).row_add(1, 0, 2); // <=> array([[1, 2], [5, 8]])
   */
  row_add = row_add_default;
  /**
   * @function scale
   * @memberof NDArray
   * @instance
   * @description
   * Multiplies all elements of current array with a specified `scalar`.
   * Accelerated with BLAS `?scal`.
   * @param {Number} scalar
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).scale(2); // <=> array([2, 4, 6])
   */
  scale = scale_default;
  /**
   * @function set
   * @memberof NDArray
   * @instance
   * @description Sets the element at `i, j, ..., n` to `value`.
   * @param {Number[]} ...indices
   * @param {Number} value
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).set(1, 0); // <=> array([1, 0, 3])
   */
  set = set_default;
  /**
   * @function sign
   * @memberof NDArray
   * @instance
   * @description
   * Returns the sign of each element of current array, indicating
   * whether it is positive, negative or zero.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).sign(); // <=> array([1, 1, 1])
   */
  sign = sign_default;
  /**
   * @function sin
   * @memberof NDArray
   * @instance
   * @description Returns the sine of each element of current array.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([0, Math.PI / 2, Math.PI]).sin(); // <=> array([0, 1, 0])
   */
  sin = sin_default;
  /**
   * @function sinh
   * @memberof NDArray
   * @instance
   * @description Returns the hyperbolic sine of each element of current array.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).sinh(); // <=> array([1.175201177597046, 3.6268603801727295, 10.017874717712402])
   */
  sinh = sinh_default;
  /**
   * @function slice
   * @memberof NDArray
   * @instance
   * @description Slices the current array along the leading dimension
   * @param {Number} begin
   * @param {Number} end
   * @param {Number} step
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3, 4]).slice(0, 4, 2); // => array([1, 3])
   */
  slice = slice_default;
  /**
   * @function solve
   * @memberof NDArray
   * @instance
   * @description
   * Solves the equation AX = B (where A is current matrix and B is `x`).
   * Accelerated with LAPACK `?gesv`.
   * @param {NDArray} x
   * @returns {NDArray}
   * @example
   * import { array } from 'vectorious';
   *
   * array([[1, 3, 5], [2, 4, 7], [1, 1, 0]]).solve([[1], [3], [5]]); // => array([[3.25], [1.75], [-1.5]])
   */
  solve = solve_default;
  /**
   * @function sqrt
   * @memberof NDArray
   * @instance
   * @description Returns the positive square root of each element of current array.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 4, 9]); // <=> array([1, 2, 3])
   */
  sqrt = sqrt_default;
  /**
   * @function square
   * @memberof NDArray
   * @instance
   * @description Asserts if current matrix is square.
   * @throws {Error} matrix is not square
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).square(); // Error: matrix is not square
   */
  square = square_default;
  /**
   * @function subtract
   * @memberof NDArray
   * @instance
   * @description
   * Subtracts `x` from the current array.
   * Accelerated with BLAS `?axpy`.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).subtract([1, 1, 1]); // <=> array([0, 1, 2])
   */
  subtract = subtract_default;
  /**
   * @function sum
   * @memberof NDArray
   * @instance
   * @description Sum of array elements
   * @returns {Number}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).sum(); // => 6
   */
  sum = sum_default;
  /**
   * @function swap
   * @memberof NDArray
   * @instance
   * @description Swaps two rows `i` and `j` in current matrix
   * @param {Number} i
   * @param {Number} j
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([[1, 2], [3, 4]]); // <=> array([[3, 4], [1, 2]])
   */
  swap = swap_default;
  /**
   * @function tan
   * @memberof NDArray
   * @instance
   * @description Returns the tangent of each element of current array.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).tan(); // <=> array([1.5574077367782593, -2.185039758682251, -0.14254654943943024])
   */
  tan = tan_default;
  /**
   * @function tanh
   * @memberof NDArray.prototype
   * @description Returns the hyperbolic tangent of each element of current array.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).tanh(); // <=> array([0.7615941762924194, 0.9640275835990906, 0.9950547814369202])
   */
  tanh = tanh_default;
  /**
   * @function toArray
   * @memberof NDArray
   * @instance
   * @description Converts current vector into a JavaScript array.
   * @param {Number} index
   * @param {Number} dim
   * @returns {Array}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).toArray(); // => [1, 2, 3]
   */
  toArray = toArray_default;
  /**
   * @function toString
   * @memberof NDArray
   * @instance
   * @description Converts current vector into a readable formatted string.
   * @returns {String}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).toString(); // => '1,2,3'
   */
  toString = toString_default;
  /**
   * @function trace
   * @memberof NDArray
   * @instance
   * @description Gets the trace of the matrix (the sum of all diagonal elements).
   * @returns {Number}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1, 2, 3]).trace(); // => 5
   */
  trace = trace_default;
  /**
   * @function transpose
   * @memberof NDArray
   * @instance
   * @description Transposes current matrix (mirror across the diagonal).
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([[1, 2, 3], [4, 5, 6], [7, 8, 9]]); // <=> array([[1, 4, 7], [2, 5, 8], [3, 6, 9]])
   */
  transpose = transpose_default;
  /**
   * @function trunc
   * @memberof NDArray
   * @instance
   * @description
   * Returns the integer part of each element of current array,
   * removing any fractional digits.
   * @returns {this}
   * @example
   * import { array } from 'vectorious';
   *
   * array([1.2, 2.8, 3.5]).trunc(); // => array([1, 2, 3])
   */
  trunc = trunc_default;
  constructor(data, options) {
    if (!data) {
      return;
    }
    if (data instanceof NDArray) {
      return data;
    }
    if (data instanceof NDIter) {
      if (!options || !options.dtype) {
        throw new Error("dtype is missing");
      }
      if (data.shape) {
        options.shape = data.shape;
      }
      const length2 = data.length;
      data = new (get_type(options.dtype))(length2);
    }
    const {
      shape = get_shape(data),
      length = get_length(shape),
      strides = get_strides(shape),
      dtype = get_dtype(data),
    } = options || {};
    this.data = is_typed_array(data)
      ? data
      : new (get_type(dtype))(flatten(data));
    this.shape = shape;
    this.length = length;
    this.dtype = dtype;
    this.strides = strides;
  }
  /**
   * @name x
   * @memberof NDArray
   * @instance
   * @description Gets or sets the value at index 0
   * @type Number
   */
  get x() {
    return this.get(0);
  }
  set x(value) {
    this.set(0, value);
  }
  /**
   * @name y
   * @memberof NDArray
   * @instance
   * @description Gets or sets the value at index 1
   * @type Number
   */
  get y() {
    return this.get(1);
  }
  set y(value) {
    this.set(1, value);
  }
  /**
   * @name z
   * @memberof NDArray
   * @instance
   * @description Gets or sets the value at index 2
   * @type Number
   */
  get z() {
    return this.get(2);
  }
  set z(value) {
    this.set(2, value);
  }
  /**
   * @name w
   * @memberof NDArray
   * @instance
   * @description Gets or sets the value at index 3
   * @type Number
   */
  get w() {
    return this.get(3);
  }
  set w(value) {
    this.set(3, value);
  }
  /**
   * @name T
   * @memberof NDArray
   * @instance
   * @description Short for `this.copy().transpose()`
   * @type NDArray
   */
  get T() {
    return this.copy().transpose();
  }
};
try {
  window.v = NDArray;
} catch (error) {}
export {
  NDArray,
  NDIter,
  NDMultiIter,
  abs,
  acos,
  acosh,
  add,
  angle,
  array,
  asin,
  asinh,
  atan,
  atanh,
  augment,
  binOp,
  cbrt,
  ceil,
  check,
  combine,
  copy,
  cos,
  cosh,
  cross,
  det,
  diagonal,
  dot2 as dot,
  eig,
  equals,
  equidimensional,
  equilateral,
  exp,
  expm1,
  eye,
  fill,
  floor,
  forEach,
  fround,
  gauss,
  get,
  inv,
  log,
  log10,
  log1p,
  log2,
  lu,
  lu_factor,
  magic,
  map,
  matrix,
  max,
  mean,
  min,
  multiply,
  norm,
  normalize,
  ones,
  pow,
  prod,
  product,
  project,
  push,
  random,
  range,
  rank,
  reciprocal,
  reduce,
  reshape,
  round,
  row_add,
  scale,
  set,
  sign,
  sin,
  sinh,
  slice,
  solve,
  sqrt,
  square,
  subtract,
  sum,
  swap,
  tan,
  tanh,
  toArray,
  toString,
  trace,
  transpose,
  trunc,
  zeros,
};
//# sourceMappingURL=index.mjs.map
