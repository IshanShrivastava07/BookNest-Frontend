import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#6B7280' }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const role = user?.role ?? '';
    if (!allowedRoles.includes(role)) {
      return <Navigate to={role === 'ROLE_ADMIN' ? '/admin' : '/'} replace />;
    }
  } else {
    // Standard user route: prevent ADMIN from accessing it
    const role = user?.role ?? '';
    if (role === 'ROLE_ADMIN') {
      return <Navigate to="/admin" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
