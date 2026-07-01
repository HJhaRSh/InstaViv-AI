/**
 * LipSync.js
 * Takes raw audio amplitude and calculates a smooth jaw drop value.
 */
export class LipSync {
  constructor() {
    this.currentJawDrop = 0;
  }

  update(amplitude) {
    // Basic thresholding and amplification
    let rawJaw = amplitude * 2.5; 
    
    // Clamp between 0 and 1
    rawJaw = Math.max(0, Math.min(1, rawJaw));

    // Simple smoothing to prevent jitter
    this.currentJawDrop += (rawJaw - this.currentJawDrop) * 0.3;

    return {
      jawDrop: this.currentJawDrop
    };
  }
}
