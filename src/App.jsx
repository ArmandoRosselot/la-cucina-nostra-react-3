import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import TiendaLayout from './components/TiendaLayout.jsx';
import RutaAdmin from './components/RutaAdmin.jsx';
import RutaProtegida from './components/RutaProtegida.jsx';
import MiCuenta from './pages/MiCuenta.jsx';
import ArmarPizza from './pages/ArmarPizza.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Productos from './pages/Productos.jsx';
import DetalleProducto from './pages/DetalleProducto.jsx';
import Categorias from './pages/Categorias.jsx';
import Ofertas from './pages/Ofertas.jsx';
import { Nosotros, Blog, BlogDetalle, Contacto } from './pages/Paginas.jsx';
import Checkout from './pages/Checkout.jsx';
import PagoResultado from './pages/PagoResultado.jsx';
// El panel admin se carga solo cuando se entra a él (code splitting).
const LaCucinaNostraAdmin = lazy(() => import('./components/admin/LaCucinaNostraAdmin.jsx'));

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
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogDetalle />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/comprar" element={<Checkout />} />
            <Route path="/armar-pizza" element={<ArmarPizza />} />
            <Route path="/mi-cuenta" element={<RutaProtegida><MiCuenta /></RutaProtegida>} />
            <Route path="/mis-pedidos" element={<Navigate to="/mi-cuenta?tab=compras" replace />} />
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
                <Suspense fallback={<p className="text-center mt-5">Cargando panel…</p>}>
                  <LaCucinaNostraAdmin />
                </Suspense>
              </RutaAdmin>
            }
          />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}
