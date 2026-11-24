import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderConApp } from '../test/utils.jsx';
import Navbar from './Navbar.jsx';

const navegar = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => navegar
}));

beforeEach(() => navegar.mockClear());

const montar = (props = {}) => renderConApp(<Navbar onAbrirCarrito={() => {}} {...props} />);

describe('<Navbar />', () => {
  it('muestra el buscador, los botones de sesión y los enlaces del template', () => {
    montar();
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Iniciar Sesión' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Crear Cuenta' })).toBeInTheDocument();
    const rutas = { Home: '/', Productos: '/productos', Ofertas: '/ofertas', Nosotros: '/nosotros', Blog: '/blog', Contacto: '/contacto' };
    Object.entries(rutas).forEach(([nombre, href]) =>
      expect(screen.getByRole('link', { name: nombre })).toHaveAttribute('href', href));
  });

  it('el botón del carrito muestra el monto y abre el panel', async () => {
    const onAbrirCarrito = vi.fn();
    montar({ onAbrirCarrito });
    const boton = screen.getByRole('button', { name: /ver carrito/i });
    expect(boton).toHaveTextContent('Carrito $0');
    await userEvent.click(boton);
    expect(onAbrirCarrito).toHaveBeenCalledTimes(1);
  });

  it('buscar navega a /productos con el texto (sin espacios sobrantes)', async () => {
    montar();
    await userEvent.type(screen.getByLabelText(/buscar plato/i), '  pizza  ');
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(navegar).toHaveBeenCalledWith('/productos?q=pizza');
  });

  it('validación: no navega y muestra error con caracteres no permitidos', async () => {
    montar();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/buscar plato/i), '<b>');
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/no permitidos/i);
    expect(navegar).not.toHaveBeenCalled();
  });

  it('el menú Categorías enlaza a cada categoría', async () => {
    montar();
    await userEvent.click(screen.getByRole('button', { name: 'Categorías' }));
    expect(screen.getByRole('link', { name: 'Almuerzo' })).toHaveAttribute('href', '/categorias/Almuerzo');
    expect(screen.getByRole('link', { name: 'Todas las categorías' })).toHaveAttribute('href', '/categorias');
  });
});
