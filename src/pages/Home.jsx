import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Carousel from '../components/Carousel.jsx';
import CategoriasSection from '../components/CategoriasSection.jsx';
import OfertasSection from '../components/OfertasSection.jsx';
import MenuSection from '../components/MenuSection.jsx';
import About from '../components/About.jsx';
import Historias from '../components/Historias.jsx';
import ContactSection from '../components/ContactSection.jsx';
import { useTienda } from '../components/TiendaLayout.jsx';
import { obtenerProductos, obtenerOfertas, CATEGORIAS } from '../data/db.js';

const SLIDES = [
  { imagen: '/img/about.jpg', titulo: 'Nuevos sabores de Italia', texto: 'Descubre los platos que preparamos esta temporada.' },
  { imagen: '/img/events-1.jpg', titulo: 'Ofertas de la semana', texto: 'Pastas, pizzas y entradas con precio especial.' },
  { imagen: '/img/events-2.jpg', titulo: 'Horno de leña desde 1978', texto: 'La receta de la nonna, en tu mesa.' }
];

export default function Home() {
  const [productos] = useState(() => obtenerProductos());
  const [ofertas] = useState(() => obtenerOfertas());
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const { agregarProducto, verDetalle } = useTienda();
  const navigate = useNavigate();

  // Una tarjeta por categoría, con la foto de su primer plato.
  const categoriasInfo = useMemo(
    () => CATEGORIAS.map((nombre) => {
      const items = productos.filter((p) => p.categoria === nombre);
      return { nombre, imagen: items[0]?.imagen ?? '', cantidad: items.length };
    }),
    [productos]
  );

  return (
    <main>
      <h1 className="visually-hidden">La Cucina Nostra – Auténtica comida italiana</h1>
      <Carousel slides={SLIDES} />
      <CategoriasSection categorias={categoriasInfo} onSeleccionar={(n) => navigate(`/categorias/${n}`)} />
      <OfertasSection productos={ofertas} onAgregar={agregarProducto} onVerDetalle={verDetalle} />
      <MenuSection
        productos={productos} categorias={CATEGORIAS} categoria={categoria} busqueda=""
        onCategoria={setCategoria} onLimpiar={() => {}} onAgregar={agregarProducto} onVerDetalle={verDetalle}
      />
      <div className="text-center pb-3"><Link to="/productos" className="btn lcn-btn-primary">Ver todos los productos</Link></div>
      <About />
      <Historias />
      <ContactSection />
    </main>
  );
}
