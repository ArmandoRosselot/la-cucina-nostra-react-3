import { formatearPrecio } from '../utils/validaciones.js';

/* Tabla de productos de una compra. Props: items [{ id, nombre, imagen, precio, cantidad, subtotal }] */
export default function TablaItems({ items }) {
  return (
    <div className="table-responsive">
      <table className="table table-sm align-middle mb-0">
        <thead>
          <tr><th>Imagen</th><th>Nombre</th><th>Precio</th><th>Cantidad</th><th className="text-end">Subtotal</th></tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id} data-testid="fila-item">
              <td><img src={i.imagen} alt="" className="lcn-mini" /></td>
              <td>{i.nombre}</td>
              <td>{formatearPrecio(i.precio)}</td>
              <td>{i.cantidad}</td>
              <td className="text-end">{formatearPrecio(i.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
