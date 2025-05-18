// src/routes/PrivateRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
  allowedRoles: Array<'cliente' | 'pos'>;
}

const PrivateRoute = ({ children, allowedRoles }: Props) => {
  const { user } = useAuth();

  // No autenticado → al login
  if (!user) return <Navigate to="/login" />;

  //Autenticado pero sin el rol correcto → fuera
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />; // o una página de "No autorizado"
  }

  // ✅ Autorizado
  return <>{children}</>;
};

export default PrivateRoute;
