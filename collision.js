export class RigidBody {
    constructor() {}
  
    createBox(mass, pos, quat, size) {
      this.transform_ = new Ammo.btTransform();
      this.transform_.setIdentity();
      this.transform_.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
      this.transform_.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
      this.motionState_ = new Ammo.btDefaultMotionState(this.transform_);
  
      const btSize = new Ammo.btVector3(size.x * 0.5, size.y * 0.5, size.z * 0.5);
      this.shape_ = new Ammo.btBoxShape(btSize);
      this.shape_.setMargin(0.05);
  
      this.inertia_ = new Ammo.btVector3(0, 0, 0);
      if (mass > 0) {
        this.shape_.calculateLocalInertia(mass, this.inertia_);
      }
  
      this.info_ = new Ammo.btRigidBodyConstructionInfo(mass, this.motionState_, this.shape_, this.inertia_);
      this.body_ = new Ammo.btRigidBody(this.info_);
  
      Ammo.destroy(btSize);
    }
  }