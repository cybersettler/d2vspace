import {Clock, Quaternion, Vector3} from '/node_modules/three/build/three.module.js';
import KeyboardControls from '/frontend/assets/js/KeyboardControls.js';
import PointerLockManager from '/frontend/assets/js/PointerLockManager.js';
import MouseControls from '/frontend/assets/js/MouseControls.js';
import Subject from '/frontend/assets/js/Subject.js';

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
    this.subject = new Subject();
  }

  start() {
    let loop = this;
    let perspective = this.perspective;
    let keyboardControls = this.keyboardControls;
    let mouseControls = this.mouseControls;
    let subject = this.subject;
    let pointerLockManager = this.pointerLockManager;

    this.pointerLockManager.onPointerLocked()
    .then(function() {
      mouseControls.addMouseMoveHandler(
        function(result) {
          loop.handleMouseMove(result);
      });

      keyboardControls.addDownEventHandler('w', function() {
          subject.locomotion.forward = true;
        });

      keyboardControls.addUpEventHandler('w', function() {
        subject.locomotion.forward = false;
      });

      keyboardControls.addDownEventHandler('s', function() {
          subject.locomotion.backward = true;
        });

      keyboardControls.addUpEventHandler('s', function() {
        subject.locomotion.backward = false;
      });

      keyboardControls.addDownEventHandler('a', function() {
          subject.locomotion.left = true;
        });

      keyboardControls.addUpEventHandler('a', function() {
        subject.locomotion.left = false;
      });

      keyboardControls.addDownEventHandler('d', function() {
          subject.locomotion.right = true;
        });

      keyboardControls.addUpEventHandler('d', function() {
        subject.locomotion.right = false;
      });

      keyboardControls.addUpEventHandler('space', function() {
        subject.locomotion.jump = true;
      });

      keyboardControls.addUpEventHandler('escape', function() {
        if (!pointerLockManager.isPointerLocked()) {
          return;
        }
        mouseControls.enabled = false;
        keyboardControls.enabled = false;
        pointerLockManager.releasePointerLock();
        pointerLockManager.onPointerLocked()
        .then(() => {
          mouseControls.enabled = true;
          keyboardControls.enabled = true;
        });
        document.querySelector('ui-modal')
          .dispatchEvent(new Event('openDialog'));
      });

      mouseControls.enabled = true;
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

    let subjectPerspective = this.subject.turnPerspective(data);

    let event = new CustomEvent('rotate', {
      detail: subjectPerspective });

    this.perspective.dispatchEvent(event);
    return this;
  }

  updateAvatar() {
    let direction = this.subject.getMovingDirection();
    this.physicsWorker.postMessage({command:'WALK', payload: {
      direction: [direction.x, direction.y, direction.z]
    }});
    if (this.subject.isJumping()) {
      this.physicsWorker.postMessage({command:'JUMP'});
      this.subject.setJumping(false);
    }
  }

  updatePhysics() {
    return this;
  }

  updateWorld() {
    this.keyboardControls.dispatch();
    this.updateAvatar();
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
