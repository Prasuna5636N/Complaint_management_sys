import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, StatusBadge } from '../components/Layout';
import api from '../api';

const CATEGORIES = ['Infrastructure', 'Billing', 'Service', 'Safety', 'Noise', 'Sanitation', 'Other'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/complaints/stats').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  const getCount = (arr, key) => arr?.find(s => s._id === key)?.count || 0;
  const totalComplaints = stats?.statusStats?.reduce((a, s) => a + s.count, 0) || 0;

  return (
    <Layout title="Admin Dashboard">
      {loading ? <p style={{ color: '#888' }}>Loading stats…</p> : (
        <>
          <div className="stats-row">
            <StatCard label="Total" value={totalComplaints} color="#4a9eff" />
            <StatCard label="Pending" value={getCount(stats.statusStats, 'Pending')} color="#f0ad4e" />
            <StatCard label="In Progress" value={getCount(stats.statusStats, 'In Progress')} color="#4a9eff" />
            <StatCard label="Resolved" value={getCount(stats.statusStats, 'Resolved')} color="#28a745" />
            <StatCard label="Rejected" value={getCount(stats.statusStats, 'Rejected')} color="#e74c3c" />
          </div>

          <div className="dash-grid">
            <div className="card">
              <h3 className="card-title">Recent Complaints</h3>
              {stats.recentComplaints?.map(c => (
                <div className="recent-item" key={c._id} onClick={() => navigate(`/admin/complaints/${c._id}`)}>
                  <div>
                    <span className="mono" style={{ fontSize: 12, color: '#4a9eff', marginRight: 8 }}>{c.complaintId}</span>
                    <span style={{ fontSize: 13, color: '#333' }}>{c.title}</span>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
              <button className="btn-view" style={{ marginTop: 14, width: '100%', padding: '9px' }} onClick={() => navigate('/admin/complaints')}>
                View All Complaints →
              </button>
            </div>

            <div className="card">
              <h3 className="card-title">By Category</h3>
              {CATEGORIES.map(cat => {
                const count = getCount(stats.categoryStats, cat);
                const pct = totalComplaints ? Math.round((count / totalComplaints) * 100) : 0;
                return count > 0 ? (
                  <div className="cat-row" key={cat}>
                    <span className="cat-name">{cat}</span>
                    <div className="cat-bar-wrap"><div className="cat-bar" style={{ width: `${pct}%` }} /></div>
                    <span className="cat-count">{count}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </>
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
