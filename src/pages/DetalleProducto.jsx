import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PaginaPanel from '../components/PaginaPanel.jsx';
import ProductCard from '../components/ProductCard.jsx';
import RichTextView from '../components/RichTextView.jsx';
import { useTienda } from '../components/TiendaLayout.jsx';
import useReveal from '../hooks/useReveal.js';
import { obtenerProductoPorId, obtenerProductosPorCategoria } from '../data/db.js';
import { getProducto } from '../services/api.js';
import { precioFinal, descuentoPorcentaje, limiteDe } from '../utils/carrito.js';
import { formatearPrecio } from '../utils/validaciones.js';

const Dato = ({ icono, titulo, valor }) => (
  <div className="col-4">
    <div className="lcn-dato reveal">
      <i className={`bi ${icono}`} aria-hidden="true" />
      <strong>{valor}</strong>
      <small className="text-muted">{titulo}</small>
    </div>
  </div>
);

/* Vista "Detalle producto" (/productos/:id): descripción, porción, tiempo, calorías,
   alérgenos, etiquetas, ingredientes y disponibilidad. */
export default function DetalleProducto() {
  const { id } = useParams();
  // Dato inicial inmediato desde la base local; si hay backend se refresca con Axios.
  const [producto, setProducto] = useState(() => obtenerProductoPorId(id));
  const [cantidad, setCantidad] = useState(1);
  const { agregarProducto, verDetalle } = useTienda();
  const refDatos = useReveal('.reveal', [id]);

  useEffect(() => {
    setProducto(obtenerProductoPorId(id));
    setCantidad(1);
    let activo = true;
    getProducto(id).then((p) => { if (activo && p) setProducto(p); });
    return () => { activo = false; };
  }, [id]);

  if (!producto) {
    return (
      <PaginaPanel titulo="Producto no encontrado">
        <p className="text-center">El plato que buscas no existe o fue retirado del menú.</p>
        <p className="text-center mb-0"><Link to="/productos" className="btn lcn-btn-primary">Ver productos</Link></p>
      </PaginaPanel>
    );
  }

  const descuento = descuentoPorcentaje(producto);
  const limite = limiteDe(producto);
  const agotado = limite <= 0;
  const stockBajo = !agotado && producto.stock <= 5;
  const ingredientes = producto.ingredientes.split(/,\s*|\s+y\s+/).map((t) => t.trim()).filter(Boolean);
  const relacionados = obtenerProductosPorCategoria(producto.categoria).filter((p) => p.id !== producto.id).slice(0, 3);

  return (
    <>
      <PaginaPanel>
        <nav aria-label="breadcrumb" className="small mb-3">
          <Link to="/productos">Productos</Link> / <Link to={`/categorias/${producto.categoria}`}>{producto.categoria}</Link> / {producto.nombre}
        </nav>
        <div className="row g-4 align-items-start" ref={refDatos}>
          <div className="col-md-6">
            <img src={producto.imagen} alt={producto.nombre} className={`img-fluid rounded-4 shadow-sm w-100 ${agotado ? 'lcn-agotado' : ''}`} />
          </div>
          <div className="col-md-6">
            <span className="lcn-kicker">{producto.categoria}</span>
            <h2 className="h2">{producto.nombre}</h2>

            {producto.etiquetas?.length > 0 && (
              <p className="mb-2">
                {producto.etiquetas.map((e) => <span key={e} className="badge text-bg-success me-1" data-testid="etiqueta">{e}</span>)}
              </p>
            )}

            <RichTextView html={producto.descripcion} />

            <p className="fs-3 fw-bold lcn-precio mt-2">
              {descuento > 0 && <del className="text-muted fs-6 me-2">{formatearPrecio(producto.precio)}</del>}
              {formatearPrecio(precioFinal(producto))}
              {descuento > 0 && <span className="badge lcn-badge-inline ms-2">-{descuento}%</span>}
            </p>

            <div className="row g-2 mb-3">
              <Dato icono="bi-basket" titulo="Porción" valor={producto.porcion || '—'} />
              <Dato icono="bi-clock" titulo="Preparación" valor={producto.tiempo ? `${producto.tiempo} min` : '—'} />
              <Dato icono="bi-fire" titulo="Calorías" valor={producto.calorias ? `${producto.calorias} kcal` : '—'} />
            </div>

            <h3 className="h6">Ingredientes</h3>
            <ul className="mb-2" data-testid="ingredientes">{ingredientes.map((i) => <li key={i}>{i}</li>)}</ul>

            <p className="mb-3" data-testid="alergenos">
              <strong>Alérgenos: </strong>
              {producto.alergenos?.length ? producto.alergenos.join(', ') : 'No declara alérgenos comunes.'}
            </p>

            {agotado && <p className="text-danger fw-bold" role="status">Producto agotado por ahora.</p>}
            {stockBajo && <p className="lcn-stock-bajo" role="status">¡Últimas {producto.stock} unidades!</p>}

            <div className="d-flex align-items-center gap-3 mb-3">
              <span id="lbl-cantidad">Cantidad</span>
              <div className="btn-group" role="group" aria-labelledby="lbl-cantidad">
                <button type="button" className="btn btn-outline-secondary" aria-label="Disminuir cantidad"
                  disabled={cantidad <= 1} onClick={() => setCantidad((c) => c - 1)}>−</button>
                <span className="btn btn-outline-secondary disabled" data-testid="cantidad-detalle">{cantidad}</span>
                <button type="button" className="btn btn-outline-secondary" aria-label="Aumentar cantidad"
                  disabled={cantidad >= limite} onClick={() => setCantidad((c) => c + 1)}>+</button>
              </div>
            </div>

            <button type="button" className="btn lcn-btn-primary btn-lg" disabled={agotado}
              onClick={() => agregarProducto(producto, cantidad)}>
              <i className="bi bi-cart-plus" /> {agotado ? 'Sin stock' : 'Agregar al carrito'}
            </button>
          </div>
        </div>
      </PaginaPanel>

      {relacionados.length > 0 && (
        <PaginaPanel subtitulo="También te puede gustar" titulo={`Más de ${producto.categoria}`}>
          <div className="row g-4">
            {relacionados.map((p) => (
              <div className="col-12 col-sm-6 col-lg-4" key={p.id}>
                <ProductCard producto={p} onAgregar={agregarProducto} onVerDetalle={verDetalle} />
              </div>
            ))}
          </div>
        </PaginaPanel>
      )}
    </>
  );
}
