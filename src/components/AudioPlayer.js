import React, { useState } from 'react';

function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // YouTube Video ID for the requested "Musique Douce"
  const videoId = '9TGlc0Fufgk';

  const toggleMusic = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '24px', 
      right: '24px', 
      zIndex: 2000, 
      display: 'flex', 
      alignItems: 'center',
      gap: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: '6px 14px',
      borderRadius: '40px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.4)',
      transition: 'all 0.4s ease'
    }}>
      {/* Hidden YouTube Embed */}
      {isPlaying && (
        <div style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <iframe 
            width="100" 
            height="100" 
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=0`} 
            title="Flowvia Zen Music"
            allow="autoplay; encrypted-media"
            frameBorder="0"
          ></iframe>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', minWidth: '80px' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color: isPlaying ? 'var(--primary)' : '#4a5568' }}>
          {isPlaying ? 'Musique zen' : 'Mode calme'}
        </span>
        <span style={{ fontSize: '9px', color: '#718096', marginTop: '1px' }}>
          {isPlaying ? 'En lecture 🎶' : 'Sourdine'}
        </span>
      </div>

      <button 
        onClick={toggleMusic}
        style={{ 
          border: 'none', 
          background: isPlaying ? 'var(--primary)' : '#f1f5f9', 
          color: isPlaying ? 'white' : '#4a5568',
          width: '32px', 
          height: '32px', 
          borderRadius: '50%', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          transition: 'all 0.2s ease',
          transform: isPlaying ? 'scale(1.1)' : 'scale(1)',
        }}
        title="Activer/Désactiver la musique douce"
      >
        {isPlaying ? '🔊' : '🔇'}
      </button>
    </div>
  );
}

export default AudioPlayer;
