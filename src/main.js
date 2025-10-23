import * as THREE from 'three';
import { WheelRenderer } from './core/WheelRenderer.js';
import { LightingSystem } from './core/LightingSystem.js';
import { SpinController } from './SpinController.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 12;

const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Core systems
const wheel = new WheelRenderer(scene);
const lighting = new LightingSystem(scene, camera, renderer);
const spinController = new SpinController();

// Spin button
const spinButton = document.getElementById('spinButton');
spinButton.addEventListener('click', () => {
  if (!spinController.isSpinning) {
    spinController.startSpin((finalAngle) => {
      console.log('Final angle:', finalAngle);
      spinButton.disabled = false;
    });
    spinButton.disabled = true;
  }
});

// Animation loop
let lastTime = 0;
function animate(currentTime) {
  requestAnimationFrame(animate);
  
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;
  
  // Update wheel rotation
  const angle = spinController.update();
  wheel.updateRotation(angle);
  
  // Update LED pulse
  wheel.updateLEDs(currentTime * 0.001);
  
  // Render
  lighting.render();
}

animate(0);

// Window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  lighting.resize(window.innerWidth, window.innerHeight);
});

console.log('✅ Wheel initialized at localhost:8080');
