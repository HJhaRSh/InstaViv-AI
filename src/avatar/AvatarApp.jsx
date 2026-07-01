import React, { useState, useRef, useEffect } from 'react';
import { AvatarCanvas } from './AvatarCanvas';
import './styles/avatar.css';

export default function AvatarApp() {
  const [avatarState, setAvatarState] = useState('IDLE');
  const [chatHistory, setChatHistory] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const audioElementRef = useRef(null);
  const chatContainerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Reset state when Navbar logo is clicked
  useEffect(() => {
    const handleReset = (e) => {
      e.preventDefault();
      setIsInitialized(false);
      setChatHistory([]);
      setAvatarState('IDLE');
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.currentTime = 0;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const logo = document.querySelector('.logo');
    if (logo) logo.addEventListener('click', handleReset);
    
    return () => {
      if (logo) logo.removeEventListener('click', handleReset);
    };
  }, []);

  const speakMessage = async (text) => {
    try {
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const ttsRes = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal
      });
      
      if (!ttsRes.ok) throw new Error('Failed to get TTS response');

      const audioBlob = await ttsRes.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioElementRef.current) {
        audioElementRef.current.src = audioUrl;
        
        audioElementRef.current.onplay = () => {
          setAvatarState('TALKING');
        };
        
        audioElementRef.current.onended = () => {
          setAvatarState('IDLE');
          URL.revokeObjectURL(audioUrl);
        };

        audioElementRef.current.play().catch(err => {
          if (err.name !== 'AbortError') {
            console.error("Audio play failed:", err);
            setAvatarState('IDLE');
          }
        });
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('TTS error:', error);
        setAvatarState('IDLE');
      }
    }
  };

  const handleInitialize = () => {
    setIsInitialized(true);
    setAvatarState('THINKING');
    speakMessage("Hello, welcome to InstaViv AI. How can I help you today?");
  };

  const handleSend = async () => {
    if (!inputText.trim() || avatarState === 'TALKING') return;

    const userMessage = inputText.trim();
    setInputText('');
    
    // Add user message to local history array for API format
    const newHistory = [...chatHistory, { role: 'user', parts: [{ text: userMessage }] }];
    setChatHistory(newHistory);
    
    setAvatarState('THINKING');

    // Setup abort controller for cancelling requests
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      // 1. Get Text Response from /api/chat
      const chatRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: newHistory }),
        signal
      });
      const chatData = await chatRes.json();
      
      if (!chatRes.ok) throw new Error(chatData.error || 'Failed to get chat response');
      
      const aiText = chatData.response;
      
      // Update UI with AI text
      const updatedHistory = [...newHistory, { role: 'model', parts: [{ text: aiText }] }];
      setChatHistory(updatedHistory);

      // 2. Play Audio via TTS
      await speakMessage(aiText);

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Response generation stopped by user');
      } else {
        console.error('Avatar interaction error:', error);
        setAvatarState('IDLE');
        
        // Crucial: Show the error in the chat so we know what failed!
        const errorHistory = [...newHistory, { 
          role: 'model', 
          parts: [{ text: `System Error: ${error.message}. Please check terminal logs.` }] 
        }];
        setChatHistory(errorHistory);
      }
    }
  };

  const handleStop = () => {
    // Abort any pending fetch requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    // Stop audio if playing
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    setAvatarState('IDLE');
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <AvatarCanvas avatarState={avatarState} />
      
      <audio ref={audioElementRef} style={{ display: 'none' }} muted={isMuted} />

      <div style={{ 
        position: 'absolute', 
        bottom: '45%', 
        left: '65%', 
        transform: 'none', 
        zIndex: 10, 
        width: '280px',
        maxWidth: '90vw'
      }}>
        {!isInitialized ? (
          <button 
            className="sci-fi-box"
            onClick={handleInitialize}
            style={{
              width: '100%',
              border: 'none',
              cursor: 'pointer',
              display: 'block'
            }}
          >
            <div className="sci-fi-box-inner" style={{ textAlign: 'center', width: '100%' }}>
              INITIALIZE AI
            </div>
          </button>
        ) : (
          <div className="sci-fi-box no-hover" style={{ width: '100%', cursor: 'default' }}>
            <div className="sci-fi-box-inner" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '1.2rem 1.5rem', gap: '10px' }}>
              <div 
                ref={chatContainerRef}
                style={{ 
                fontSize: '0.85rem', 
                fontFamily: 'var(--font-body)', 
                color: 'var(--text-primary)', 
                minHeight: '35px', 
                maxHeight: '120px', 
                overflowY: 'auto', 
                textAlign: 'left',
                textTransform: 'none', /* Override sci-fi-box uppercase */
                letterSpacing: 'normal'
              }}>
                {chatHistory.length === 0 ? (
                  "Hello, welcome to InstaViv AI. How can I help you today?"
                ) : (
                  chatHistory[chatHistory.length - 1]?.parts[0].text
                )}
              </div>

              <div className="chat-input-row" style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                  <input 
                    type="text" 
                    placeholder="Message AI..." 
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      if (e.target.value.length > 0 && avatarState === 'IDLE') setAvatarState('LISTENING');
                      else if (e.target.value.length === 0 && avatarState === 'LISTENING') setAvatarState('IDLE');
                    }}
                    onFocus={() => { if (avatarState === 'IDLE') setAvatarState('LISTENING'); }}
                    onBlur={() => { if (avatarState === 'LISTENING') setAvatarState('IDLE'); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={avatarState === 'THINKING' || avatarState === 'TALKING'}
                    style={{ 
                      flex: 1, 
                      minWidth: 0, /* FIX: allows flex child to shrink properly */
                      padding: '0.5rem 0', 
                      border: 'none', 
                      borderBottom: '2px solid var(--text-secondary)', 
                    background: 'transparent', 
                    color: 'var(--text-primary)', 
                    outline: 'none',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    letterSpacing: 'normal'
                  }}
                />
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--electric-cyan)',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    padding: '0 0.2rem'
                  }}
                  title={isMuted ? "Unmute Speech" : "Mute Speech"}
                >
                  {isMuted ? '🔇' : '🔊'}
                </button>
                
                {avatarState === 'THINKING' || avatarState === 'TALKING' ? (
                  <button 
                    onClick={handleStop}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ff4444',
                      fontFamily: 'var(--font-tech)',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      cursor: 'pointer',
                      letterSpacing: '2px',
                      padding: '0 0.5rem'
                    }}
                    title="Stop Response"
                  >
                    STOP
                  </button>
                ) : (
                  <button 
                    onClick={handleSend}
                    disabled={avatarState === 'THINKING' || avatarState === 'TALKING'}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--electric-cyan)',
                      fontFamily: 'var(--font-tech)',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      cursor: 'pointer',
                      letterSpacing: '2px',
                      padding: '0 0.5rem'
                    }}
                  >
                    SEND
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
