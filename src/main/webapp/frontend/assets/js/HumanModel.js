class HumanModel {

  constructor(config) {
    let width = config.with;
    let height = config.height;
    let position = config.position;
    let mass = config.mass;

    this.width = width;
    this.height = height;
    this.mass = mass;

    let startTransform = new Ammo.btTransform();
    startTransform.setIdentity();

    let radius = width/2;
    let shape = new Ammo.btSphereShape(radius);

    let motionState = new Ammo.btDefaultMotionState(startTransform);
    let inertia = new Ammo.btVector3(0, 0, 0);
    shape.calculateLocalInertia(mass, inertia);
    let rigidBodyInfo = new Ammo.btRigidBodyConstructionInfo(
        mass, motionState, shape, inertia);
    let body = new Ammo.btRigidBody(rigidBodyInfo);

		body.setRollingFriction(0.1);

    this.body = body;
    this.transform = startTransform;
  }

  walk(direction, dt) {
    let body = this.body;
    let transform = this.transform;
    body.getMotionState()
      .getWorldTransform (transform);
    let torque = new Ammo.btVector3(1,0,0);
    body.applyTorque(torque);
    body.getMotionState()
      .setWorldTransform(transform);
    body.setCenterOfMassTransform(transform);
  }

}
