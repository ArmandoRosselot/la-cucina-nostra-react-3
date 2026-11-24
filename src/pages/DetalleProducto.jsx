import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PaginaPanel from '../components/PaginaPanel.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { useTienda } from '../components/TiendaLayout.jsx';
import { obtenerProductoPorId, obtenerProductosPorCategoria } from '../data/db.js';
import { precioFinal, descuentoPorcentaje, CANTIDAD_MAXIMA } from '../utils/carrito.js';
import { formatearPrecio } from '../utils/validaciones.js';

/* Vista "Detalle producto" (/productos/:id). */
export default function DetalleProducto() {
  const { id } = useParams();
  const producto = obtenerProductoPorId(id);
  const [cantidad, setCantidad] = useState(1);
  const { agregarProducto, verDetalle } = useTienda();

  if (!producto) {
    return (
      <PaginaPanel titulo="Producto no encontrado">
        <p className="text-center">El plato que buscas no existe o fue retirado del menú.</p>
        <p className="text-center mb-0"><Link to="/productos" className="btn lcn-btn-primary">Ver productos</Link></p>
      </PaginaPanel>
    );
  }

  const descuento = descuentoPorcentaje(producto);
  const relacionados = obtenerProductosPorCategoria(producto.categoria).filter((p) => p.id !== producto.id).slice(0, 3);

  return (
    <>
      <PaginaPanel>
        <nav aria-label="breadcrumb" className="small mb-3">
          <Link to="/productos">Productos</Link> / <Link to={`/categorias/${producto.categoria}`}>{producto.categoria}</Link> / {producto.nombre}
        </nav>
        <div className="row g-4 align-items-center">
          <div className="col-md-6">
            <img src={producto.imagen} alt={producto.nombre} className="img-fluid rounded-4 shadow-sm w-100" />
          </div>
          <div className="col-md-6">
            <span className="lcn-kicker">{producto.categoria}</span>
            <h2 className="h2">{producto.nombre}</h2>
            <p>{producto.ingredientes}</p>
            <p className="fs-3 fw-bold lcn-precio">
              {descuento > 0 && <del className="text-muted fs-6 me-2">{formatearPrecio(producto.precio)}</del>}
              {formatearPrecio(precioFinal(producto))}
              {descuento > 0 && <span className="badge lcn-badge-inline ms-2">-{descuento}%</span>}
            </p>

            <div className="d-flex align-items-center gap-3 mb-3">
              <span id="lbl-cantidad">Cantidad</span>
              <div className="btn-group" role="group" aria-labelledby="lbl-cantidad">
                <button type="button" className="btn btn-outline-secondary" aria-label="Disminuir cantidad"
                  disabled={cantidad <= 1} onClick={() => setCantidad((c) => c - 1)}>−</button>
                <span className="btn btn-outline-secondary disabled" data-testid="cantidad-detalle">{cantidad}</span>
                <button type="button" className="btn btn-outline-secondary" aria-label="Aumentar cantidad"
                  disabled={cantidad >= CANTIDAD_MAXIMA} onClick={() => setCantidad((c) => c + 1)}>+</button>
              </div>
            </div>

            <button type="button" className="btn lcn-btn-primary btn-lg" onClick={() => agregarProducto(producto, cantidad)}>
              <i className="bi bi-cart-plus" /> Agregar al carrito
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
