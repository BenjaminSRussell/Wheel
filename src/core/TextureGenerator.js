import * as THREE from 'three';

export class TextureGenerator {
  /**
   * Create radial gradient texture for wheel segments
   * @param {number} baseColor - Hex color
   * @param {number} size - Canvas size (power of 2)
   */
  static createSegmentTexture(baseColor, size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Convert hex to RGB
    const r = (baseColor >> 16) & 255;
    const g = (baseColor >> 8) & 255;
    const b = baseColor & 255;
    
    // Radial gradient (bright outside, dark inside)
    const gradient = ctx.createRadialGradient(
      size / 2, size / 2, size * 0.1,
      size / 2, size / 2, size * 0.5
    );
    
    gradient.addColorStop(0, `rgba(${r * 0.7}, ${g * 0.7}, ${b * 0.7}, 1)`);
    gradient.addColorStop(0.6, `rgb(${r}, ${g}, ${b})`);
    gradient.addColorStop(1, `rgba(${r * 1.2}, ${g * 1.2}, ${b * 1.2}, 1)`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Add subtle noise
    this._addNoise(ctx, size);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }
  
  static _addNoise(ctx, size) {
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 10;
      data[i] += noise;
      data[i + 1] += noise;
      data[i + 2] += noise;
    }
    
    ctx.putImageData(imageData, 0, 0);
  }
  
  /**
   * Create metallic rim texture
   */
  static createRimTexture(size = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Gold metallic gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#FFD700');
    gradient.addColorStop(0.5, '#FFA500');
    gradient.addColorStop(1, '#FFD700');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Brushed metal effect
    for (let i = 0; i < size; i += 2) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }
}
