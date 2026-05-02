import React from 'react';

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

  // YouTube fallback
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
  if (!videoPath) return null;

  const isEmbed = shouldUseEmbedPlayer(videoPath);
  const isDrive = videoPath.includes('drive.google.com');

  return (
    <div className="video-player-container">
      {isEmbed ? (
        <div className={`video-embed-wrapper ${isDrive ? 'is-drive' : ''}`}>
          <iframe
            className="video-iframe"
            src={toEmbedSrc(videoPath)}
            title={title || 'Video Player'}
            frameBorder="0"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : (
        <video
          className="video-native"
          controls
          preload="metadata"
          playsInline
          src={resolveVideoSrc(videoPath)}
          onLoadedMetadata={(e) => {
            // Optional: detect aspect ratio and apply class if vertical
            const video = e.target;
            if (video.videoHeight > video.videoWidth) {
              video.classList.add('is-vertical');
            }
          }}
        >
          Your browser does not support the video tag.
        </video>
      )}
      <style>{`
        .video-player-container {
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          background: #000;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .video-embed-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
        }
        
        /* Some Drive videos might benefit from a slightly taller default or flexibility */
        .video-embed-wrapper.is-drive {
          /* No change needed for now, but placeholder for drive-specific tweaks */
        }

        .video-iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }

        .video-native {
          width: 100%;
          height: auto;
          display: block;
          max-height: 80vh;
          background: #000;
          object-fit: contain;
        }

        .video-native.is-vertical {
          max-height: 600px;
          width: auto;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .video-player-container {
            border-radius: 12px;
          }
          
          .video-native {
            max-height: 70vh;
          }
          
          .video-native.is-vertical {
            max-height: 65vh;
            width: 100%;
            object-fit: contain;
          }
          
          .video-embed-wrapper {
            /* On very small screens, maybe 4/3 or keeping 16/9 is safer */
            min-height: 200px;
          }
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
