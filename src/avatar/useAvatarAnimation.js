import { useEffect, useRef, useState } from 'react';
import { AvatarEngine } from './core/AvatarEngine';
import { AvatarStateMachine } from './core/AvatarStateMachine';
import { IdleAnimator } from './core/IdleAnimator';
import { LipSync } from './core/LipSync';
import { AudioAnalyzer } from './core/AudioAnalyzer';

export function useAvatarAnimation(avatarState, audioElementRef) {
  const canvasRef = useRef(null);
  
  // Core classes
  const engineRef = useRef(null);
  const stateMachineRef = useRef(new AvatarStateMachine());
  const idleAnimatorRef = useRef(new IdleAnimator());
  const lipSyncRef = useRef(new LipSync());
  const audioAnalyzerRef = useRef(new AudioAnalyzer());
  
  const animationFrameId = useRef(null);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    stateMachineRef.current.setState(avatarState);
  }, [avatarState]);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (!engineRef.current) {
      engineRef.current = new AvatarEngine(canvasRef.current);
    }

    const renderLoop = (time) => {
      const deltaTime = time - lastTime.current;
      lastTime.current = time;

      // Update Audio Analyzer if talking
      let amplitude = 0;
      if (stateMachineRef.current.currentState === 'TALKING' && audioElementRef.current) {
        // Ensure connected
        audioAnalyzerRef.current.connectMediaElement(audioElementRef.current);
        amplitude = audioAnalyzerRef.current.getAmplitude();
      }

      // Update subsystems
      const idleData = idleAnimatorRef.current.update(deltaTime);
      const lipSyncData = lipSyncRef.current.update(amplitude);
      
      // Compute final state
      const renderState = stateMachineRef.current.update(deltaTime, idleData, lipSyncData);

      // Render
      engineRef.current.render(renderState);

      animationFrameId.current = requestAnimationFrame(renderLoop);
    };

    animationFrameId.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [audioElementRef]);

  return { canvasRef };
}
