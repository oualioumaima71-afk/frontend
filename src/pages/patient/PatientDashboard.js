import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import Layout from '../../components/Layout';

function PatientDashboard() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/patient/dashboard');
        setStats(res.data);
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
      }
    };
    fetchStats();
  }, [navigate]);

  if (!stats) return <Layout role="patient"><div style={{ padding: '24px', color: 'var(--text-muted)' }}>Chargement de votre espace...</div></Layout>;

  // Motivation Engine
  let motivationMsg = "Continue … la discipline construit quelque chose de grand !";
  let bannerStyle = { background: 'linear-gradient(135deg, #2E7D32 0%, #43a047 100%)' };

  if (stats.lastSessionDate) {
    const lastDate = new Date(stats.lastSessionDate);
    const diffTime = Math.abs(new Date() - lastDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 3) {
      motivationMsg = `Rappel : Cela fait ${diffDays} jours que tu n'as pas pratiqué. Reprends le rythme, ne lâche rien 💪`;
      bannerStyle = { background: 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)' }; // Orange motivation
    } else if (stats.score_global > 70) {
      motivationMsg = "Félicitations pour ton assiduité, ton score global est excellent ! 🌟";
    }
  } else if (stats.completedSessions === 0) {
    motivationMsg = "Bienvenue sur Flowvia ! Commence ta première séance pour obtenir ton niveau.";
  }

  return (
    <Layout role="patient">
      <div className="motivation-banner" style={bannerStyle}>
        <div style={{ fontSize: '32px' }}>💡</div>
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', color: 'white' }}>Mot du jour</h2>
          <p style={{ margin: 0, fontSize: '15px', color: 'rgba(255,255,255,0.95)' }}>{motivationMsg}</p>
        </div>
      </div>

      <h1 style={{ marginBottom: '24px' }}>Mon Espace</h1>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', padding: '24px' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '12px', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Programmes Complétés</h3>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text)', lineHeight: '1' }}>
            {stats.completedSessions} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>/ {stats.totalSessions}</span>
          </div>
        </div>

        <div className="card" style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', padding: '24px' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '12px', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Score Moyen</h3>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text)', lineHeight: '1' }}>{stats.score_global}%</div>
        </div>

        <div className="card" style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', padding: '24px' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '12px', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Niveau Actuel</h3>
          <div style={{
            fontSize: '0.9rem',
            fontWeight: '600',
            textTransform: 'capitalize',
            color: stats.level === 'nouveau' ? '#546e7a' : (stats.level === 'faible' ? '#d32f2f' : (stats.level === 'moyen' ? '#ef6c00' : 'var(--primary)')),
            lineHeight: '1',
            display: 'inline-flex',
            alignItems: 'center',
            background: stats.level === 'nouveau' ? '#eceff1' : (stats.level === 'faible' ? '#ffebee' : (stats.level === 'moyen' ? '#fff3e0' : '#e8f5e9')),
            padding: '4px 12px',
            borderRadius: '20px',
            width: 'fit-content'
          }}>
            {stats.level}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <Link to="/patient/sessions" className="btn" style={{ padding: '14px 32px', fontSize: '16px' }}>Consulter les programmes</Link>
      </div>
    </Layout>
  );
}
export default PatientDashboard;
