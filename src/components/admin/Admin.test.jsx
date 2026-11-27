import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderConApp } from '../../test/utils.jsx';
import Categorias from './Categorias.jsx';
import Ordenes from './Ordenes.jsx';
import Reportes from './Reportes.jsx';
import Perfil from './Perfil.jsx';
import Usuarios from './Usuarios.jsx';
import {
  CATEGORIAS, crearOrden, actualizarOrden, registrarUsuario, iniciarSesion, obtenerUsuarios, USUARIO_ADMIN
} from '../../data/db.js';

afterEach(() => vi.restoreAllMocks());

const nuevaOrden = (estado) => {
  const o = crearOrden({
    cliente: { nombre: 'Pedro', apellidos: 'Hernández', email: 'p@c.cl' },
    direccion: { calle: 'Calle 1', departamento: '', region: 'Metropolitana', comuna: 'Santiago', indicaciones: '' },
    items: [{ id: 1, nombre: 'Bruschetta', imagen: '', precio: 5500, cantidad: 2, subtotal: 11000 }],
    total: 11000
  });
  return actualizarOrden(o.id, { estado });
};

const entrarComoAdmin = () => iniciarSesion(USUARIO_ADMIN);

describe('admin · Categorias', () => {
  it('lista todas las categorías del menú y llama a onVolver', async () => {
    const onVolver = vi.fn();
    renderConApp(<Categorias onVolver={onVolver} />);
    expect(screen.getAllByTestId('categoria-admin')).toHaveLength(CATEGORIAS.length);
    await userEvent.click(screen.getByRole('button', { name: /volver al dashboard/i }));
    expect(onVolver).toHaveBeenCalledTimes(1);
  });
});

describe('admin · Ordenes', () => {
  it('sin órdenes muestra el mensaje vacío', () => {
    renderConApp(<Ordenes onVolver={() => {}} />);
    expect(screen.getByText(/no hay órdenes para mostrar/i)).toBeInTheDocument();
  });

  it('filtra por estado y despliega el detalle de una orden', async () => {
    nuevaOrden('pagada');
    nuevaOrden('rechazada');
    renderConApp(<Ordenes onVolver={() => {}} />);
    expect(screen.getAllByTestId('orden-admin')).toHaveLength(2);

    await userEvent.click(screen.getByRole('button', { name: 'Rechazada' }));
    expect(screen.getAllByTestId('orden-admin')).toHaveLength(1);

    await userEvent.click(screen.getByRole('button', { name: 'Pendiente' }));
    expect(screen.getByText(/no hay órdenes para mostrar/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Todas' }));
    await userEvent.click(screen.getAllByRole('button', { name: 'Detalle' })[0]);
    expect(screen.getByText(/2 × Bruschetta/)).toBeInTheDocument();
    expect(screen.getByText(/Entrega: Calle 1/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Ocultar' }));
    expect(screen.queryByText(/2 × Bruschetta/)).not.toBeInTheDocument();
  });
});

describe('admin · Reportes', () => {
  it('sin ventas muestra los textos vacíos', () => {
    renderConApp(<Reportes onVolver={() => {}} />);
    expect(screen.getAllByText('Aún no hay ventas.')).toHaveLength(2);
    expect(screen.getByText('Órdenes pagadas')).toBeInTheDocument();
  });

  it('con una orden pagada calcula el plato más vendido', () => {
    nuevaOrden('pagada');
    renderConApp(<Reportes onVolver={() => {}} />);
    const top = screen.getByRole('heading', { name: 'Platos más vendidos' }).closest('.card');
    expect(within(top).getByText('Bruschetta')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /stock crítico/i })).toBeInTheDocument();
  });
});

describe('admin · Perfil', () => {
  it('muestra el correo y el rol del administrador', () => {
    entrarComoAdmin();
    renderConApp(<Perfil onVolver={() => {}} />);
    expect(screen.getByRole('heading', { name: 'Perfil' })).toBeInTheDocument();
    expect(screen.getByText(/admin@lacucinanostra\.cl · rol admin/)).toBeInTheDocument();
  });
});

describe('admin · Usuarios', () => {
  it('protege al admin principal y permite cambiar el rol de un cliente', async () => {
    registrarUsuario({ nombre: 'Ana Pérez', email: 'ana@correo.cl', password: 'Clave1234' });
    entrarComoAdmin();
    renderConApp(<Usuarios onVolver={() => {}} />);

    expect(screen.getByLabelText('Rol de Administrador')).toBeDisabled();
    const selectAna = screen.getByLabelText('Rol de Ana Pérez');
    expect(selectAna).toBeEnabled();

    await userEvent.selectOptions(selectAna, 'admin');
    expect(screen.getByRole('status')).toHaveTextContent('Ana Pérez ahora es admin.');
    expect(obtenerUsuarios().find((u) => u.email === 'ana@correo.cl').rol).toBe('admin');
  });

  it('elimina una cuenta solo si se confirma', async () => {
    registrarUsuario({ nombre: 'Ana Pérez', email: 'ana@correo.cl', password: 'Clave1234' });
    entrarComoAdmin();
    renderConApp(<Usuarios onVolver={() => {}} />);
    const fila = () => screen.getByText('ana@correo.cl').closest('tr');

    vi.spyOn(window, 'confirm').mockReturnValueOnce(false);
    await userEvent.click(within(fila()).getByRole('button', { name: 'Eliminar' }));
    expect(screen.getAllByTestId('usuario-admin')).toHaveLength(2);

    vi.spyOn(window, 'confirm').mockReturnValueOnce(true);
    await userEvent.click(within(fila()).getByRole('button', { name: 'Eliminar' }));
    expect(screen.getAllByTestId('usuario-admin')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('Cuenta eliminada.');
  });
});
