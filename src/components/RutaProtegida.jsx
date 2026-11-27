import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/* Protege una ruta con inicio de sesión y, opcionalmente, con roles.
   - Sin sesión válida  -> redirige a /login recordando a dónde quería ir.
   - Con sesión pero sin el rol -> pantalla "Acceso denegado" (403).
   Uso: <RutaProtegida roles={['admin']}><Panel /></RutaProtegida> */
export default function RutaProtegida({ roles, children }) {
  const { usuario } = useAuth();
  const ubicacion = useLocation();

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: ubicacion.pathname, aviso: 'Inicia sesión para continuar.' }} />;
  }

  if (roles && !roles.includes(usuario.rol)) {
    return (
      <main className="auth-page">
        <div className="card-box text-center" role="alert">
          <h3>Acceso denegado</h3>
          <p>Tu cuenta no tiene permisos para ver esta sección.</p>
          <Link to="/" className="btn-main d-inline-block text-decoration-none">Volver al inicio</Link>
        </div>
      </main>
    );
  }

  return children;
}
