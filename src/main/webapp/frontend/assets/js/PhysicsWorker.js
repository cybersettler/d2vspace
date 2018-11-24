importScripts('./ammo.wasm.js', './WorldDynamicsFactory.js', './RigidBodyFactory');

Ammo().then(function(Ammo) {

  let dynamicsWorld = WorldDynamicsFactory.create({
    Ammo: Ammo,
    rigidBodyFactory: new RigidBodyFactory(Ammo)
  });

  // START -- Your code here
  
  let interval;

  function startLoop() {
    console.log("Simulation started");
    if (interval) {
      clearInterval(interval);
    }
    dynamicsWorld.state.time = Date.now();
    interval = setInterval(mainLoop, 1000/60);
  }

  function mainLoop() {
    let time = dynamicsWorld.state.time;
    let now = Date.now();
    let state = dynamicsWorld.simulate(now - time);
    postMessage({ objects: state.objects});
    dynamicsWorld.state.time = now;
  }

  function stopLoop() {
    clearInterval(interval);
    WorldDynamicsFactory.destroy();
    console.log("Simulation stopped");
  }

  onmessage = function(event) {
    if (event.data === 'START') {
      startLoop();
    } else if (event.data.command === 'INIT_WORLD') {
      dynamicsWorld.initWorld(event.data.payload)
          .then(postMessage('WORLD_READY'));
    }
  };

  postMessage('WORKER_READY');

  // END
});
