import * as THREE from 'three';
import { WHEEL_CONFIG } from '../config/WheelConfig.js';
import { TextureGenerator } from './TextureGenerator.js';

export class WheelRenderer {
  constructor(scene) {
    this.scene = scene;
    this.wheelGroup = new THREE.Group();
    this.pointerGroup = new THREE.Group();
    this.ledLights = [];
    
    this._buildWheel();
    this._buildRim();
    this._buildLEDs();
    this._buildPointer();
    
    this.scene.add(this.wheelGroup);
    this.scene.add(this.pointerGroup);
  }
  
  _buildWheel() {
    WHEEL_CONFIG.segments.forEach(ring => {
      const segmentAngle = (Math.PI * 2) / ring.labels.length;
      
      ring.labels.forEach((label, i) => {
        const segment = this._createSegment(
          ring.innerRadius,
          ring.outerRadius,
          i * segmentAngle,
          (i + 1) * segmentAngle,
          ring.colors[i]
        );
        this.wheelGroup.add(segment);
      });
    });
  }
  
  _createSegment(innerRadius, outerRadius, startAngle, endAngle, color) {
    const shape = new THREE.Shape();
    const segments = 32;
    
    // Outer arc
    for (let i = 0; i <= segments; i++) {
      const angle = startAngle + (endAngle - startAngle) * (i / segments);
      const x = Math.cos(angle) * outerRadius;
      const y = Math.sin(angle) * outerRadius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    
    // Inner arc (reverse)
    for (let i = segments; i >= 0; i--) {
      const angle = startAngle + (endAngle - startAngle) * (i / segments);
      const x = Math.cos(angle) * innerRadius;
      const y = Math.sin(angle) * innerRadius;
      shape.lineTo(x, y);
    }
    
    shape.closePath();
    
    const geometry = new THREE.ShapeGeometry(shape);
    const texture = TextureGenerator.createSegmentTexture(color);
    
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      color: color,
      roughness: WHEEL_CONFIG.materials.segments.roughness,
      metalness: WHEEL_CONFIG.materials.segments.metalness,
      emissive: new THREE.Color(color),
      emissiveIntensity: WHEEL_CONFIG.materials.segments.emissiveIntensity,
      side: THREE.DoubleSide
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // Add black border
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })
    );
    
    const group = new THREE.Group();
    group.add(mesh);
    group.add(line);
    
    return group;
  }
  
  _buildRim() {
    const rimShape = new THREE.Shape();
    rimShape.absarc(0, 0, WHEEL_CONFIG.radius, 0, Math.PI * 2, false);
    
    const holePath = new THREE.Path();
    holePath.absarc(0, 0, WHEEL_CONFIG.radius - WHEEL_CONFIG.rim.width, 0, Math.PI * 2, true);
    rimShape.holes.push(holePath);
    
    const geometry = new THREE.ShapeGeometry(rimShape);
    const texture = TextureGenerator.createRimTexture();
    
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      color: WHEEL_CONFIG.rim.color,
      metalness: WHEEL_CONFIG.rim.metalness,
      roughness: WHEEL_CONFIG.rim.roughness,
      emissive: new THREE.Color(WHEEL_CONFIG.rim.color),
      emissiveIntensity: WHEEL_CONFIG.rim.emissiveIntensity
    });
    
    const rim = new THREE.Mesh(geometry, material);
    rim.position.z = 0.05;
    this.wheelGroup.add(rim);
  }
  
  _buildLEDs() {
    const { count, radius, size, colors } = WHEEL_CONFIG.leds;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const color = colors[i % colors.length];
      
      const geometry = new THREE.SphereGeometry(size, 8, 8);
      const material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: new THREE.Color(color),
        emissiveIntensity: WHEEL_CONFIG.leds.emissiveIntensity,
        metalness: 0.8,
        roughness: 0.2
      });
      
      const led = new THREE.Mesh(geometry, material);
      led.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0.1
      );
      
      this.wheelGroup.add(led);
      this.ledLights.push({ mesh: led, phase: i, angle });
    }
  }
  
  _buildPointer() {
    const { length, width, color, position } = WHEEL_CONFIG.pointer;
    
    const shape = new THREE.Shape();
    shape.moveTo(0, length);
    shape.lineTo(-width / 2, 0);
    shape.lineTo(width / 2, 0);
    shape.closePath();
    
    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: new THREE.Color(color),
      emissiveIntensity: WHEEL_CONFIG.pointer.emissiveIntensity,
      side: THREE.DoubleSide
    });
    
    const pointer = new THREE.Mesh(geometry, material);
    pointer.position.set(position.x, position.y, position.z);
    
    this.pointerGroup.add(pointer);
  }
  
  updateRotation(angle) {
    this.wheelGroup.rotation.z = angle;
  }
  
  updateLEDs(time) {
    this.ledLights.forEach((led, i) => {
      const pulse = Math.sin(time * WHEEL_CONFIG.leds.pulseSpeed + led.phase) * 0.5 + 0.5;
      led.mesh.material.emissiveIntensity = WHEEL_CONFIG.leds.emissiveIntensity * (0.5 + pulse * 0.5);
    });
  }
}
