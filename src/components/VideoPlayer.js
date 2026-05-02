import React, { useState, useRef, useEffect } from 'react';
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

const toDriveEmbedSrc = (input = '') => {
  const fileId = getGoogleDriveFileId(input);
  if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
  return String(input).replace(/\/(view|edit)(\?.*)?$/, '/preview');
};

const isDriveUrl = (url = '') => String(url).toLowerCase().includes('drive.google.com');

const VideoPlayer = ({ videoPath, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted]     = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const playerRef    = useRef(null);
  const containerRef = useRef(null);
  const hideTimeout  = useRef(null);

  const isDrive = isDriveUrl(videoPath);

  useEffect(() => {
    const show = () => {
      setShowControls(true);
      clearTimeout(hideTimeout.current);
      hideTimeout.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };
    const el = containerRef.current;
    if (el) {
      el.addEventListener('mousemove', show);
      el.addEventListener('touchstart', show);
    }
    return () => {
      if (el) {
        el.removeEventListener('mousemove', show);
        el.removeEventListener('touchstart', show);
      }
      clearTimeout(hideTimeout.current);
    };
  }, [isPlaying]);

  const requestFS = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } catch (e) {
      console.warn('Fullscreen blocked:', e);
    }
  };

  const togglePlay = async () => {
    if (!isPlaying) {
      await requestFS();
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  if (!videoPath) return null;

  return (
    <div className="vpc" ref={containerRef}>
      {/* ── LOADER ── */}
      {isLoading && (
        <div className="vpc-loader">
          <div className="vpc-spinner" />
        </div>
      )}

      {/* ── GOOGLE DRIVE → iframe directe ── */}
      {isDrive ? (
        <div className="vpc-drive-wrapper">
          <iframe
            src={toDriveEmbedSrc(videoPath)}
            title={title || 'Video'}
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
            className="vpc-iframe"
          />
        </div>
      ) : (
        /* ── AUTRES SOURCES → ReactPlayer ── */
        <div className="vpc-player-wrapper" onClick={togglePlay}>
          <ReactPlayer
            ref={playerRef}
            url={resolveVideoSrc(videoPath)}
            playing={isPlaying}
            muted={isMuted}
            width="100%"
            height="100%"
            playsinline
            onReady={() => setIsLoading(false)}
            onBuffer={() => setIsLoading(true)}
            onBufferEnd={() => setIsLoading(false)}
            onEnded={() => setIsPlaying(false)}
            onError={(e) => { console.error('Player error:', e); setIsLoading(false); }}
            config={{
              file: {
                attributes: { playsInline: true, controlsList: 'nodownload' }
              },
              youtube: { playerVars: { rel: 0, modestbranding: 1 } }
            }}
          />

          {/* Overlay controls */}
          <div className={`vpc-overlay ${showControls ? 'visible' : ''}`}>
            <div className="vpc-top">
              <span className="vpc-title">{title}</span>
            </div>

            <div className="vpc-center">
              <button className="vpc-big-btn" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                {isPlaying ? <Pause size={44} fill="white" color="white" /> : <Play size={44} fill="white" color="white" />}
              </button>
            </div>

            <div className="vpc-bottom" onClick={(e) => e.stopPropagation()}>
              <div className="vpc-row">
                <div className="vpc-left">
                  <button onClick={togglePlay}>
                    {isPlaying ? <Pause size={20} color="white" /> : <Play size={20} color="white" />}
                  </button>
                  <button onClick={() => setIsMuted(m => !m)}>
                    {isMuted ? <VolumeX size={20} color="white" /> : <Volume2 size={20} color="white" />}
                  </button>
                </div>
                <div className="vpc-right">
                  <button onClick={() => { playerRef.current?.seekTo(0); setIsPlaying(true); }}>
                    <RotateCcw size={18} color="white" />
                  </button>
                  <button onClick={requestFS}>
                    <Maximize size={18} color="white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .vpc {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          background: #000d1a;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 16px 48px rgba(0,0,0,0.35);
        }

        /* ── Loader ── */
        .vpc-loader {
          position: absolute;
          inset: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(4px);
        }
        .vpc-spinner {
          width: 42px; height: 42px;
          border: 3px solid rgba(255,255,255,0.12);
          border-top-color: #6c63ff;
          border-radius: 50%;
          animation: vpc-spin 0.9s linear infinite;
        }
        @keyframes vpc-spin { to { transform: rotate(360deg); } }

        /* ── Drive iframe ── */
        .vpc-drive-wrapper {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .vpc-iframe {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
        }

        /* Desktop: crop les barres UI Drive */
        @media (min-width: 769px) {
          .vpc-iframe {
            height: 122%;
            margin-top: -11%;
          }
        }

        /* ── ReactPlayer wrapper ── */
        .vpc-player-wrapper {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }

        /* ── Overlay controls ── */
        .vpc-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 16px;
          background: linear-gradient(
            to top,
            rgba(0,0,0,0.65) 0%,
            transparent 45%,
            rgba(0,0,0,0.3) 100%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: 10;
        }
        .vpc-overlay.visible {
          opacity: 1;
          pointer-events: auto;
        }

        .vpc-top { display: flex; }
        .vpc-title {
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          text-shadow: 0 1px 4px rgba(0,0,0,0.6);
        }

        .vpc-center {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .vpc-big-btn {
          background: rgba(255,255,255,0.18);
          border: none;
          width: 76px; height: 76px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: transform 0.2s cubic-bezier(0.175,0.885,0.32,1.275), background 0.2s;
        }
        .vpc-big-btn:hover {
          transform: scale(1.1);
          background: rgba(255,255,255,0.28);
        }

        .vpc-bottom { display: flex; flex-direction: column; }
        .vpc-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .vpc-left, .vpc-right {
          display: flex;
          gap: 14px;
          align-items: center;
        }
        .vpc-left button,
        .vpc-right button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          opacity: 0.85;
          display: flex;
          align-items: center;
          transition: opacity 0.2s;
        }
        .vpc-left button:hover,
        .vpc-right button:hover { opacity: 1; }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .vpc { border-radius: 10px; }
          .vpc-big-btn { width: 58px; height: 58px; }
          .vpc-overlay { padding: 10px; }
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
