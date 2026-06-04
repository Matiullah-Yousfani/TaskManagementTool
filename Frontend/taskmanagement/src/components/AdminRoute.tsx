import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './ui/GlassPanel';

export function AdminRoute() {
  const { isAdmin, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
