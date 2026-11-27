import Cabecera from './Cabecera.jsx';
import { obtenerOrdenes, obtenerProductos } from '../../data/db.js';
import { resumenVentas, topProductos, ventasPorCategoria, stockCritico } from '../../utils/estadisticas.js';
import { formatearPrecio } from '../../utils/validaciones.js';

/* Reportes calculados con las órdenes y el inventario reales. */
export default function Reportes({ onVolver }) {
  const ordenes = obtenerOrdenes();
  const productos = obtenerProductos();
  const r = resumenVentas(ordenes);
  const top = topProductos(ordenes, 5);
  const porCategoria = ventasPorCategoria(ordenes, productos);
  const criticos = stockCritico(productos);

  const Tabla = ({ titulo, vacio, filas, cabeceras }) => (
    <div className="card border-0 shadow-sm mb-4"><div className="card-body">
      <h2 className="h5">{titulo}</h2>
      {filas.length === 0 ? <p className="text-muted mb-0">{vacio}</p> : (
        <table className="table table-sm mb-0">
          <thead><tr>{cabeceras.map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>{filas.map((f, n) => <tr key={n}>{f.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
        </table>
      )}
    </div></div>
  );

  return (
    <div>
      <Cabecera titulo="Reportes" subtitulo="Ventas e inventario (solo cuentan las órdenes pagadas)" onVolver={onVolver} />
      <div className="row g-3 mb-4">
        {[['Ingresos', formatearPrecio(r.ingresos)], ['Órdenes pagadas', r.pagadas], ['Ticket promedio', formatearPrecio(r.ticketPromedio)], ['Pagos rechazados', r.rechazadas]].map(([t, v]) => (
          <div className="col-6 col-lg-3" key={t}><div className="card border-0 shadow-sm"><div className="card-body">
            <div className="text-muted small">{t}</div><div className="fs-4 fw-bold">{v}</div>
          </div></div></div>
        ))}
      </div>
      <Tabla titulo="Platos más vendidos" vacio="Aún no hay ventas." cabeceras={['Plato', 'Unidades', 'Ingresos']}
        filas={top.map((t) => [t.nombre, t.unidades, formatearPrecio(t.ingresos)])} />
      <Tabla titulo="Ventas por categoría" vacio="Aún no hay ventas." cabeceras={['Categoría', 'Ingresos']}
        filas={porCategoria.map((c) => [c.categoria, formatearPrecio(c.ingresos)])} />
      <Tabla titulo="Stock crítico (5 o menos)" vacio="Todo el menú tiene stock suficiente." cabeceras={['Plato', 'Stock']}
        filas={criticos.map((p) => [p.nombre, p.stock === 0 ? 'Agotado' : p.stock])} />
    </div>
  );
}
