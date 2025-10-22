import * as THREE from 'three';
import {
    BatchedParticleRenderer,
    ParticleSystem,
    PointEmitter,
    ConstantValue,
    IntervalValue,
    SizeOverLife,
    PiecewiseBezier,
    ColorOverLife,
    RenderMode,
    RandomColor,
    ConeEmitter,
    SphereEmitter
} from 'three.quarks';

const textureLoader = new THREE.TextureLoader();

function createCircleTexture(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    context.beginPath();
    context.arc(32, 32, 30, 0, 2 * Math.PI);
    context.fillStyle = color;
    context.fill();
    return new THREE.CanvasTexture(canvas);
}

function loadTextureOrFallback(path, fallbackColor) {
    const fallback = createCircleTexture(fallbackColor);
    if (!path) {
        return fallback;
    }

    let textureRef = fallback;
    try {
        textureRef = textureLoader.load(
            path,
            (tex) => {
                tex.encoding = THREE.sRGBEncoding;
                tex.needsUpdate = true;
            },
            undefined,
            () => {
                textureRef.image = fallback.image;
                textureRef.needsUpdate = true;
            }
        );
        textureRef.encoding = THREE.sRGBEncoding;
    } catch (error) {
        textureRef = fallback;
    }
    return textureRef;
}

export class CartoonFX {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.enabled = true;

        this._setupConfetti();
        this._setupMotionLines();
        this._setupCornerLights();

        // State for update loop
        this.isShaking = false;
        this.shakeTimer = 0;
        this.originalCameraPos = new THREE.Vector3();

        this.isPulsingLights = false;
        this.pulseTimer = 0;
    }

    // --- 1. Spin Start: Confetti Burst ---
    _setupConfetti() {
        this.confettiRenderer = new BatchedParticleRenderer();
        this.scene.add(this.confettiRenderer);

        const confettiManifest = [
            { color: '#ff6347', texture: 'assets/textures/confetti/red.png' },
            { color: '#4682b4', texture: 'assets/textures/confetti/blue.png' },
            { color: '#3cb371', texture: 'assets/textures/confetti/green.png' },
            { color: '#ffd700', texture: 'assets/textures/confetti/gold.png' },
            { color: '#9370db', texture: 'assets/textures/confetti/violet.png' },
        ];

        this.confettiSystems = confettiManifest.map(({ color, texture }) => {
            const particleTexture = loadTextureOrFallback(texture, color);
            const system = new ParticleSystem({
                duration: 1,
                looping: false,
                startLife: new ConstantValue(1.5),
                startSpeed: new IntervalValue(5, 10),
                startSize: new IntervalValue(0.1, 0.2),
                startColor: new RandomColor(new THREE.Color(1,1,1), new THREE.Color(1,1,1)),
                worldSpace: true,
                maxParticles: 50,
                emissionOverTime: new ConstantValue(0),
                emissionBursts: [{
                    time: 0,
                    count: 50,
                    probability: 1,
                }],
                shape: new SphereEmitter({radius: 0.5}),
                material: new THREE.MeshBasicMaterial({ map: particleTexture, transparent: true }),
                renderMode: RenderMode.BillBoard,
                behaviors: [
                    new SizeOverLife(new PiecewiseBezier([[new THREE.Vector2(0, 1), 0.5], [new THREE.Vector2(1, 0), 0.5]])),
                ]
            });
            system.emitter.renderOrder = 10; // Render on top
            system.emitter.position.z = 1;
            this.confettiRenderer.addSystem(system);
            return system;
        });
    }

    playSpinFX() {
        if (!this.enabled) return;
        this.confettiSystems.forEach(sys => sys.restart());
    }

    // --- 2. Slowdown: Motion Lines & Camera Shake ---
    _setupMotionLines() {
        this.motionLinesGroup = new THREE.Group();
        const lineTexture = loadTextureOrFallback('assets/textures/motion/motion_line.png', '#ffffff');
        lineTexture.center = new THREE.Vector2(0.5, 0.5);

        for (let i = 0; i < 60; i++) {
            const material = new THREE.SpriteMaterial({ map: lineTexture, color: 0xffffff, transparent: true, opacity: 0.6 });
            const sprite = new THREE.Sprite(material);
            const angle = Math.random() * 2 * Math.PI;
            const radius = 4 + Math.random() * 2;
            sprite.position.set(radius * Math.cos(angle), radius * Math.sin(angle), -0.5);
            sprite.scale.set(0.5, 0.02, 1);
            sprite.rotation = angle;
            this.motionLinesGroup.add(sprite);
        }
        this.motionLinesGroup.visible = false;
        this.scene.add(this.motionLinesGroup);
    }

    playSlowdownFX() {
        if (!this.enabled) return;
        
        // Motion Lines
        this.motionLinesGroup.visible = true;

        // Camera Shake
        if (!this.isShaking) {
            this.isShaking = true;
            this.shakeTimer = 1; // 1 second duration
            this.originalCameraPos.copy(this.camera.position);
        }
    }

    // --- 3. Stop: Flashing Corner Lights ---
    _setupCornerLights() {
        this.cornerLights = [];
        const colors = [0xff0000, 0xffff00, 0x0000ff, 0x00ff00];
        const positions = [[1, 1], [-1, 1], [-1, -1], [1, -1]]; // Top-right, top-left, etc.

        positions.forEach((pos, i) => {
            const light = new THREE.PointLight(colors[i], 0, 15);
            const target = new THREE.Vector3(pos[0] * 10, pos[1] * 10, 0);
            light.position.copy(target);
            this.scene.add(light);
            this.cornerLights.push(light);
        });
    }

    playStopFX() {
        if (!this.enabled) return;
        if (!this.isPulsingLights) {
            this.isPulsingLights = true;
            this.pulseTimer = 0.8; // 0.8 second pulse
        }
    }

    // --- Main Update Loop (call this every frame) ---
    update(deltaTime) {
        if (!this.enabled) return;

        // Update particle systems
        this.confettiRenderer.update(deltaTime);

        // Update motion lines rotation
        if (this.motionLinesGroup.visible) {
            this.motionLinesGroup.rotation.z -= deltaTime * 5;
        } else {
            this.motionLinesGroup.rotation.z = 0;
        }

        // Update camera shake
        if (this.isShaking) {
            this.shakeTimer -= deltaTime;
            if (this.shakeTimer <= 0) {
                this.isShaking = false;
                this.camera.position.copy(this.originalCameraPos);
            } else {
                this.camera.position.x = this.originalCameraPos.x + (Math.random() - 0.5) * 0.05;
                this.camera.position.y = this.originalCameraPos.y + (Math.random() - 0.5) * 0.05;
            }
        }

        // Update light pulse
        if (this.isPulsingLights) {
            this.pulseTimer -= deltaTime;
            if (this.pulseTimer <= 0) {
                this.isPulsingLights = false;
                this.cornerLights.forEach(light => light.intensity = 0);
            } else {
                // Simple pulse curve: fast rise, slow fall
                const intensity = Math.sin((1 - this.pulseTimer / 0.8) * Math.PI) * 5;
                this.cornerLights.forEach(light => light.intensity = intensity);
            }
        }
    }

    // --- Control Functions ---
    stopAllFX() {
        this.motionLinesGroup.visible = false;
        if(this.isShaking) {
            this.isShaking = false;
            this.camera.position.copy(this.originalCameraPos);
        }
        if(this.isPulsingLights) {
            this.isPulsingLights = false;
            this.cornerLights.forEach(light => light.intensity = 0);
        }
    }

    setEnabled(isEnabled) {
        this.enabled = isEnabled;
        if (!isEnabled) {
            this.stopAllFX();
        }
    }
}
