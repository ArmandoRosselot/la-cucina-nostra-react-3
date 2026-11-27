import { Fragment, useState } from 'react';
import Cabecera from './Cabecera.jsx';
import { obtenerOrdenes } from '../../data/db.js';
import { formatearPrecio } from '../../utils/validaciones.js';

const ESTADOS = { pagada: 'bg-success', rechazada: 'bg-danger', pendiente: 'bg-secondary' };

/* Órdenes reales generadas en el checkout de la tienda. */
export default function Ordenes({ onVolver }) {
  const [ordenes] = useState(() => obtenerOrdenes().slice().reverse());
  const [filtro, setFiltro] = useState('todas');
  const [abierta, setAbierta] = useState(null);
  const visibles = ordenes.filter((o) => filtro === 'todas' || o.estado === filtro);

  return (
    <div>
      <Cabecera titulo="Órdenes" subtitulo="Compras realizadas desde la tienda" onVolver={onVolver} />
      <div className="btn-group mb-3" role="group" aria-label="Filtrar por estado">
        {['todas', 'pagada', 'rechazada', 'pendiente'].map((e) => (
          <button key={e} type="button" className={`btn btn-sm ${filtro === e ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setFiltro(e)}>
            {e[0].toUpperCase() + e.slice(1)}
          </button>
        ))}
      </div>

      <div className="card border-0 shadow-sm"><div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light"><tr><th className="ps-4">N°</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th><th /></tr></thead>
          <tbody>
            {visibles.length === 0 && <tr><td colSpan="6" className="text-center text-muted py-4">No hay órdenes para mostrar.</td></tr>}
            {visibles.map((o) => (
              <Fragment key={o.id}>
                <tr data-testid="orden-admin">
                  <td className="ps-4 fw-bold">#{o.numero}</td>
                  <td>{o.cliente.nombre} {o.cliente.apellidos}<div className="small text-muted">{o.cliente.email}</div></td>
                  <td className="small text-muted">{new Date(o.fecha).toLocaleString('es-CL')}</td>
                  <td className="fw-bold">{formatearPrecio(o.total)}</td>
                  <td><span className={`badge ${ESTADOS[o.estado]}`}>{o.estado}</span></td>
                  <td className="text-end pe-3">
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setAbierta(abierta === o.id ? null : o.id)}>
                      {abierta === o.id ? 'Ocultar' : 'Detalle'}
                    </button>
                  </td>
                </tr>
                {abierta === o.id && (
                  <tr><td colSpan="6" className="bg-light">
                    <ul className="mb-1">{o.items.map((i) => <li key={i.id}>{i.cantidad} × {i.nombre} — {formatearPrecio(i.subtotal)}</li>)}</ul>
                    <small className="text-muted">Entrega: {o.direccion.calle} {o.direccion.departamento}, {o.direccion.comuna}, {o.direccion.region}</small>
                  </td></tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div></div>
    </div>
  );
}
