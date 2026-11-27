import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProductCard from './ProductCard.jsx';

gsap.registerPlugin(ScrollTrigger);

/* Sección de ofertas. Si no hay ofertas no se renderiza (renderizado condicional).
   Las tarjetas aparecen con un fade-in escalonado (GSAP) al entrar en pantalla. */
export default function OfertasSection({ productos, onAgregar, onVerDetalle }) {
  const fila = useRef(null);

  // Los hooks van antes del return condicional para respetar las reglas de React.
  useLayoutEffect(() => {
    if (!fila.current) return undefined; // sin ofertas no hay fila que animar

    // matchMedia respeta "reducir movimiento": en ese caso no se anima nada.
    const mm = gsap.matchMedia(fila);

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.lcn-oferta-item', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out',
        stagger: { amount: 0.6 },
        clearProps: 'opacity,transform', // devuelve el control al CSS (hover, etc.)
        scrollTrigger: {
          trigger: fila.current,
          start: 'top 85%',
          once: true,
        },
      });
    });

    return () => mm.revert(); // limpia animaciones y ScrollTriggers al desmontar o cambiar la lista
  }, [productos]);

  if (productos.length === 0) return null;

  return (
    <section id="ofertas" className="lcn-section">
      <div className="container">
        <div className="lcn-panel">
          <header className="lcn-section-title">
            <span>Aprovecha</span>
            <h2>Ofertas</h2>
          </header>
          <div className="row g-4" ref={fila}>
            {productos.map((p) => (
              <div className="col-12 col-sm-6 col-lg-4 lcn-oferta-item" key={p.id}>
                <ProductCard producto={p} onAgregar={onAgregar} onVerDetalle={onVerDetalle} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
