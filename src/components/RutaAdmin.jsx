import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/* Protege rutas exclusivas del administrador.
   Si no hay sesión o el rol no es 'admin', redirige al inicio ('/').
   Uso: <RutaAdmin><PanelAdmin /></RutaAdmin> */
export default function RutaAdmin({ children }) {
  const { sesion } = useAuth();

  if (sesion?.rol !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
