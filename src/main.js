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
camera.lookAt(
  APP_CONFIG.scene.cameraLookAt.x,
  APP_CONFIG.scene.cameraLookAt.y,
  APP_CONFIG.scene.cameraLookAt.z,
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

// Camera effects configuration
const baseCameraZ = APP_CONFIG.scene.cameraPosition.z;
const cameraZoomAmount = 2.0; // How much to zoom in during fast spin
const cameraShakeAmount = 0.15; // Camera shake intensity
let cameraShakeX = 0;
let cameraShakeY = 0;

// Mouse hover detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
  // Only do hover effects when not spinning
  if (spinController.isSpinning) {
    wheel.setHoveredSegment(-1);
    return;
  }

  // Calculate mouse position in normalized device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update raycaster
  raycaster.setFromCamera(mouse, camera);

  // Check intersections with wheel segments
  const intersects = raycaster.intersectObjects(wheel.wheelGroup.children, true);

  if (intersects.length > 0) {
    // Find which segment was hit
    for (let i = 0; i < wheel.segmentMeshes.length; i++) {
      const segmentMesh = wheel.segmentMeshes[i].mesh;
      if (intersects[0].object === segmentMesh) {
        wheel.setHoveredSegment(i);
        canvas.style.cursor = 'pointer';
        return;
      }
    }
  }

  // No segment hovered
  wheel.setHoveredSegment(-1);
  canvas.style.cursor = 'default';
}

window.addEventListener('mousemove', onMouseMove);

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

function updateCameraEffects(velocity) {
  // Normalize velocity (max velocity around 25 rad/s)
  const normalizedVelocity = Math.min(Math.abs(velocity) / 25, 1.0);

  // Zoom in based on velocity (faster = closer)
  const targetZ = baseCameraZ - (normalizedVelocity * cameraZoomAmount);
  camera.position.z += (targetZ - camera.position.z) * 0.1; // Smooth interpolation

  // Camera shake at high velocities
  if (normalizedVelocity > 0.5) {
    const shakeIntensity = (normalizedVelocity - 0.5) * 2; // 0 to 1 range above threshold
    cameraShakeX = (Math.random() - 0.5) * cameraShakeAmount * shakeIntensity;
    cameraShakeY = (Math.random() - 0.5) * cameraShakeAmount * shakeIntensity;
  } else {
    // Smoothly return to center when not shaking
    cameraShakeX *= 0.8;
    cameraShakeY *= 0.8;
  }

  camera.position.x = APP_CONFIG.scene.cameraPosition.x + cameraShakeX;
  camera.position.y = APP_CONFIG.scene.cameraPosition.y + cameraShakeY;
}

function animate() {
  requestAnimationFrame(animate);

  if (document.hidden) {
    return;
  }

  animationTime += APP_CONFIG.animation.frameDelta;

  const angle = spinController.update();
  const velocity = spinController.angularVelocity;

  wheel.updateRotation(angle);
  wheel.updateLEDs(animationTime, velocity);
  wheel.updateHoverEffects();
  updateCameraEffects(velocity);
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
