import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../index.css';

export function Layout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/complaints', label: 'All Complaints'},
  ];
  const userLinks = [
    { to: '/dashboard', label: 'My Complaints', end: true },
    { to: '/complaints/new', label: 'File Complaint' },
  ];
  const links = user?.role === 'admin' ? adminLinks : userLinks;

  return (
    <div className="app-wrap">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">CMS</span>
        </div>
        <div className="sidebar-user">
          <div className="avatar">{user?.name?.[0]}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role === 'admin' ? 'Administrator' : 'Citizen'}</div>
          </div>
        </div>
        <nav className="nav">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
      </aside>
      <main className="main-content">
        <div className="top-bar">
          <h1 className="page-title">{title}</h1>
          <span className="date-tag">
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
        {children}
      </main>
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = { 'Pending': 'pending', 'In Progress': 'inprogress', 'Resolved': 'resolved', 'Rejected': 'rejected' };
  return (
    <span className={`badge badge-${map[status] || 'pending'}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}

export const PRIORITY_COLOR = { High: '#e74c3c', Medium: '#f39c12', Low: '#27ae60' };
export const CATEGORIES = ['Infrastructure', 'Billing', 'Service', 'Safety', 'Noise', 'Sanitation', 'Other'];
