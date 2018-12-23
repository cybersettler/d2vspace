import {Vector3, Quaternion, Euler} from '/node_modules/three/build/three.module.js';

const NORTH = new Vector3(0, 0, 1);
const SOUTH = new Vector3(0, 0, -1);
const PI_2 = Math.PI/2;

class Subject {
  constructor() {
    this.perspective = {
      yaw: 0,
      pitch: 0,
      heading: SOUTH.clone(),
      rotation: new Euler(0, 0, 0, 'XYZ')
    };
  }

  getHeading() {
    return this.perspective.heading;
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
