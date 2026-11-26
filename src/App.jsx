import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import TiendaLayout from './components/TiendaLayout.jsx';
import RutaAdmin from './components/RutaAdmin.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Productos from './pages/Productos.jsx';
import DetalleProducto from './pages/DetalleProducto.jsx';
import Categorias from './pages/Categorias.jsx';
import Ofertas from './pages/Ofertas.jsx';
import ArmarPizza from './pages/ArmarPizza.jsx';
import { Nosotros, Blog, BlogDetalle, Contacto } from './pages/Paginas.jsx';
import Checkout from './pages/Checkout.jsx';
import PagoResultado from './pages/PagoResultado.jsx';
import LaCucinaNostraAdmin from './components/admin/LaCucinaNostraAdmin.jsx';

/* Flujo de navegación de la tienda (Figura 3 del PDF). */
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route element={<TiendaLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/productos/:id" element={<DetalleProducto />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/categorias/:nombre" element={<Categorias />} />
            <Route path="/ofertas" element={<Ofertas />} />
            <Route path="/armar-pizza" element={<ArmarPizza />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogDetalle />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/comprar" element={<Checkout />} />
            <Route path="/pago-correcto/:id" element={<PagoResultado exito />} />
            <Route path="/pago-error/:id" element={<PagoResultado />} />
            <Route path="*" element={<Home />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/LaCucinaNostraAdmin"
            element={
              <RutaAdmin>
                <LaCucinaNostraAdmin />
              </RutaAdmin>
            }
          />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}
