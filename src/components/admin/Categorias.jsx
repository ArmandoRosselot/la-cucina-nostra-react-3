import Cabecera from './Cabecera.jsx';
import { CATEGORIAS, obtenerProductos, obtenerOrdenes } from '../../data/db.js';
import { ventasPorCategoria } from '../../utils/estadisticas.js';
import { formatearPrecio } from '../../utils/validaciones.js';

/* Categorías del menú con la cantidad de platos y lo vendido en cada una. */
export default function Categorias({ onVolver }) {
  const productos = obtenerProductos();
  const ventas = Object.fromEntries(ventasPorCategoria(obtenerOrdenes(), productos).map((v) => [v.categoria, v.ingresos]));

  return (
    <div>
      <Cabecera titulo="Categorías" subtitulo="Secciones del menú de la tienda" onVolver={onVolver} />
      <div className="card border-0 shadow-sm"><div className="table-responsive">
        <table className="table align-middle mb-0">
          <thead className="table-light"><tr><th className="ps-4">Categoría</th><th>Platos</th><th>Con stock</th><th>Ventas pagadas</th></tr></thead>
          <tbody>
            {CATEGORIAS.map((c) => {
              const platos = productos.filter((p) => p.categoria === c);
              return (
                <tr key={c} data-testid="categoria-admin">
                  <td className="ps-4 fw-bold">{c}</td>
                  <td>{platos.length}</td>
                  <td>{platos.filter((p) => p.stock > 0).length}</td>
                  <td>{formatearPrecio(ventas[c] ?? 0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div></div>
    </div>
  );
}
