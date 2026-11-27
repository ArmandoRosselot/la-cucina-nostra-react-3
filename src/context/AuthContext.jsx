import { createContext, useContext, useMemo, useState } from 'react';
import { obtenerSesion, iniciarSesion, cerrarSesion, buscarUsuarioPorEmail } from '../data/db.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(() => obtenerSesion());

  const valor = useMemo(() => {
    /* La sesión guardada en el navegador se puede manipular, por eso el rol
       real siempre se consulta en la "base de datos" (db.js). */
    const usuario = sesion ? buscarUsuarioPorEmail(sesion.email) : null;
    return {
      sesion,
      usuario,
      autenticado: Boolean(usuario),
      esAdmin: usuario?.rol === 'admin',
      entrar: (u) => {
        iniciarSesion(u);
        setSesion(obtenerSesion());
      },
      /* Vuelve a leer la cuenta (por ejemplo tras editar el perfil). */
      refrescar: () => {
        const actual = sesion ? buscarUsuarioPorEmail(sesion.email) : null;
        if (actual) { iniciarSesion(actual); setSesion(obtenerSesion()); }
      },
      salir: () => {
        cerrarSesion();
        setSesion(null);
      }
    };
  }, [sesion]);

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
