import { NDArray, array, multiply } from "./vectorious.mjs";

const sin = Math.sin;
const cos = Math.cos;

const EPSILON = 1e-12;

const RAD_DEG_RATIO = Math.PI / 180;
export const rad2deg = (radian) => radian / RAD_DEG_RATIO;
export const deg2rad = (degrees) => degrees * RAD_DEG_RATIO;

export const vecN = (...args) => array([...args]);
export const vec2 = (x, y) => array([x, y]).transpose();
export const vec3 = (x, y, z) => array([x, y, z]).transpose();
export const vec4 = (x, y, z, w) => array([x, y, z, w]).transpose();
export { NDArray };

export function identity(x = 3, y = undefined) {
  const X = x || 3;
  const Y = y || X;

  const data = [];
  for (let yi = 0; yi < Y; yi++) {
    const row = [];
    for (let xi = 0; xi < X; xi++) {
      if (xi === yi) {
        row.push(1);
      } else {
        row.push(0);
      }
    }
    data.push(row);
  }
  return array(data);
}

export function translate(x, y = undefined, z = undefined) {
  if (x instanceof NDArray) {
    return translate(...x.toArray());
  }
  if (z !== undefined) {
    return array([
      [1, 0, 0, x || 0],
      [0, 1, 0, y || 0],
      [0, 0, 1, z || 0],
      [0, 0, 0, 1],
    ]);
  } else {
    return array([
      [1, 0, x || 0],
      [0, 1, y || 0],
      [0, 0, 1],
    ]);
  }
}

export function scale(x, y = undefined, z = undefined) {
  if (x instanceof NDArray) {
    return scale(...x.toArray());
  }
  const X = x !== undefined ? x : 1;
  const Y = y || X || 1;
  if (z !== undefined) {
    const Z = z !== undefined ? z : 1;
    return array([
      [X, 0, 0, 0],
      [0, Y, 0, 0],
      [0, 0, Z, 0],
      [0, 0, 0, 1],
    ]);
  } else {
    return array([
      [X, 0, 0],
      [0, Y, 0],
      [0, 0, 1],
    ]);
  }
}

export function rotate(angle, axis = undefined) {
  if (angle instanceof NDArray) {
    if (angle.length === 3) {
      return rotateEuler(...angle.toArray());
    } else if (angle.length === 4) {
      throw new Error("quaternion rotation not yet implemented");
    }
  }
  if (angle !== null && typeof angle !== "number") {
    throw new TypeError("expected a numeric angle");
  }
  if (angle === null || (angle > -EPSILON && angle < EPSILON)) {
    return identity(axis === undefined ? 2 : 3);
  }
  const Cos = cos(angle);
  const Sin = sin(angle);
  if (axis === undefined) {
    return array([
      [Cos, Sin, 0],
      [-Sin, Cos, 0],
      [0, 0, 1],
    ]).transpose();
  }
  let Axis = axis;
  if (typeof axis === "string") {
    Axis = axis.toLowerCase();
    if (Axis === "x") {
      Axis = array([1, 0, 0]);
    } else if (Axis === "y") {
      Axis = array([0, 1, 0]);
    } else if (Axis === "z") {
      Axis = array([0, 0, 1]);
    } else {
      throw new Error(
        "string rotation axis must be one of: 'x', 'y', 'z'; got: " + axis,
        {
          cause: {
            axis,
          },
        }
      );
    }
  }
  if (!(Axis instanceof NDArray)) {
    throw new Error("rotation axis isn't a vector", {
      cause: Axis,
    });
  }
  const Length = Axis.norm();
  if (Length > -EPSILON && Length < EPSILON) {
    return identity(4);
  }
  Axis.scale(1 / Length);
  const invCos = 1 - Cos;
  return array([
    [
      Cos + Axis.x * Axis.x * invCos,
      Axis.x * Axis.y * invCos - Axis.z * Sin,
      Axis.x * Axis.z * invCos + Axis.y * Sin,
      0,
    ],
    [
      Axis.y * Axis.x * invCos + Axis.z * Sin,
      Cos + Axis.y * Axis.y * invCos,
      Axis.y * Axis.z * invCos - Axis.x * Sin,
      0,
    ],
    [
      Axis.z * Axis.x * invCos - Axis.y * Sin,
      Axis.z * Axis.y * invCos + Axis.x * Sin,
      Cos + Axis.z * Axis.z * invCos,
      0,
    ],
    [0, 0, 0, 1],
  ]);
}

export function rotateEuler(x = undefined, y = undefined, z = undefined) {
  let X = x;
  let Y = y;
  let Z = z;
  if (x != null) {
    if (x instanceof NDArray) {
      X = x.x;
      Y = x.y;
      Z = x.z;
    } else if (Array.isArray(x)) {
      X = x[0];
      Y = x[1];
      Z = x[2];
    }
  }

  const R = identity(4);
  if (X || 0 != 0) {
    const cosX = cos(X);
    const sinX = sin(X);
    R.multiply(
      array([
        [1, 0, 0, 0],
        [0, cosX, -sinX, 0],
        [0, sinX, cosX, 0],
        [0, 0, 0, 1],
      ]).transpose()
    );
  }
  if (Y || 0 != 0) {
    const cosY = cos(Y);
    const sinY = sin(Y);
    R.multiply(
      array([
        [cosY, 0, sinY, 0],
        [0, 1, 0, 0],
        [-sinY, 0, cosY, 0],
        [0, 0, 0, 1],
      ]).transpose()
    );
  }
  if (Z || 0 != 0) {
    const cosZ = cos(Z);
    const sinZ = sin(Z);
    R.multiply(
      array([
        [cosZ, 0, sinZ, 0],
        [0, 1, 0, 0],
        [-sinZ, 0, cosZ, 0],
        [0, 0, 0, 1],
      ]).transpose()
    );
  }

  return R;
}

export function mxMul(...mx) {
  if (mx.length === 0) {
    throw new Error("no matrices provided to mxMul");
  } else if (mx.length === 1) {
    return mx[0];
  }
  return mx.reduce((R, M) => multiply(R, M));
}

export function toTypedArray(T, value) {
  if (value instanceof NDArray) {
    return new T(value.data);
  } else {
    return new T(value);
  }
}

const perspective = (angle) => {
  throw new Error("todo perspective");
};
const orthographic = (angle) => {
  throw new Error("todo orthographic");
};

export const Projection = Object.freeze({
  perspective,
  orthographic,
});
