import {Vector3, Quaternion, Euler} from '/node_modules/three/build/three.module.js';

const NORTH = new Vector3(0, 0, 1);
const SOUTH = new Vector3(0, 0, -1);
const UP = new Vector3(0, 1, 0);
const PI_2 = Math.PI/2;

class Subject {
  constructor() {
    this.locomotion = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false
    }
    this.perspective = {
      yaw: 0,
      pitch: 0,
      heading: SOUTH.clone(),
      rotation: new Euler(0, 0, 0, 'XYZ')
    };
  }

  getMovingDirection() {
    let forward  = this.locomotion.forward ?
      this.perspective.heading.clone() : new Vector3(0, 0, 0);
    let backward = this.locomotion.backward ?
      this.perspective.heading.clone()
      .applyAxisAngle(UP, Math.PI) :
      new Vector3(0, 0, 0);
    let left  = this.locomotion.left ?
      this.perspective.heading.clone()
      .applyAxisAngle(UP, Math.PI/2) :
      new Vector3(0, 0, 0);
    let right = this.locomotion.right ?
      this.perspective.heading.clone()
      .applyAxisAngle(UP, - Math.PI/2) :
      new Vector3(0, 0, 0);

    return forward.add(backward).add(left).add(right);
  }

  getHeading() {
    return this.perspective.heading;
  }

  isJumping() {
    return this.locomotion.jump;
  }

  setJumping() {
    this.locomotion.jump = false;
  }

  turnPerspective(data) {
    let actualYaw = this.perspective.yaw;
    let yaw = actualYaw - data.y;

    let actualPitch = this.perspective.pitch;
    let pitch = actualPitch - data.x;

    this.perspective.rotation.y = yaw;

    this.perspective.yaw = yaw;
    let current = this.perspective.heading.angleTo(NORTH);

    this.perspective.heading = SOUTH.clone();
    this.perspective.heading.applyEuler(this.perspective.rotation);
    this.perspective.heading.normalize();

    this.perspective.pitch =
        Math.max( - PI_2, Math.min(PI_2, pitch) );
    return this.perspective;
  }
}

export default Subject;
