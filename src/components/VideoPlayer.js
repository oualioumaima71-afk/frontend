import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause, Maximize, Volume2, VolumeX, RotateCcw, ExternalLink } from 'lucide-react';

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

/** Page Drive complète (nouvel onglet) — les clics dans l’iframe ne sont pas interceptables depuis notre site. */
const toDriveViewUrl = (input = '') => {
  const fileId = getGoogleDriveFileId(input);
  if (fileId) return `https://drive.google.com/file/d/${fileId}/view`;
  const s = String(input || '').trim();
  return /^https?:\/\//i.test(s) ? s : `https://drive.google.com/file/d/${s}/view`;
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

  /** Drive : iframe uniquement (la lecture directe reste souvent bloquée sans erreur → spinner infini). */
  const embedDrive = isDriveUrl(videoPath);

  useEffect(() => {
    setIsLoading(true);
    if (!embedDrive) return undefined;
    const maxWait = window.setTimeout(() => setIsLoading(false), 12000);
    return () => clearTimeout(maxWait);
  }, [videoPath, embedDrive]);

  const reactPlayerUrl = resolveVideoSrc(videoPath);

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
    <div className={`vpc ${embedDrive ? 'vpc--drive' : ''}`} ref={containerRef}>
      {isLoading && (
        <div className="vpc-loader">
          <div className="vpc-spinner" />
        </div>
      )}

      {embedDrive ? (
        <>
          <a
            href={toDriveViewUrl(videoPath)}
            target="_blank"
            rel="noopener noreferrer"
            className="vpc-drive-open"
            aria-label="Ouvrir cette vidéo dans Google Drive"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={15} aria-hidden />
            <span className="vpc-drive-open-text">Ouvrir dans Drive</span>
          </a>
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
        </>
      ) : (
        <div className="vpc-player-wrapper" onClick={togglePlay}>
          <ReactPlayer
            ref={playerRef}
            url={reactPlayerUrl}
            playing={isPlaying}
            muted={isMuted}
            controls={false}
            width="100%"
            height="100%"
            playsinline
            onReady={() => setIsLoading(false)}
            onBuffer={() => setIsLoading(true)}
            onBufferEnd={() => setIsLoading(false)}
            onEnded={() => setIsPlaying(false)}
            onError={(e) => {
              console.error('Player error:', e);
              setIsLoading(false);
            }}
            config={{
              file: {
                attributes: { playsInline: true, controlsList: 'nodownload' }
              },
              youtube: { playerVars: { rel: 0, modestbranding: 1 } }
            }}
          />

          <div className={`vpc-overlay ${showControls ? 'visible' : ''}`}>
            <div className="vpc-top">
              <span className="vpc-title">{title}</span>
            </div>

            <div className="vpc-center">
              <button type="button" className="vpc-big-btn" onClick={(e) => { e.stopPropagation(); togglePlay(); }} aria-label={isPlaying ? 'Pause' : 'Lecture'}>
                {isPlaying ? <Pause className="vpc-big-btn-icon" fill="white" color="white" /> : <Play className="vpc-big-btn-icon" fill="white" color="white" />}
              </button>
            </div>

            <div className="vpc-bottom" onClick={(e) => e.stopPropagation()}>
              <div className="vpc-row">
                <div className="vpc-left">
                  <button type="button" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Lecture'}>
                    {isPlaying ? <Pause size={18} color="white" /> : <Play size={18} color="white" />}
                  </button>
                  <button type="button" onClick={() => setIsMuted(m => !m)} aria-label={isMuted ? 'Activer le son' : 'Couper le son'}>
                    {isMuted ? <VolumeX size={18} color="white" /> : <Volume2 size={18} color="white" />}
                  </button>
                </div>
                <div className="vpc-right">
                  <button type="button" onClick={() => { playerRef.current?.seekTo(0); setIsPlaying(true); }} aria-label="Recommencer depuis le début">
                    <RotateCcw size={16} color="white" />
                  </button>
                  <button type="button" onClick={requestFS} aria-label="Plein écran">
                    <Maximize size={16} color="white" />
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
          max-width: 100%;
          box-sizing: border-box;
          aspect-ratio: 4 / 3;
          background: #000000;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 16px 48px rgba(0,0,0,0.35);
        }

        /* Drive embed : ratio vidéo standard, pleine largeur du parent */
        .vpc--drive {
          aspect-ratio: 16 / 9;
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

        .vpc-drive-open {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 30;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 11px;
          background: rgba(255, 255, 255, 0.96);
          color: #0f172a;
          font-size: 12px;
          font-weight: 700;
          border-radius: 10px;
          text-decoration: none;
          box-shadow: 0 2px 14px rgba(0, 0, 0, 0.22);
          border: 1px solid rgba(15, 23, 42, 0.08);
          transition: background 0.15s ease, transform 0.12s ease;
        }
        .vpc-drive-open:active {
          transform: scale(0.98);
        }
        .vpc-drive-open:hover {
          background: #fff;
        }

        /* ── Drive iframe ── */
        .vpc-drive-wrapper {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          -webkit-overflow-scrolling: touch;
        }
        .vpc-iframe {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
        }

        /* Drive : pas de transform/zoom — ça décale la barre et les boutons dans l’iframe (cross-origin). */

        /* ── ReactPlayer wrapper ── */
        .vpc-player-wrapper {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          max-width: 100%;
          cursor: pointer;
        }

        /* react-player : le wrapper interne ne doit pas forcer une largeur > conteneur */
        .vpc-player-wrapper > div {
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
        }

        .vpc-player-wrapper video {
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          object-fit: contain;
        }

        /* ── Overlay controls ── */
        .vpc-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 12px;
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
          font-size: 12px;
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
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: transform 0.2s cubic-bezier(0.175,0.885,0.32,1.275), background 0.2s;
        }
        .vpc-big-btn-icon {
          width: 28px;
          height: 28px;
        }
        .vpc-big-btn:hover {
          transform: scale(1.06);
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
          gap: 8px;
          align-items: center;
        }
        .vpc-left button,
        .vpc-right button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px;
          min-width: 28px;
          min-height: 28px;
          opacity: 0.9;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s;
        }
        .vpc-left button:hover,
        .vpc-right button:hover { opacity: 1; }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .vpc { 
            border-radius: 10px; 
            aspect-ratio: 4 / 5;
          }
          .vpc--drive {
            aspect-ratio: 16 / 9;
          }
          .vpc-big-btn {
            width: 44px;
            height: 44px;
          }
          .vpc-big-btn-icon {
            width: 22px;
            height: 22px;
          }
          .vpc-overlay { padding: 8px; }
          .vpc-title { font-size: 11px; }
          .vpc-left, .vpc-right { gap: 6px; }
          .vpc-drive-open {
            top: 6px;
            right: 6px;
            padding: 6px 9px;
            font-size: 11px;
          }
          .vpc-drive-open-text {
            max-width: 112px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
