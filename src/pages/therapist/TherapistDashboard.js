import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import Layout from '../../components/Layout';

function TherapistDashboard() {
  const [patients, setPatients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/therapist/patients')
      .then(res => setPatients(res.data))
      .catch(err => {
        if(err.response?.status === 401) navigate('/login');
      });
  }, [navigate]);

  return (
    <Layout role="therapist">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Espace Thérapeute</h1>
          <p style={{ margin: '8px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>Supervisez les progrès des patients et créez des programmes globaux.</p>
        </div>
        <Link to="/therapist/sessions/manage" className="btn" style={{ padding: '12px 24px', fontSize: '15px' }}>+ Créer un programme</Link>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <h2 style={{ padding: '24px 24px 16px 24px', margin: 0, borderBottom: '1px solid var(--border)', fontSize: '1.2rem' }}>Liste des Patients Inscrits</h2>
        {patients.length === 0 ? <p style={{ padding: '24px', color: 'var(--text-muted)', margin: 0 }}>Aucun patient inscrit sur la plateforme.</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Patient</th>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Âge</th>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Séances Fait</th>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Score Moyen</th>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Niveau</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='#f8f9fa'} onMouseOut={e=>e.currentTarget.style.backgroundColor='transparent'}>
                  <td style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text)' }}>{p.nom}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>{p.age} ans</td>
                  <td style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--primary)' }}>{p.completedCount || 0}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ display: 'inline-block', backgroundColor: '#fff3e0', color: '#e65100', padding: '4px 12px', borderRadius: '12px', fontWeight: '700', fontSize: '13px' }}>{p.score_global}%</span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ display: 'inline-block', backgroundColor: '#e0f7fa', color: '#00838f', padding: '4px 12px', borderRadius: '12px', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>{p.level}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
export default TherapistDashboard;
