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

const resultDisplay = document.getElementById('resultDisplay');
const winnerText = document.getElementById('winnerText');
const cooldownOverlay = document.getElementById('cooldownOverlay');
const cooldownTimer = document.getElementById('cooldownTimer');

if (!resultDisplay || !winnerText || !cooldownOverlay || !cooldownTimer) {
  throw new Error('Result display elements not found');
}

function showResult(segment) {
  winnerText.textContent = segment.label;
  resultDisplay.style.background = `linear-gradient(135deg, #${segment.color.toString(16).padStart(6, '0')}, #${Math.floor(segment.color * 0.8).toString(16).padStart(6, '0')})`;

  setTimeout(() => {
    resultDisplay.classList.add('show');
  }, 300);

  setTimeout(() => {
    resultDisplay.classList.remove('show');
  }, 4000);
}

function startCooldownTimer(duration) {
  const startTime = Date.now();
  cooldownOverlay.classList.add('show');

  const intervalId = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.ceil((duration - elapsed) / 1000);

    if (remaining <= 0) {
      clearInterval(intervalId);
      cooldownOverlay.classList.remove('show');
    } else {
      cooldownTimer.textContent = remaining;
    }
  }, 100);
}

function handleSpinClick() {
  if (spinController.isSpinning || spinButton.disabled) {
    return;
  }

  spinButton.disabled = true;
  spinButton.textContent = APP_CONFIG.ui.buttonDisabledText;
  resultDisplay.classList.remove('show');

  spinController.startSpin((finalAngle) => {
    const winningSegment = wheel.getCurrentSegment();
    // Create confetti using the winning segment's color for a cohesive effect
    confettiSystem.createConfetti([winningSegment.color]);

    showResult(winningSegment);
    startCooldownTimer(APP_CONFIG.ui.buttonCooldown);

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
