import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    requireAdmin?: boolean;
}

export const ProtectedRoute = ({ requireAdmin }: ProtectedRouteProps) => {
    const { user, isAdmin } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && !isAdmin) {
        // Jeśli user próbuje wejść na admina a nie ma uprawnień -> przekieruj na dashboard
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};