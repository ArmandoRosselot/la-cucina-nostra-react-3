import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PaginaPanel from '../components/PaginaPanel.jsx';
import TablaItems from '../components/TablaItems.jsx';
import { useCart } from '../context/CartContext.jsx';
import { actualizarOrden, obtenerOrdenPorId } from '../data/db.js';
import { simularPago } from '../utils/pago.js';
import { formatearPrecio } from '../utils/validaciones.js';

const Lectura = ({ etiqueta, valor }) => (
  <div className="col-md-6 mb-2">
    <label className="form-label small mb-1">{etiqueta}</label>
    <input className="form-control form-control-sm" readOnly value={valor} aria-label={etiqueta} />
  </div>
);

/* Vistas "Pago correcto" y "Pago con error". Prop: exito (bool). */
export default function PagoResultado({ exito = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vaciar } = useCart();
  const [orden] = useState(() => obtenerOrdenPorId(id));
  const [mensaje, setMensaje] = useState('');

  if (!orden) {
    return (
      <PaginaPanel titulo="Orden no encontrada">
        <p className="text-center mb-0">No encontramos esa compra. <Link to="/productos">Ir a los productos</Link></p>
      </PaginaPanel>
    );
  }

  const reintentar = () => {
    if (simularPago()) {
      actualizarOrden(orden.id, { estado: 'pagada' });
      vaciar();
      navigate(`/pago-correcto/${orden.id}`);
    } else {
      setMensaje('El pago volvió a fallar. Intenta nuevamente.');
    }
  };

  const { cliente, direccion } = orden;

  return (
    <PaginaPanel>
      <div className="d-flex justify-content-between flex-wrap gap-2">
        <h2 className={`h3 ${exito ? 'text-success' : 'text-danger'}`}>
          <i className={`bi ${exito ? 'bi-check-circle' : 'bi-x-circle'}`} aria-hidden="true" />{' '}
          {exito ? `Se ha realizado la compra. nro #${orden.numero}` : `No se pudo realizar el pago. nro #${orden.numero}`}
        </h2>
        {exito && <small className="text-muted">Código orden: {orden.codigo}</small>}
      </div>

      {!exito && (
        <div className="text-center my-3">
          <button type="button" className="btn lcn-btn-cart btn-lg" onClick={reintentar}>VOLVER A REALIZAR EL PAGO</button>
        </div>
      )}
      {mensaje && <div className="alert alert-info py-2" role="status">{mensaje}</div>}

      <div className="row mt-2">
        <Lectura etiqueta="Nombre" valor={cliente.nombre} />
        <Lectura etiqueta="Apellidos" valor={cliente.apellidos} />
        <Lectura etiqueta="Correo" valor={cliente.email} />
      </div>
      <h3 className="h6 mt-2">Dirección de entrega de los productos</h3>
      <div className="row">
        <Lectura etiqueta="Calle" valor={direccion.calle} />
        <Lectura etiqueta="Departamento" valor={direccion.departamento} />
        <Lectura etiqueta="Región" valor={direccion.region} />
        <Lectura etiqueta="Comuna" valor={direccion.comuna} />
        {direccion.indicaciones && <Lectura etiqueta="Indicaciones" valor={direccion.indicaciones} />}
      </div>

      <TablaItems items={orden.items} />

      <div className="lcn-total-box text-center my-3">
        <strong>{exito ? 'Total pagado' : 'Total a pagar'}: {formatearPrecio(orden.total)}</strong>
      </div>

      {exito && (
        <div className="d-flex justify-content-center gap-2 flex-wrap">
          <button type="button" className="btn btn-danger btn-sm" onClick={() => window.print()}>Imprimir boleta en PDF</button>
          <button type="button" className="btn btn-success btn-sm"
            onClick={() => setMensaje(`Boleta enviada a ${cliente.email}`)}>Enviar boleta por email</button>
        </div>
      )}
    </PaginaPanel>
  );
}
