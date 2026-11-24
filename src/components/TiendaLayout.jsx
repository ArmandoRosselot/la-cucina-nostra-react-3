import { createContext, useContext, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import CartPanel from './CartPanel.jsx';
import { useCart } from '../context/CartContext.jsx';

const TiendaContext = createContext(null);

/* Contexto compartido por todas las vistas de la tienda. */
export function useTienda() {
  const ctx = useContext(TiendaContext);
  if (!ctx) throw new Error('useTienda debe usarse dentro de <TiendaLayout>');
  return ctx;
}

/* Estructura común de la tienda: encabezado, carrito lateral, aviso y pie.
   Cada vista se dibuja dentro de <Outlet />. */
export default function TiendaLayout() {
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [aviso, setAviso] = useState('');
  const { agregar } = useCart();
  const { hash, pathname } = useLocation();
  const navigate = useNavigate();

  // Al cambiar de vista: ir a la sección del hash o volver arriba.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView?.({ behavior: 'smooth' });
    else window.scrollTo?.(0, 0);
  }, [hash, pathname]);

  useEffect(() => {
    if (!aviso) return undefined;
    const t = setTimeout(() => setAviso(''), 3000);
    return () => clearTimeout(t);
  }, [aviso]);

  const agregarProducto = (producto, cantidad = 1) => {
    agregar(producto.id, cantidad);
    setAviso(`${producto.nombre} se agregó al carrito`);
  };

  const verDetalle = (producto) => navigate(`/productos/${producto.id}`);

  return (
    <TiendaContext.Provider value={{ agregarProducto, verDetalle }}>
      <div className="lcn-home d-flex flex-column">
        <Navbar onAbrirCarrito={() => setCarritoAbierto(true)} />
        <div className="flex-grow-1"><Outlet /></div>
        <Footer />
        <CartPanel
          abierto={carritoAbierto}
          onCerrar={() => setCarritoAbierto(false)}
          onPedir={() => { setCarritoAbierto(false); navigate('/comprar'); }}
        />
        {aviso && <div className="lcn-toast" role="status">{aviso}</div>}
      </div>
    </TiendaContext.Provider>
  );
}
