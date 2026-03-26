import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import HomeNavbar from '../components/HomeNavbar';
import HomeFooter from '../components/HomeFooter';
import { Eye, EyeOff } from 'lucide-react';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nom: '', age: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return setError('Les mots de passe ne correspondent pas.');
    }
    try {
      const res = await api.post('/auth/register', { ...form, age: Number(form.age) });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur d\'inscription');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
      <HomeNavbar />

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px' }}>
        <div className="card" style={{ width: '320px', padding: '24px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Créer un profil Patient</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '24px', fontSize: '12px' }}>Commencez votre rééducation avec Flowvia</p>
          
          <form onSubmit={handleRegister}>
            {error && <div style={{ color: '#d32f2f', marginBottom: '12px', fontSize: '12px', fontWeight: 'bold' }}>{error}</div>}
            
            <div className="form-group">
              <label>Nom complet</label>
              <input type="text" className="input" required onChange={e=>setForm({...form, nom: e.target.value})} />
            </div>
            
            <div className="form-group">
              <label>Âge</label>
              <input type="number" min="1" max="120" step="1" className="input" required onChange={e=>setForm({...form, age: e.target.value})} />
            </div>
            
            <div className="form-group">
              <label>Mot de passe</label>
              <div className="password-input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="input" 
                  required 
                  onChange={e=>setForm({...form, password: e.target.value})} 
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <div className="password-input-wrapper">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  className="input" 
                  required 
                  onChange={e=>setForm({...form, confirmPassword: e.target.value})} 
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <button type="submit" className="btn" style={{ width: '100%', marginTop: '8px', padding: '8px' }}>S'inscrire</button>
          </form>

          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px' }}>
            <Link to="/login">Déjà inscrit ? Se connecter</Link>
          </div>
        </div>
      </div>

      <HomeFooter />
    </div>
  );
}

export default Register;
