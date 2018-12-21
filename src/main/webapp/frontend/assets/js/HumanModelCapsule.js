class HumanModelCapsule {

  constructor(config) {
    let width = config.with;
    let height = config.height;
    let position = config.position;
    let mass = config.mass;

    this.width = width;
    this.height = height;
    this.mass = mass;

    this.rayLambda = [1.0, 1.0];
    this.turnAngle = 0.0;
    this.maxLinearVelocity = 10.0;
    this.walkSpeed = 8.0; // meters/sec
    this.turnVelocity = 1.0; // radians/sec
    // this.shape = null;

    let radius = width/2;
    let capsuleHeight = height - width;

    let shape = new Ammo.btCapsuleShape(radius, capsuleHeight);

    let startTransform = new Ammo.btTransform();
    startTransform.setIdentity();
    let myMotionState = new Ammo.btDefaultMotionState(startTransform);
    let cInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, shape);
    let rigidBody = new Ammo.btRigidBody(cInfo);
    // kinematic vs. static doesn't work
    //m_rigidBody->setCollisionFlags( m_rigidBody->getCollisionFlags() | btCollisionObject::CF_KINEMATIC_OBJECT);
    rigidBody.setSleepingThresholds (0.0, 0.0);
    rigidBody.setAngularFactor (0.0);
    this.body = rigidBody;
    this.transform = startTransform;
  }

  walk(direction, dt) {
    let transform = this.transform;
    this.body.getMotionState()
      .getWorldTransform (transform);

    let v0 = this.body.getLinearVelocity();

    let forwardDir = transform.getBasis()
      .getRow(2);
    forwardDir.normalize ();
    let speed = this.walkSpeed * dt;

    // if(forward)
    let walkDirection = new Ammo.btVector3(0.0, 0.0, 0.0)
    walkDirection.op_add(forwardDir);

    // if ((forward || backward) && onGround && speed < maxSpeed)
    walkDirection.op_mul(speed);
    let vf = new Ammo.btVector3(v0.x(), v0.y(), v0.z());
    vf.op_add(walkDirection);
		this.body.setLinearVelocity(vf);
    // fi

    this.body.getMotionState()
      .setWorldTransform(transform);
    this.body.setCenterOfMassTransform(transform);
    return transform;
  }


}
