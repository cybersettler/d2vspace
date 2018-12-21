import {Clock} from '/node_modules/three/build/three.module.js';
import KeyboardControls from '/frontend/assets/js/KeyboardControls.js';
import PointerLockManager from '/frontend/assets/js/PointerLockManager.js';
import MouseControls from '/frontend/assets/js/MouseControls.js';

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
    this.keyboardControls = new KeyboardControls(config.perspective);
    this.pointerLockManager = new PointerLockManager(config.perspective);
    this.mouseControls = new MouseControls(config.perspective);
  }

  start() {
    let loop = this;
    let perspective = this.perspective;
    let keyboardControls = this.keyboardControls;
    let mouseControls = this.mouseControls;
    this.pointerLockManager.onPointerLocked()
    .then(function() {
      mouseControls.addMouseMoveHandler(
        function(result) {
          loop.handleMouseMove(result);
      });

      mouseControls.enabled = true;

      keyboardControls.addDownEventHandler('w', function() {
          loop.handleMoveForward();
        });

      keyboardControls.enabled = true;
      loop.animate();
    });
  }

  animate() {

    let loop = this;
    let world = this.world;
    let physicsWorker = new Worker('/frontend/assets/js/PhysicsWorker.js');
    this.physicsWorker = physicsWorker;

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
        loop.requestId = requestAnimationFrame((timestamp) => {
          loop.updatePerspective()
              .updateWorld();
        });
      } else {
        loop.requestId = requestAnimationFrame((timestamp) => {
          loop.updatePerspective(event.data)
              .updateWorld();
        });
      }
    };

    physicsWorker.onerror = function(error) {
      console.log('something went wrong', error);
    };

    return this;
  }

  handleMouseMove(data) {

    let event = new CustomEvent('rotate', {
      detail: data });

    this.perspective.dispatchEvent(event);
    return this;
  }

  handleMoveForward() {
    this.physicsWorker.postMessage({command:'MOVE'});
    console.log("move forward");
  }

  updatePhysics() {
    return this;
  }

  updateWorld() {
    this.keyboardControls.dispatch();
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
