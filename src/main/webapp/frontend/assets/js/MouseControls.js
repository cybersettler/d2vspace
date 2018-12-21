class MouseControls {

  constructor(view) {
    this.parentView = view;
    this.enabled = false;
  }

  addMouseMoveHandler(handler) {
    let controls = this;
    let parentView = this.parentView;
    parentView.addEventListener('mousemove', function(event) {
        if (!controls.enabled) {
          return;
        }
        // let normalized = {};
        let movementX = event.movementX || 0;
        let movementY = event.movementY || 0;
        // normalized.x = (event.clientX / window.innerWidth) * 2 - 1;
        // normalized.y = -(event.clientY / window.innerHeight) * 2 + 1;
        let rotationY = movementX * 0.002;
        let rotationX = movementY * 0.002;
        handler({
          x: rotationX,
          y: rotationY
        });
      });
  }

  onMouseUp(event) {
    _onMouseUp.call(instance, event);
  }
}

function _onMouseUp(e) {
  //  perspective.addEventToQueue({ name:'touch', detail: e });
}

export default MouseControls;
