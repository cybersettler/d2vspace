import {Clock} from '/node_modules/three/build/three.module.js';
const PI_2 = Math.PI / 2;

class LoopHandler {
  constructor(config) {
    this.perspective = config.perspective;
    this.world = config.world;
    let position = config.world.subject.position ||
        config.world.subject.defaultPosition;
    this.world.subject.position = position;
    this.requestAnimationFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame;
    this.cancelAnimationFrame = window.cancelAnimationFrame;
    this.clock = new Clock(false);
    this.delta = 0;
  }

  handleMouseMove(input) {

    let rotationY = input.x * 0.002;
    let rotationX = input.y * 0.002;

    let event = new CustomEvent('rotate', {
      detail: {
        x: rotationX,
        y: rotationY,
      }});

    this.perspective.dispatchEvent(event);
    return this;
  }

  handleMoveForward() {
    // physicsWorker.postMessage('move');
    console.log("move forward");
  }

  updatePhysics() {
    return this;
  }

  updateWorld() {
    return this;
  }

  animate() {
    let loop = this;
    let world = this.world;
    let physicsWorker = new Worker('/frontend/assets/js/PhysicsWorker.js');

    physicsWorker.onmessage = function(event) {
      if (event.data.status === 'WORKER_READY') {
        physicsWorker.postMessage({command: 'INIT_WORLD', payload: world});
      } else if(event.data.status === 'WORLD_READY') {
        let subjectId = event.data.subjectId;
        physicsWorker.postMessage({command: 'START'});
        /* loop.updatePhysics()
        .updateWorld()
        .updatePerspective(event.data)
        .tick(); */
        loop.updatePerspective();
        // loop.requestId = requestAnimationFrame(() => loop.updateWorld());
      } else {
        loop.updatePerspective(event.data);
      }
    };

    physicsWorker.onerror = function(error) {
      console.log('something went wrong', error);
    };

    return this;
  }

  tick() {
    this.delta = this.clock.getDelta();
  }

  updatePerspective(data) {
    let event = new CustomEvent('render', {
      detail: data
    });
    this.perspective.dispatchEvent(event);
    return this;
  }

  stop() {
    this.cancelAnimationFrame(this.requestId);
  }
}

export default LoopHandler;
