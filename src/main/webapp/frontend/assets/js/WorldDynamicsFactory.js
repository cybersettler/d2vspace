class World {

  constructor(config) {
    let collisionConfiguration, dispatcher, overlappingPairCache,
        solver, dynamicsWorld;

    let Ammo = config.Ammo;

    collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    overlappingPairCache = new Ammo.btDbvtBroadphase();
    solver = new Ammo.btSequentialImpulseConstraintSolver();
    dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher,
        overlappingPairCache, solver, collisionConfiguration);

    this.Ammo = Ammo;
    this.collisionConfiguration = collisionConfiguration;
    this.dispatcher = dispatcher;
    this.overlappingPairCache = overlappingPairCache;
    this.solver = solver;
    this.dynamicsWorld = dynamicsWorld;
    this.state = {
      transform: new Ammo.btTransform(),
      time: Date.now(),
    };
    this.rigidBodyFactory = config.rigidBodyFactory;
  }

  initWorld(config) {
    let g = config.environment.gravityVector || [0, -10, 0];
    let gravityVector = new Ammo.btVector3(g[0], g[1], g[2]);
    this.dynamicsWorld.setGravity(gravityVector);
    this.initGround(config);
    this.initObjects(config);
    this.initSubject(config);
    return Promise.resolve();
  }

  initGround(config) {
    let groundRigidBody = WorldUtil.createGroundRigidBody(this.Ammo);
    groundRigidBody.setRestitution(1);
    groundRigidBody.setFriction(1);
    this.dynamicsWorld.addRigidBody(groundRigidBody);
  }

  initObjects(config) {
    let bodies = [];
    let dynamicObjects = [];
    const DynamicObjectsMap = {};
    config.content.forEach(WorldUtil.addInstances, {
      bodies: bodies,
      config: config,
      dynamicObjects: dynamicObjects,
      DynamicObjectsMap: DynamicObjectsMap,
      world: this
    });
    this.bodies = bodies;
    this.dynamicObjects = dynamicObjects;
    this.DynamicObjectsMap = DynamicObjectsMap;
  }

  initSubject(config) {

    let position = config.subject.position || config.subject.defaultPosition;

    let body = this.rigidBodyFactory.create({
      geometry: {
        type: 'SphereGeometry',
        radius: 0.3
      },
      mass: 1,
      restitution: 0.9
    });

    this.dynamicObjects.push({
      uuid: config.subject.uuid,
      body: body
    });

    this.subjectId = config.subject.uuid;
    this.subject = body;
    this.dynamicsWorld.addRigidBody(body);

    let origin = body.getWorldTransform().getOrigin();
    origin.setX(position[0]);
    origin.setY(position[1] + 1);
    origin.setZ(position[2]);
    body.setSleepingThresholds (0.0, 0.0);
    body.activate();
    let rotation = body.getWorldTransform().getRotation();
    rotation.setX(1);
    rotation.setY(0);
    rotation.setZ(0);
    rotation.setW(1);
  }

  destroy() {
    let Ammo = this.Ammo;
    Ammo.destroy(this.dynamicsWorld);
    Ammo.destroy(this.solver);
    Ammo.destroy(this.overlappingPairCache);
    Ammo.destroy(this.dispatcher);
    Ammo.destroy(this.collisionConfiguration);
  }

  simulate(dt) {
    dt = dt || 1;
    this.dynamicsWorld.stepSimulation(dt, 2);
    let subjectId = this.subjectId;
    let transform = this.state.transform;

    this.state.objects = this.dynamicObjects.map((item) => {
      let body = item.body;
      body.getMotionState()
        .getWorldTransform(transform);
      let position = transform.getOrigin();
      let rotation = transform.getRotation();

      let offset = 0;

      if (item.uuid === subjectId) {
//        offset = - 0.3;
      }

      return {
        uuid: item.uuid,
        position: [position.x(), position.y() + offset, position.z()],
        rotation: [rotation.x(), rotation.y(), rotation.z(), rotation.w()],
      };
    });

    return this.state;
  }

}

const WorldUtil = {

  addInstances: function(item) {
    let config = this.config;
    this.component = WorldUtil.findComponent(item.component, config);
    item.instances.forEach(WorldUtil.addInstance, this);
  },

  addInstance: function(item) {
    let component = this.component,
        world = this.world,
        bodies = this.bodies,
        dynamicObjects = this.dynamicObjects,
        DynamicObjectsMap = this.DynamicObjectsMap;

    if (component.type === 'illumination') {
      return;
    }

    let bodyData = {
      position: item.position,
      rotation: item.rotation,
      uuid: item.uuid || THREE.Math.generateUUID(),
      type: component.type,
      geometry: component.geometry,
      mass: item.mass || component.mass || 0,
      restitution: item.restitution || component.restitution || 1
    };

    let body = world.rigidBodyFactory.create(bodyData);
    world.dynamicsWorld.addRigidBody(body);

    bodies.push(body);
    if (component.type === 'freeBody') {
      dynamicObjects.push({
        uuid: item.uuid,
        body: body
      });
    }

    let origin = body.getWorldTransform().getOrigin();
    origin.setX(bodyData.position[0]);
    origin.setY(bodyData.position[1]);
    origin.setZ(bodyData.position[2]);
    body.activate();
    let rotation = body.getWorldTransform().getRotation();
    rotation.setX(1);
    rotation.setY(0);
    rotation.setZ(0);
    rotation.setW(1);
  },

  createGroundRigidBody: function(Ammo) {
    let normal = new Ammo.btVector3(0, 1, 0);
    let offset = 0;
    let groundMass = 0; // mass of zero is equivalent to making a body with infinite mass
    let groundInertia = new Ammo.btVector3(0, 0, 0);
    let groundRotation = new Ammo.btQuaternion(0, 0, 0, 1);
    let groundTranslation = new Ammo.btVector3(0, 0, 0);
    let groundTransform = new Ammo.btTransform(
        groundRotation, groundTranslation);
    let groundShape = new Ammo.btStaticPlaneShape(normal, offset);
    let groundMotionState = new Ammo.btDefaultMotionState(groundTransform);
    let groundRigidBodyConfig = new Ammo.btRigidBodyConstructionInfo
    (groundMass, groundMotionState, groundShape, groundInertia);
    return new Ammo.btRigidBody(groundRigidBodyConfig);
  },

  findComponent: function(name, config) {
    let result;
    let component = config.components.find((item) => name === item.name);
    let body;

    if (component) {
      body = config.bodies.find((item) => component.body === item.name);
    }

    if (component && body) {
      let geometry = config.geometries.find(
          (item) => body.geometryName === item.name);
      result = {
        type: component.componentType,
        geometry: geometry,
      };
    }

    return result;
  },

  toEulerAngle: function(q) {
    // roll (x-axis rotation)
    let sinrCosp = 2.0 * (q.w * q.x + q.y * q.z);
    let cosrCosp = 1.0 - 2.0 * (q.x * q.x + q.y * q.y);
    let roll = Math.atan2(sinrCosp, cosrCosp);

    // pitch (y-axis rotation)
    let sinp = 2.0 * (q.w * q.y - q.z * q.x);
    let pitch;

    if (sinp > 1.0) {
      sinp = 1.0;
    } else if (sinp < -1.0) {
      sinp = -1.0;
    }

    pitch = Math.asin(sinp);

    // yaw (z-axis rotation)
    let sinyCosp = 2.0 * (q.w * q.z + q.x * q.y);
    let cosyCosp = 1.0 - 2.0 * (q.y * q.y + q.z * q.z);
    let yaw = Math.atan2(sinyCosp, cosyCosp);

    return [roll, pitch, yaw, 'XYZ'];
  },
};

let instance;

let WorldDynamicsFactory = {
  create: function(config) {
    if (instance) {
      throw new Error('World instance already exists');
    } else {
      instance = new World(config);
    }
    return instance;
  },
  getWorldInstance: function() {
    return instance;
  },
  /**
   * Delete objects we created through |new|. We just do a few of them here,
   * but you should do them all if you are not shutting down ammo.js
   * we'll free the objects in reversed order as they were created via 'new'
   * to avoid the 'dead' object links
   */
  destroy: function() {
    this.getWorldInstance().destroy();
    instance = null;
  },
};
