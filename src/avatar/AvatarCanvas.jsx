import React, { useRef, useEffect } from 'react';
import './styles/avatar.css';

export function AvatarCanvas({ avatarState }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // CSS classes based on state for glow effects
  let stateClass = '';
  if (avatarState === 'LISTENING') stateClass = 'avatar-state-listening';
  if (avatarState === 'THINKING') stateClass = 'avatar-state-thinking';

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let animationFrameId;

    const processFrame = () => {
      // Always draw the current frame to the canvas, even if paused, 
      // so the avatar doesn't disappear when idle!
      
      // Match canvas size to video resolution
      if (canvas.width !== video.videoWidth && video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      if (video.videoWidth > 0) {
        // Draw current video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get pixel data
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = frame.data;
        const width = canvas.width;
        const height = canvas.height;
        const pixelCount = width * height;

        // Allocate reusable arrays on the window object to avoid GC pauses at 60fps
        if (!window.avatarFloodVisited || window.avatarFloodVisited.length !== pixelCount) {
           window.avatarFloodVisited = new Uint8Array(pixelCount);
           window.avatarFloodStackX = new Int32Array(pixelCount * 4); // safely large stack
           window.avatarFloodStackY = new Int32Array(pixelCount * 4);
        }
        
        const visited = window.avatarFloodVisited;
        const stackX = window.avatarFloodStackX;
        const stackY = window.avatarFloodStackY;
        
        // Fast reset for Uint8Array
        visited.fill(0); 
        
        let stackPtr = 0;
        
        // Seed the flood fill from the top edge and the top half of the side edges.
        // We strictly DO NOT seed from the bottom edge or lower sides, 
        // because his dark suit touches the bottom and we don't want the flood fill to start inside it!
        for (let x = 0; x < width; x++) {
           stackX[stackPtr] = x; stackY[stackPtr] = 0; stackPtr++; // Entire top edge
        }
        
        const halfHeight = Math.floor(height / 2);
        for (let y = 0; y < halfHeight; y++) {
           stackX[stackPtr] = 0; stackY[stackPtr] = y; stackPtr++; // Top half of left edge
           stackX[stackPtr] = width - 1; stackY[stackPtr] = y; stackPtr++; // Top half of right edge
        }
        
        const threshold = 22; // Strict threshold for pitch black
        
        // BFS Flood Fill
        while (stackPtr > 0) {
           stackPtr--;
           const y = stackY[stackPtr];
           const x = stackX[stackPtr];
           
           if (x < 0 || x >= width || y < 0 || y >= height) continue;
           
           const idx = y * width + x;
           if (visited[idx]) continue;
           visited[idx] = 1;
           
           const dataIdx = idx * 4;
           const r = data[dataIdx];
           const g = data[dataIdx + 1];
           const b = data[dataIdx + 2];
           
           const brightness = Math.max(r, g, b);
           
           if (brightness < threshold) {
              data[dataIdx + 3] = 0; // Make transparent
              
              // Push neighbors to stack
              stackX[stackPtr] = x + 1; stackY[stackPtr] = y; stackPtr++;
              stackX[stackPtr] = x - 1; stackY[stackPtr] = y; stackPtr++;
              stackX[stackPtr] = x; stackY[stackPtr] = y + 1; stackPtr++;
              stackX[stackPtr] = x; stackY[stackPtr] = y - 1; stackPtr++;
           }
        }
        
        ctx.putImageData(frame, 0, 0);
      }

      animationFrameId = requestAnimationFrame(processFrame);
    };

    video.addEventListener('play', () => {
      processFrame();
    });

    // In case the video is already playing before the event listener is attached
    if (!video.paused) {
      processFrame();
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={`avatar-container ${stateClass}`} style={{ position: 'relative' }}>
      <video
        ref={videoRef}
        src="/avatar.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          width: '1px',
          height: '1px'
        }}
      />
      <canvas
        ref={canvasRef}
        className="avatar-canvas"
      />
      
      {/* Sci-Fi Zig Zag Connector Line */}
      <svg 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none" 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}
      >
        <defs>
          <linearGradient id="fade-gradient" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#000" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Connector node at the chat box (updated to y=55 to match new box position) */}
        <circle cx="65" cy="55" r="0.5" fill="#000" />
        
        {/* Tech Zig Zag Path stopping before it hits the coat */}
        <path 
          d="M 65 55 L 60 55 L 56 59 L 56 75" 
          fill="none" 
          stroke="url(#fade-gradient)" 
          strokeWidth="2" 
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
