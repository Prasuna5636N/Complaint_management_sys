import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, StatusBadge, PRIORITY_COLOR } from '../components/Layout';
import api from '../api';

export default function UserDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/complaints').then(r => setComplaints(r.data.complaints)).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
  };

  return (
    <Layout title="My Complaints">
      <div className="stats-row">
        <StatCard label="Total Filed" value={stats.total} color="#4a9eff" />
        <StatCard label="Pending" value={stats.pending} color="#f0ad4e" />
        <StatCard label="In Progress" value={stats.inProgress} color="#4a9eff" />
        <StatCard label="Resolved" value={stats.resolved} color="#28a745" />
      </div>
      <div className="section-header">
        <h2 className="section-title">Complaint History</h2>
        <button className="btn-primary" onClick={() => navigate('/complaints/new')}>+ New Complaint</button>
      </div>
      {loading ? <p style={{ color: '#888' }}>Loading…</p> : complaints.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p className="empty-msg">No complaints filed yet.</p>
          <button className="btn-primary" onClick={() => navigate('/complaints/new')}>File your first complaint</button>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Title</th><th>Category</th><th>Priority</th><th>Status</th><th>Date</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(c => (
                <tr key={c._id}>
                  <td className="mono" style={{ color: '#4a9eff', fontWeight: 600 }}>{c.complaintId}</td>
                  <td style={{ maxWidth: 200 }}><span style={{ display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.title}</span></td>
                  <td><span className="cat-tag">{c.category}</span></td>
                  <td><span style={{ color: PRIORITY_COLOR[c.priority], fontWeight: 700, fontSize: 13 }}>▲ {c.priority}</span></td>
                  <td><StatusBadge status={c.status} /></td>
                  <td style={{ color: '#888', fontSize: 13 }}>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  <td><button className="btn-view" onClick={() => navigate(`/complaints/${c._id}`)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div className="stat-card" style={{ borderTopColor: color }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
