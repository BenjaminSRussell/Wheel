import * as THREE from 'three';
import { Wheel } from './Wheel.js';
import { CartoonFX } from './CartoonFX.js';
import { AudioManager } from './AudioManager.js';
import { WheelController } from './WheelController.js';
import { VisualEffects } from './VisualEffects.js';
import { FullscreenLauncher } from './FullscreenLauncher.js';

let camera, scene, renderer, clock;
let wheel, fx, audioManager, wheelController, visualEffects, fullscreenLauncher;
let isFirstClick = true;

async function init() {
    console.log('🎡 Initializing 3D Carnival Wheel...');

    // Basic Scene Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);
    clock = new THREE.Clock();

    // Camera - adjusted for better 3D view
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, -2, 8);
    camera.lookAt(0, 0, 0);

    // Renderer with enhanced settings for PBR
    const canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // --- Initialize Visual Effects First (needed for materials) ---
    visualEffects = new VisualEffects(scene, camera, renderer);

    // --- Initialize Wheel with PBR materials ---
    wheel = new Wheel(visualEffects);
    scene.add(wheel.wheelGroup);
    scene.add(wheel.pointerGroup);

    // --- Initialize Particle FX (legacy system for confetti) ---
    fx = new CartoonFX(scene, camera);

    // --- Initialize Physics-based Wheel Controller ---
    wheelController = new WheelController(wheel);

    // --- Initialize Audio ---
    audioManager = new AudioManager();

    // --- Initialize Fullscreen Launcher ---
    fullscreenLauncher = new FullscreenLauncher();

    // --- Event Listeners ---
    const spinButton = document.getElementById('spinButton');
    spinButton.addEventListener('click', handleSpinClick);

    window.addEventListener('resize', onWindowResize, false);

    // Add UI for outcomes display
    createOutcomeDisplay();

    console.log('✅ Initialization complete! Click SPIN to begin.');

    // Start Animation Loop
    animate();
}

function createOutcomeDisplay() {
    const display = document.createElement('div');
    display.id = 'outcomeDisplay';
    display.style.cssText = `
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        padding: 20px 40px;
        border-radius: 15px;
        border: 3px solid #ffd700;
        font-family: 'Comic Sans MS', 'Chalkduster', cursive;
        color: white;
        font-size: 24px;
        text-align: center;
        display: none;
        z-index: 100;
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
    `;
    document.body.appendChild(display);
}

function showOutcome(outcomes) {
    const display = document.getElementById('outcomeDisplay');
    display.innerHTML = `
        <div style="margin-bottom: 10px; font-size: 18px; color: #ffd700;">🎉 WINNER! 🎉</div>
        <div style="margin: 10px 0;">
            <span style="color: #${outcomes.inner.color.toString(16).padStart(6, '0')};">
                ${outcomes.inner.label}
            </span>
        </div>
        <div style="font-size: 32px; margin: 5px 0;">×</div>
        <div style="margin: 10px 0;">
            <span style="color: #${outcomes.outer.color.toString(16).padStart(6, '0')};">
                ${outcomes.outer.label}
            </span>
        </div>
    `;
    display.style.display = 'block';

    // Hide after 5 seconds
    setTimeout(() => {
        display.style.display = 'none';
    }, 5000);
}

function handleSpinClick() {
    if (wheelController.isSpinning) return;

    // Hide previous outcome
    const display = document.getElementById('outcomeDisplay');
    if (display) display.style.display = 'none';

    // On first click, enter fullscreen and unlock audio
    if (isFirstClick) {
        fullscreenLauncher.enterKioskMode();
        audioManager.unlockAudio();
        isFirstClick = false;
    }

    // 1. Trigger visual and audio effects
    visualEffects.onSpinStart();
    audioManager.playSpin();
    fx.playSpinFX();
    fx.stopAllFX();

    // 2. Start the physics-based spin
    wheelController.spin({
        duration: 8, // seconds
        onSlowdown: () => {
            console.log('🎯 Wheel is slowing down...');
            visualEffects.onSlowdown();
            fx.playSlowdownFX();
        },
        onComplete: (finalAngle) => {
            // 3. Get outcomes and display
            const outcomes = wheel.getOutcomes(finalAngle);
            console.log('🏆 Spin complete! Results:', outcomes);

            // Show outcome display
            showOutcome(outcomes);

            // Trigger completion effects
            audioManager.playIdle();
            audioManager.playDing();
            visualEffects.onStop();
            fx.playStopFX();

            // Stop slowdown effects after delay
            setTimeout(() => fx.stopAllFX(), 1000);
        }
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    visualEffects.resize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();
    const currentTime = performance.now() * 0.001; // Convert to seconds

    // Update all systems
    wheelController.update(performance.now());
    visualEffects.update(deltaTime);
    fx.update(deltaTime);

    // Update LED animations
    wheel.updateLEDs(currentTime, wheelController.isSpinning);

    // Render with postprocessing
    visualEffects.render();
}

// Initialize when DOM is ready
init();
