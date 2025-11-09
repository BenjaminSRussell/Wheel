import * as THREE from "three";

import { WHEEL_CONFIG, SCENE_CONFIG } from "../config/appConfig.js";
import * as CONST from "./WheelConstants.js";

export class Wheel {
  constructor(scene, config = {}) {
    if (!scene) {
      throw new Error("Scene is required");
    }

    this.scene = scene;
    this.wheelGroup = new THREE.Group();
    this.ledLights = [];
    this.segmentMeshes = []; // Store segment meshes for hover effects
    this.hoveredSegmentIndex = -1; // Track which segment is hovered

    this.config = {
      ...WHEEL_CONFIG,
      ...config,
    };

    this._calculateSegmentBoundaries();
    this._buildWheel();
    this._buildLEDs();
    this._buildPointer();
    this._buildShadow();
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
    this.segments.forEach((segment, index) => {
      const segmentGroup = this._createSegment(
        this.config.innerRadius,
        this.config.outerRadius,
        segment.startRad,
        segment.endRad,
        segment.color,
        segment.label,
      );
      this.segmentMeshes.push({
        group: segmentGroup,
        mesh: segmentGroup.children[0],
        originalScale: 1.0,
        targetScale: 1.0,
      });
      this.wheelGroup.add(segmentGroup);
    });
  }

  _createSegment(innerRadius, outerRadius, startAngle, endAngle, color, label) {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);

    for (let i = 0; i <= CONST.SEGMENT_RESOLUTION; i++) {
      const angle = startAngle + (endAngle - startAngle) * (i / CONST.SEGMENT_RESOLUTION);
      shape.lineTo(
        Math.cos(angle) * outerRadius,
        Math.sin(angle) * outerRadius,
      );
    }
    shape.lineTo(0, 0);
    shape.closePath();

    const extrudeSettings = {
      depth: SCENE_CONFIG.wheelDepth,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.translate(0, 0, -SCENE_CONFIG.wheelDepth / 2);

    const material = new THREE.MeshLambertMaterial({
      color: color,
      emissive: new THREE.Color(color).multiplyScalar(CONST.EMISSIVE_MULTIPLIER),
    });

    const mesh = new THREE.Mesh(geometry, material);
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: CONST.EDGE_COLOR, linewidth: CONST.EDGE_LINE_WIDTH }),
    );

    const group = new THREE.Group();
    group.add(mesh);
    group.add(line);
    this._addTextLabel(
      group,
      label,
      startAngle,
      endAngle,
      innerRadius,
      outerRadius,
    );

    return group;
  }

  _addTextLabel(group, text, startAngle, endAngle, innerRadius, outerRadius) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = CONST.LABEL_CANVAS_WIDTH;
    canvas.height = CONST.LABEL_CANVAS_HEIGHT;

    context.font = 'bold 36px "Playfair Display", "Times New Roman", serif';
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.strokeStyle = "#000000";
    context.lineWidth = CONST.LABEL_LINE_WIDTH;
    context.strokeText(text, canvas.width / 2, canvas.height / 2);
    context.fillStyle = "#FFFFFF";
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        alphaTest: CONST.MATERIAL_ALPHA_TEST,
      }),
    );

    const midAngle = (startAngle + endAngle) / 2;
    const labelRadius = outerRadius * CONST.LABEL_RADIUS_RATIO;
    sprite.position.set(
      Math.cos(midAngle) * labelRadius,
      Math.sin(midAngle) * labelRadius,
      CONST.MATERIAL_DEPTH_TEST_OFFSET,
    );
    sprite.scale.set(CONST.SPRITE_SCALE_X, CONST.SPRITE_SCALE_Y, CONST.SPRITE_SCALE_Z);
    sprite.rotation.z = midAngle + Math.PI / 2;

    group.add(sprite);
  }

  _buildLEDs() {
    const { ledCount, ledRadius, ledSize, ledColors } = this.config;

    for (let i = 0; i < ledCount; i++) {
      const angle = (i / ledCount) * Math.PI * 2;
      const color = ledColors[i % ledColors.length];

      const geometry = new THREE.SphereGeometry(
        ledSize,
        CONST.LED_SPHERE_SEGMENTS_HORIZONTAL,
        CONST.LED_SPHERE_SEGMENTS_VERTICAL
      );
      const material = new THREE.MeshLambertMaterial({
        color: color,
        emissive: new THREE.Color(color),
        emissiveIntensity: CONST.LED_BASE_INTENSITY,
      });

      const led = new THREE.Mesh(geometry, material);
      led.position.set(
        Math.cos(angle) * ledRadius,
        Math.sin(angle) * ledRadius,
        CONST.MATERIAL_DEPTH_TEST_OFFSET,
      );

      this.wheelGroup.add(led);
      this.ledLights.push({ mesh: led, phase: i, angle });
    }
  }

  _buildPointer() {
    const { pointerLength, pointerWidth, pointerColor, pointerPosition } =
      this.config;

    const arrowShape = new THREE.Shape();
    const halfWidth = pointerWidth / 2;
    arrowShape.moveTo(0, 0);
    arrowShape.lineTo(-halfWidth, pointerLength);
    arrowShape.lineTo(halfWidth, pointerLength);
    arrowShape.lineTo(0, 0);

    const arrowGeometry = new THREE.ShapeGeometry(arrowShape);
    const arrowMaterial = new THREE.MeshLambertMaterial({
      color: pointerColor,
      emissive: new THREE.Color(pointerColor).multiplyScalar(CONST.POINTER_EMISSIVE_MULTIPLIER),
      side: THREE.DoubleSide,
    });

    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.position.set(0, 0, CONST.POINTER_Z_OFFSET);

    const pointerGroup = new THREE.Group();
    pointerGroup.add(arrow);
    pointerGroup.position.set(
      pointerPosition.x,
      pointerPosition.y,
      pointerPosition.z,
    );

    this.scene.add(pointerGroup);
    this.pointer = pointerGroup;
  }

  _buildShadow() {
    const shadowGeometry = new THREE.CircleGeometry(this.config.outerRadius * 1.1, 64);
    const shadowMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      opacity: 0.3,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadow.position.set(0, -0.5, -SCENE_CONFIG.wheelDepth / 2 - 0.1);
    shadow.rotation.x = -Math.PI / 2;

    this.scene.add(shadow);
    this.shadow = shadow;
  }

  updateRotation(angle) {
    this.wheelGroup.rotation.z = angle;
  }

  updateLEDs(time, velocity = 0) {
    const normalizedVelocity = Math.min(Math.abs(velocity) / 25, 1.0);
    const chaseOffset = time * normalizedVelocity * 10;
    const velocityBoost = normalizedVelocity * 0.5;

    this.ledLights.forEach((led, index) => {
      const phase = (index / this.ledLights.length) * Math.PI * 2;
      const pulse = Math.sin(time * CONST.LED_PULSE_SPEED_MULTIPLIER + phase + chaseOffset) * CONST.LED_PULSE_AMOUNT + CONST.LED_BASE_INTENSITY;
      led.mesh.material.emissiveIntensity = Math.min(pulse + velocityBoost, 2.0);
    });
  }

  /**
   * Determines which segment is currently under the pointer
   * @returns {Object} Segment information including index, label, color, and angles
   */
  getCurrentSegment() {
    const pointerAngle = CONST.POINTER_ANGLE_RAD;
    const wheelAngle = this.wheelGroup.rotation.z;
    const twoPi = 2 * Math.PI;

    for (const [index, segment] of this.segments.entries()) {
      const startAngle =
        (((segment.startRad + wheelAngle) % twoPi) + twoPi) % twoPi;
      const endAngle =
        (((segment.endRad + wheelAngle) % twoPi) + twoPi) % twoPi;

      const isInSegment =
        startAngle <= endAngle
          ? pointerAngle >= startAngle && pointerAngle < endAngle
          : pointerAngle >= startAngle || pointerAngle < endAngle;

      if (isInSegment) {
        return {
          index,
          label: segment.label,
          color: segment.color,
          wheelAngle,
          pointerAngle,
          segmentStart: startAngle,
          segmentEnd: endAngle,
        };
      }
    }

    return {
      index: 0,
      label: this.segments[0]?.label ?? "Unknown",
      color: this.segments[0]?.color ?? CONST.EDGE_COLOR,
      wheelAngle,
      pointerAngle,
      segmentStart: 0,
      segmentEnd: CONST.FALLBACK_SEGMENT_ANGLE,
    };
  }

  /**
   * Set which segment is hovered (or -1 for none)
   * @param {number} segmentIndex - Index of hovered segment, or -1 for none
   */
  setHoveredSegment(segmentIndex) {
    if (segmentIndex === this.hoveredSegmentIndex) {
      return;
    }

    if (this.hoveredSegmentIndex >= 0 && this.hoveredSegmentIndex < this.segmentMeshes.length) {
      this.segmentMeshes[this.hoveredSegmentIndex].targetScale = 1.0;
      const mesh = this.segmentMeshes[this.hoveredSegmentIndex].mesh;
      if (mesh && mesh.material) {
        mesh.material.emissive.multiplyScalar(0.1 / Math.max(mesh.material.emissive.r, mesh.material.emissive.g, mesh.material.emissive.b, 0.1));
      }
    }

    this.hoveredSegmentIndex = segmentIndex;

    if (segmentIndex >= 0 && segmentIndex < this.segmentMeshes.length) {
      this.segmentMeshes[segmentIndex].targetScale = 1.05;
      const mesh = this.segmentMeshes[segmentIndex].mesh;
      if (mesh && mesh.material) {
        mesh.material.emissive.multiplyScalar(3.0);
      }
    }
  }

  updateHoverEffects() {
    this.segmentMeshes.forEach((segmentData) => {
      const currentScale = segmentData.group.scale.x;
      const newScale = currentScale + (segmentData.targetScale - currentScale) * 0.15;
      segmentData.group.scale.set(newScale, newScale, 1);
    });
  }
}
