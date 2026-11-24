import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CategoriasSection from '../components/CategoriasSection.jsx';
import PaginaPanel from '../components/PaginaPanel.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { useTienda } from '../components/TiendaLayout.jsx';
import { obtenerProductos, CATEGORIAS } from '../data/db.js';

/* Vista "Categorías" (/categorias) y "Categoría #1" (/categorias/:nombre). */
export default function Categorias() {
  const { nombre } = useParams();
  const navigate = useNavigate();
  const { agregarProducto, verDetalle } = useTienda();
  const productos = obtenerProductos();

  const info = useMemo(
    () => CATEGORIAS.map((c) => {
      const items = productos.filter((p) => p.categoria === c);
      return { nombre: c, imagen: items[0]?.imagen ?? '', cantidad: items.length };
    }),
    [productos]
  );

  const existe = !nombre || CATEGORIAS.includes(nombre);
  const delaCategoria = nombre ? productos.filter((p) => p.categoria === nombre) : [];

  return (
    <>
      <CategoriasSection categorias={info} onSeleccionar={(n) => navigate(`/categorias/${n}`)} />

      {!existe && (
        <PaginaPanel titulo="Categoría no encontrada">
          <p className="text-center mb-0">La categoría «{nombre}» no existe. <Link to="/categorias">Ver todas</Link></p>
        </PaginaPanel>
      )}

      {existe && nombre && (
        <PaginaPanel subtitulo="Categoría" titulo={nombre}>
          <div className="row g-4">
            {delaCategoria.map((p) => (
              <div className="col-12 col-sm-6 col-lg-4" key={p.id}>
                <ProductCard producto={p} onAgregar={agregarProducto} onVerDetalle={verDetalle} />
              </div>
            ))}
          </div>
        </PaginaPanel>
      )}

      {existe && !nombre && (
        <p className="text-center"><span className="lcn-chip">Elige una categoría para ver sus platos</span></p>
      )}
    </>
  );
}
