import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Shield, Heart, Activity } from 'lucide-react';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simular delay de autenticação
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, remember }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao autenticar');
        setIsLoading(false);
        return;
      }

      alert('Login realizado com sucesso!');
      localStorage.setItem('accessToken', data.accessToken);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Erro ao conectar com o servidor');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="login-container">
      {/* Background elements */}
      <div className="login-background">
        <div className="login-background-element login-background-heart">
          <Heart size={128} />
        </div>
        <div className="login-background-element login-background-activity">
          <Activity size={160} />
        </div>
        <div className="login-background-element login-background-shield">
          <Shield size={96} />
        </div>
        <div className="login-background-element login-background-circle"></div>
        <div className="login-background-element login-background-square"></div>
      </div>

      <div className="login-main-container">
        {/* Header */}
        <div className="login-header">
          <h1 className="login-title">Formulários PREM</h1>
          <p className="login-subtitle">Acesso institucional aos resultados</p>
        </div>

        {/* Login Card */}
        <div className="login-card">
          {/* Error message */}
          {error && (
            <div className="login-error">
              <svg className="login-error-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="login-error-text">{error}</p>
            </div>
          )}

          <div className="login-form">
            {/* Email field */}
            <div className="login-field">
              <label className="login-label">Email</label>
              <div className="login-input-container">
                <Mail size={20} className="login-input-icon" />
                <input
                  type="email"
                  className="login-input"
                  placeholder="medico@hospital.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="login-field">
              <label className="login-label">Senha</label>
              <div className="login-input-container">
                <Lock size={20} className="login-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="login-input login-input-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-password-toggle"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="login-checkbox-container" onClick={() => setRemember(!remember)}>
              <div className={`login-checkbox ${remember ? 'checked' : ''}`}>
                {remember && (
                  <svg className="login-checkbox-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="login-checkbox-label">Manter sessão ativa</span>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              onClick={handleLogin}
              className="login-button"
            >
              {isLoading ? (
                <>
                  <div className="login-spinner"></div>
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <Shield size={20} />
                  <span>Login</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;