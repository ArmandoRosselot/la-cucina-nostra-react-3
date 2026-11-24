import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/utils.jsx';
import { registrarUsuario, iniciarSesion } from '../data/db.js';

describe('<Home /> (integración con layout y rutas)', () => {
  it('muestra carrusel, categorías, ofertas, nosotros, blog y contacto', async () => {
    await renderApp('/');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/comida italiana/i);
    expect(screen.getAllByTestId('slide').length).toBeGreaterThan(1);
    ['Categorías', 'Ofertas', 'Sobre nosotros', 'Blog', 'Contacto'].forEach((t) =>
      expect(screen.getByRole('heading', { name: t })).toBeInTheDocument());
  });

  it('agregar un plato actualiza el contador y el monto del carrito, y avisa', async () => {
    await renderApp('/');
    expect(screen.getByTestId('contador-carrito')).toHaveTextContent('0');
    await userEvent.click(screen.getAllByRole('button', { name: /^agregar$/i })[0]);
    expect(screen.getByTestId('contador-carrito')).toHaveTextContent('1');
    expect(screen.getByRole('button', { name: /ver carrito/i })).not.toHaveTextContent('Carrito $0');
    expect(screen.getByRole('status')).toHaveTextContent(/se agregó al carrito/i);
  });

  it('las pestañas del menú cambian la categoría mostrada', async () => {
    await renderApp('/');
    await userEvent.click(screen.getByRole('tab', { name: 'Cena' }));
    expect(screen.getByRole('tab', { name: 'Cena' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Ravioli di Ricotta')).toBeInTheDocument();
  });

  it('con sesión iniciada muestra el saludo y oculta login/registro', async () => {
    const { usuario } = registrarUsuario({ nombre: 'Ana Silva', email: 'ana@correo.cl', password: 'Pasta2024' });
    iniciarSesion(usuario);
    await renderApp('/');
    expect(screen.getByTestId('saludo')).toHaveTextContent('Hola, Ana');
    expect(screen.queryByRole('link', { name: /iniciar sesión/i })).not.toBeInTheDocument();
  });

  it('cerrar sesión vuelve a mostrar login y crear cuenta', async () => {
    const { usuario } = registrarUsuario({ nombre: 'Ana Silva', email: 'ana@correo.cl', password: 'Pasta2024' });
    iniciarSesion(usuario);
    await renderApp('/');
    await userEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }));
    expect(screen.getByRole('link', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /crear cuenta/i })).toBeInTheDocument();
  });
});
