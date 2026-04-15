import React from 'react';
import { Link } from 'react-router-dom';

function HomeNavbar() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <nav className="home-nav" style={{ 
      padding: '16px clamp(12px, 4vw, 40px)', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      gap: '12px',
      backgroundColor: 'rgba(255,255,255,0.95)', 
      backdropFilter: 'blur(10px)', 
      position: 'sticky', 
      top: 0, 
      zIndex: 1000, 
      borderBottom: '1px solid #f0f0f0' 
    }}>
      <Link to={user ? `/${user.role}/dashboard` : "/"} className="home-nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: 'var(--primary)', textDecoration: 'none' }}>
        <span>🌿</span> Flowvia
      </Link>
      <div className="home-nav-actions" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {user ? (
          <Link to={`/${user.role}/dashboard`} className="btn" style={{ padding: '10px 24px', fontSize: '14px' }}>
            Tableau de Bord
          </Link>
        ) : (
          <>
            <Link to="/login" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>Connexion</Link>
            <Link to="/register" className="btn" style={{ padding: '10px 24px', fontSize: '14px' }}>S'inscrire</Link>
          </>
        )}
      </div>
      <style>{`
        .home-nav-logo {
          font-size: clamp(18px, 2.5vw, 24px);
          white-space: nowrap;
        }
        .home-nav-actions {
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        @media (max-width: 640px) {
          .home-nav {
            align-items: flex-start;
            flex-direction: column;
          }
          .home-nav-actions {
            width: 100%;
            justify-content: flex-start;
            gap: 12px;
          }
        }
      `}</style>
    </nav>
  );
}

export default HomeNavbar;
