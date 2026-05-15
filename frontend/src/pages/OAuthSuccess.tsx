import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen } from 'lucide-react';

const OAuthSuccess = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      login(token);

      let role = 'ROLE_USER';
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        role = payload.role || 'ROLE_USER';
      } catch (e) {
        console.error("Failed to decode token", e);
      }

      if (role === 'ROLE_ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } else {
      setError('Missing token from Google sign-in. Try again.');
    }
  }, [login, navigate]);

  if (error) {
    return (
      <div className="auth-layout">
        <div className="card auth-card">
          <p style={{ color: 'var(--color-error)' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-layout">
      <div className="card auth-card" style={{ textAlign: 'center' }}>
        <BookOpen size={40} style={{ marginBottom: '1rem' }} />
        <p className="text-muted">Signing you in…</p>
      </div>
    </div>
  );
};

export default OAuthSuccess;
