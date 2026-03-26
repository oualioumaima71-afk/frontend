import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import Layout from '../../components/Layout';

function PatientSessions() {
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/patient/sessions')
      .then(res => setSessions(res.data))
      .catch(err => {
        if(err.response?.status === 401) navigate('/login');
      });
  }, [navigate]);

  return (
    <Layout role="patient">
      <h1 style={{marginBottom: '8px'}}>Programmes de Rééducation</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '15px' }}>Tous les programmes globaux disponibles pour votre rééducation.</p>

      {sessions.length === 0 ? <div className="card" style={{textAlign:'center', color:'var(--text-muted)'}}>Aucun programme n'a été créé par les thérapeutes.</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {sessions.map(s => {
            const isCompleted = s.status === 'completed';
            const isInProgress = s.status === 'in_progress';

            return (
              <div key={s._id} className="card" style={{ display: 'flex', flexDirection: 'column', marginBottom: 0 }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '18px', color: 'var(--text)', marginBottom: '8px' }}>{s.title}</h2>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    Thérapeute source : {s.therapistId?.nom || 'Inconnu'} <br/>
                    {s.exercises?.length || 0} exercices
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '12px', backgroundColor: isCompleted ? '#e8f5e9' : (isInProgress ? '#fff3e0' : '#f5f5f5'), color: isCompleted ? 'var(--primary)' : (isInProgress ? '#e65100' : 'var(--text-muted)') }}>
                    {isCompleted ? 'Terminé' : (isInProgress ? 'En cours' : 'Nouvelle Séance')}
                  </span>
                  
                  <Link to={`/patient/sessions/${s._id}`} className="btn" style={{ padding: '8px 16px', backgroundColor: isCompleted ? '#e9ecef' : 'var(--primary)', color: isCompleted ? 'var(--text)' : 'white' }}>
                    {isCompleted ? 'Revoir' : (isInProgress ? 'Continuer' : 'Démarrer')}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
export default PatientSessions;
