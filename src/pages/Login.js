import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import HomeNavbar from '../components/HomeNavbar';
import HomeFooter from '../components/HomeFooter';
import { Eye, EyeOff } from 'lucide-react';

function Login() {
  const navigate = useNavigate();
  const [nom, setNom] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { nom, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      if (res.data.user.role === 'patient') navigate('/patient/dashboard');
      else navigate('/therapist/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
      <HomeNavbar />
      
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px' }}>
        <div className="card" style={{ width: '300px', padding: '24px' }}>
          <h1 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '4px' }}>Flowvia</h1>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '24px' }}>Votre progression, à votre rythme</p>
          
          <form onSubmit={handleLogin}>
            {error && <div style={{ color: '#d32f2f', marginBottom: '12px', fontSize: '12px', fontWeight: 'bold' }}>{error}</div>}
            
            <div className="form-group">
              <label>Nom ou Identifiant</label>
              <input type="text" className="input" placeholder="Ex: Dr. Dupont ou Alice" value={nom} onChange={e=>setNom(e.target.value)} required />
            </div>
            
            <div className="form-group">
              <label>Mot de passe</label>
              <div className="password-input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="input" 
                  placeholder="Mot de passe" 
                  value={password} 
                  onChange={e=>setPassword(e.target.value)} 
                  required 
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
            
            <button type="submit" className="btn" style={{ width: '100%', marginTop: '8px', padding: '8px' }}>Se connecter</button>
          </form>

          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px' }}>
            <Link to="/register">Patient ? Créer un compte</Link>
          </div>
        </div>
      </div>

      <HomeFooter />
    </div>
  );
}

export default Login;
