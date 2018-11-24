function MouseControls(view) {

  let instance = this;

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

  instance.parentView = view;
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

  this.detach = function() {
    document.removeEventListener('pointerlockchange',
        onPointerLockChange);
    document.removeEventListener('webkitpointerlockchange',
        onPointerLockChange);

    document.removeEventListener('pointerlockerror',
        onPointerlockerror);
    document.removeEventListener('webkitpointerlockerror',
        onPointerlockerror);
  };

  function onPointerLockChange() {
    let isPointerLocked = document.pointerLockElement === instance.parentView
        || document.webkitPointerLockElement === instance.parentView
        || document.mozPointerLockElement === instance.parentView;

    this.isPointerLocked = isPointerLocked;

    console.log('Pointer lock status changed', isPointerLocked);

    if (isPointerLocked) {
      onPointerLocked();
    } else {
      onPointerReleased();
    }
  }

  function onPointerLocked() {
    console.log('Pointer is locked!');
    document.addEventListener('mouseup', onMouseUp, false);
    document.addEventListener('mousemove', onMouseMove, false);
  }

  function onPointerReleased() {
    console.log('Pointer is released');
    document.removeEventListener('mouseup', onMouseUp, false);
    document.removeEventListener('mousemove', onMouseMove, false);
  }

  function onPointerlockerror(e) {
    throw new Error(e);
  }

  function onMouseMove(event) {
    let normalized = {};
    let movementX = event.movementX || 0;
    let movementY = event.movementY || 0;
    normalized.x = (event.clientX / window.innerWidth) * 2 - 1;
    normalized.y = -(event.clientY / window.innerHeight) * 2 + 1;
    instance.parentView.onMouseMouse({
      x: movementX,
      y: movementY,
      normalized: normalized
    });
  }

  function onMouseUp(event) {
    _onMouseUp.call(instance, event);
  }
}

function _onMouseUp(e) {
  //  perspective.addEventToQueue({ name:'touch', detail: e });
}

export default MouseControls;
