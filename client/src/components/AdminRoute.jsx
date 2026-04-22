import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!adminEmail || user?.email !== adminEmail) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
