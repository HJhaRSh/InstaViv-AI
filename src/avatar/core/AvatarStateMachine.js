/**
 * AvatarStateMachine.js
 * Manages the high-level states (IDLE, LISTENING, THINKING, TALKING) and smooth interpolation.
 */
export class AvatarStateMachine {
  constructor() {
    this.currentState = 'IDLE';
    this.targetJawDrop = 0;
    this.currentJawDrop = 0;
    this.targetSmile = 0.1;
    this.currentSmile = 0.1;
  }

  setState(newState) {
    if (this.currentState !== newState) {
      this.currentState = newState;
    }
  }

  update(deltaTime, idleData, lipSyncData) {
    // Determine targets based on state
    let targetJaw = 0;
    let targetSmile = idleData.smile;
    let eyeModifier = 1.0;
    let headX = idleData.headTiltX;
    let headY = idleData.headTiltY;

    switch (this.currentState) {
      case 'LISTENING':
        targetSmile = 0.3; // Tiny smile
        headY -= 0.5; // Slight head tilt up/back
        eyeModifier = 1.1; // Slightly wide eyes
        break;
      case 'THINKING':
        targetSmile = 0.0; // Serious/calm
        headY -= 0.2;
        headX += 0.5; // Looking away slightly
        break;
      case 'TALKING':
        targetJaw = lipSyncData.jawDrop;
        targetSmile = 0.2;
        break;
      case 'IDLE':
      default:
        // Use idle defaults
        break;
    }

    // Smooth interpolation (easing)
    const lerpSpeed = 0.15;
    this.currentJawDrop += (targetJaw - this.currentJawDrop) * lerpSpeed;
    this.currentSmile += (targetSmile - this.currentSmile) * lerpSpeed;

    return {
      headTiltX: headX,
      headTiltY: headY,
      eyeOpenness: Math.min(1.0, idleData.eyeOpenness * eyeModifier),
      jawDrop: this.currentJawDrop,
      smile: this.currentSmile
    };
  }
}
