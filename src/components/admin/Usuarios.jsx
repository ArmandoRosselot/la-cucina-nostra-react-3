import { useState } from 'react';
import Cabecera from './Cabecera.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { obtenerUsuarios, actualizarUsuario, eliminarUsuario } from '../../data/db.js';

/* Gestión de cuentas reales: cambiar rol y eliminar (el admin principal y tu propia cuenta están protegidos). */
export default function Usuarios({ onVolver }) {
  const { usuario: yo } = useAuth();
  const [usuarios, setUsuarios] = useState(() => obtenerUsuarios());
  const [aviso, setAviso] = useState('');
  const recargar = () => setUsuarios(obtenerUsuarios());

  const cambiarRol = (u, rol) => {
    actualizarUsuario(u.id, { rol });
    setAviso(`${u.nombre} ahora es ${rol}.`);
    recargar();
  };
  const borrar = (u) => {
    if (!window.confirm(`¿Eliminar la cuenta de ${u.nombre}?`)) return;
    eliminarUsuario(u.id);
    setAviso('Cuenta eliminada.');
    recargar();
  };

  return (
    <div>
      <Cabecera titulo="Usuarios" subtitulo="Cuentas registradas y sus roles" onVolver={onVolver} />
      {aviso && <div className="alert alert-success py-2" role="status">{aviso}</div>}
      <div className="card border-0 shadow-sm"><div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light"><tr><th className="ps-4">Nombre</th><th>Correo</th><th>Comuna</th><th>Rol</th><th /></tr></thead>
          <tbody>
            {usuarios.map((u) => {
              const protegido = u.id === 0 || u.id === yo?.id;
              return (
                <tr key={u.id} data-testid="usuario-admin">
                  <td className="ps-4 fw-bold">{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>{u.comuna || '—'}</td>
                  <td>
                    <select className="form-select form-select-sm w-auto" aria-label={`Rol de ${u.nombre}`} value={u.rol} disabled={protegido}
                      onChange={(e) => cambiarRol(u, e.target.value)}>
                      <option value="cliente">cliente</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="text-end pe-3">
                    <button type="button" className="btn btn-sm btn-outline-danger" disabled={protegido} onClick={() => borrar(u)}>Eliminar</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div></div>
    </div>
  );
}
