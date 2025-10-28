import * as THREE from 'three';

import { APP_CONFIG, WHEEL_CONFIG } from '../config/appConfig.js';

export class Wheel {
  constructor(scene, config = {}) {
    if (!scene) {
      throw new Error('Scene is required');
    }

    this.scene = scene;
    this.wheelGroup = new THREE.Group();
    this.ledLights = [];

    this.config = {
      ...WHEEL_CONFIG,
      ...config,
    };

    this._calculateSegmentBoundaries();
    this._buildWheel();
    this._buildLEDs();
    this._buildPointer();
    this.scene.add(this.wheelGroup);
  }

  _calculateSegmentBoundaries() {
    const segmentAngle = (2 * Math.PI) / this.config.segments.length;
    this.segments = this.config.segments.map((segment, index) => ({
      ...segment,
      startRad: index * segmentAngle,
      endRad: (index + 1) * segmentAngle,
    }));
  }

  _buildWheel() {
    this.segments.forEach((segment) => {
      const segmentMesh = this._createSegment(
        this.config.innerRadius,
        this.config.outerRadius,
        segment.startRad,
        segment.endRad,
        segment.color,
        segment.label,
      );
      this.wheelGroup.add(segmentMesh);
    });
  }

  _createSegment(innerRadius, outerRadius, startAngle, endAngle, color, label) {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);

    for (let i = 0; i <= 32; i++) {
      const angle = startAngle + (endAngle - startAngle) * (i / 32);
      shape.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
    }
    shape.lineTo(0, 0);
    shape.closePath();

    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshLambertMaterial({
      color: color,
      side: THREE.DoubleSide,
      emissive: new THREE.Color(color).multiplyScalar(0.1),
    });

    const mesh = new THREE.Mesh(geometry, material);
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0xffd700, linewidth: 3 }),
    );

    const group = new THREE.Group();
    group.add(mesh);
    group.add(line);
    this._addTextLabel(group, label, startAngle, endAngle, innerRadius, outerRadius);

    return group;
  }

  _addTextLabel(group, text, startAngle, endAngle, innerRadius, outerRadius) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;

    context.font = 'bold 36px "Playfair Display", "Times New Roman", serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.strokeStyle = '#000000';
    context.lineWidth = 3;
    context.strokeText(text, canvas.width / 2, canvas.height / 2);
    context.fillStyle = '#FFFFFF';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: texture, transparent: true, alphaTest: 0.1 }),
    );

    const midAngle = (startAngle + endAngle) / 2;
    const labelRadius = outerRadius * 0.8;
    sprite.position.set(Math.cos(midAngle) * labelRadius, Math.sin(midAngle) * labelRadius, 0.1);
    sprite.scale.set(1.0, 0.3, 1);
    sprite.rotation.z = midAngle + Math.PI / 2;

    group.add(sprite);
  }

  _buildLEDs() {
    const { ledCount, ledRadius, ledSize, ledColors } = this.config;

    for (let i = 0; i < ledCount; i++) {
      const angle = (i / ledCount) * Math.PI * 2;
      const color = ledColors[i % ledColors.length];

      const geometry = new THREE.SphereGeometry(ledSize, 12, 12);
      const material = new THREE.MeshLambertMaterial({
        color: color,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.8,
      });

      const led = new THREE.Mesh(geometry, material);
      led.position.set(Math.cos(angle) * ledRadius, Math.sin(angle) * ledRadius, 0.1);

      this.wheelGroup.add(led);
      this.ledLights.push({ mesh: led, phase: i, angle });
    }
  }

  _buildPointer() {
    const { pointerLength, pointerWidth, pointerColor, pointerPosition } = this.config;

    const arrowShape = new THREE.Shape();
    const halfWidth = pointerWidth / 2;
    arrowShape.moveTo(0, 0);
    arrowShape.lineTo(-halfWidth, pointerLength);
    arrowShape.lineTo(halfWidth, pointerLength);
    arrowShape.lineTo(0, 0);

    const arrowGeometry = new THREE.ShapeGeometry(arrowShape);
    const arrowMaterial = new THREE.MeshLambertMaterial({
      color: pointerColor,
      emissive: new THREE.Color(pointerColor).multiplyScalar(0.2),
      side: THREE.DoubleSide,
    });

    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.position.set(0, 0, 0.1);

    const pointerGroup = new THREE.Group();
    pointerGroup.add(arrow);
    pointerGroup.position.set(pointerPosition.x, pointerPosition.y, pointerPosition.z);

    this.scene.add(pointerGroup);
    this.pointer = pointerGroup;
  }

  updateRotation(angle) {
    this.wheelGroup.rotation.z = angle;
  }

  updateLEDs(time) {
    const { ledPulseSpeed, ledIntensityBase } = APP_CONFIG.animation;
    const pulseFactor = 0.5;
    const colorShiftSpeed = 0.5;
    const phaseFactor = 0.1;

    this.ledLights.forEach((led) => {
      const pulse = Math.sin(time * ledPulseSpeed + led.phase) * pulseFactor + pulseFactor;
      const intensity = ledIntensityBase * (pulseFactor + pulse * pulseFactor);

      led.mesh.material.emissiveIntensity = intensity;

      const hue = (time * colorShiftSpeed + led.phase * phaseFactor) % 1;
      const color = new THREE.Color().setHSL(hue, 1, 0.5);
      led.mesh.material.color = color;
      led.mesh.material.emissive = color;
    });
  }

  getCurrentSegment() {
    const pointerAngle = -Math.PI / 2;
    const wheelAngle = this.wheelGroup.rotation.z;
    const twoPi = 2 * Math.PI;

    for (const [index, segment] of this.segments.entries()) {
      const startAngle = ((segment.startRad + wheelAngle) % twoPi + twoPi) % twoPi;
      const endAngle = ((segment.endRad + wheelAngle) % twoPi + twoPi) % twoPi;

      const isInSegment =
        startAngle <= endAngle
          ? pointerAngle >= startAngle && pointerAngle < endAngle
          : pointerAngle >= startAngle || pointerAngle < endAngle;

      if (isInSegment) {
        return {
          index,
          label: segment.label,
          wheelAngle,
          pointerAngle,
          segmentStart: startAngle,
          segmentEnd: endAngle,
        };
      }
    }

    return {
      index: 0,
      label: this.segments[0]?.label ?? 'Unknown',
      wheelAngle,
      pointerAngle,
      segmentStart: 0,
      segmentEnd: Math.PI / 4,
    };
  }
}
