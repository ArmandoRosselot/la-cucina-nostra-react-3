import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MenuSection from '../components/MenuSection.jsx';
import { useTienda } from '../components/TiendaLayout.jsx';
import { obtenerProductos, CATEGORIAS } from '../data/db.js';
import { getProductos } from '../services/api.js';

/* Vista "Productos": todos los platos, con pestañas y búsqueda (?q=texto). */
export default function Productos() {
  const [productos, setProductos] = useState(() => obtenerProductos());

  // Con backend configurado (VITE_API_URL) se refresca la lista vía Axios.
  useEffect(() => {
    let activo = true;
    getProductos().then((lista) => { if (activo) setProductos(lista); });
    return () => { activo = false; };
  }, []);
  const [categoria, setCategoria] = useState('Todos');
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { agregarProducto, verDetalle } = useTienda();

  return (
    <MenuSection
      productos={productos} categorias={['Todos', ...CATEGORIAS]} categoria={categoria}
      busqueda={params.get('q') ?? ''} titulo="Productos" subtitulo="Todo nuestro menú"
      onCategoria={(c) => { setCategoria(c); if (params.get('q')) navigate('/productos'); }}
      onLimpiar={() => navigate('/productos')}
      onAgregar={agregarProducto} onVerDetalle={verDetalle}
    />
  );
}
