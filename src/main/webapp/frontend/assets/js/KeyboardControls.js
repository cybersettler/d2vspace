import KeyCodeMap from "/frontend/assets/js/KeyCodeMap.js";

function KeyboardControls(){

  var controls = this;
  this.upEvents = [];
  this.downEvents = [];

  this.upHandlers = [];
  this.downHandlers = [];

  // this.isEnabled = false;

  this.registerKeyEvent = function( e ){

    controls.upEvents[ Number(e.keyCode) ] = e.type === 'keyup';
    controls.downEvents[ Number(e.keyCode) ] = e.type === 'keydown';

  };

  this.dispatch = function(){

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

  };

  this.addUpEventHandler = function( key, handler ){

    this.upHandlers[ KeyCodeMap[ key ] ] = handler;

  };

  this.addDownEventHandler = function( key, handler ){

    this.downHandlers[ KeyCodeMap[ key ] ] = handler;

  };

}

export default KeyboardControls;
