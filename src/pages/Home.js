import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import HomeNavbar from '../components/HomeNavbar';
import HomeFooter from '../components/HomeFooter';

function Home() {
  useEffect(() => {
    // Keep horizontal overflow hidden while preserving vertical scroll on small screens.
    const previousOverflowX = document.body.style.overflowX;
    document.body.style.overflowX = 'hidden';

    return () => {
      document.body.style.overflowX = previousOverflowX;
    };
  }, []);

  return (
    <div className="home-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', color: 'var(--text)', overflow: 'hidden' }}>
      <HomeNavbar />

      {/* Hero Section */}
      <main className="home-hero-main" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden' }}>
        <div className="home-hero-content" style={{ flex: '0 1 600px', maxWidth: '600px', animation: 'fadeInLeft 1s ease-out' }}>
          <h1 className="home-title" style={{ lineHeight: '1.2', fontWeight: '800', marginBottom: '24px', color: '#1a202c' }}>
            La rééducation <br />
            <span style={{ color: 'var(--primary)' }}>réinventée.</span>
          </h1>
          <p className="home-description" style={{ color: '#4a5568', marginBottom: '40px', lineHeight: '1.7', opacity: 0.9 }}>
            Plateforme élégante et intuitive pour votre rééducation. Suivez vos progrès et atteignez vos objectifs avec sérénité.
          </p>
          <div className="home-cta-row" style={{ display: 'flex', gap: '16px' }}>
            <Link to="/register" className="btn" style={{ padding: '16px 40px', boxShadow: '0 10px 15px -3px rgba(46, 125, 50, 0.3)' }}>
              Commencer maintenant
            </Link>
          </div>
        </div>

        <div className="home-hero-image-wrap" style={{ flex: '0 1 490px', position: 'relative', animation: 'fadeInRight 1s ease-out' }}>
          <div className="home-hero-image" style={{ position: 'relative', zIndex: 2, borderRadius: '40px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', maxHeight: '520px' }}>
            <img
              src="/assets/hero_kine.png"
              alt="Kinesitherapeutes"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(46,125,50,0.1) 0%, rgba(255,255,255,0) 70%)', zIndex: 1 }}></div>
          <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(46,125,50,0.05) 0%, rgba(255,255,255,0) 70%)', zIndex: 1 }}></div>
        </div>
      </main>

      <HomeFooter />

      <style>{`
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .home-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .home-hero-main {
          padding: 0 clamp(16px, 6vw, 100px);
          gap: clamp(20px, 5vw, 48px);
        }
        .home-title {
          font-size: clamp(2rem, 6vw, 4rem);
        }
        .home-description {
          font-size: clamp(1rem, 2.2vw, 1.25rem);
        }
        .home-cta-row .btn {
          font-size: clamp(14px, 2.1vw, 18px);
        }
        @media (max-width: 900px) {
          .home-hero-main {
            flex-direction: column;
            justify-content: center;
            text-align: center;
            padding-top: 20px;
            padding-bottom: 24px;
            overflow: visible;
          }
          .home-hero-content {
            flex: 1 1 auto;
            max-width: 100%;
          }
          .home-cta-row {
            justify-content: center;
          }
          .home-hero-image-wrap {
            width: min(100%, 540px);
            flex: 1 1 auto;
          }
          .home-hero-image {
            border-radius: 24px;
          }
        }
        @media (max-width: 480px) {
          .home-hero-main {
            padding-left: 12px;
            padding-right: 12px;
          }
          .home-description {
            margin-bottom: 24px;
          }
          .home-cta-row .btn {
            width: 100%;
            max-width: 300px;
          }
          .home-hero-image {
            border-radius: 16px;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;
