import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PaginaPanel from '../components/PaginaPanel.jsx';
import TablaItems from '../components/TablaItems.jsx';
import { useCart } from '../context/CartContext.jsx';
import { actualizarOrden, obtenerOrdenPorId, descontarStock, obtenerProductos } from '../data/db.js';
import { problemasDeStock, detallarCarrito } from '../utils/carrito.js';
import { simularPago } from '../utils/pago.js';
import { formatearPrecio } from '../utils/validaciones.js';

const Lectura = ({ etiqueta, valor }) => (
  <div className="col-md-6 mb-2">
    <label htmlFor={`lectura-${etiqueta}`} className="form-label small mb-1">{etiqueta}</label>
    <input id={`lectura-${etiqueta}`} className="form-control form-control-sm" readOnly value={valor} />
  </div>
);

/* Vistas "Pago correcto" y "Pago con error". Prop: exito (bool). */
export default function PagoResultado({ exito = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vaciar } = useCart();
  const { usuario, esAdmin } = useAuth();
  // Se lee en cada render: el estado de la orden cambia al reintentar el pago.
  const orden = obtenerOrdenPorId(id);
  const [mensaje, setMensaje] = useState('');

  if (!orden) {
    return (
      <PaginaPanel titulo="Orden no encontrada">
        <p className="text-center mb-0">No encontramos esa compra. <Link to="/productos">Ir a los productos</Link></p>
      </PaginaPanel>
    );
  }

  /* Una orden de un cliente con cuenta solo la ve su dueño o el administrador. */
  if (orden.usuarioId != null && !esAdmin && usuario?.id !== orden.usuarioId) {
    return (
      <PaginaPanel titulo="Sin acceso">
        <p className="text-center mb-0">Esta compra pertenece a otra cuenta. <Link to="/">Volver al inicio</Link></p>
      </PaginaPanel>
    );
  }

  /* La URL no puede contradecir el estado real de la orden. */
  const rutaReal = { pagada: `/pago-correcto/${orden.id}`, rechazada: `/pago-error/${orden.id}`, pendiente: '/comprar' }[orden.estado];
  if (rutaReal && rutaReal !== `/${exito ? 'pago-correcto' : 'pago-error'}/${orden.id}`) {
    return <Navigate to={rutaReal} replace />;
  }

  const reintentar = () => {
    // Antes de reintentar se vuelve a comprobar el stock.
    const lineas = detallarCarrito(orden.items.map(({ id, cantidad, personalizada }) => ({ id, cantidad, personalizada })), obtenerProductos());
    const faltantes = problemasDeStock(lineas);
    if (faltantes.length || lineas.length !== orden.items.length) {
      setMensaje('Ya no hay stock suficiente para completar esta compra.');
      return;
    }
    if (simularPago()) {
      actualizarOrden(orden.id, { estado: 'pagada' });
      descontarStock(orden.items);
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
