import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="login-wrap">
      <div className="login-card" style={{ maxWidth: 480 }}>
        <div className="login-header">
          <h1 className="login-title">Create Account</h1>
          <p className="login-sub">Register to file complaints</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input value={form.name} onChange={set('name')} placeholder="Your full name" required />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input value={form.phone} onChange={set('phone')} placeholder="10-digit number" />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input value={form.address} onChange={set('address')} placeholder="Your address" />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#888' }}>
          Already have an account? <Link to="/login" style={{ color: '#4a9eff', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
