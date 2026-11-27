import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* Clase GSAP: anima a los hijos que tengan la clase indicada cuando entran en pantalla.
   Devuelve la ref del contenedor. Se desactiva si el usuario prefiere menos movimiento
   o si el entorno no soporta matchMedia (por ejemplo en las pruebas con jsdom).
   Uso: const ref = useReveal('.lcn-card', [productos]); <div ref={ref}>...</div> */
export default function useReveal(selector = '.reveal', dependencias = []) {
  const contenedor = useRef(null);

  useGSAP(
    () => {
      if (!contenedor.current || typeof window.matchMedia !== 'function') return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const elementos = gsap.utils.toArray(selector, contenedor.current);
      if (!elementos.length) return;
      gsap.from(elementos, {
        opacity: 0,
        y: 28,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.08,
        clearProps: 'all',
        scrollTrigger: { trigger: contenedor.current, start: 'top 88%', once: true }
      });
    },
    { scope: contenedor, dependencies: dependencias, revertOnUpdate: true }
  );

  return contenedor;
}
