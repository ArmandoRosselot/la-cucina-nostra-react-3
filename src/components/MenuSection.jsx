import { useLayoutEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProductCard from './ProductCard.jsx';

gsap.registerPlugin(ScrollTrigger);

const normalizar = (t) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/* Listado de productos con pestañas por categoría.
   El texto de búsqueda llega desde el encabezado (ya validado).
   Las tarjetas aparecen con un fade-in escalonado (GSAP), al entrar en pantalla
   y cada vez que cambia el listado (categoría o búsqueda).
   Props: productos, categorias, categoria, busqueda,
          onCategoria(nombre), onLimpiar(), onAgregar(p), onVerDetalle(p) */
export default function MenuSection({
  productos, categorias, categoria, busqueda, onCategoria, onLimpiar, onAgregar, onVerDetalle,
  titulo = 'Delicioso menú', subtitulo = 'Conoce nuestro'
}) {
  const fila = useRef(null);

  const visibles = useMemo(() => {
    const q = normalizar(busqueda.trim());
    // Con texto se busca en TODO el menú; sin texto, solo en la categoría activa.
    return productos.filter((p) =>
      q
        ? normalizar(`${p.nombre} ${p.ingredientes}`).includes(q)
        : categoria === 'Todos' || p.categoria === categoria
    );
  }, [productos, categoria, busqueda]);

  useLayoutEffect(() => {
    if (!fila.current) return undefined; // sin resultados no hay fila que animar

    // matchMedia respeta "reducir movimiento": en ese caso no se anima nada.
    const mm = gsap.matchMedia(fila);

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.lcn-menu-item', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out',
        stagger: { amount: 0.6 }, // el escalonado total dura 0.6 s sin importar cuántas tarjetas haya
        clearProps: 'opacity,transform', // devuelve el control al CSS (hover, etc.)
        scrollTrigger: {
          trigger: fila.current,
          start: 'top 85%',
          once: true,
        },
      });
    });

    return () => mm.revert(); // limpia animaciones y ScrollTriggers antes de cada nuevo listado
  }, [visibles]);

  return (
    <section id="menu" className="lcn-section">
      <div className="container">
        <div className="lcn-panel">
          <header className="lcn-section-title">
            <span>{subtitulo}</span>
            <h2>{titulo}</h2>
          </header>

          <ul className="nav nav-pills justify-content-center gap-2 mb-4" role="tablist">
            {categorias.map((c) => (
              <li className="nav-item" key={c} role="presentation">
                <button
                  type="button"
                  role="tab"
                  aria-selected={!busqueda && c === categoria}
                  className={`nav-link lcn-tab ${!busqueda && c === categoria ? 'active' : ''}`}
                  onClick={() => onCategoria(c)}
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>

          {busqueda && (
            <p className="text-center">
              Resultados para «<strong>{busqueda}</strong>»{' '}
              <button type="button" className="btn btn-sm btn-outline-secondary ms-2" onClick={onLimpiar}>Limpiar búsqueda</button>
            </p>
          )}

          {visibles.length > 0 ? (
            <div className="row g-4" ref={fila}>
              {visibles.map((p) => (
                <div className="col-12 col-sm-6 col-lg-4 lcn-menu-item" key={p.id}>
                  <ProductCard producto={p} onAgregar={onAgregar} onVerDetalle={onVerDetalle} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted mb-0" role="status">No encontramos platos con esa búsqueda.</p>
          )}
        </div>
      </div>
    </section>
  );
}
