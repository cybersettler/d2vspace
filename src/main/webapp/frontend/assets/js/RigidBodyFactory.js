class RigidBodyFactory {
  constructor(Ammo) {
    this.Ammo = Ammo;
  }

  BoxGeometry(config) {
    let Ammo = this.Ammo;
    let dimensions = new Ammo.btVector3(
        config.width/2, config.height/2, config.height/2);
    return new Ammo.btBoxShape(dimensions);
  }

  SphereGeometry(config) {
    let Ammo = this.Ammo;
    return new Ammo.btSphereShape(config.radius);
  }

  /**
   *
   * @param config
   * @returns {*}
   */
  create(config) {
    let shape = this[config.geometry.type](config.geometry);

    let startTransform = new Ammo.btTransform();
    startTransform.setIdentity();

    let motionState = new Ammo.btDefaultMotionState(startTransform);
    let mass = config.mass; // In kilograms
    let inertia = new Ammo.btVector3(0, 0, 0);
    shape.calculateLocalInertia(mass, inertia);
    let rigidBodyInfo = new Ammo.btRigidBodyConstructionInfo(
        mass, motionState, shape, inertia);
    let result = new Ammo.btRigidBody(rigidBodyInfo);
    result.setRestitution(config.restitution);
    return result;
  }
}
