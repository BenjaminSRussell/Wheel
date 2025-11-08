/**
 * AudioManager for spinning wheel sound effects
 * Uses Web Audio API to generate procedural sounds (no audio files needed)
 */

export class AudioManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.masterVolume = 0.3; // 30% volume by default

    // Initialize on first user interaction (required by browsers)
    this.initialized = false;
  }

  /**
   * Initialize audio context (must be called after user gesture)
   */
  init() {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      this.enabled = false;
    }
  }

  /**
   * Play click sound (button press)
   */
  playClick() {
    if (!this.enabled || !this.initialized) return;

    const ctx = this.audioContext;
    const currentTime = ctx.currentTime;

    // Create a short "pop" sound
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(800, currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, currentTime + 0.1);

    gainNode.gain.setValueAtTime(this.masterVolume * 0.5, currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.1);

    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.1);
  }

  /**
   * Play whoosh sound (spin start)
   */
  playWhoosh() {
    if (!this.enabled || !this.initialized) return;

    const ctx = this.audioContext;
    const currentTime = ctx.currentTime;

    // Create noise-based whoosh
    const bufferSize = ctx.sampleRate * 0.5; // 0.5 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate white noise that fades
    for (let i = 0; i < bufferSize; i++) {
      const fade = 1 - i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * fade;
    }

    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();

    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Sweep filter for whoosh effect
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(200, currentTime);
    filter.frequency.exponentialRampToValueAtTime(2000, currentTime + 0.5);

    gainNode.gain.setValueAtTime(this.masterVolume * 0.4, currentTime);

    source.start(currentTime);
  }

  /**
   * Play tick sound (wheel slowing down)
   * @param {number} pitch - Frequency multiplier (higher = higher pitch)
   */
  playTick(pitch = 1.0) {
    if (!this.enabled || !this.initialized) return;

    const ctx = this.audioContext;
    const currentTime = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(150 * pitch, currentTime);
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(this.masterVolume * 0.2, currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.05);

    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.05);
  }

  /**
   * Play fanfare sound (winner announcement)
   */
  playFanfare() {
    if (!this.enabled || !this.initialized) return;

    const ctx = this.audioContext;
    const currentTime = ctx.currentTime;

    // Play ascending chord
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(freq, currentTime + index * 0.1);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, currentTime + index * 0.1);
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.3, currentTime + index * 0.1 + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + index * 0.1 + 0.5);

      oscillator.start(currentTime + index * 0.1);
      oscillator.stop(currentTime + index * 0.1 + 0.5);
    });
  }

  /**
   * Set master volume
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Toggle audio on/off
   */
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}
