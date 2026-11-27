import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PaginaPanel from '../components/PaginaPanel.jsx';
import TablaItems from '../components/TablaItems.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { crearOrden, actualizarOrden, descontarStock } from '../data/db.js';
import { REGIONES } from '../data/regiones.js';
import { simularPago } from '../utils/pago.js';
import { problemasDeStock } from '../utils/carrito.js';
import { formatearPrecio, validarFormularioCheckout } from '../utils/validaciones.js';

/* Si hay sesión iniciada, los datos del cliente se completan solos (nota del PDF). */
function valoresIniciales(sesion) {
  const partes = (sesion?.nombre ?? '').trim().split(/\s+/).filter(Boolean);
  return {
    nombre: partes[0] ?? '',
    apellidos: partes.slice(1).join(' '),
    email: sesion?.email ?? '',
    calle: '', departamento: '', region: sesion?.region ?? '', comuna: sesion?.comuna ?? '', indicaciones: ''
  };
}

/* Vista "Comprar" (checkout): datos del cliente + dirección de entrega. */
export default function Checkout() {
  const { sesion, usuario } = useAuth();
  const { detalle, total, vaciar } = useCart();
  const navigate = useNavigate();
  const [valores, setValores] = useState(() => valoresIniciales(sesion));
  const [errores, setErrores] = useState({});
  const [errorStock, setErrorStock] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (detalle.length === 0) {
    return (
      <PaginaPanel subtitulo="Compra" titulo="Carrito de compra">
        <p className="text-center">Tu carrito está vacío.</p>
        <p className="text-center mb-0"><Link to="/productos" className="btn lcn-btn-primary">Ir a los productos</Link></p>
      </PaginaPanel>
    );
  }

  const cambiar = (e) => {
    const { name, value } = e.target;
    // Al cambiar de región se reinicia la comuna.
    setValores((v) => (name === 'region' ? { ...v, region: value, comuna: '' } : { ...v, [name]: value }));
  };

  const pagar = (e) => {
    e.preventDefault();
    if (enviando) return; // evita crear dos órdenes por doble clic
    const nuevos = validarFormularioCheckout(valores);
    setErrores(nuevos);
    if (Object.keys(nuevos).length) return;

    // Regla de negocio: no se vende más de lo que hay en stock.
    const faltantes = problemasDeStock(detalle);
    if (faltantes.length) {
      setErrorStock(faltantes.map((f) => `${f.nombre}: pediste ${f.pedido}, quedan ${f.disponible}`).join(' · '));
      return;
    }
    setErrorStock('');
    setEnviando(true);

    const orden = crearOrden({
      cliente: { nombre: valores.nombre.trim(), apellidos: valores.apellidos.trim(), email: valores.email.trim() },
      direccion: {
        calle: valores.calle.trim(), departamento: valores.departamento.trim(), region: valores.region,
        comuna: valores.comuna, indicaciones: valores.indicaciones.trim()
      },
      items: detalle.map(({ id, nombre, imagen, precio, cantidad, subtotal, personalizada }) => ({ id, nombre, imagen, precio, cantidad, subtotal, ...(personalizada ? { personalizada } : {}) })),
      total,
      usuarioId: usuario?.id ?? null
    });

    if (simularPago()) {
      actualizarOrden(orden.id, { estado: 'pagada' });
      descontarStock(orden.items);
      vaciar();
      navigate(`/pago-correcto/${orden.id}`);
    } else {
      actualizarOrden(orden.id, { estado: 'rechazada' });
      setEnviando(false);
      navigate(`/pago-error/${orden.id}`);
    }
  };

  const campo = (id, etiqueta, { requerido = true, ...props } = {}) => (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">{etiqueta}{requerido && <span className="text-danger">*</span>}</label>
      <input id={id} name={id} className={`form-control ${errores[id] ? 'is-invalid' : ''}`} value={valores[id]}
        onChange={cambiar} aria-invalid={Boolean(errores[id])} {...props} />
      {errores[id] && <div className="invalid-feedback" role="alert">{errores[id]}</div>}
    </div>
  );

  return (
    <PaginaPanel subtitulo="Compra" titulo="Carrito de compra">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <p className="mb-0 text-muted">Completa la siguiente información</p>
        <span className="badge fs-6 lcn-badge-total" data-testid="total-a-pagar">Total a pagar: {formatearPrecio(total)}</span>
      </div>

      {errorStock && <div className="alert alert-warning" role="alert">Stock insuficiente — {errorStock}. Ajusta tu carrito.</div>}
      <TablaItems items={detalle} />

      <form onSubmit={pagar} noValidate className="mt-4">
        <h3 className="h5">Información del cliente</h3>
        <div className="row">
          <div className="col-md-6">{campo('nombre', 'Nombre', { autoComplete: 'given-name' })}</div>
          <div className="col-md-6">{campo('apellidos', 'Apellidos', { autoComplete: 'family-name' })}</div>
          <div className="col-md-12">{campo('email', 'Correo', { type: 'email', autoComplete: 'email' })}</div>
        </div>

        <h3 className="h5 mt-2">Dirección de entrega de los productos</h3>
        <p className="small text-muted">Ingrese dirección de forma detallada</p>
        <div className="row">
          <div className="col-md-6">{campo('calle', 'Calle', { autoComplete: 'street-address' })}</div>
          <div className="col-md-6">{campo('departamento', 'Departamento (opcional)', { requerido: false, placeholder: 'Ej: 603' })}</div>

          <div className="col-md-6 mb-3">
            <label htmlFor="region" className="form-label">Región<span className="text-danger">*</span></label>
            <select id="region" name="region" className={`form-select ${errores.region ? 'is-invalid' : ''}`} value={valores.region} onChange={cambiar}>
              <option value="">Selecciona una región</option>
              {Object.keys(REGIONES).map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            {errores.region && <div className="invalid-feedback" role="alert">{errores.region}</div>}
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="comuna" className="form-label">Comuna<span className="text-danger">*</span></label>
            <select id="comuna" name="comuna" className={`form-select ${errores.comuna ? 'is-invalid' : ''}`} value={valores.comuna}
              onChange={cambiar} disabled={!valores.region}>
              <option value="">Selecciona una comuna</option>
              {(REGIONES[valores.region] ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errores.comuna && <div className="invalid-feedback" role="alert">{errores.comuna}</div>}
          </div>

          <div className="col-12 mb-3">
            <label htmlFor="indicaciones" className="form-label">Indicaciones para la entrega (opcional)</label>
            <textarea id="indicaciones" name="indicaciones" rows="3" className={`form-control ${errores.indicaciones ? 'is-invalid' : ''}`}
              placeholder="Ej.: Entre calles, color del edificio, no tiene timbre." value={valores.indicaciones} onChange={cambiar} />
            {errores.indicaciones && <div className="invalid-feedback" role="alert">{errores.indicaciones}</div>}
          </div>
        </div>

        <div className="text-end">
          <button type="submit" className="btn lcn-btn-cart btn-lg" disabled={enviando}>Pagar ahora {formatearPrecio(total)}</button>
        </div>
      </form>
    </PaginaPanel>
  );
}
