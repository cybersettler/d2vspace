class PointerLockManager {

  constructor(view) {

    this.parentView = view;

    document.body.requestPointerLock = document.body.requestPointerLock
        || document.body.webkitRequestPointerLock
        || document.body.mozRequestPointerLock;

    document.exitPointerLock = document.exitPointerLock
        || document.webkitExitPointerLock
        || document.mozExitPointerLock;

    let hasPointerLock = 'pointerLockElement' in document
        || 'mozPointerLockElement' in document
        || 'webkitPointerLockElement' in document;

    if (!hasPointerLock) {
      throw new Error('Your system doesn\'t seem to support Pointer Lock API');
    }

    if ('pointerlockerror' in document) {
      document.addEventListener('pointerlockerror',
          onPointerlockerror, false);
    } else if ('webkitpointerlockerror' in document) {
      document.addEventListener('webkitpointerlockerror',
          onPointerlockerror, false);
    } else if ('mozpointerlockerror' in document) {
      document.addEventListener('mozpointerlockerror',
          onPointerlockerror, false);
    }
  }

  requestPointerLock() {
    this.parentView.requestPointerLock();
  }

  onPointerLocked() {
    let manager = this;
    let parentView = this.parentView;
    return new Promise(function(fulfill) {
      function onPointerLockChange() {
        if (manager.isPointerLocked()) {
          document.removeEventListener('pointerlockchange',
              onPointerLockChange);
          fulfill();
        }
      }
      // Hook pointer lock state change events
      if ('onpointerlockchange' in document) {
        document.addEventListener('pointerlockchange',
            onPointerLockChange, false);
      } else if ('webkitpointerlockchange' in document) {
        document.addEventListener('webkitpointerlockchange',
            onPointerLockChange, false);
      } else if ('onmozpointerlockchange' in document) {
        document.addEventListener('onmozpointerlockchange',
            onPointerLockChange, false);
      }
    });
  }

  isPointerLocked() {
    return document.pointerLockElement === this.parentView
        || document.webkitPointerLockElement === this.parentView
        || document.mozPointerLockElement === this.parentView;
  }

  detach() {
    /*
    document.removeEventListener('pointerlockchange',
        onPointerLockChange);
    document.removeEventListener('webkitpointerlockchange',
        onPointerLockChange);
        */

    document.removeEventListener('pointerlockerror',
        onPointerlockerror);
    document.removeEventListener('webkitpointerlockerror',
        onPointerlockerror);
  };
}

function onPointerlockerror(e) {
  throw new Error(e);
}

export default PointerLockManager;
