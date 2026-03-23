import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, StatusBadge, PRIORITY_COLOR } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function ComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminForm, setAdminForm] = useState({ status: '', adminNote: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/complaints/${id}`)
      .then(r => {
        setComplaint(r.data.complaint);
        setAdminForm({ status: r.data.complaint.status, adminNote: r.data.complaint.adminNote || '' });
      })
      .catch(() => setError('Complaint not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/complaints/${id}`, adminForm);
      setComplaint(res.data.complaint);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const backPath = user.role === 'admin' ? '/admin/complaints' : '/dashboard';
  const title = loading ? 'Loading…' : complaint?.title || 'Complaint Detail';

  return (
    <Layout title="Complaint Detail">
      {loading ? <p style={{ color: '#888' }}>Loading…</p> : error ? (
        <div className="error-msg">{error}</div>
      ) : (
        <div className="detail-card">
          <button className="back-btn" onClick={() => navigate(backPath)}>← Back</button>
          <div className="detail-header">
            <div>
              <span className="detail-id">{complaint.complaintId}</span>
              <h2 className="detail-title">{complaint.title}</h2>
            </div>
            <StatusBadge status={complaint.status} />
          </div>

          <div className="detail-meta">
            <MetaItem icon="👤" label="Filed by" value={complaint.user?.name} />
            <MetaItem icon="📂" label="Category" value={complaint.category} />
            <MetaItem icon="🎯" label="Priority" value={complaint.priority} color={PRIORITY_COLOR[complaint.priority]} />
            <MetaItem icon="📅" label="Filed on" value={new Date(complaint.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })} />
            <MetaItem icon="🔄" label="Updated" value={new Date(complaint.updatedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })} />
          </div>

          <div className="detail-section">
            <h3 className="detail-section-title">Description</h3>
            <p className="detail-desc">{complaint.description}</p>
          </div>

          {/* Status Timeline */}
          {complaint.statusHistory?.length > 0 && (
            <div className="detail-section">
              <h3 className="detail-section-title">Status Timeline</h3>
              <div className="timeline">
                {complaint.statusHistory.map((h, i) => (
                  <div className="timeline-item" key={i}>
                    <div className="timeline-dot" />
                    <div>
                      <div className="timeline-status">{h.status}</div>
                      {h.note && <div className="timeline-note">{h.note}</div>}
                      <div className="timeline-date">{new Date(h.changedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin actions */}
          {user.role === 'admin' ? (
            <div className="detail-section">
              <h3 className="detail-section-title">Admin Actions</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Update Status</label>
                  <select value={adminForm.status} onChange={e => setAdminForm(p => ({ ...p, status: e.target.value }))}>
                    {['Pending', 'In Progress', 'Resolved', 'Rejected'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group full">
                  <label>Admin Note</label>
                  <textarea value={adminForm.adminNote} onChange={e => setAdminForm(p => ({ ...p, adminNote: e.target.value }))} placeholder="Add a note visible to the citizen…" />
                </div>
              </div>
              {error && <div className="error-msg" style={{ marginTop: 8 }}>{error}</div>}
              {saved && <div className="success-msg" style={{ marginTop: 8 }}>✅ Changes saved successfully!</div>}
              <button className="btn-primary" style={{ marginTop: 14 }} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          ) : complaint.adminNote ? (
            <div className="detail-section">
              <h3 className="detail-section-title">Admin Response</h3>
              <div className="admin-note-box">{complaint.adminNote}</div>
            </div>
          ) : null}
        </div>
      )}
    </Layout>
  );
}

function MetaItem({ icon, label, value, color }) {
  return (
    <div className="meta-item">
      <span className="meta-icon">{icon}</span>
      <div>
        <div className="meta-label">{label}</div>
        <div className="meta-value" style={color ? { color, fontWeight: 700 } : {}}>{value}</div>
      </div>
    </div>
  );
}
