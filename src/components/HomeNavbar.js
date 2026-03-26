import React from 'react';
import { Link } from 'react-router-dom';

function HomeNavbar() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <nav style={{ 
      padding: '20px 40px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      backgroundColor: 'rgba(255,255,255,0.95)', 
      backdropFilter: 'blur(10px)', 
      position: 'sticky', 
      top: 0, 
      zIndex: 1000, 
      borderBottom: '1px solid #f0f0f0' 
    }}>
      <Link to={user ? `/${user.role}/dashboard` : "/"} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', textDecoration: 'none' }}>
        <span>🌿</span> Flowvia
      </Link>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
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
    </nav>
  );
}

export default HomeNavbar;
