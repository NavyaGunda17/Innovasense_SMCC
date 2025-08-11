import React, { useState, useEffect, useRef } from 'react';
import './TopControls.css';
import { logout } from '../reducer/authSlice';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLayoutAnimation } from '../context/LayoutAnimationContext';

const TopControls: React.FC = () => {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { triggerLogout } = useLayoutAnimation();

  // Ensure audio plays on first user interaction
  // useEffect(() => {
  //   const tryPlay = () => {
  //     const audio = audioRef.current;
  //     if (audio && !isPlaying) {
  //       audio.volume = 0.15;
  //       audio.muted = false;
  //       audio.play()
  //         .then(() => {
  //           setIsPlaying(true);
  //           setIsMuted(false);
  //         })
  //         .catch(err => {
  //           console.warn('Autoplay blocked:', err.message);
  //         });
  //     }
  //   };

  //   const listeners = ['click', 'keydown', 'touchstart'];
  //   listeners.forEach(type =>
  //     document.body.addEventListener(type, tryPlay, { once: true })
  //   );

  //   return () => {
  //     listeners.forEach(type =>
  //       document.body.removeEventListener(type, tryPlay)
  //     );
  //   };
  // }, [isPlaying]);

    useEffect(() => {
    // Auto-play music when component mounts
    if (audioRef.current) {
      audioRef.current.volume = 0.15  // Set initial volume to 30%
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch((error) => {
        console.log('Autoplay failed:', error)
      })
    }
  }, [])


  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      // Unmuting & playing
      audio.volume = 0.15;
      audio.play().then(() => {
        setIsPlaying(true);
        setIsMuted(false);
      }).catch(err => console.warn('Play failed:', err));
    } else {
      // Muting & pausing
      audio.pause();
      setIsPlaying(false);
      setIsMuted(true);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    
    triggerLogout(() => navigate('/login'));
    
  };

const location = useLocation();

  return (
    <div className="top-controls">
      <audio
        ref={audioRef}
        src="/music.mp3"
        loop
        preload="auto"
      />

      {/* Mute Button */}
      <button className="control-btn mute-btn" onClick={toggleMute}>
        {isMuted ? (
          // Muted Icon
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          // Playing Icon
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </button>

      {/* Music Bars */}
      <div className="music-bars">
        <div className={`bar ${isPlaying ? 'playing' : ''}`} style={{ '--delay': '0s' } as React.CSSProperties}></div>
        <div className={`bar ${isPlaying ? 'playing' : ''}`} style={{ '--delay': '0.1s' } as React.CSSProperties}></div>
        <div className={`bar ${isPlaying ? 'playing' : ''}`} style={{ '--delay': '0.2s' } as React.CSSProperties}></div>
        <div className={`bar ${isPlaying ? 'playing' : ''}`} style={{ '--delay': '0.3s' } as React.CSSProperties}></div>
      </div>

      {/* Logout Button */}
      <button className="control-btn logout-btn" onClick={handleLogout}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </div>
  );
};

export default TopControls;
