import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, CATEGORIES } from '../components/Layout';
import api from '../api';

export default function NewComplaint() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', category: CATEGORIES[0], description: '', priority: 'Medium' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setLoading(true); setServerError('');
    try {
      const res = await api.post('/complaints', form);
      navigate(`/complaints/${res.data.complaint._id}`);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]: '' })); };

  return (
    <Layout title="File a Complaint">
      <div className="form-card">
        <h2 className="form-title">📝 New Complaint</h2>
        {serverError && <div className="error-msg">{serverError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group full">
              <label>Title *</label>
              <input className={errors.title ? 'error' : ''} value={form.title} onChange={set('title')} placeholder="Brief title of your complaint" />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={form.priority} onChange={set('priority')}>
                {['Low', 'Medium', 'High'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group full">
              <label>Description *</label>
              <textarea className={errors.description ? 'error' : ''} value={form.description} onChange={set('description')} placeholder="Describe your complaint in detail…" />
              {errors.description && <span className="field-error">{errors.description}</span>}
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Submitting…' : 'Submit Complaint'}</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
