import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, StatusBadge, PRIORITY_COLOR } from '../components/Layout';
import api from '../api';

const CATEGORIES = ['Infrastructure', 'Billing', 'Service', 'Safety', 'Noise', 'Sanitation', 'Other'];

export default function ManageComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '', search: '' });
  const navigate = useNavigate();

  const fetchComplaints = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.category) params.set('category', filters.category);
    if (filters.search) params.set('search', filters.search);
    api.get(`/complaints?${params}`).then(r => {
      setComplaints(r.data.complaints);
      setTotal(r.data.total);
    }).finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this complaint?')) return;
    await api.delete(`/complaints/${id}`);
    fetchComplaints();
  };

  const set = (k) => (e) => setFilters(p => ({ ...p, [k]: e.target.value }));

  return (
    <Layout title="All Complaints">
      <div className="filter-row">
        <input style={{ flex: 1, marginBottom: 0 }} placeholder="🔍 Search ID, title…" value={filters.search} onChange={set('search')} />
        <select value={filters.status} onChange={set('status')}>
          <option value="">All Statuses</option>
          {['Pending', 'In Progress', 'Resolved', 'Rejected'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filters.category} onChange={set('category')}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <p className="result-count">{total} complaint{total !== 1 ? 's' : ''} found</p>
      {loading ? <p style={{ color: '#888' }}>Loading…</p> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Filed By</th><th>Title</th><th>Category</th><th>Priority</th><th>Status</th><th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0
                ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#888' }}>No complaints found</td></tr>
                : complaints.map(c => (
                  <tr key={c._id}>
                    <td className="mono" style={{ color: '#4a9eff', fontWeight: 600 }}>{c.complaintId}</td>
                    <td style={{ fontSize: 13 }}>{c.user?.name}</td>
                    <td style={{ maxWidth: 180 }}><span style={{ display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.title}</span></td>
                    <td><span className="cat-tag">{c.category}</span></td>
                    <td><span style={{ color: PRIORITY_COLOR[c.priority], fontWeight: 700, fontSize: 13 }}>▲ {c.priority}</span></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td style={{ color: '#888', fontSize: 13 }}>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-view" onClick={() => navigate(`/admin/complaints/${c._id}`)}>View</button>
                      <button className="btn-danger" onClick={() => handleDelete(c._id)}>Delete</button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
