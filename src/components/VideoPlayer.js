import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause, Maximize, Volume2, VolumeX, RotateCcw } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://backend-jpbe.onrender.com/api';
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

const resolveVideoSrc = (videoPath) => {
  if (!videoPath) return '';
  if (/^https?:\/\//i.test(videoPath)) return videoPath;
  const normalizedPath = videoPath.startsWith('/') ? videoPath : `/${videoPath}`;
  return `${BACKEND_ORIGIN}${normalizedPath}`;
};

const getGoogleDriveFileId = (input = '') => {
  const url = String(input || '').trim();
  if (!url.toLowerCase().includes('drive.google.com')) return '';

  try {
    const parsedUrl = new URL(url);
    const pathMatch = parsedUrl.pathname.match(/\/file\/d\/([^/]+)/i);
    if (pathMatch) return decodeURIComponent(pathMatch[1]);
    return parsedUrl.searchParams.get('id') || '';
  } catch (e) {
    const pathMatch = url.match(/\/file\/d\/([^/?#]+)/i);
    if (pathMatch) return pathMatch[1];
    const idMatch = url.match(/[?&]id=([^&#]+)/i);
    return idMatch ? idMatch[1] : '';
  }
};

const toEmbedSrc = (input = '') => {
  const url = String(input || '').trim();
  if (!url) return '';

  const driveFileId = getGoogleDriveFileId(url);
  if (driveFileId) {
    return `https://drive.google.com/file/d/${driveFileId}/preview`;
  }

  if (url.toLowerCase().includes('drive.google.com')) {
    return url.replace(/\/(view|edit)(\?.*)?$/, '/preview');
  }

  return url;
};

const VideoPlayer = ({ videoPath, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  const isDrive = String(videoPath || '').includes('drive.google.com');
  const finalSrc = isDrive ? toEmbedSrc(videoPath) : resolveVideoSrc(videoPath);

  const togglePlay = async () => {
    if (!isPlaying) {
      // Fullscreen before play for browser compatibility
      try {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if (containerRef.current?.webkitRequestFullscreen) {
          containerRef.current.webkitRequestFullscreen();
        }
      } catch (err) {
        console.warn('Fullscreen blocked:', err);
      }
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current?.requestFullscreen) containerRef.current.requestFullscreen();
    else if (containerRef.current?.webkitRequestFullscreen) containerRef.current.webkitRequestFullscreen();
  };

  if (!videoPath) return null;

  return (
    <div 
      className={`modern-video-container ${isDrive ? 'is-drive-container' : ''}`} 
      ref={containerRef}
      onMouseMove={() => {
        setShowControls(true);
        setTimeout(() => { if (isPlaying) setShowControls(false); }, 3000);
      }}
    >
      {isLoading && <div className="video-loader"><div className="spinner"></div></div>}
      
      <div className="player-wrapper" onClick={togglePlay}>
        <ReactPlayer
          ref={playerRef}
          url={finalSrc}
          playing={isPlaying}
          muted={isMuted}
          width="100%"
          height="100%"
          onReady={() => setIsLoading(false)}
          onStart={() => setIsLoading(false)}
          onBuffer={() => setIsLoading(true)}
          onBufferEnd={() => setIsLoading(false)}
          onEnded={() => setIsPlaying(false)}
          onError={(e) => {
            console.error('VideoPlayer Error:', e);
            setIsLoading(false);
          }}
          config={{
            file: {
              attributes: {
                playsInline: true,
                controlsList: 'nodownload noplaybackrate'
              }
            }
          }}
        />
        
        {/* Custom Controls Layer (Only for non-Drive or if we want consistent UI) */}
        {/* For Drive, ReactPlayer will render an iframe, so custom controls won't interact with it well */}
        {!isDrive && (
          <div className={`video-overlay-controls ${showControls ? 'visible' : ''}`}>
            <div className="controls-top">
              <span className="video-title-hint">{title}</span>
            </div>
            
            <div className="controls-center">
              <button className="big-play-btn" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                {isPlaying ? <Pause size={48} fill="white" /> : <Play size={48} fill="white" />}
              </button>
            </div>
            
            <div className="controls-bottom" onClick={(e) => e.stopPropagation()}>
              <div className="controls-row">
                <div className="controls-left">
                  <button onClick={togglePlay}>{isPlaying ? <Pause size={20} /> : <Play size={20} />}</button>
                  <button onClick={() => setIsMuted(!isMuted)}>{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
                </div>
                <div className="controls-right">
                  <button onClick={() => { playerRef.current.seekTo(0); setIsPlaying(true); }}><RotateCcw size={18} title="Recommencer" /></button>
                  <button onClick={handleFullscreen}><Maximize size={18} /></button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .modern-video-container {
          position: relative;
          width: 100%;
          height: 100%;
          background: #000;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .player-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Desktop Crop for Drive via ReactPlayer iframe */
        @media (min-width: 769px) {
          .is-drive-container iframe {
            width: 100% !important;
            height: 120% !important;
            margin-top: -10% !important;
          }
          .is-drive-container .player-wrapper {
            overflow: hidden;
          }
        }

        .video-loader {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          backdrop-filter: blur(4px);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.1);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .video-overlay-controls {
          position: absolute;
          inset: 0;
          background: linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 50%, rgba(0,0,0,0.4) 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 20px;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: 5;
        }

        .video-overlay-controls.visible {
          opacity: 1;
          pointer-events: auto;
        }

        .big-play-btn {
          background: rgba(255,255,255,0.15);
          border: none;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(10px);
          color: white;
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .controls-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .controls-left, .controls-right {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .controls-row button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 5px;
          display: flex;
          align-items: center;
          opacity: 0.8;
          transition: opacity 0.2s;
        }

        @media (max-width: 768px) {
          .modern-video-container {
            border-radius: 12px;
          }
          .big-play-btn {
            width: 60px;
            height: 60px;
          }
          .video-overlay-controls {
            padding: 12px;
          }
          /* Reset crop for mobile in ReactPlayer */
          .is-drive-container iframe {
            width: 100% !important;
            height: 100% !important;
            margin-top: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
