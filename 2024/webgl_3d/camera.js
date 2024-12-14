
/**
 * @enum {number}
 */
export const Projection = Object.freeze({
    NONE: 0,
    ORTHOGRAPHIC: 1,
    PERSPECTIVE: 2,
  });
  
  /**
   * @typedef {vec3} EulerAxes
   */
  /**
   * @typedef {object} CameraOptions
   * @property {vec3} [position=[0, 0, 0]]
   * @property {vec3} [up=[0, 1, 0]]
   * @property {vec3} [lookAt]
   * @property {quat | EulerAxes} [rotation]
   * @property {vec3 | number} [scale=1]
   * @property {number} [near=0.001]
   * @property {number} [far=1000]
   * @property {Projection} [projection]
   * @property {number} [fovy=Math.PI/2] perspective field of view in radians
   * @property {number} [aspect=canvas || 1] perspective `width / height` ratio
   * @property {number} [width] ortographic width
   * @property {number} [height] ortographic height
   * @property {number} [left=-width/2 || -1]
   * @property {number} [right=width/2 || 1]
   * @property {number} [bottom=height/2 || -1]
   * @property {number} [top=-height/2 || 1]
   */
  
  export function lookAtMat3(direction, up) {
    let U = vec3.normalize(vec3.create(), up);
    const F = vec3.normalize(vec3.create(), direction);
    const R = vec3.cross(vec3.create(), F, U);
    vec3.normalize(U, U);
    U = vec3.cross(vec3.create(), R, F);
    return mat3.fromValues(R[0], R[1], R[2], U[0], U[1], U[2], F[0], F[1], F[2]);
  }
  export function lookAtQuat(direction, up) {
    return quat.fromMat3(quat.create(), lookAtMat3(direction, up));
  }
  
  export class Camera {
    /**
     * @param {CameraOptions} [options={}]
     */
    constructor(options = {}) {
      this.position = options.position || vec3.create();
      this.up = options.up || vec3.fromValues(0, 1, 0);
  
      if (options.lookAt) {
        vec3.normalize(this.up, this.up);
        this.focalPoint = vec3.copy(vec3.create(), options.lookAt);
        const F = options.lookAt;
        vec3.sub(quat.create(), options.lookAt, options.position);
        vec3.normalize(F, F);
        const R = vec3.cross(vec3.create(), F, this.up);
        vec3.normalize(this.up, this.up);
        const U = vec3.cross(vec3.create(), R, F);
        vec3.negate(F, F);
        this.rotation = quat.fromMat3(
          quat.create(),
          mat3.fromValues(R[0], R[1], R[2], U[0], U[1], U[2], F[0], F[1], F[2])
        );
        quat.normalize(this.rotation, this.rotation);
      } else {
        this.up = vec3.fromValues(0, 1, 0);
        this.rotation = options.rotation || quat.create();
        if (this.rotation.length == 3) {
          quat.fromEuler(
            this.rotation,
            this.rotation[0],
            this.rotation[1],
            this.rotation[2]
          );
        }
        vec3.transformQuat(this.up, this.up, this.rotation);
      }
  
      this.scale = options.scale || 1;
      if (typeof this.scale === "number") {
        this.scale = vec3.fromValues(this.scale, this.scale, this.scale);
      }
  
      this.near = options.near || 0.001;
      this.far = options.far || 1000;
  
      this.projectionKind =
        options.projection || options.fovy
          ? Projection.PERSPECTIVE
          : Projection.ORTHOGRAPHIC;
      if (this.projectionKind === Projection.ORTHOGRAPHIC) {
        this.projectionKind = Projection.ORTHOGRAPHIC;
  
        let w = options.width;
        if (w === undefined) {
          w = null;
        }
        let h = options.height;
        if (h === undefined) {
          h = null;
        }
  
        this.left = options.left || w !== null ? w / -2 : -1;
        this.right = options.right || w !== null ? w / 2 : 1;
        this.bottom = options.bottom || h !== null ? h / -2 : -1;
        this.top = options.top || h !== null ? h / 2 : 1;
      } else if (this.projectionKind === Projection.PERSPECTIVE) {
        this.fovy = options.fovy || Math.PI / 2;
        this.aspect = options.aspect || null;
      }
    }
  
    /**
     * @param {vec3} [point=this.focalPoint] point to direct the camera towards
     * @param {vec3} [up=this.up] camera up direction
     */
    lookAt(point = this.focalPoint, up = undefined) {
      this.up = up || this.up;
      vec3.normalize(this.up, this.up);
      const F = point;
      vec3.sub(F, point, this.position);
      vec3.normalize(F, F);
      const R = vec3.cross(vec3.create(), F, this.up);
      vec3.normalize(R, R);
      const U = vec3.cross(vec3.create(), R, F);
      vec3.negate(F, F);
      quat.fromMat3(
        this.rotation,
        mat3.fromValues(R[0], R[1], R[2], U[0], U[1], U[2], F[0], F[1], F[2])
      );
      quat.normalize(this.rotation, this.rotation);
    }
  
    translate(offset) {
      vec3.add(this.position, this.position, offset);
      vec3.add(this.focalPoint, this.focalPoint, offset);
    }
  
    rotateXYOrbit(x, y, speed, focalPoint = undefined) {
      const target = focalPoint || this.focalPoint;
      if (!target) {
        console.warn("Camera orbit missing focal point");
        return;
      }
  
      const F = vec3.subtract(vec3.create(), target, this.position);
      const distance = vec3.distance(target, this.position);
      vec3.normalize(F, F);
      const R = vec3.cross(vec3.create(), F, this.up);
      vec3.normalize(R, R);
      const U = vec3.cross(vec3.create(), R, F);
  
      const xAngle = deg2rad(x * speed);
      const yAngle = deg2rad(y * speed);
      const localXAdjust = xAngle / 2;
      const localYAdjust = yAngle / 2;
      const xLength = distance * Math.sin(xAngle) * 2;
      const yLength = distance * Math.sin(yAngle) * 2;
  
  
      const offset = vec3.subtract(vec3.create(), this.position, target);
      vec3.normalize(offset, offset);
      vec3.rotateX(offset, offset, vec3.fromValues(0, 1, 0), x * speed);
      vec3.rotateY(offset, offset, vec3.fromValues(1, 0, 0), y * speed);
      vec3.normalize(offset, offset);
      vec3.scale(offset, offset, vec3.distance(this.position, target));
      vec3.add(this.position, target, offset);
      this.lookAt(target);
    }
  
    /**
     * Sets camera position, updating the rotation if necessary.
     * @param {vec3} newPosition new camera position.
     */
    setPosition(newPosition) {
      this.position = newPosition;
      if (this.focalPoint) {
        this.lookAt();
      }
    }
  
    /**
     *  @returns {mat4} camera view matrix
     */
    view() {
      /** inverse translation */
      const T = vec3.negate(vec3.create(), this.position);
      /** inverse rotation */
      const R = mat4.fromQuat(
        mat4.create(),
        quat.invert(quat.create(), this.rotation)
      );
      const view = mat4.create();
  
      const T0 = T[0];
      const T1 = T[1];
      const T2 = T[2];
  
      // Row 1: rotation
      view[0] = R[0] * this.scale[0];
      view[1] = R[1] * this.scale[0];
      view[2] = R[2] * this.scale[0];
      view[3] = 0;
  
      // Row 2: rotation
      view[4] = R[4] * this.scale[1];
      view[5] = R[5] * this.scale[1];
      view[6] = R[6] * this.scale[1];
      view[7] = 0;
  
      // Row 3: rotation
      view[8] = R[8] * this.scale[2];
      view[9] = R[9] * this.scale[2];
      view[10] = R[10] * this.scale[2];
      view[11] = 0;
  
      // Row 4: translation
      view[12] = T0 * view[0] + T1 * view[4] + T2 * view[8];
      view[13] = T0 * view[1] + T1 * view[5] + T2 * view[9];
      view[14] = T0 * view[2] + T1 * view[6] + T2 * view[10];
      view[15] = 1;
  
      return view;
    }
  
    /**
     * @param {GL} [gl]
     * @returns {mat4} camera projection matrix
     */
    projection(gl = undefined) {
      const canvasAspect = gl != null ? gl.canvas.width / gl.canvas.height : 1;
      const aspect = this.aspect || canvasAspect;
  
      switch (this.projectionKind) {
        case Projection.NONE:
          return mat4.create();
        case Projection.ORTHOGRAPHIC:
          return mat4.orthoNO(
            mat4.create(),
            this.left * aspect,
            this.right * aspect,
            this.bottom,
            this.top,
            this.near,
            this.far
          );
        case Projection.PERSPECTIVE:
          return mat4.perspectiveNO(
            mat4.create(),
            this.fovy,
            aspect,
            this.near,
            this.far
          );
      }
    }
  }
  