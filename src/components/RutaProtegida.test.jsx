import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderApp } from '../test/utils.jsx';
import { registrarUsuario, iniciarSesion, USUARIO_ADMIN, KEYS } from '../data/db.js';

const entrarComo = (usuario) => iniciarSesion(usuario);
const cliente = () => registrarUsuario({ nombre: 'Ana Silva', email: 'ana@correo.cl', password: 'Pasta2024' }).usuario;

describe('Rutas protegidas', () => {
  it('sin sesión, el panel admin redirige al login con aviso', async () => {
    await renderApp('/LaCucinaNostraAdmin');
    expect(await screen.findByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/inicia sesión/i);
  });

  it('un cliente ve "Acceso denegado" en el panel admin', async () => {
    entrarComo(cliente());
    await renderApp('/LaCucinaNostraAdmin');
    expect(await screen.findByRole('heading', { name: /acceso denegado/i })).toBeInTheDocument();
    expect(screen.queryByText(/panel administrativo/i)).not.toBeInTheDocument();
  });

  it('un cliente que se auto-asigna rol admin en la sesión sigue bloqueado', async () => {
    const ana = cliente();
    localStorage.setItem(KEYS.SESION, JSON.stringify({ ...ana, rol: 'admin' }));
    await renderApp('/LaCucinaNostraAdmin');
    expect(await screen.findByRole('heading', { name: /acceso denegado/i })).toBeInTheDocument();
  });

  it('una sesión de un usuario que ya no existe se trata como sin sesión', async () => {
    localStorage.setItem(KEYS.SESION, JSON.stringify({ id: 99, nombre: 'Fantasma', email: 'x@x.cl', rol: 'admin' }));
    await renderApp('/LaCucinaNostraAdmin');
    expect(await screen.findByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('el administrador entra al panel y cerrar sesión lo devuelve al login', async () => {
    entrarComo(USUARIO_ADMIN);
    await renderApp('/LaCucinaNostraAdmin');
    expect(await screen.findByText(/panel administrativo/i)).toBeInTheDocument();
    screen.getByRole('button', { name: /cerrar sesión/i }).click();
    expect(await screen.findByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(localStorage.getItem(KEYS.SESION)).toBeNull();
  });

  it('"Mis pedidos" exige sesión', async () => {
    await renderApp('/mi-cuenta?tab=compras');
    expect(await screen.findByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
  });
});
