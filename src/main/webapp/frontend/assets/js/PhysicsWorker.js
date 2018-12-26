importScripts('./ammo.wasm.js',
'/node_modules/three/build/three.js',
'./WorldDynamicsFactory.js', './RigidBodyFactory.js',
'./HumanModel.js'
);

// define ACTIVE_TAG 1
// define ISLAND_SLEEPING 2
// define WANTS_DEACTIVATION 3
// define DISABLE_DEACTIVATION 4
// define DISABLE_SIMULATION 5

Ammo().then(function(Ammo) {

  let world = WorldDynamicsFactory.create({
    Ammo: Ammo,
    rigidBodyFactory: new RigidBodyFactory(Ammo)
  });

  const DOWN = new Ammo.btVector3(0, -1, 0);

  // START -- Your code here

  let interval;

  function startLoop() {
    console.log("Simulation started");
    if (interval) {
      clearInterval(interval);
    }
    world.state.time = Date.now();
    interval = setInterval(mainLoop, 1000/60);
  }

  function mainLoop() {
    let time = world.state.time;
    let now = Date.now();
    let state = world.simulate(now - time);
    postMessage({ objects: state.objects});
    world.state.time = now;
  }

  function stopLoop() {
    clearInterval(interval);
    WorldDynamicsFactory.destroy();
    console.log("Simulation stopped");
  }

  onmessage = function(event) {
    if (event.data.command === 'START') {
      startLoop();
    } else if (event.data.command === 'INIT_WORLD') {
      world.initWorld(event.data.payload)
          .then(function() {
            postMessage({
              status: 'WORLD_READY'
            });
          });
    } else if (event.data.command === 'WALK') {
      if (!world.subject.isActive()) {
        console.warn("character not active");
        world.subject.forceActivationState(1);
      }

      let lv = world.subject.getLinearVelocity();
      // let linearVelocity = new THREE.Vector3(lv.x(), lv.y(), lv.z());

      let v = event.data.payload.direction;
      let direction = new THREE.Vector3(v[0], v[1], v[2]);
      // let angle = direction.angleTo(linearVelocity);

      lv.setX(direction.x);
      lv.setY(direction.y);
      lv.setZ(direction.z);

      world.subject.setLinearVelocity(lv);
      world.subject.setAngularVelocity(new Ammo.btVector3(0, 0, 0));

      direction.multiplyScalar(0.3); // Torque arm
      let thrust = new THREE.Vector3(0, -1, 0);
      direction.cross(thrust);
      let torque = new Ammo.btVector3(
        direction.x, direction.y, direction.z);

      let transform = world.state.transform;
      world.subject.getMotionState()
        .getWorldTransform (transform);
      world.subject.applyTorque(torque);
      world.subject.getMotionState()
        .setWorldTransform(transform);
      world.subject.setCenterOfMassTransform(transform);
      let dt = Date.now() - world.state.time;
      world.dynamicsWorld.stepSimulation(dt, 2);
    } else if (event.data.command === 'JUMP') {
      let transform = world.state.transform;
      world.subject.getMotionState()
        .getWorldTransform (transform);
      world.subject.applyCentralImpulse(DOWN);
      world.subject.getMotionState()
        .setWorldTransform(transform);
      world.subject.setCenterOfMassTransform(transform);
      let dt = Date.now() - world.state.time;
      world.dynamicsWorld.stepSimulation(dt, 2);
    }
  };

  postMessage({status:'WORKER_READY'});

  // END
});
