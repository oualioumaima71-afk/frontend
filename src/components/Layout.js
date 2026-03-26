import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import Toast from './Toast';

function Layout({ children, role }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // Notification logic placeholder : dot active si un message de motivation n'a pas été lu,
  // ou simplement afficher un modal au clic.
  const [showNotif, setShowNotif] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [notifMessage, setNotifMessage] = useState("Continue tes efforts pour maintenir ta progression ! 💪");

  // Global Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const handleShowToast = (e) => {
      setToast({ show: true, message: e.detail.message, type: e.detail.type || 'success' });
      setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };
    window.addEventListener('show-toast', handleShowToast);
    return () => window.removeEventListener('show-toast', handleShowToast);
  }, []);

  useEffect(() => {
    const checkNotif = () => {
      const saved = localStorage.getItem('session_notification');
      if (saved) {
        const parsed = JSON.parse(saved);
        setNotifCount(1);
        setNotifMessage(parsed.message);
      } else {
        setNotifCount(0);
      }
    };
    checkNotif();
    window.addEventListener('new_notification', checkNotif);
    return () => window.removeEventListener('new_notification', checkNotif);
  }, []);

  const handleNotifClick = () => {
    setShowNotif(!showNotif);
    if (!showNotif && notifCount > 0) {
      localStorage.removeItem('session_notification');
      setNotifCount(0);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="layout-top">
      {toast.show && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} />
        </div>
      )}
      <nav className="navbar">
        <Link to={user ? `/${user.role}/dashboard` : "/"} className="navbar-logo" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '24px' }}>🌿</span> Flowvia
        </Link>

        <div className="navbar-actions">
          {role === 'patient' && (
            <div className="notif-wrapper" onClick={handleNotifClick}>
              🔔
              {notifCount > 0 && <div className="notif-red-dot">1</div>}
              {showNotif && (
                <div style={{ position: 'absolute', top: '50px', right: 0, width: '250px', background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', color: '#333', fontSize: '13px', zIndex: 1000 }}>
                  <strong>Nouveau Message</strong><br />
                  <span style={{ display: 'block', marginTop: '8px' }}>{notifMessage}</span>
                </div>
              )}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <svg width="16" height="16" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor">
              <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 19V18C5 15.7909 6.79086 14 9 14H15C17.2091 14 19 15.7909 19 18V19" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="user-name">{user?.nom}</span>
          </div>
        </div>
      </nav>

      <div className="layout-body">
        <aside className="sidebar">
          <ul className="sidebar-nav">
            <li>
              <NavLink to={`/${role}/dashboard`} className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="icon">📊</span> <span className="sidebar-text">Dashboard</span>
              </NavLink>
            </li>
            {role === 'patient' && (
              <li>
                <NavLink to="/patient/sessions" className={({ isActive }) => isActive ? 'active' : ''}>
                  <span className="icon">📅</span> <span className="sidebar-text">Mes Séances</span>
                </NavLink>
              </li>
            )}
            {role === 'therapist' && (
              <li>
                <NavLink to="/therapist/sessions/manage" className={({ isActive }) => isActive ? 'active' : ''}>
                  <span className="icon">📝</span> <span className="sidebar-text">Mes Programmes</span>
                </NavLink>
              </li>
            )}
          </ul>

          <div className="sidebar-footer">
            <button onClick={handleLogout} className="btn-logout-sidebar">
              <span className="icon">→</span> <span className="sidebar-text">Déconnexion</span>
            </button>
          </div>
        </aside>

        <main className="main-container">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
