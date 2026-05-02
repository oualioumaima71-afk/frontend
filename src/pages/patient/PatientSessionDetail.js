import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api';
import Layout from '../../components/Layout';
import VideoPlayer from '../../components/VideoPlayer';

function PatientSessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    api.get(`/patient/sessions/${id}`).then(res => setSession(res.data)).catch(() => navigate('/login'));
  }, [id, navigate]);

  const validateExercise = async (exId, status) => {
    try {
      const res = await api.put(`/patient/sessions/${id}/exercise/${exId}`, { status });
      setSession(res.data);
    } catch (err) { 
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Erreur de validation", type: 'error' } }));
    }
  };

  const completeSession = async () => {
    try {
      const res = await api.put(`/patient/sessions/${id}/complete`);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Félicitations ! Séance terminée. Score : ${res.data.newScore}`, type: 'success' } }));
      
      const level = res.data.newLevel || 'faible';
      let msg = "";
      if (level === 'faible') msg = "Continue tes efforts, chaque séance compte ! 🚀";
      else if (level === 'moyen') msg = "Super progression ! Tu es sur la bonne voie 💪";
      else msg = "Excellent travail ! Ton niveau est au top ! 🌟";
      
      localStorage.setItem('session_notification', JSON.stringify({ message: msg }));
      window.dispatchEvent(new Event('new_notification'));

      navigate('/patient/dashboard');
    } catch (err) { 
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: err.response?.data?.message || "Erreur lors de la validation finale", type: 'error' } }));
    }
  };

  if (!session) return <Layout role="patient"><div style={{padding: '24px', color:'var(--text-muted)'}}>Chargement en cours...</div></Layout>;

  const allCompleted = session.exercises.every(ex => ex.validationStatus !== 'pending');
  const sessionStatusLabel = session.status === 'completed' ? 'Terminée' : (session.status === 'in_progress' ? 'En cours' : 'À faire');

  return (
    <Layout role="patient">
      <div className="session-header-container">
        <div className="session-header-top">
          <Link to="/patient/sessions" className="back-link">
            <span className="back-icon">←</span>
            <span className="back-text">Mes séances</span>
          </Link>
          <div className="session-status-badge" data-status={session.status}>
            {sessionStatusLabel}
          </div>
        </div>
        <h1 className="session-main-title">{session.title}</h1>
      </div>

      <div className="exercises-timeline">
        {session.exercises.map((ex, index) => (
          <div key={ex._id} className="exercise-card">
            <div className="exercise-index">Exercice {index + 1}</div>
            
            <div className="exercise-layout">
              {ex.videoPath && (
                <div className="exercise-video-section">
                  <VideoPlayer videoPath={ex.videoPath} title={ex.title} />
                </div>
              )}
              
              <div className="exercise-info-section">
                <h2 className="exercise-title">{ex.title}</h2>
                <p className="exercise-description">{ex.description}</p>
                
                <div className="exercise-stats">
                  <div className="stat-pill">
                    <span className="stat-icon">⏱</span>
                    <span className="stat-value">{ex.duration}s</span>
                  </div>
                  <div className="stat-pill">
                    <span className="stat-icon">🔄</span>
                    <span className="stat-value">{ex.repetitions} reps</span>
                  </div>
                </div>
                
                <div className="exercise-actions">
                  {session.status !== 'completed' ? (
                    <div className="validation-buttons">
                      <button 
                        onClick={() => validateExercise(ex._id, 'fait')} 
                        className={`action-btn success-btn ${ex.validationStatus === 'fait' ? 'active' : ''}`}
                      >
                        <span className="btn-icon">✓</span>
                        J'ai réussi
                      </button>
                      <button 
                        onClick={() => validateExercise(ex._id, 'non fait')} 
                        className={`action-btn fail-btn ${ex.validationStatus === 'non fait' ? 'active' : ''}`}
                      >
                        <span className="btn-icon">✗</span>
                        Trop difficile
                      </button>
                    </div>
                  ) : (
                    <div className={`completion-status ${ex.validationStatus}`}>
                      {ex.validationStatus === 'fait' ? (
                        <><span>✓</span> Exercice accompli !</>
                      ) : (
                        <><span>✗</span> Pas effectué</>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {session.status !== 'completed' && (
        <div className="sticky-footer">
          <div className="footer-content">
            <div className="completion-progress">
              {session.exercises.filter(ex => ex.validationStatus !== 'pending').length} / {session.exercises.length} terminés
            </div>
            <button 
              onClick={completeSession} 
              disabled={!allCompleted} 
              className="btn btn-primary finish-btn"
            >
              Terminer la séance
            </button>
          </div>
        </div>
      )}

      <style>{`
        .session-header-container {
          margin-bottom: 32px;
        }

        .session-header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .back-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          font-weight: 500;
          font-size: 14px;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: var(--primary);
        }

        .session-status-badge {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .session-status-badge[data-status="completed"] {
          background: #e1f7f1;
          color: #0d9488;
        }

        .session-status-badge[data-status="in_progress"] {
          background: #fff7ed;
          color: #c2410c;
        }

        .session-status-badge:not([data-status="completed"]):not([data-status="in_progress"]) {
          background: #f1f5f9;
          color: #475569;
        }

        .session-main-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text);
          margin: 0;
          line-height: 1.2;
          letter-spacing: -0.5px;
        }

        .exercises-timeline {
          display: flex;
          flex-direction: column;
          gap: 40px;
          padding-bottom: 140px;
        }

        .exercise-card {
          background: white;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.03);
          border: 1px solid rgba(0,0,0,0.02);
          position: relative;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          margin-top: 12px;
        }

        .exercise-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.06);
        }

        .exercise-index {
          position: absolute;
          top: -14px;
          left: 24px;
          background: var(--primary);
          color: white;
          padding: 4px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(88, 201, 207, 0.3);
          z-index: 10;
        }

        .exercise-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: start;
        }

        .exercise-video-section {
          width: 100%;
        }

        .exercise-info-section {
          display: flex;
          flex-direction: column;
        }

        .exercise-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 12px 0;
          color: var(--text);
          line-height: 1.3;
        }

        .exercise-description {
          color: #475569;
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .exercise-stats {
          display: flex;
          gap: 12px;
          margin-bottom: 32px;
        }

        .stat-pill {
          background: #f8fafc;
          padding: 8px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #475569;
          font-size: 14px;
          border: 1px solid #f1f5f9;
        }

        .stat-icon {
          font-size: 16px;
        }

        .validation-buttons {
          display: flex;
          gap: 12px;
        }

        .action-btn {
          flex: 1;
          padding: 14px;
          border-radius: 14px;
          border: 2px solid transparent;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .success-btn {
          background: #f0fdf4;
          color: #166534;
        }

        .success-btn:hover {
          background: #dcfce7;
        }

        .success-btn.active {
          background: #16a34a;
          color: white;
          box-shadow: 0 8px 20px rgba(22, 163, 74, 0.25);
        }

        .fail-btn {
          background: #fef2f2;
          color: #991b1b;
        }

        .fail-btn:hover {
          background: #fee2e2;
        }

        .fail-btn.active {
          background: #dc2626;
          color: white;
          box-shadow: 0 8px 20px rgba(220, 38, 38, 0.25);
        }

        .completion-status {
          padding: 16px;
          border-radius: 14px;
          text-align: center;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .completion-status.fait {
          background: #f0fdf4;
          color: #166534;
        }

        .completion-status.non.fait {
          background: #fef2f2;
          color: #991b1b;
        }

        .sticky-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          padding: 20px 32px;
          border-top: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 -10px 40px rgba(0,0,0,0.05);
          z-index: 1000;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .completion-progress {
          font-weight: 600;
          color: var(--text-muted);
        }

        .finish-btn {
          padding: 16px 40px;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 700;
        }

        @media (max-width: 1024px) {
          .exercise-layout {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .exercise-card {
            padding: 24px;
          }
          
          .exercise-title {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .session-main-title {
            font-size: 1.75rem;
          }
          
          .exercise-title {
            font-size: 1.3rem;
          }

          .exercise-card {
            border-radius: 20px;
            padding: 20px;
          }

          .exercise-index {
            left: 16px;
          }

          .sticky-footer {
            padding: 12px 16px 24px;
          }

          .footer-content {
            flex-direction: column;
            gap: 10px;
          }

          .finish-btn {
            width: 100%;
            padding: 12px;
          }
        }

        @media (max-width: 480px) {
          .exercise-stats {
            flex-direction: column;
            gap: 8px;
          }
          
          .stat-pill {
            width: 100%;
          }

          .validation-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </Layout>
  );
}

export default PatientSessionDetail;
