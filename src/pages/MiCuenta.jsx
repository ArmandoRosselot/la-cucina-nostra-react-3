import { Fragment, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PaginaPanel from '../components/PaginaPanel.jsx';
import PerfilForm from '../components/PerfilForm.jsx';
import TablaItems from '../components/TablaItems.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { obtenerOrdenesDeUsuario } from '../data/db.js';
import { formatearPrecio } from '../utils/validaciones.js';

const ESTADOS = {
  pagada: { texto: 'Pagada', clase: 'bg-success', accion: (id) => ({ ruta: `/pago-correcto/${id}`, texto: 'Ver boleta' }) },
  rechazada: { texto: 'Pago rechazado', clase: 'bg-danger', accion: (id) => ({ ruta: `/pago-error/${id}`, texto: 'Reintentar pago' }) },
  pendiente: { texto: 'Pendiente', clase: 'bg-secondary', accion: () => ({ ruta: '/comprar', texto: 'Ir al checkout' }) }
};

function Compras({ usuario }) {
  const ordenes = obtenerOrdenesDeUsuario(usuario.id).slice().reverse();
  const [abierta, setAbierta] = useState(null);
  const pagadas = ordenes.filter((o) => o.estado === 'pagada');
  const gastado = pagadas.reduce((s, o) => s + o.total, 0);

  if (ordenes.length === 0) {
    return <p className="text-center mb-0">Aún no has hecho compras. <Link to="/productos">Ver el menú</Link> o <Link to="/armar-pizza">arma tu pizza</Link>.</p>;
  }

  return (
    <>
      <p className="text-muted" data-testid="resumen-compras">
        {pagadas.length} {pagadas.length === 1 ? 'compra pagada' : 'compras pagadas'} · total gastado {formatearPrecio(gastado)}
      </p>
      <div className="table-responsive">
        <table className="table align-middle">
          <thead><tr><th>N°</th><th>Fecha</th><th>Unidades</th><th>Total</th><th>Estado</th><th /></tr></thead>
          <tbody>
            {ordenes.map((o) => {
              const estado = ESTADOS[o.estado] ?? ESTADOS.pendiente;
              const accion = estado.accion(o.id);
              return (
                <Fragment key={o.id}>
                  <tr data-testid="pedido">
                    <td>#{o.numero}</td>
                    <td>{new Date(o.fecha).toLocaleDateString('es-CL')}</td>
                    <td>{o.items.reduce((s, i) => s + i.cantidad, 0)}</td>
                    <td>{formatearPrecio(o.total)}</td>
                    <td><span className={`badge ${estado.clase}`}>{estado.texto}</span></td>
                    <td className="text-end">
                      <button type="button" className="btn btn-sm btn-outline-secondary me-1" aria-expanded={abierta === o.id}
                        onClick={() => setAbierta(abierta === o.id ? null : o.id)}>
                        {abierta === o.id ? 'Ocultar' : 'Detalle'}
                      </button>
                      <Link to={accion.ruta} className="btn btn-sm btn-outline-primary">{accion.texto}</Link>
                    </td>
                  </tr>
                  {abierta === o.id && (
                    <tr data-testid="detalle-pedido"><td colSpan="6" className="bg-light">
                      <TablaItems items={o.items} />
                      <p className="small text-muted mt-2 mb-0">
                        Entrega: {o.direccion.calle} {o.direccion.departamento}, {o.direccion.comuna}, {o.direccion.region}
                      </p>
                    </td></tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* Área del cliente (ruta protegida): configurar la cuenta y ver las compras hechas. */
export default function MiCuenta() {
  const { usuario } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'compras' ? 'compras' : 'datos';

  return (
    <PaginaPanel subtitulo={`Hola, ${usuario.nombre.split(' ')[0]}`} titulo="Mi cuenta">
      <ul className="nav nav-pills justify-content-center gap-2 mb-4" role="tablist">
        {[['datos', 'Configurar usuario'], ['compras', 'Mis compras']].map(([id, texto]) => (
          <li className="nav-item" key={id} role="presentation">
            <button type="button" role="tab" aria-selected={tab === id} className={`nav-link lcn-tab ${tab === id ? 'active' : ''}`}
              onClick={() => setParams(id === 'datos' ? {} : { tab: id })}>
              {texto}
            </button>
          </li>
        ))}
      </ul>
      {tab === 'datos' ? <PerfilForm /> : <Compras usuario={usuario} />}
    </PaginaPanel>
  );
}
