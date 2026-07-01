/**
 * AvatarEngine.js
 * Handles the low-level HTML5 Canvas rendering of the avatar image.
 * Provides methods to draw the image with various transformations (head tilt, jaw drop, blinking).
 */
export class AvatarEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.image = new Image();
    this.imageLoaded = false;

    // Load the image
    this.image.src = '/avatar.png';
    this.image.onload = () => {
      this.imageLoaded = true;
    };
  }

  /**
   * Clears the canvas.
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Render the avatar with specific state parameters.
   * @param {Object} state - The current animation state.
   * @param {number} state.headTiltX - Horizontal head sway (-1 to 1)
   * @param {number} state.headTiltY - Vertical head sway (-1 to 1)
   * @param {number} state.eyeOpenness - Eye open state (0 = closed, 1 = open)
   * @param {number} state.jawDrop - Jaw drop for speaking (0 = closed, 1 = max open)
   * @param {number} state.smile - Smile amount (0 to 1)
   */
  render(state) {
    if (!this.imageLoaded) return;

    this.clear();
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // Calculate aspect-ratio preserving dimensions
    const imgAspect = this.image.width / this.image.height;
    const canvasAspect = w / h;
    
    let drawW = w;
    let drawH = h;
    let offsetX = 0;
    let offsetY = 0;
    
    // Cover mode: fill the canvas
    if (imgAspect > canvasAspect) {
      drawW = h * imgAspect;
      offsetX = (w - drawW) / 2;
    } else {
      drawH = w / imgAspect;
      offsetY = (h - drawH) / 2;
    }
    
    this.ctx.save();
    
    // Move to center of canvas for scaling/rotation
    this.ctx.translate(w / 2, h / 2);
    
    // 1. Idle Head Sway
    const maxRotation = (2 * Math.PI) / 180;
    this.ctx.rotate(state.headTiltX * maxRotation);
    
    // 2. Idle Breathing (Subtle vertical stretch)
    const breathingScale = 1.0 + (state.headTiltY * 0.015);
    
    // 3. Audio / Talking Reactivity
    // Instead of cutting the jaw, we pulse the entire avatar organically with the audio.
    // It gives a "speaking" energy without distorting or slicing the photo.
    const speechScaleY = 1.0 + (state.jawDrop * 0.03); // max 3% vertical stretch when loud
    const speechScaleX = 1.0 - (state.jawDrop * 0.01); // slight horizontal squeeze
    
    // 4. Simulated "Blink" / Micro-expression
    // A rapid, very subtle overall vertical squash mimics a blink or head twitch organically
    let blinkScale = 1.0;
    if (state.eyeOpenness < 0.99) {
       // eyeOpenness drops to ~0.01 during a blink. We map that to a 1-2% global vertical squash.
       blinkScale = 0.98 + (state.eyeOpenness * 0.02);
    }

    // Apply combined scales
    this.ctx.scale(speechScaleX, breathingScale * speechScaleY * blinkScale);
    
    // Move back to draw image from top-left
    this.ctx.translate(-w / 2, -h / 2);

    // Draw the full image intact, never sliced or cut
    this.ctx.drawImage(this.image, offsetX, offsetY, drawW, drawH);

    this.ctx.restore();
  }
}
