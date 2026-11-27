import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* Tarjetas de categorías (Figura 1 y 4).
   Props: categorias [{ nombre, imagen, cantidad }], onSeleccionar(nombre)
   Las tarjetas aparecen con un fade-in escalonado (GSAP) al entrar en pantalla. */
export default function CategoriasSection({ categorias, onSeleccionar }) {
  const fila = useRef(null);

  useLayoutEffect(() => {
    // matchMedia respeta "reducir movimiento": en ese caso no se anima nada.
    const mm = gsap.matchMedia(fila);

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.lcn-categoria', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.12,
        clearProps: 'opacity,transform', // devuelve el control al CSS (hover, etc.)
        scrollTrigger: {
          trigger: fila.current,
          start: 'top 85%',
          once: true,
        },
      });
    });

    return () => mm.revert(); // limpia animaciones y ScrollTriggers al desmontar o cambiar la lista
  }, [categorias.length]);

  return (
    <section id="categorias" className="lcn-section">
      <div className="container">
        <div className="lcn-panel">
          <header className="lcn-section-title">
            <span>Explora</span>
            <h2>Categorías</h2>
          </header>
          <div className="row g-3 justify-content-center" ref={fila}>
            {categorias.map((c) => (
              <div className="col-6 col-md-3" key={c.nombre}>
                <button type="button" className="card lcn-card lcn-categoria h-100 w-100 text-center" onClick={() => onSeleccionar(c.nombre)}>
                  <img src={c.imagen} alt="" className="card-img-top" loading="lazy" />
                  <div className="card-body py-2">
                    <h3 className="h6 mb-0">{c.nombre}</h3>
                    <small className="text-muted">{c.cantidad} {c.cantidad === 1 ? 'plato' : 'platos'}</small>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
