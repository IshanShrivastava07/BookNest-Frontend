import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/axios';
import { getApiErrorMessage } from '../utils/apiError';
import { useAuth } from '../context/AuthContext';
import { BookOpen, User, Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, RotateCcw } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpMode, setOtpMode] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!EMAIL_REGEX.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!PASSWORD_REGEX.test(formData.password)) {
      setError('Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'ROLE_USER'
      });
      setOtpMode(true);
      setError('');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to register. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/auth/verify?email=${encodeURIComponent(formData.email)}&otp=${otp}`);
      const { token } = response.data;
      if (token) {
        login(token);
        navigate('/dashboard');
      } else {
        setError('Verification failed: No token received.');
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Invalid or expired OTP.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setResending(true);
    try {
      await api.post(`/auth/resend-otp?email=${encodeURIComponent(formData.email)}`);
      setError(''); // clear any previous error
      setOtp('');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to resend OTP.'));
    } finally {
      setResending(false);
    }
  };

  // ── OTP Verification Screen ──
  if (otpMode) {
    return (
      <div className="auth-layout">
        <div className="card auth-card">
          <div className="auth-header">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--color-gold)' }}>
              <ShieldCheck size={48} />
            </div>
            <h1 className="auth-title">Verify Email</h1>
            <p className="auth-subtitle">
              We sent a 6-digit OTP to<br />
              <strong style={{ color: 'var(--color-text)' }}>{formData.email}</strong>
            </p>
          </div>

          {error && (
            <div style={{ backgroundColor: '#FEE2E2', color: 'var(--color-error)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleVerifyOtp}>
            <div className="input-group">
              <label className="input-label">Enter OTP</label>
              <input
                type="text"
                className="input-field"
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.75rem', fontWeight: 600 }}
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
                autoFocus
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Login'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button
              onClick={handleResendOtp}
              disabled={resending}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text)',
                fontWeight: 600,
                cursor: resending ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.875rem',
                opacity: resending ? 0.5 : 1
              }}
            >
              <RotateCcw size={14} />
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>

          <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.75rem', color: '#6B7280' }}>
            OTP expires in 5 minutes
          </div>
        </div>
      </div>
    );
  }

  // ── Registration Screen ──
  return (
    <div className="auth-layout">
      <div className="card auth-card">
        <div className="auth-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--color-text)' }}>
            <BookOpen size={40} />
          </div>
          <h1 className="auth-title">Create an Account</h1>
          <p className="auth-subtitle">Join Book<span className="text-gold">Nest</span> today</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', color: 'var(--color-error)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                <User size={18} />
              </div>
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Email</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                <Mail size={18} />
              </div>
              <input
                type="email"
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 0 }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <span style={{ color: '#6B7280' }}>Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--color-text)', fontWeight: 600 }}>Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
