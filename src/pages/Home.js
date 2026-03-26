import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import HomeNavbar from '../components/HomeNavbar';
import HomeFooter from '../components/HomeFooter';

function Home() {
  useEffect(() => {
    // Lock body scroll on mount
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100%';

    return () => {
      // Restore body scroll on unmount
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
    };
  }, []);

  return (
    <div className="home-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', color: 'var(--text)', overflow: 'hidden' }}>
      <HomeNavbar />

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 100px', overflow: 'hidden' }}>
        <div style={{ flex: '0 1 600px', maxWidth: '600px', animation: 'fadeInLeft 1s ease-out' }}>
          <h1 style={{ fontSize: '4rem', lineHeight: '1.2', fontWeight: '800', marginBottom: '24px', color: '#1a202c' }}>
            La rééducation <br />
            <span style={{ color: 'var(--primary)' }}>réinventée.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#4a5568', marginBottom: '40px', lineHeight: '1.7', opacity: 0.9 }}>
            Plateforme élégante et intuitive pour votre rééducation. Suivez vos progrès et atteignez vos objectifs avec sérénité.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/register" className="btn" style={{ padding: '16px 40px', fontSize: '18px', boxShadow: '0 10px 15px -3px rgba(46, 125, 50, 0.3)' }}>
              Commencer maintenant
            </Link>
          </div>
        </div>

        <div style={{ flex: '0 1 490px', position: 'relative', animation: 'fadeInRight 1s ease-out' }}>
          <div style={{ position: 'relative', zIndex: 2, borderRadius: '40px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', maxHeight: '520px' }}>
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
      `}</style>
    </div>
  );
}

export default Home;
