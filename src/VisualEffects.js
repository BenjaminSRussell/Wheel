import * as THREE from 'three';
import { EffectComposer, RenderPass, UnrealBloomPass } from 'postprocessing';

/**
 * VisualEffects - Manages PBR materials, bloom, lighting, and camera effects
 */
export class VisualEffects {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        // Effect states
        this.isShaking = false;
        this.shakeTimer = 0;
        this.originalCameraPos = new THREE.Vector3();
        this.isPulsingLights = false;
        this.pulseTimer = 0;

        this._setupLighting();
        this._setupPostProcessing();
        this._setupCarnivalLights();
    }

    /**
     * Setup PBR lighting environment
     * @private
     */
    _setupLighting() {
        // Ambient light for base illumination
        this.ambientLight = new THREE.AmbientLight(0xff9944, 0.3);
        this.scene.add(this.ambientLight);

        // Key light (main carnival atmosphere)
        const keyLight = new THREE.DirectionalLight(0xffd700, 1.2);
        keyLight.position.set(5, 8, 5);
        this.scene.add(keyLight);

        // Fill light (softer, cooler)
        const fillLight = new THREE.DirectionalLight(0x4488ff, 0.4);
        fillLight.position.set(-5, 3, -2);
        this.scene.add(fillLight);

        // Rim light (edge definition)
        const rimLight = new THREE.DirectionalLight(0xff6688, 0.6);
        rimLight.position.set(0, -2, -5);
        this.scene.add(rimLight);

        // Store reference for dynamic control
        this.keyLight = keyLight;
    }

    /**
     * Setup postprocessing with Unreal Bloom
     * @private
     */
    _setupPostProcessing() {
        // Create composer
        this.composer = new EffectComposer(this.renderer);

        // Add render pass
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        // Add Unreal Bloom pass for emissive glow
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5,  // strength
            0.4,  // radius
            0.85  // threshold
        );
        bloomPass.strength = 1.2;
        bloomPass.radius = 0.5;
        bloomPass.threshold = 0.1;

        this.composer.addPass(bloomPass);
        this.bloomPass = bloomPass;

        console.log('Bloom postprocessing enabled');
    }

    /**
     * Create carnival atmosphere lights around the wheel
     * @private
     */
    _setupCarnivalLights() {
        this.carnivalLights = [];

        // Create ring of colored point lights around the wheel
        const numLights = 8;
        const radius = 6;
        const colors = [0xff0000, 0xff9900, 0xffff00, 0x00ff00, 0x00ffff, 0x0088ff, 0xff00ff, 0xff0088];

        for (let i = 0; i < numLights; i++) {
            const angle = (i / numLights) * Math.PI * 2;
            const light = new THREE.PointLight(colors[i], 0.8, 15);
            light.position.set(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                2
            );
            this.scene.add(light);
            this.carnivalLights.push({
                light,
                angle,
                baseIntensity: 0.8,
                phase: Math.random() * Math.PI * 2
            });
        }

        // Spotlight on wheel (initially dim)
        this.wheelSpotlight = new THREE.SpotLight(0xffffff, 2, 20, Math.PI / 6);
        this.wheelSpotlight.position.set(0, 0, 10);
        this.wheelSpotlight.target.position.set(0, 0, 0);
        this.scene.add(this.wheelSpotlight);
        this.scene.add(this.wheelSpotlight.target);
    }

    /**
     * Create PBR material for wheel segments with emissive properties
     * @param {number} baseColor - Base color for the segment
     * @param {boolean} isEmissive - Whether this segment should glow
     */
    createWheelMaterial(baseColor, isEmissive = false) {
        const material = new THREE.MeshStandardMaterial({
            color: baseColor,
            metalness: 0.3,
            roughness: 0.4,
            side: THREE.DoubleSide,
        });

        if (isEmissive) {
            material.emissive = new THREE.Color(baseColor);
            material.emissiveIntensity = 0.5;
        }

        return material;
    }

    /**
     * Create emissive LED material for rim lights
     */
    createLEDMaterial(color) {
        return new THREE.MeshStandardMaterial({
            color: color,
            emissive: new THREE.Color(color),
            emissiveIntensity: 2.0,
            metalness: 0.7,
            roughness: 0.2,
        });
    }

    /**
     * Trigger spin start effects (dramatic lighting)
     */
    onSpinStart() {
        // Dim ambient, boost spotlight
        this.ambientLight.intensity = 0.15;
        this.wheelSpotlight.intensity = 3;
        this.bloomPass.strength = 1.5;
    }

    /**
     * Trigger slowdown effects (camera shake, light pulse)
     */
    onSlowdown() {
        // Camera shake
        if (!this.isShaking) {
            this.isShaking = true;
            this.shakeTimer = 1.2;
            this.originalCameraPos.copy(this.camera.position);
        }

        // Pulse carnival lights faster
        this.carnivalLights.forEach(light => {
            light.baseIntensity = 1.5;
        });

        // Intense bloom
        this.bloomPass.strength = 2.0;
    }

    /**
     * Trigger stop effects (flash, restore lighting)
     */
    onStop() {
        // Flash effect
        this.isPulsingLights = true;
        this.pulseTimer = 0.6;

        // Reset to idle lighting
        setTimeout(() => {
            this.ambientLight.intensity = 0.3;
            this.wheelSpotlight.intensity = 2;
            this.bloomPass.strength = 1.2;
            this.carnivalLights.forEach(light => {
                light.baseIntensity = 0.8;
            });
        }, 600);
    }

    /**
     * Update effects each frame
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        // Animate carnival lights (flickering effect)
        const time = performance.now() * 0.001;
        this.carnivalLights.forEach(lightData => {
            const flicker = Math.sin(time * 3 + lightData.phase) * 0.3 + 1;
            lightData.light.intensity = lightData.baseIntensity * flicker;
        });

        // Update camera shake
        if (this.isShaking) {
            this.shakeTimer -= deltaTime;
            if (this.shakeTimer <= 0) {
                this.isShaking = false;
                this.camera.position.copy(this.originalCameraPos);
            } else {
                const intensity = this.shakeTimer / 1.2; // Fade out shake
                this.camera.position.x = this.originalCameraPos.x + (Math.random() - 0.5) * 0.08 * intensity;
                this.camera.position.y = this.originalCameraPos.y + (Math.random() - 0.5) * 0.08 * intensity;
            }
        }

        // Update light pulse (stop effect)
        if (this.isPulsingLights) {
            this.pulseTimer -= deltaTime;
            if (this.pulseTimer <= 0) {
                this.isPulsingLights = false;
            } else {
                // Flash the spotlight
                const pulse = Math.sin((1 - this.pulseTimer / 0.6) * Math.PI);
                this.wheelSpotlight.intensity = 2 + pulse * 4;
            }
        }
    }

    /**
     * Render the scene with postprocessing
     */
    render() {
        this.composer.render();
    }

    /**
     * Handle window resize
     */
    resize(width, height) {
        this.composer.setSize(width, height);
    }
}
