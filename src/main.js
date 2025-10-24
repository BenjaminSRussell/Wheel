import * as THREE from 'three';

import { Wheel } from './components/Wheel.js';
import { SpinController } from './controllers/SpinController.js';
import { ConfettiSystem } from './effects/ConfettiSystem.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

scene.add(new THREE.AmbientLight(0x404040, 0.6));
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Camera setup
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 12;

// Renderer setup
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const wheel = new Wheel(scene);
const spinController = new SpinController();
const confettiSystem = new ConfettiSystem(scene);
const spinButton = document.getElementById('spinButton');

if (spinButton) spinButton.style.display = 'block';
console.info('Wheel ready');

// Handle spin button click
spinButton.addEventListener('click', () => {
  if (!spinController.isSpinning) {
    spinController.startSpin((finalAngle) => {
      const currentSegment = wheel.getCurrentSegment();
      console.info(`Winner: ${currentSegment.label} at ${finalAngle.toFixed(2)} degrees`);
      confettiSystem.createConfetti();
      spinButton.disabled = false;
    });
    spinButton.disabled = true;
  }
});

// Main animation loop
function animate(currentTime) {
  requestAnimationFrame(animate);

  const angle = spinController.update();
  wheel.updateRotation(angle);
  wheel.updateLEDs(currentTime * 0.001);
  confettiSystem.update();
  renderer.render(scene, camera);
}
animate(0);

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
