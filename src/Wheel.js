import * as THREE from 'three';

// --- Constants for 3D wheel design ---
const INNER_RADIUS = 2.5;
const OUTER_RADIUS = 4;
const WHEEL_DEPTH = 0.3;  // 3D thickness
const SEGMENTS_INNER = 8;
const SEGMENTS_OUTER = 12;

// Vibrant carnival colors
const COLORS_INNER = [0xff6347, 0x4682b4, 0x3cb371, 0xffd700, 0x9370db, 0xfa8072, 0x00ced1, 0xff4500];
const COLORS_OUTER = [0xe6194b, 0x3cb44b, 0xffe119, 0x4363d8, 0xf58231, 0x911eb4, 0x46f0f0, 0xf032e6, 0xbcf60c, 0xfabebe, 0x008080, 0xe6beff];

// Outcome labels for dual rings
const OUTCOMES_INNER = ['Dance', 'Sing', 'Act', 'Draw', 'Jump', 'Spin', 'Laugh', 'Clap'];
const OUTCOMES_OUTER = ['Movie', 'Music', 'Sports', 'Food', 'Travel', 'Games', 'Books', 'Art', 'Science', 'History', 'Nature', 'Tech'];

export class Wheel {
    constructor(visualEffects = null) {
        this.visualEffects = visualEffects;
        this.wheelGroup = new THREE.Group();
        this.pointerGroup = new THREE.Group();
        this.ledLights = [];

        this._createWheel();
        this._createLEDRim();
        this._createPointer();
    }

    /**
     * Creates the 3D wheel with PBR materials
     * @private
     */
    _createWheel() {
        // --- Outer Ring ---
        const outerSegmentAngle = (2 * Math.PI) / SEGMENTS_OUTER;
        for (let i = 0; i < SEGMENTS_OUTER; i++) {
            const startAngle = i * outerSegmentAngle;
            const endAngle = startAngle + outerSegmentAngle;
            const segment = this._createWedge3D(
                OUTER_RADIUS,
                INNER_RADIUS,
                startAngle,
                endAngle,
                COLORS_OUTER[i],
                false
            );
            this.wheelGroup.add(segment);
        }

        // --- Inner Ring ---
        const innerSegmentAngle = (2 * Math.PI) / SEGMENTS_INNER;
        for (let i = 0; i < SEGMENTS_INNER; i++) {
            const startAngle = i * innerSegmentAngle;
            const endAngle = startAngle + innerSegmentAngle;
            const segment = this._createWedge3D(
                INNER_RADIUS,
                0.3,  // Small center hub
                startAngle,
                endAngle,
                COLORS_INNER[i],
                false
            );
            this.wheelGroup.add(segment);
        }

        // --- Center Hub (decorative) ---
        const hubGeometry = new THREE.CylinderGeometry(0.3, 0.3, WHEEL_DEPTH, 32);
        hubGeometry.rotateX(Math.PI / 2);
        const hubMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0x444444,
            emissiveIntensity: 0.5
        });
        const hub = new THREE.Mesh(hubGeometry, hubMaterial);
        this.wheelGroup.add(hub);
    }

    /**
     * Creates a single 3D wedge segment with PBR material
     * @private
     */
    _createWedge3D(radius, innerRadius, startAngle, endAngle, color, isEmissive = false) {
        const group = new THREE.Group();

        // Create wedge shape for extrusion
        const shape = new THREE.Shape();
        const segments = 32;

        // Outer arc
        for (let i = 0; i <= segments; i++) {
            const angle = startAngle + (endAngle - startAngle) * (i / segments);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) {
                shape.moveTo(x, y);
            } else {
                shape.lineTo(x, y);
            }
        }

        // Inner arc (reverse)
        for (let i = segments; i >= 0; i--) {
            const angle = startAngle + (endAngle - startAngle) * (i / segments);
            const x = Math.cos(angle) * innerRadius;
            const y = Math.sin(angle) * innerRadius;
            shape.lineTo(x, y);
        }

        shape.closePath();

        // Extrude to create 3D geometry
        const extrudeSettings = {
            depth: WHEEL_DEPTH,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.02,
            bevelSegments: 2
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.center();

        // Create PBR material
        const material = this.visualEffects
            ? this.visualEffects.createWheelMaterial(color, isEmissive)
            : new THREE.MeshStandardMaterial({
                color,
                metalness: 0.3,
                roughness: 0.4,
            });

        const mesh = new THREE.Mesh(geometry, material);

        // Add edge highlights
        const edgeGeometry = new THREE.EdgesGeometry(geometry, 15);
        const edgeMaterial = new THREE.LineBasicMaterial({
            color: 0x000000,
            linewidth: 2,
            transparent: true,
            opacity: 0.3
        });
        const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);

        group.add(mesh);
        group.add(edges);

        return group;
    }

    /**
     * Create LED lights around the rim
     * @private
     */
    _createLEDRim() {
        const numLEDs = 48;
        const ledRadius = OUTER_RADIUS + 0.2;

        for (let i = 0; i < numLEDs; i++) {
            const angle = (i / numLEDs) * Math.PI * 2;

            // Alternate LED colors for carnival feel
            const color = i % 2 === 0 ? 0xff9900 : 0xff00ff;

            // Create small LED sphere
            const ledGeometry = new THREE.SphereGeometry(0.08, 8, 8);
            const ledMaterial = this.visualEffects
                ? this.visualEffects.createLEDMaterial(color)
                : new THREE.MeshStandardMaterial({
                    color,
                    emissive: new THREE.Color(color),
                    emissiveIntensity: 2.0,
                    metalness: 0.7,
                    roughness: 0.2
                });

            const led = new THREE.Mesh(ledGeometry, ledMaterial);
            led.position.set(
                Math.cos(angle) * ledRadius,
                Math.sin(angle) * ledRadius,
                0
            );

            this.wheelGroup.add(led);
            this.ledLights.push({ mesh: led, angle, baseIntensity: 2.0, phase: i });
        }
    }

    /**
     * Creates the 3D pointer arrow
     * @private
     */
    _createPointer() {
        // Create arrow shape
        const arrowShape = new THREE.Shape();
        const width = 0.25;
        const length = 1.0;
        const baseY = OUTER_RADIUS + 0.3;

        arrowShape.moveTo(0, baseY + length);
        arrowShape.lineTo(-width, baseY);
        arrowShape.lineTo(width, baseY);
        arrowShape.closePath();

        // Extrude to 3D
        const extrudeSettings = {
            depth: 0.2,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.05,
            bevelSegments: 2
        };

        const geometry = new THREE.ExtrudeGeometry(arrowShape, extrudeSettings);
        geometry.center();
        geometry.translate(0, baseY + length / 2, WHEEL_DEPTH / 2 + 0.2);

        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0xffff00,
            emissiveIntensity: 0.3
        });

        const pointer = new THREE.Mesh(geometry, material);

        // Add glow outline
        const edgeGeometry = new THREE.EdgesGeometry(geometry);
        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 3 });
        const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);

        this.pointerGroup.add(pointer);
        this.pointerGroup.add(edges);
        this.pointerGroup.position.z = 0.1;
    }

    /**
     * Update LED animation
     * @param {number} time - Current time for animation
     * @param {boolean} isSpinning - Whether wheel is currently spinning
     */
    updateLEDs(time, isSpinning = false) {
        this.ledLights.forEach((led, index) => {
            // Animated pulsing effect
            const speed = isSpinning ? 10 : 3;
            const pulse = Math.sin(time * speed + led.phase * 0.5) * 0.5 + 0.5;
            const intensity = led.baseIntensity * (0.5 + pulse * 0.5);

            if (led.mesh.material.emissiveIntensity !== undefined) {
                led.mesh.material.emissiveIntensity = intensity;
            }
        });
    }

    /**
     * Sets the rotation of the wheel
     * @param {number} angle - The rotation angle in radians
     */
    updateRotation(angle) {
        this.wheelGroup.rotation.z = angle;
    }

    /**
     * Calculates which segment is currently pointed at for a given ring
     * @param {number} currentAngle - The current rotation of the wheel in radians
     * @param {'inner' | 'outer'} ring - The ring to check
     * @returns {number} The index of the segment
     */
    getSegmentAtAngle(currentAngle, ring) {
        const numSegments = ring === 'inner' ? SEGMENTS_INNER : SEGMENTS_OUTER;
        const segmentAngle = (2 * Math.PI) / numSegments;

        // Pointer is at 12 o'clock (PI/2)
        const pointerAngle = Math.PI / 2;
        const effectiveAngle = pointerAngle - (currentAngle % (2 * Math.PI));

        // Normalize to [0, 2π]
        const normalizedAngle = (effectiveAngle % (2 * Math.PI) + (2 * Math.PI)) % (2 * Math.PI);

        const segmentIndex = Math.floor(normalizedAngle / segmentAngle) % numSegments;
        return segmentIndex;
    }

    /**
     * Gets the final winning segments for both rings with labels
     * @param {number} finalAngle - The final rotation angle in radians
     * @returns {{inner: {index: number, label: string}, outer: {index: number, label: string}}}
     */
    getOutcomes(finalAngle) {
        const innerIndex = this.getSegmentAtAngle(finalAngle, 'inner');
        const outerIndex = this.getSegmentAtAngle(finalAngle, 'outer');

        return {
            inner: {
                index: innerIndex,
                label: OUTCOMES_INNER[innerIndex],
                color: COLORS_INNER[innerIndex]
            },
            outer: {
                index: outerIndex,
                label: OUTCOMES_OUTER[outerIndex],
                color: COLORS_OUTER[outerIndex]
            }
        };
    }
}
