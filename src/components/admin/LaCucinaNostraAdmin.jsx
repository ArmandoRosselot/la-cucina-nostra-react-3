import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './LaCucinaNostraAdmin.css';
import { useAuth } from '../../context/AuthContext.jsx';
import { obtenerOrdenes, obtenerProductos, obtenerUsuarios } from '../../data/db.js';
import { resumenVentas, stockCritico } from '../../utils/estadisticas.js';
import { formatearPrecio } from '../../utils/validaciones.js';
import Ordenes from './Ordenes.jsx';
import Productos from './Productos.jsx';
import Categorias from './Categorias.jsx';
import Usuarios from './Usuarios.jsx';
import Reportes from './Reportes.jsx';
import Perfil from './Perfil.jsx';

const MODULOS = [
  { id: 'Órdenes', icono: 'bi-receipt', texto: 'Compras realizadas en la tienda y su estado de pago.', Vista: Ordenes },
  { id: 'Productos', icono: 'bi-box-seam', texto: 'Platos del menú: precios, ofertas, stock y descripción.', Vista: Productos },
  { id: 'Categorías', icono: 'bi-tags', texto: 'Secciones del menú con platos y ventas.', Vista: Categorias },
  { id: 'Usuarios', icono: 'bi-people', texto: 'Cuentas registradas y sus roles.', Vista: Usuarios },
  { id: 'Reportes', icono: 'bi-graph-up', texto: 'Ingresos, platos más vendidos y stock crítico.', Vista: Reportes },
  { id: 'Perfil', icono: 'bi-person-circle', texto: 'Tus datos y contraseña.', Vista: Perfil }
];

/* Panel administrativo. Solo se llega aquí a través de <RutaAdmin> (requiere login y rol admin).
   Los KPI se calculan con las órdenes, productos y usuarios reales. */
export default function LaCucinaNostraAdmin() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { usuario, salir } = useAuth();
  const navigate = useNavigate();
  const irAlInicio = () => setActiveTab('Dashboard');

  const cerrarSesion = () => { salir(); navigate('/login', { replace: true }); };

  const resumen = resumenVentas(obtenerOrdenes());
  const productos = obtenerProductos();
  const criticos = stockCritico(productos);
  const kpis = [
    { clase: 'kpi-card-blue', titulo: 'Ventas', valor: formatearPrecio(resumen.ingresos), pie: `Órdenes pagadas: ${resumen.pagadas}`, destino: 'Reportes' },
    { clase: 'kpi-card-green', titulo: 'Productos', valor: productos.length, pie: `Stock crítico: ${criticos.length}`, destino: 'Productos' },
    { clase: 'kpi-card-yellow', titulo: 'Usuarios', valor: obtenerUsuarios().length, pie: `Pagos rechazados: ${resumen.rechazadas}`, destino: 'Usuarios' }
  ];
  const activo = MODULOS.find((m) => m.id === activeTab);

  return (
    <div className="d-flex flex-column min-vh-100">
      <header className="top-header"><span>La Cucina Nostra - Panel Administrativo</span></header>

      <div className="container-fluid flex-grow-1 p-0">
        <div className="row g-0 admin-container">
          <aside className="col-12 col-md-3 col-lg-2 sidebar">
            <div>
              <nav className="sidebar-nav" aria-label="Administración">
                {[{ id: 'Dashboard', icono: 'bi-speedometer2' }, ...MODULOS.filter((m) => m.id !== 'Perfil')].map((m) => (
                  <a key={m.id} href={`#${m.id}`} className={`nav-link-custom ${activeTab === m.id ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); setActiveTab(m.id); }}>
                    <i className={`bi ${m.icono}`} aria-hidden="true" /> <span>{m.id}</span>
                  </a>
                ))}
              </nav>
              <div className="sidebar-divider" />
              <a href="#Perfil" className={`nav-link-custom ${activeTab === 'Perfil' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setActiveTab('Perfil'); }}>
                <i className="bi bi-person-circle" aria-hidden="true" /> <span>Perfil</span>
              </a>
            </div>
            <div className="sidebar-actions mt-4">
              <a href="/" className="btn-sidebar-store text-decoration-none"><i className="bi bi-shop" aria-hidden="true" /> <span>Tienda</span></a>
              <button type="button" className="btn-sidebar-logout" onClick={cerrarSesion}>
                <i className="bi bi-box-arrow-right" aria-hidden="true" /> <span>Cerrar Sesión</span>
              </button>
            </div>
          </aside>

          <main className="col-12 col-md-9 col-lg-10 main-content">
            {activo ? (
              <activo.Vista onVolver={irAlInicio} />
            ) : (
              <>
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Hola, {usuario.nombre}. Resumen de la tienda en tiempo real.</p>

                <div className="row g-4 mb-4">
                  {kpis.map((k) => (
                    <div className="col-12 col-md-4" key={k.titulo} style={{ cursor: 'pointer' }} onClick={() => setActiveTab(k.destino)}>
                      <div className={`kpi-card ${k.clase} d-flex justify-content-between align-items-center`}>
                        <div className="text-end ms-auto">
                          <div className="kpi-title">{k.titulo}</div>
                          <div className="kpi-value" data-testid={`kpi-${k.titulo}`}>{k.valor}</div>
                          <div className="kpi-footer">{k.pie}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {criticos.length > 0 && (
                  <div className="alert alert-warning" role="alert">
                    <strong>Stock crítico:</strong> {criticos.map((p) => `${p.nombre} (${p.stock})`).join(', ')}
                  </div>
                )}

                <div className="row g-4">
                  {MODULOS.map((m) => (
                    <div className="col-12 col-sm-6 col-lg-3" key={m.id} style={{ cursor: 'pointer' }} onClick={() => setActiveTab(m.id)}>
                      <div className="module-card"><div className="module-card-body">
                        <i className={`bi ${m.icono} module-icon`} style={{ fontSize: '2rem' }} aria-hidden="true" />
                        <h3 className="module-title">{m.id}</h3>
                        <p className="module-description">{m.texto}</p>
                      </div></div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
