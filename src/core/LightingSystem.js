import * as THREE from 'three';
import { EffectComposer, RenderPass, UnrealBloomPass } from 'postprocessing';
import { WHEEL_CONFIG } from '../config/WheelConfig.js';

export class LightingSystem {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    
    this._setupLights();
    this._setupPostProcessing();
  }
  
  _setupLights() {
    const { ambient, directional, spotlight } = WHEEL_CONFIG.lighting;
    
    // Ambient
    const ambientLight = new THREE.AmbientLight(ambient.color, ambient.intensity);
    this.scene.add(ambientLight);
    
    // Directional
    const dirLight = new THREE.DirectionalLight(directional.color, directional.intensity);
    dirLight.position.set(directional.position.x, directional.position.y, directional.position.z);
    this.scene.add(dirLight);
    
    // Spotlight
    this.spotlight = new THREE.SpotLight(
      spotlight.color,
      spotlight.intensity,
      0,
      spotlight.angle,
      spotlight.penumbra
    );
    this.spotlight.position.set(spotlight.position.x, spotlight.position.y, spotlight.position.z);
    this.spotlight.target.position.set(0, 0, 0);
    this.scene.add(this.spotlight);
    this.scene.add(this.spotlight.target);
  }
  
  _setupPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      WHEEL_CONFIG.bloom.strength,
      WHEEL_CONFIG.bloom.radius,
      WHEEL_CONFIG.bloom.threshold
    );
    
    this.composer.addPass(bloomPass);
    this.bloomPass = bloomPass;
  }
  
  render() {
    this.composer.render();
  }
  
  resize(width, height) {
    this.composer.setSize(width, height);
  }
}
