import * as THREE from 'three';

// 2D wheel component rendered as flat geometry in Three.js
export class Wheel {
  constructor(scene, config = {}) {
    this.scene = scene;
    this.wheelGroup = new THREE.Group();
    this.ledLights = [];

    this.config = {
      segments: [
        { label: 'JavaScript', color: 0x3498db },
        { label: 'Python', color: 0x2ecc71 },
        { label: 'TypeScript', color: 0x9b59b6 },
        { label: 'React', color: 0xe74c3c },
        { label: 'Node.js', color: 0x1abc9c },
        { label: 'Go', color: 0x34495e },
        { label: 'Rust', color: 0xf39c12 },
        { label: 'Swift', color: 0x27ae60 },
      ],
      innerRadius: 0.0,
      outerRadius: 3.6,
      ledCount: 16,
      ledRadius: 3.7,
      ledSize: 0.08,
      ledColors: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff],
      pointerLength: 1.0,
      pointerWidth: 0.4,
      pointerColor: 0xff0000,
      pointerPosition: { x: 0, y: 3.8, z: 0.5 },
      ...config,
    };

    this._calculateSegmentBoundaries();
    this._buildWheel();
    this._buildSegmentPins();
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

  _buildSegmentPins() {
    this.segments.forEach((segment) => {
      const pinGeometry = new THREE.CylinderGeometry(0.02, 0.02, this.config.outerRadius, 8);
      const pinMaterial = new THREE.MeshLambertMaterial({
        color: 0xffd700,
        emissive: new THREE.Color(0xffd700).multiplyScalar(0.1),
      });

      const pin = new THREE.Mesh(pinGeometry, pinMaterial);
      const pinRadius = this.config.outerRadius / 2;

      pin.position.set(
        Math.cos(segment.endRad) * pinRadius,
        Math.sin(segment.endRad) * pinRadius,
        0.05,
      );
      pin.rotation.z = segment.endRad + Math.PI / 2;

      this.wheelGroup.add(pin);
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
    canvas.width = 512;
    canvas.height = 128;

    context.font = 'bold 48px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.strokeStyle = '#000000';
    context.lineWidth = 4;
    context.strokeText(text, canvas.width / 2, canvas.height / 2);
    context.fillStyle = '#FFFFFF';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: texture, transparent: true, alphaTest: 0.1 }),
    );

    const midAngle = (startAngle + endAngle) / 2;
    const midRadius = outerRadius / 2;
    sprite.position.set(Math.cos(midAngle) * midRadius, Math.sin(midAngle) * midRadius, 0.1);
    sprite.scale.set(1.5, 0.4, 1);
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

      const glowGeometry = new THREE.RingGeometry(ledSize * 1.5, ledSize * 2, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.set(Math.cos(angle) * ledRadius, Math.sin(angle) * ledRadius, 0.05);
      glow.rotation.z = angle;

      this.wheelGroup.add(led);
      this.wheelGroup.add(glow);
      this.ledLights.push({ mesh: led, glow: glow, phase: i, angle });
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
    this.ledLights.forEach((led) => {
      const pulse = Math.sin(time * 3.0 + led.phase) * 0.5 + 0.5;
      const intensity = 0.8 * (0.5 + pulse * 0.5);

      led.mesh.material.emissiveIntensity = intensity;
      if (led.glow) led.glow.material.opacity = 0.3 * (0.5 + pulse * 0.5);

      const hue = (time * 0.5 + led.phase * 0.1) % 1;
      const color = new THREE.Color().setHSL(hue, 1, 0.5);
      led.mesh.material.color = color;
      led.mesh.material.emissive = color;
    });
  }

  getCurrentSegment() {
    const pointerAngle = -Math.PI / 2;
    const wheelAngle = this.wheelGroup.rotation.z;

    for (const [index, segment] of this.segments.entries()) {
      const startAngle =
        (((segment.startRad + wheelAngle) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const endAngle =
        (((segment.endRad + wheelAngle) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

      let isInSegment = false;
      if (startAngle <= endAngle) {
        isInSegment = pointerAngle >= startAngle && pointerAngle < endAngle;
      } else {
        isInSegment = pointerAngle >= startAngle || pointerAngle < endAngle;
      }

      if (isInSegment) {
        return {
          index,
          label: segment.label,
          wheelAngle: wheelAngle,
          pointerAngle: pointerAngle,
          segmentStart: startAngle,
          segmentEnd: endAngle,
        };
      }
    }

    return {
      index: 0,
      label: this.segments[0].label,
      wheelAngle: wheelAngle,
      pointerAngle: pointerAngle,
      segmentStart: 0,
      segmentEnd: Math.PI / 4,
    };
  }
}
