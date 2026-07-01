/**
 * AudioAnalyzer.js
 * Sets up Web Audio API to process a stream or audio buffer and extract amplitude.
 */
export class AudioAnalyzer {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.source = null;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);
    this.isInitialized = true;
  }

  /**
   * Connect an HTMLMediaElement (like <audio>) to the analyzer.
   */
  connectMediaElement(mediaElement) {
    if (!this.isInitialized) this.init();
    
    // Only connect once per element
    if (!mediaElement.sourceConnected) {
      this.source = this.audioContext.createMediaElementSource(mediaElement);
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      mediaElement.sourceConnected = true;
    }
    
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  getAmplitude() {
    if (!this.isInitialized || !this.analyser) return 0;
    this.analyser.getByteFrequencyData(this.dataArray);
    
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    const avg = sum / this.dataArray.length;
    // Normalize to 0-1 (max byte value is 255)
    return avg / 255;
  }

  dispose() {
    if (this.audioContext) {
      this.audioContext.close();
      this.isInitialized = false;
    }
  }
}
