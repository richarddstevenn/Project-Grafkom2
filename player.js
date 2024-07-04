import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RigidBody } from './collision.js';





///////////////////////////////////////////    
export class PlayerControllerProxy {
  constructor(animations) {
    this._animations = animations;
  }

  get animations() {
    return this._animations;
  }
}

export class PlayerController {
  constructor(params) {
    this._Init(params);
  }

  _Init(params) {
    this._params = params;
    this._decceletation = new THREE.Vector3(-0.002, -0.0004, -20.0);
    this.acceleration = new THREE.Vector3(0.25, 0.0625, 12.5);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this._position = new THREE.Vector3();
    this._lastPosition = new THREE.Vector3();

    this._animations = {};
    this._input = new PlayerControllerInput();
    this._stateMachine = new CharacterFSM(new PlayerControllerProxy(this._animations));

    this._loadModel();
  }
  
  _loadModel() {
    const loader = new FBXLoader();
    loader.setPath('./resources/player/');
    loader.load('gtr.fbx', (fbx) => {
      fbx.scale.set(0.005, 0.005, 0.005);
      fbx.traverse((child) => {
        child.castShadow = true;
        child.receiveShadow = true;
      });
  
      this._target = fbx;
      this._params.scene.add(this._target);
  
      this._mixer = new THREE.AnimationMixer(this._target);
  
      this._manager = new THREE.LoadingManager();
      this._manager.onLoad = () => {
        this._stateMachine.SetState('idle');
      };
  
      const _onLoad = (animName, anim) => {
        const clip = anim.animations[0];
        const action = this._mixer.clipAction(clip);
        this._animations[animName] = {
          clip: clip,
          action: action,
        };
      };
  
      const animLoader = new FBXLoader(this._manager);
      animLoader.setPath('./resources/player/');
      animLoader.load('gtr.fbx', (a) => {
        _onLoad('idle', a);
      });
      animLoader.load('gtr.fbx', (a) => {
        _onLoad('walk', a);
      });
      animLoader.load('gtr.fbx', (a) => {
        _onLoad('run', a);
      });


      const headsourcelight1 = new THREE.PointLight(0xffffff, 1, 100);
      headsourcelight1.position.set(-18, 182, 280);
      this._target.add(headsourcelight1);

      const headsourcelight2 = new THREE.PointLight(0xffffff, 1, 100);
      headsourcelight2.position.set(-345, 182, 280);
      this._target.add(headsourcelight2);

      const headlight1 = new THREE.SpotLight(0xffffff, 1, 600, Math.PI / 4, 0.2, 2);
      headlight1.position.set(-18, 182, 280);
      headlight1.target.position.set(-18, 182, 580);
      this._target.add(headlight1);
      this._target.add(headlight1.target);
  
      const headlight2 = new THREE.SpotLight(0xffffff, 1, 600, Math.PI / 4, 0.2, 2);
      headlight2.position.set(-345, 182, 280);
      headlight2.target.position.set(-345, 182, 580);
      this._target.add(headlight2);
      this._target.add(headlight2.target);

      const stoplamp1 = new THREE.PointLight(0xff0000, 1, 10);
      stoplamp1.position.set(-18, 190, -740);
      this._target.add(stoplamp1);

      const stoplamp2 = new THREE.PointLight(0xff0000, 1, 10);
      stoplamp2.position.set(-345, 190, -740);
      this._target.add(stoplamp2);

      const stoplamp3 = new THREE.PointLight(0xff0000, 1, 10);
      stoplamp3.position.set(-23, 185, -740);
      this._target.add(stoplamp3);

      const stoplamp4 = new THREE.PointLight(0xff0000, 1, 10);
      stoplamp4.position.set(-350, 185, -740);
      this._target.add(stoplamp4);

      const stoplampLight1 = new THREE.SpotLight(0xffffff, 1, 1000, Math.PI / 4, 0.2, 2);
      stoplampLight1.position.set(-18, 190, -750);
      stoplampLight1.target.position.set(-18, 190, -755);
      this._target.add(stoplampLight1);
      this._target.add(stoplampLight1.target);

      const stoplampLight2 = new THREE.SpotLight(0xffffff, 1, 1000, Math.PI / 4, 0.2, 2);
      stoplampLight2.position.set(-345, 190, -750);
      stoplampLight2.target.position.set(-345, 190, -755);
      this._target.add(stoplampLight2);
      this._target.add(stoplampLight2.target);

      //Neons
      const bounds = {
        corner1: { x: -5, z: 50 },
        corner2: { x: -350, z: -420 }
      };

      const neonLightIntensity = 1;
      const neonLightDistance = 4000;
      const neonLightColor = 0x800080;
      const neonLightAngle = Math.PI / 2;
      const neonLightPenumbra = 0.5;

      const yPos = 50;
      const targetYPos = 5;

      for (let x = bounds.corner1.x; x >= bounds.corner2.x; x -= 25) {
        let neonLight = new THREE.SpotLight(neonLightColor, neonLightIntensity, neonLightDistance, neonLightAngle, neonLightPenumbra);
        neonLight.position.set(x, yPos, bounds.corner1.z);
        neonLight.target.position.set(x, targetYPos, bounds.corner1.z);
        this._target.add(neonLight);
        this._target.add(neonLight.target);

        neonLight = new THREE.SpotLight(neonLightColor, neonLightIntensity, neonLightDistance, neonLightAngle, neonLightPenumbra);
        neonLight.position.set(x, yPos, bounds.corner2.z);
        neonLight.target.position.set(x, targetYPos, bounds.corner2.z);
        this._target.add(neonLight);
        this._target.add(neonLight.target);
      }

      for (let z = bounds.corner1.z; z >= bounds.corner2.z; z -= 25) {
        let neonLight = new THREE.SpotLight(neonLightColor, neonLightIntensity, neonLightDistance, neonLightAngle, neonLightPenumbra);
        neonLight.position.set(bounds.corner1.x, yPos, z);
        neonLight.target.position.set(bounds.corner1.x, targetYPos, z);
        this._target.add(neonLight);
        this._target.add(neonLight.target);

        neonLight = new THREE.SpotLight(neonLightColor, neonLightIntensity, neonLightDistance, neonLightAngle, neonLightPenumbra);
        neonLight.position.set(bounds.corner2.x, yPos, z);
        neonLight.target.position.set(bounds.corner2.x, targetYPos, z);
        this._target.add(neonLight);
        this._target.add(neonLight.target);
      }


    });
  }
  
  get Position() {
    return this._position.clone();
  }

  setPosition(newPosition) {
    if (this._target && newPosition instanceof THREE.Vector3) {
      this._target.position.copy(newPosition);
      this._position.copy(newPosition);
    } else {
      console.error("Invalid position or target not set.");
    }
  }

  get Rotation() {
    if (!this._target) {
      return new THREE.Quaternion();
    }
    return this._target.quaternion.clone();
  }

  setRotation(newRotation) {
    if (this._target && newRotation instanceof THREE.Quaternion) {
      this._target.quaternion.copy(newRotation);
    } else {
      console.error("Invalid rotation or target not set.");
    }
  }

  Update(timeInSeconds) {
    if (!this._target) {
      return;
    }

    this._stateMachine.Update(timeInSeconds, this._input);

    this._lastPosition.copy(this._target.position);

    const velocity = this.velocity;
    const frameDecceleration = new THREE.Vector3(velocity.x * this._decceletation.x, velocity.y * this._decceletation.y, velocity.z * this._decceletation.z);
    frameDecceleration.multiplyScalar(timeInSeconds);
    frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(Math.abs(frameDecceleration.z), Math.abs(velocity.z));

    velocity.add(frameDecceleration);

    const controlObject = this._target;
    const _Q = new THREE.Quaternion();
    const _A = new THREE.Vector3();
    const _R = controlObject.quaternion.clone();

    const acc = this.acceleration.clone();
    if (this._input._keys.shift) {
      acc.multiplyScalar(3.0);
    }

    if (this._input._keys.forward) {
      velocity.z += acc.z * 10 * timeInSeconds;
    }
    if (this._input._keys.backward) {
      velocity.z -= acc.z * 10 * timeInSeconds;
    }
    if (this._input._keys.left) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * 2 * Math.PI * timeInSeconds * this.acceleration.y);
      _R.multiply(_Q);
    }
    if (this._input._keys.right) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * 2 * -Math.PI * timeInSeconds * this.acceleration.y);
      _R.multiply(_Q);
    }

    controlObject.quaternion.copy(_R);

    const oldPosition = new THREE.Vector3();
    oldPosition.copy(controlObject.position);

    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(controlObject.quaternion);
    forward.normalize();

    const sideways = new THREE.Vector3(1, 0, 0);
    sideways.applyQuaternion(controlObject.quaternion);
    sideways.normalize();

    sideways.multiplyScalar(velocity.x * timeInSeconds);
    forward.multiplyScalar(velocity.z * timeInSeconds);

    controlObject.position.add(forward);
    controlObject.position.add(sideways);

    this._position.copy(controlObject.position);

    if (this._mixer) {
      this._mixer.update(timeInSeconds);
    }
  }
}

export class PlayerControllerInput {
  constructor() {
    this._Init();
  }

  _Init() {
    this._keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      shift: false,
    };
    document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
    document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
  }

  _onKeyDown(event) {
    switch (event.keyCode) {
      case 87: // W
        this._keys.forward = true;
        break;
      case 83: // S
        this._keys.backward = true;
        break;
      case 65: // A
        this._keys.left = true;
        break;
      case 68: // D
        this._keys.right = true;
        break;
      case 16: // SHIFT
        this._keys.shift = true;
        break;  
    }
  }

  _onKeyUp(event) {
    switch (event.keyCode) {
      case 87: // W
        this._keys.forward = false;
        break;
      case 83: // S
        this._keys.backward = false;
        break;
      case 65: // A
        this._keys.left = false;
        break;
      case 68: // D
        this._keys.right = false;
        break;
      case 16: // SHIFT
        this._keys.shift = false;
        break;
    }
  }
}

export class FiniteStateMachine {
  constructor() {
    this._states = {};
    this._currentState = null;
  }

  _addState(name, type) {
    this._states[name] = type;
  }

  SetState(name) {
    const prevState = this._currentState;

    if (prevState) {
      if (prevState.Name == name) {
        return;
      }
      prevState.Exit();
    }

    const state = new this._states[name](this);

    this._currentState = state;
    state.Enter(prevState);
  }

  Update(timeElapsed, input) {
    if (this._currentState) {
      this._currentState.Update(timeElapsed, input);
    }
  }
}

export class CharacterFSM extends FiniteStateMachine {
  constructor(proxy) {
    super();
    this._proxy = proxy;
    this._Init();
  }

  _Init() {
    this._addState('idle', IdleState);
    this._addState('walk', WalkState);
    this._addState('run', RunState);
  }
}

export class State {
  constructor(parent) {
    this._parent = parent;
  }

  Enter() {}

  Exit() {}

  Update() {}
}

export class IdleState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'idle';
  }

  Enter(prevState) {
    const idleAction = this._parent._proxy._animations['idle'].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;
      idleAction.time = 0.0;
      idleAction.enabled = true;
      idleAction.setEffectiveTimeScale(1.0);
      idleAction.setEffectiveWeight(1.0);
      idleAction.crossFadeFrom(prevAction, 0.2, true);
      idleAction.play();
    } else {
      idleAction.play();
    }
  }

  Exit() {}

  Update(_, input) {
    if (input._keys.forward || input._keys.backward) {
      this._parent.SetState('walk');
    }
  }
}



export class WalkState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'walk';
  }

  Enter(prevState) {
    const walkAction = this._parent._proxy._animations['walk'].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;
      walkAction.time = 0.0;
      walkAction.enabled = true;
      walkAction.setEffectiveTimeScale(1.0);
      walkAction.setEffectiveWeight(1.0);
      walkAction.crossFadeFrom(prevAction, 0.2, true);
      walkAction.play();
    } else {
      walkAction.play();
    }
  }

  Exit() {}

  Update(timeElapsed, input) {
    if (input._keys.forward || input._keys.backward) {
      if (input._keys.shift) {
        this._parent.SetState('run');
      }
      return;
    }

    this._parent.SetState('idle');
  }
}

export class RunState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return 'run';
  }

  Enter(prevState) {
    const curAction = this._parent._proxy._animations['run'].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;

      curAction.enabled = true;

      if (prevState.Name == 'walk') {
        const ratio = curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.5, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  Exit() {
  }

  Update(timeElapsed, input) {
    if (input._keys.forward || input._keys.backward) {
      if (!input._keys.shift) {
        this._parent.SetState('walk');
      }
      return;
    }

    this._parent.SetState('idle');
  }
};


export class Environment {
  // CONSTRUCTOR
  constructor(scene, fisik, physWorld, rigidBodies) {
    this.scene = scene;
    this.fisik = fisik;
    this.physWorld = physWorld;
    this.rigidBodies = rigidBodies;

    this._loadModel(physWorld, rigidBodies);
  }

  // LOAD MODEL
  _loadModel(physWorld, rigidBodies) {
    const loader = new GLTFLoader();
    loader.setPath('./resources/environment/');
    loader.load(
      'scene.gltf',
      (gltf) => {
        gltf.scene.scale.set(0.008, 0.008, 0.008);

        gltf.scene.traverse((child) => {
          child.castShadow = true;
          child.receiveShadow = true;
        });

        this.scene.add(gltf.scene);
        this._addStreetLights(gltf.scene);
        this._addCollisionBodies(gltf.scene, physWorld, rigidBodies);
        this._addMoonLight(gltf.scene);
        this._addDirectionalLight(gltf.scene);
      },
      undefined,
      (error) => {
        console.error(error);
      }
    );
  }

    // ADD MOON LIGHT
  _addMoonLight(scene) {
    var moon_geometry = new THREE.SphereGeometry(1, 10, 10);
    var moon_material = new THREE.MeshPhongMaterial({ color: 0x500500, emissive: 0x0f0f0f});
    var moon = new THREE.Mesh(moon_geometry, moon_material);
    moon.position.set(20000, 10000, -20000);
    moon.scale.set(1000, 1000, 1000);
    moon.castShadow = true;
    moon.receiveShadow = true;
    scene.add(moon);

    // AMBIENT LIGHT
    var ambientLight = new THREE.AmbientLight(0x404040, 5);
    scene.add(ambientLight);
  }

  // ADD DIRECTIONAL LIGHT
  _addDirectionalLight(scene) {
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(20000, 20000, -20000); // Set the position of the light
    directionalLight.castShadow = true;

    // Configure shadow properties
    directionalLight.shadow.mapSize.width = 5000;  // Shadow map resolution
    directionalLight.shadow.mapSize.height = 5000;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 15000;
    directionalLight.shadow.camera.left = -3000;
    directionalLight.shadow.camera.right = 3000;
    directionalLight.shadow.camera.top = 3000;
    directionalLight.shadow.camera.bottom = -3000;

    scene.add(directionalLight);
  }

  // ADD STREET LIGHTS
  _addStreetLights(scene) {
    scene.traverse((child) => {
      if(child.name.startsWith("StreetLamp") || (child.name.startsWith("StopLight") && !child.name.startsWith("StopLights"))) {
        const streetspotlight = new THREE.SpotLight(0xffffff, 1, 500, Math.PI / 2, 0.1, 1);
        streetspotlight.position.set(child.position.x, child.position.y + 200, child.position.z);
        streetspotlight.target.position.set(child.position.x, child.position.y, child.position.z);
        //streetspotlight.castShadow = true;
        scene.add(streetspotlight);
        scene.add(streetspotlight.target);

        //console.log(Added light at position: ${streetspotlight.position.x}, ${streetspotlight.position.y}, ${streetspotlight.position.z});
      }
    });
  }

  _addCollisionBodies(scene, physWorld, rigidBodies) {
    scene.traverse((child) => {
      if (["LM_Clinic2", "FFactory", "FFactory1", "Filler_Housing1"].includes(child.name)) {
        let boundingBox = new THREE.Box3().setFromObject(child);
        let size = new THREE.Vector3();
        boundingBox.getSize(size);
        let center = new THREE.Vector3();
        boundingBox.getCenter(center);
        
        size.multiplyScalar(0.5);

        // Create an Ammo.js box shape
        const shape = new Ammo.btBoxShape(new Ammo.btVector3(size.x, size.y, size.z));

        // Create a transform for the shape
        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(center.x, center.y, center.z));
        transform.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));

        // Create a motion state and rigid body
        const motionState = new Ammo.btDefaultMotionState(transform);
        const localInertia = new Ammo.btVector3(0, 0, 0);
        shape.calculateLocalInertia(0, localInertia);

        const rbInfo = new Ammo.btRigidBodyConstructionInfo(0, motionState, shape, localInertia);
        const body = new Ammo.btRigidBody(rbInfo);

        // Add body to the physics world
        body.setCollisionFlags(body.getCollisionFlags() | Ammo.btCollisionObject.CF_STATIC_OBJECT);
        physWorld.addRigidBody(body);

        child.userData.physicsBody = body;

        rigidBodies.push(child);
      }
    })
  }
}