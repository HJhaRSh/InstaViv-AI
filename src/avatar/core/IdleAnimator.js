/**
 * IdleAnimator.js
 * Generates continuous smooth noise for idle movements (breathing, blinking, head sway).
 */
export class IdleAnimator {
  constructor() {
    this.time = 0;
    this.lastBlinkTime = 0;
    this.nextBlinkInterval = 4000; // Random between 3-6s
    this.isBlinking = false;
    this.blinkProgress = 0; // 0 to 1
  }

  update(deltaTime) {
    this.time += deltaTime * 0.001;

    // Head Sway (sine waves with different frequencies)
    const swayX = Math.sin(this.time * 0.5) * Math.cos(this.time * 0.3) * 0.5;
    const swayY = Math.sin(this.time * 0.8) * 0.8;

    // Breathing (slow sine)
    const breath = Math.sin(this.time * 1.5);

    // Blinking logic
    let eyeOpenness = 1.0;
    if (this.isBlinking) {
      this.blinkProgress += deltaTime * 0.008; // Fast blink
      if (this.blinkProgress >= Math.PI) {
        this.isBlinking = false;
        this.blinkProgress = 0;
        this.lastBlinkTime = performance.now();
        this.nextBlinkInterval = 3000 + Math.random() * 3000; // 3 to 6 seconds
      } else {
        // Dip eye openness using a sine curve (1 -> 0 -> 1)
        eyeOpenness = 1.0 - Math.sin(this.blinkProgress);
      }
    } else {
      if (performance.now() - this.lastBlinkTime > this.nextBlinkInterval) {
        this.isBlinking = true;
      }
    }

    return {
      headTiltX: swayX,
      headTiltY: breath,
      eyeOpenness: eyeOpenness,
      smile: 0.1 // Default subtle smile
    };
  }
}
