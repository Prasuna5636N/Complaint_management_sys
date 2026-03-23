import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fill = (email, password) => setForm({ email, password });

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">CMS Portal</h1>
          <p className="login-sub">Complaint Management System</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@gmail.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" required />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#888' }}>
          New user? <Link to="/register" style={{ color: '#4a9eff', fontWeight: 600 }}>Register here</Link>
        </p>
        <div className="quick-access">
          <p className="quick-title">Quick Access (Demo)</p>
          <div className="quick-btns">
            <button className="quick-btn" onClick={() => fill('admin@cms.com', 'admin123')}>Admin</button>
            <button className="quick-btn" onClick={() => fill('arjun12@gmail.com', 'arjun123')}>Arjun</button>
            <button className="quick-btn" onClick={() => fill('varshi123@gmail.com', 'varshi123')}>Varshini</button>
            <button className="quick-btn" onClick={() => fill('joshu123@gmail.com', 'joshu123')}>Jyothsna</button>
          </div>
        </div>
      </div>
    </div>
  );
}
