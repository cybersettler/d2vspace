import KeyCodeMap from "/frontend/assets/js/KeyCodeMap.js";

class KeyboardControls {

  constructor(view) {
    let controls = this;
    this.upEvents = [];
    this.downEvents = [];
    this.upHandlers = [];
    this.downHandlers = [];
    this.enabled = false;
    this.parentView = view;
    document.addEventListener( 'keydown', function(event) {
      controls.registerKeyEvent(event);
    }, false );
    document.addEventListener( 'keyup', function(event) {
      controls.registerKeyEvent(event);
    }, false );
  }

  registerKeyEvent(e) {

    if (!this.enabled) {
      return;
    }

    e.preventDefault();

    this.upEvents[ Number(e.keyCode) ] = e.type === 'keyup';
    this.downEvents[ Number(e.keyCode) ] = e.type === 'keydown';
  }

  dispatch() {

    if (!this.enabled) {
      return;
    }

    let controls = this;

    this.downEvents.forEach( function( triggered, key ){
      if( triggered && controls.downHandlers[ key ]){
        controls.downHandlers[ key ]( key );
      }
    });

    this.upEvents.forEach( function( triggered, key ){
      if( triggered && controls.upHandlers[ key ] ){
        controls.upHandlers[ key ]( key );
      }
    });

    this.downEvents.length = 0;
    this.upEvents.length = 0;
  }

  addUpEventHandler(key, handler) {
    this.upHandlers[KeyCodeMap[key]] = handler;
  }

  addDownEventHandler(key, handler) {
    this.downHandlers[KeyCodeMap[key]] = handler;
  }

}

export default KeyboardControls;
