import * as THREE from 'three';

import { Wheel } from './components/Wheel.js';
import { SpinController } from './controllers/SpinController.js';
import { ConfettiSystem } from './effects/ConfettiSystem.js';
import { CONFETTI_CONFIG } from './config/constants.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

scene.add(new THREE.AmbientLight(0x404040, 0.6));
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 12);

const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const wheel = new Wheel(scene);
const spinController = new SpinController();
const confettiSystem = new ConfettiSystem(scene);
confettiSystem.setCamera(camera);

const spinButton = document.getElementById('spinButton');

spinButton.addEventListener('click', () => {
  if (!spinController.isSpinning && !spinButton.disabled) {
    spinButton.disabled = true;
    
    spinController.startSpin((finalAngle) => {
      const currentSegment = wheel.getCurrentSegment();
      console.info(`Winner: ${currentSegment.label} at ${finalAngle.toFixed(2)} degrees`);
      confettiSystem.createConfetti();
      
      setTimeout(() => {
        spinButton.disabled = false;
      }, 2000);
    });
  }
});

let animationTime = 0;

function animate() {
  requestAnimationFrame(animate);

  if (document.hidden) {
    return;
  }

  animationTime += 0.016;
  
  const angle = spinController.update();
  wheel.updateRotation(angle);
  wheel.updateLEDs(animationTime);
  confettiSystem.update();
  renderer.render(scene, camera);
}

animate();

let resizeTimeout;
function handleResize() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, 100);
}

window.addEventListener('resize', handleResize);

window.addEventListener('beforeunload', () => {
  window.removeEventListener('resize', handleResize);
  renderer.dispose();
  scene.clear();
});