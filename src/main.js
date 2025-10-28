import * as THREE from 'three';

import { APP_CONFIG } from './config/appConfig.js';
import { Wheel } from './components/Wheel.js';
import { ConfettiSystem } from './effects/ConfettiSystem.js';
import { SpinController } from './controllers/SpinController.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(APP_CONFIG.scene.backgroundColor);

scene.add(new THREE.AmbientLight(0x404040, APP_CONFIG.scene.ambientLightIntensity));
const directionalLight = new THREE.DirectionalLight(
  0xffffff,
  APP_CONFIG.scene.directionalLightIntensity,
);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const camera = new THREE.PerspectiveCamera(
  APP_CONFIG.scene.cameraFov,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(
  APP_CONFIG.scene.cameraPosition.x,
  APP_CONFIG.scene.cameraPosition.y,
  APP_CONFIG.scene.cameraPosition.z,
);

const canvas = document.querySelector('#c');
if (!canvas) {
  throw new Error('Canvas element with id "c" not found');
}

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const wheel = new Wheel(scene);
const spinController = new SpinController();
const confettiSystem = new ConfettiSystem(scene);
confettiSystem.setCamera(camera);

const spinButton = document.getElementById('spinButton');
if (!spinButton) {
  throw new Error('Spin button element not found');
}

function handleSpinClick() {
  if (spinController.isSpinning || spinButton.disabled) {
    return;
  }

  spinButton.disabled = true;
  spinButton.textContent = APP_CONFIG.ui.buttonDisabledText;

  spinController.startSpin((finalAngle) => {
    wheel.getCurrentSegment();
    confettiSystem.createConfetti();

    setTimeout(() => {
      spinButton.disabled = false;
      spinButton.textContent = APP_CONFIG.ui.buttonText;
    }, APP_CONFIG.ui.buttonCooldown);
  });
}

spinButton.addEventListener('click', handleSpinClick);

let animationTime = 0;

function animate() {
  requestAnimationFrame(animate);

  if (document.hidden) {
    return;
  }

  animationTime += APP_CONFIG.animation.frameDelta;

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
  }, APP_CONFIG.animation.resizeDebounceMs);
}

window.addEventListener('resize', handleResize);

function cleanup() {
  window.removeEventListener('resize', handleResize);
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  renderer.dispose();
  scene.clear();
}

window.addEventListener('beforeunload', cleanup);
