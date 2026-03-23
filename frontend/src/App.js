import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NewComplaint from './pages/NewComplaint';
import ComplaintDetail from './pages/ComplaintDetail';
import ManageComplaints from './pages/ManageComplaints';

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontSize:18,color:'#888' }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* User routes */}
          <Route path="/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
          <Route path="/complaints/new" element={<PrivateRoute><NewComplaint /></PrivateRoute>} />
          <Route path="/complaints/:id" element={<PrivateRoute><ComplaintDetail /></PrivateRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/complaints" element={<PrivateRoute adminOnly><ManageComplaints /></PrivateRoute>} />
          <Route path="/admin/complaints/:id" element={<PrivateRoute adminOnly><ComplaintDetail /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
