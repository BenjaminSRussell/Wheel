import * as THREE from 'three';

// Wheel configuration
const INNER_RADIUS = 2.5;
const OUTER_RADIUS = 4;
const WHEEL_DEPTH = 0.3;
const SEGMENTS_INNER = 8;
const SEGMENTS_OUTER = 12;

const COLORS_INNER = [0xff6347, 0x4682b4, 0x3cb371, 0xffd700, 0x9370db, 0xfa8072, 0x00ced1, 0xff4500];
const COLORS_OUTER = [0xe6194b, 0x3cb44b, 0xffe119, 0x4363d8, 0xf58231, 0x911eb4, 0x46f0f0, 0xf032e6, 0xbcf60c, 0xfabebe, 0x008080, 0xe6beff];

const OUTCOMES_INNER = ['Dance', 'Sing', 'Act', 'Draw', 'Jump', 'Spin', 'Laugh', 'Clap'];
const OUTCOMES_OUTER = ['Movie', 'Music', 'Sports', 'Food', 'Travel', 'Games', 'Books', 'Art', 'Science', 'History', 'Nature', 'Tech'];

export class Wheel {
    constructor(visualEffects = null) {
        this.visualEffects = visualEffects;
        this.wheelGroup = new THREE.Group();
        this.pointerGroup = new THREE.Group();
        this.ledLights = [];
        this.isModelLoaded = false;

        console.log('Creating carnival wheel...');
        this._createWheel();
        this._createLEDRim();
        this._createPointer();
        console.log('Carnival wheel created successfully');
    }

    _createWheel() {
        // Create wheel segments
        this._createWheelSegments();
        
        // Create center hub
        this._createCenterHub();
        
        this.isModelLoaded = true;
    }

    _createWheelSegments() {
        // Outer ring segments
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

        // Inner ring segments
        const innerSegmentAngle = (2 * Math.PI) / SEGMENTS_INNER;
        for (let i = 0; i < SEGMENTS_INNER; i++) {
            const startAngle = i * innerSegmentAngle;
            const endAngle = startAngle + innerSegmentAngle;
            const segment = this._createWedge3D(
                INNER_RADIUS,
                0.5,
                startAngle,
                endAngle,
                COLORS_INNER[i],
                false
            );
            this.wheelGroup.add(segment);
        }
    }

    _createCenterHub() {
        const hubGeometry = new THREE.CylinderGeometry(0.5, 0.5, WHEEL_DEPTH + 0.2, 32);
        hubGeometry.rotateX(Math.PI / 2);
        const hubMaterial = new THREE.MeshToonMaterial({
            color: 0x2F1B14,
            emissive: 0x1A0F0A,
            emissiveIntensity: 0.3
        });
        const hub = new THREE.Mesh(hubGeometry, hubMaterial);
        this.wheelGroup.add(hub);

        const centerGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const centerMaterial = new THREE.MeshToonMaterial({
            color: 0xFFD700,
            emissive: 0xFFA500,
            emissiveIntensity: 0.5
        });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.position.z = WHEEL_DEPTH / 2 + 0.1;
        this.wheelGroup.add(center);
    }

    _createWedge3D(radius, innerRadius, startAngle, endAngle, color, isEmissive = false) {
        const group = new THREE.Group();
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

        // Inner arc
        for (let i = segments; i >= 0; i--) {
            const angle = startAngle + (endAngle - startAngle) * (i / segments);
            const x = Math.cos(angle) * innerRadius;
            const y = Math.sin(angle) * innerRadius;
            shape.lineTo(x, y);
        }

        shape.closePath();

        const extrudeSettings = {
            depth: WHEEL_DEPTH,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.02,
            bevelSegments: 2
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.center();

        const material = this.visualEffects
            ? this.visualEffects.createWheelMaterial(color, isEmissive)
            : new THREE.MeshToonMaterial({
                color,
                transparent: false,
                side: THREE.DoubleSide
            });

        const mesh = new THREE.Mesh(geometry, material);

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

    _createLEDRim() {
        const numLEDs = 48;
        const ledRadius = OUTER_RADIUS + 0.3;

        for (let i = 0; i < numLEDs; i++) {
            const angle = (i / numLEDs) * Math.PI * 2;
            const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
            const color = colors[i % colors.length];

            const ledGeometry = new THREE.SphereGeometry(0.08, 8, 8);
            const ledMaterial = this.visualEffects
                ? this.visualEffects.createLEDMaterial(color)
                : new THREE.MeshToonMaterial({
                    color,
                    emissive: new THREE.Color(color),
                    emissiveIntensity: 2.0,
                    transparent: true,
                    opacity: 0.9
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

    _createPointer() {
        const arrowShape = new THREE.Shape();
        const width = 0.3;
        const length = 1.0;
        const baseY = OUTER_RADIUS + 0.3;

        arrowShape.moveTo(0, baseY + length);
        arrowShape.lineTo(-width, baseY);
        arrowShape.lineTo(width, baseY);
        arrowShape.closePath();

        const extrudeSettings = {
            depth: 0.15,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.03,
            bevelSegments: 2
        };

        const geometry = new THREE.ExtrudeGeometry(arrowShape, extrudeSettings);
        geometry.center();
        geometry.translate(0, baseY + length / 2, WHEEL_DEPTH / 2 + 0.2);

        const material = new THREE.MeshToonMaterial({
            color: 0xff0000,
            emissive: 0xff4444,
            emissiveIntensity: 0.6
        });

        const pointer = new THREE.Mesh(geometry, material);

        const edgeGeometry = new THREE.EdgesGeometry(geometry);
        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
        const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);

        this.pointerGroup.add(pointer);
        this.pointerGroup.add(edges);
        this.pointerGroup.position.z = 0.1;
    }

    updateLEDs(time, isSpinning = false) {
        this.ledLights.forEach((led, index) => {
            const speed = isSpinning ? 10 : 3;
            const pulse = Math.sin(time * speed + led.phase * 0.5) * 0.5 + 0.5;
            const intensity = led.baseIntensity * (0.5 + pulse * 0.5);

            if (led.mesh.material.emissiveIntensity !== undefined) {
                led.mesh.material.emissiveIntensity = intensity;
            }
        });
    }

    updateRotation(angle) {
        this.wheelGroup.rotation.z = angle;
        console.log('Wheel rotation updated to:', angle);
    }

    getSegmentAtAngle(currentAngle, ring) {
        const numSegments = ring === 'inner' ? SEGMENTS_INNER : SEGMENTS_OUTER;
        const segmentAngle = (2 * Math.PI) / numSegments;

        const pointerAngle = Math.PI / 2;
        const effectiveAngle = pointerAngle - (currentAngle % (2 * Math.PI));
        const normalizedAngle = (effectiveAngle % (2 * Math.PI) + (2 * Math.PI)) % (2 * Math.PI);

        const segmentIndex = Math.floor(normalizedAngle / segmentAngle) % numSegments;
        return segmentIndex;
    }

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