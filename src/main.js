import * as THREE from 'three';

let camera, scene, renderer;
let wheel;

function init() {
    console.log('Starting simple wheel...');

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;

    // Renderer
    const canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Create simple wheel
    const wheelGeometry = new THREE.CircleGeometry(3, 32);
    const wheelMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff0000,
        side: THREE.DoubleSide
    });
    wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    scene.add(wheel);

    // Create pointer
    const pointerGeometry = new THREE.ConeGeometry(0.2, 1, 8);
    const pointerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const pointer = new THREE.Mesh(pointerGeometry, pointerMaterial);
    pointer.position.set(0, 3.5, 0);
    pointer.rotation.z = Math.PI;
    scene.add(pointer);

    // Add lighting
    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);

    console.log('Simple wheel created!');
    
    // Connect spin button
    const spinButton = document.getElementById('spinButton');
    if (spinButton) {
        spinButton.addEventListener('click', spinWheel);
        console.log('Spin button connected!');
    }
    
    animate();
}

let isSpinning = false;
let spinSpeed = 0;
let spinDecay = 0.98;

function animate() {
    requestAnimationFrame(animate);
    
    if (isSpinning) {
        // Apply spin
        wheel.rotation.z += spinSpeed;
        // Decay spin speed
        spinSpeed *= spinDecay;
        
        // Stop when very slow
        if (spinSpeed < 0.001) {
            isSpinning = false;
            spinSpeed = 0;
            console.log('Spin complete!');
        }
    } else {
        // Slow idle rotation
        wheel.rotation.z += 0.005;
    }
    
    renderer.render(scene, camera);
}

function spinWheel() {
    console.log('Spinning wheel!');
    isSpinning = true;
    spinSpeed = 0.3; // Start with fast spin
}

// Start when page loads
init();