import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Maximize, Volume2, VolumeX, RotateCcw } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://flowvia-backend.onrender.com/api';
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

  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i);
  if (youtubeMatch) {
    return `https://www.youtube-nocookie.com/embed/${youtubeMatch[1]}?rel=0`;
  }

  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return url;
};

const shouldUseEmbedPlayer = (videoPath = '') => {
  const url = String(videoPath || '').toLowerCase();
  return url.includes('drive.google.com') || url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
};

const VideoPlayer = ({ videoPath, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const isEmbed = shouldUseEmbedPlayer(videoPath);

  useEffect(() => {
    let timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };

    if (containerRef.current) {
      containerRef.current.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      if (containerRef.current) containerRef.current.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current?.requestFullscreen) containerRef.current.requestFullscreen();
    else if (containerRef.current?.webkitRequestFullscreen) containerRef.current.webkitRequestFullscreen();
  };

  if (!videoPath) return null;

  return (
    <div className="modern-video-container" ref={containerRef}>
      {isLoading && <div className="video-loader"><div className="spinner"></div></div>}
      
      {isEmbed ? (
        <div className="embed-wrapper">
          <iframe
            className="modern-iframe"
            src={toEmbedSrc(videoPath)}
            title={title || 'Video Player'}
            onLoad={() => setIsLoading(false)}
            frameBorder="0"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="native-wrapper" onClick={togglePlay}>
          <video
            ref={videoRef}
            className="modern-video-tag"
            src={resolveVideoSrc(videoPath)}
            onTimeUpdate={handleTimeUpdate}
            onLoadStart={() => setIsLoading(true)}
            onCanPlay={() => setIsLoading(false)}
            onEnded={() => setIsPlaying(false)}
            playsInline
          />
          
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
              <div className="progress-bar-container">
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
              
              <div className="controls-row">
                <div className="controls-left">
                  <button onClick={togglePlay}>{isPlaying ? <Pause size={20} /> : <Play size={20} />}</button>
                  <button onClick={toggleMute}>{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
                </div>
                <div className="controls-right">
                  <button onClick={() => { videoRef.current.currentTime = 0; videoRef.current.play(); setIsPlaying(true); }}><RotateCcw size={18} /></button>
                  <button onClick={handleFullscreen}><Maximize size={18} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .modern-video-container {
          position: relative;
          width: 100%;
          background: #000;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          /* Flexible height based on content */
          min-height: 200px;
          max-height: 80vh;
        }

        /* Default ratio for embeds when we don't know better */
        .modern-video-container:has(.embed-wrapper) {
          aspect-ratio: 16 / 9;
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

        .embed-wrapper, .native-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modern-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .modern-video-tag {
          width: 100%;
          height: auto;
          max-height: 80vh;
          object-fit: contain;
        }

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

        .controls-top {
          display: flex;
          justify-content: space-between;
        }

        .video-title-hint {
          color: white;
          font-size: 14px;
          font-weight: 600;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        .controls-center {
          display: flex;
          justify-content: center;
          align-items: center;
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

        .big-play-btn:hover {
          transform: scale(1.1);
          background: rgba(255,255,255,0.25);
        }

        .controls-bottom {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .progress-bar-container {
          height: 4px;
          width: 100%;
          cursor: pointer;
          padding: 10px 0;
          margin: -10px 0;
        }

        .progress-bar-bg {
          height: 4px;
          background: rgba(255,255,255,0.2);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: var(--primary);
          border-radius: 2px;
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

        .controls-row button:hover {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .modern-video-container {
            border-radius: 12px;
          }
          
          .modern-video-container:has(.embed-wrapper) {
            aspect-ratio: 4 / 3;
          }

          .big-play-btn {
            width: 60px;
            height: 60px;
          }
          
          .video-overlay-controls {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
