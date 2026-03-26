import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api';
import Layout from '../../components/Layout';

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Link to="/patient/sessions" className="btn btn-secondary" style={{ padding: '6px 12px', borderRadius: '8px' }}>← Retour</Link>
        <h1 style={{ margin: 0 }}>{session.title}</h1>
        <span style={{ fontSize: '12px', padding: '4px 10px', background: session.status === 'completed' ? '#e8f5e9' : '#fff3e0', color: session.status === 'completed' ? 'var(--primary)' : '#e65100', borderRadius: '12px', fontWeight: '600' }}>{sessionStatusLabel}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {session.exercises.map((ex, index) => (
          <div key={ex._id} className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', padding: '24px', alignItems: 'flex-start' }}>
            {ex.videoPath && (
              <div style={{ flex: '1 1 250px', background: '#000', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                {(ex.videoPath.includes('youtube') || ex.videoPath.includes('vimeo')) ? (
                  <iframe width="100%" height="200" src={ex.videoPath} title={ex.title} frameBorder="0" allowFullScreen style={{display:'block'}}></iframe>
                ) : (
                  <video width="100%" height="200" controls style={{display:'block', objectFit: 'cover'}} src={ex.videoPath} />
                )}
              </div>
            )}
            
            <div style={{ flex: '2 1 300px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Exercice {index + 1}</div>
              <h2 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', color: 'var(--text)' }}>{ex.title}</h2>
              <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#4a5568', lineHeight: '1.6' }}>{ex.description}</p>
              
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', background: '#f8f9fa', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', color: 'var(--primary)' }}>⏱ {ex.duration} secondes</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', background: '#f8f9fa', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', color: 'var(--primary)' }}>🔄 {ex.repetitions} répétitions</span>
              </div>
              
              {session.status !== 'completed' ? (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => validateExercise(ex._id, 'fait')} className="btn" style={{ flex: 1, padding: '12px', fontSize: '14px', background: ex.validationStatus === 'fait' ? 'var(--primary)' : '#e9ecef', color: ex.validationStatus === 'fait' ? 'white' : 'var(--text)', boxShadow: 'none' }}>✓ J'ai réussi</button>
                  <button onClick={() => validateExercise(ex._id, 'non fait')} className="btn" style={{ flex: 1, padding: '12px', fontSize: '14px', background: ex.validationStatus === 'non fait' ? '#e53935' : '#e9ecef', color: ex.validationStatus === 'non fait' ? 'white' : 'var(--text)', boxShadow: 'none' }}>✗ Trop difficile</button>
                </div>
              ) : (
                <div style={{ fontSize: '14px', fontWeight: '600', padding: '12px', borderRadius: '8px', background: ex.validationStatus === 'fait' ? '#e8f5e9' : '#ffebee', color: ex.validationStatus === 'fait' ? 'var(--primary)' : '#e53935', textAlign: 'center' }}>
                  {ex.validationStatus === 'fait' ? 'Exercice accompli avec succès ! 🎉' : 'Exercice manqué lors de cette séance.'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {session.status !== 'completed' && (
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={completeSession} disabled={!allCompleted} className="btn" style={{ padding: '14px 32px', fontSize: '16px', opacity: allCompleted ? 1 : 0.4 }}>
            Valider
          </button>
        </div>
      )}
    </Layout>
  );
}
export default PatientSessionDetail;
