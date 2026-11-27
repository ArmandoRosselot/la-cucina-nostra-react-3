import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/utils.jsx';
import {
  registrarUsuario, iniciarSesion, obtenerCarrito, obtenerOrdenes, obtenerUsuarioPorId, crearOrden, actualizarOrden
} from '../data/db.js';
import { PRECIO_BASE } from '../utils/pizza.js';

afterEach(() => vi.restoreAllMocks());

// Los botones de ingredientes tienen la clase topping-btn (el nombre accesible empieza con el emoji).
const elegir = (nombre) =>
  userEvent.click(screen.getAllByRole('button').find((b) => b.classList.contains('topping-btn') && b.textContent.includes(nombre)));
const poner = () => userEvent.click(screen.getByRole('button', { name: /^\+ Agregar/ }));

describe('Arma tu pizza', () => {
  it('sin ingredientes no se puede agregar al carrito', async () => {
    await renderApp('/armar-pizza');
    expect(screen.getByRole('button', { name: /agregar al carrito/i })).toBeDisabled();
    expect(screen.getByTestId('precio-pizza')).toHaveTextContent('$7.900');
  });

  it('el precio sube con cada ingrediente y la pizza llega al carrito con sus ingredientes', async () => {
    await renderApp('/armar-pizza');
    await elegir('Pepperoni'); await poner(); await poner();
    await elegir('Queso extra'); await poner();
    expect(screen.getByTestId('precio-pizza')).toHaveTextContent(`$${(PRECIO_BASE + 2 * 1300 + 1000).toLocaleString('es-CL')}`);

    await userEvent.click(screen.getByRole('button', { name: /agregar al carrito/i }));
    expect(await screen.findByText(/pizza agregada al carrito/i)).toBeInTheDocument();
    expect(obtenerCarrito()).toHaveLength(1);

    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /ver carrito/i }));
    const linea = await screen.findByTestId('item-carrito');
    expect(linea).toHaveTextContent('Pizza personalizada');
    expect(within(linea).getByTestId('ingredientes-carrito')).toHaveTextContent('Pepperoni × 2');
    expect(screen.getByTestId('total-carrito')).toHaveTextContent('$11.500');
  });

  it('"Ir a pagar" lleva al checkout con la pizza en la tabla', async () => {
    await renderApp('/armar-pizza');
    await elegir('Tomate'); await poner();
    await userEvent.click(screen.getByRole('button', { name: /agregar al carrito/i }));
    await userEvent.click(await screen.findByRole('button', { name: /ir a pagar/i }));
    expect(await screen.findByTestId('fila-item')).toHaveTextContent('Pizza personalizada');
  });

  it('el máximo de ingredientes bloquea seguir agregando', async () => {
    await renderApp('/armar-pizza');
    await elegir('Ajo');
    for (let i = 0; i < 32; i++) await poner();
    expect(screen.getByText(/máximo de 30 ingredientes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^\+ Agregar/ })).toBeDisabled();
  });

  it('pagar una pizza guarda sus ingredientes en la orden y se ve en Mis compras', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const { usuario } = registrarUsuario({ nombre: 'Ana Silva', email: 'ana@correo.cl', password: 'Pasta2024', region: 'Región Metropolitana de Santiago', comuna: 'Cerrillos' });
    iniciarSesion(usuario);
    await renderApp('/armar-pizza');
    await elegir('Jamón'); await poner();
    await userEvent.click(screen.getByRole('button', { name: /agregar al carrito/i }));
    await userEvent.click(await screen.findByRole('button', { name: /ir a pagar/i }));
    await userEvent.type(await screen.findByLabelText(/^Calle/), 'Los Crisantemos 123');
    await userEvent.click(screen.getByRole('button', { name: /pagar ahora/i }));
    expect(await screen.findByRole('heading', { name: /se ha realizado la compra/i })).toBeInTheDocument();

    expect(obtenerOrdenes()[0].items[0].personalizada.ingredientes[0]).toMatchObject({ id: 'jamon', n: 1 });
    expect(obtenerOrdenes()[0].usuarioId).toBe(usuario.id);

    await userEvent.click(screen.getByRole('link', { name: /mi cuenta/i }));
    await userEvent.click(await screen.findByRole('tab', { name: /mis compras/i }));
    expect(screen.getByTestId('resumen-compras')).toHaveTextContent(/1 compra pagada/);
    await userEvent.click(screen.getByRole('button', { name: /detalle/i }));
    expect(within(screen.getByTestId('detalle-pedido')).getByText(/Jamón × 1/)).toBeInTheDocument();
  });
});

describe('Mi cuenta', () => {
  const cliente = () => {
    const { usuario } = registrarUsuario({ nombre: 'Ana Silva', email: 'ana@correo.cl', password: 'Pasta2024', region: 'Región de Ñuble', comuna: 'Chillán' });
    iniciarSesion(usuario);
    return usuario;
  };

  it('exige sesión y el menú de usuario lleva a la cuenta', async () => {
    await renderApp('/mi-cuenta');
    expect(await screen.findByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('muestra los datos actuales y los campos tienen autocompletado', async () => {
    cliente();
    await renderApp('/mi-cuenta');
    expect(screen.getByLabelText(/^Nombre completo/)).toHaveValue('Ana Silva');
    expect(screen.getByLabelText(/^Nombre completo/)).toHaveAttribute('autocomplete', 'name');
    expect(screen.getByLabelText(/^Comuna/)).toHaveValue('Chillán');
    expect(screen.getByLabelText(/^Correo/)).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Nueva contraseña')).toHaveAttribute('autocomplete', 'new-password');
  });

  it('valida y guarda los datos; el checkout los usa', async () => {
    const ana = cliente();
    await renderApp('/mi-cuenta');
    const nombre = screen.getByLabelText(/^Nombre completo/);
    await userEvent.clear(nombre);
    await userEvent.type(screen.getByLabelText(/^Teléfono/), '123');
    await userEvent.click(screen.getByRole('button', { name: /guardar datos/i }));
    expect(screen.getByText(/nombre es obligatorio|nombre/i, { selector: '.invalid-feedback' })).toBeInTheDocument();
    expect(screen.getByText(/celular válido/i)).toBeInTheDocument();
    expect(obtenerUsuarioPorId(ana.id).nombre).toBe('Ana Silva');

    await userEvent.type(nombre, 'Ana María Silva');
    await userEvent.clear(screen.getByLabelText(/^Teléfono/));
    await userEvent.selectOptions(screen.getByLabelText(/^Región/), 'Región Metropolitana de Santiago');
    expect(screen.getByLabelText(/^Comuna/)).toHaveValue(''); // se reinicia al cambiar la región
    await userEvent.selectOptions(screen.getByLabelText(/^Comuna/), 'Cerrillos');
    await userEvent.click(screen.getByRole('button', { name: /guardar datos/i }));
    expect(await screen.findByText(/tus datos se actualizaron/i)).toBeInTheDocument();
    expect(obtenerUsuarioPorId(ana.id)).toMatchObject({ nombre: 'Ana María Silva', comuna: 'Cerrillos' });
    expect(screen.getByTestId('saludo')).toHaveTextContent('Ana');
  });

  it('cambia la contraseña solo si la actual es correcta', async () => {
    const ana = cliente();
    await renderApp('/mi-cuenta');
    await userEvent.type(screen.getByLabelText('Contraseña actual'), 'Incorrecta1');
    await userEvent.type(screen.getByLabelText('Nueva contraseña'), 'Nueva2024x');
    await userEvent.type(screen.getByLabelText(/^Repetir/), 'Nueva2024x');
    await userEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }));
    expect(screen.getByText(/contraseña actual no coincide/i)).toBeInTheDocument();
    expect(obtenerUsuarioPorId(ana.id).password).toBe('Pasta2024');

    await userEvent.clear(screen.getByLabelText('Contraseña actual'));
    await userEvent.type(screen.getByLabelText('Contraseña actual'), 'Pasta2024');
    await userEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }));
    expect(await screen.findByText(/contraseña se actualizó/i)).toBeInTheDocument();
    expect(obtenerUsuarioPorId(ana.id).password).toBe('Nueva2024x');
  });

  it('"Mis compras" muestra solo las de la cuenta, con estado y acción según el pago', async () => {
    const ana = cliente();
    const base = { cliente: { nombre: 'Ana', apellidos: 'S', email: 'a@a.cl' }, direccion: { calle: 'X', departamento: '', region: 'R', comuna: 'C' }, items: [{ id: 1, nombre: 'Bruschetta', imagen: '', precio: 5500, cantidad: 1, subtotal: 5500 }], total: 5500 };
    actualizarOrden(crearOrden({ ...base, usuarioId: ana.id }).id, { estado: 'pagada' });
    actualizarOrden(crearOrden({ ...base, usuarioId: ana.id }).id, { estado: 'rechazada' });
    crearOrden({ ...base, usuarioId: 999 });
    await renderApp('/mi-cuenta?tab=compras');
    const filas = await screen.findAllByTestId('pedido');
    expect(filas).toHaveLength(2);
    expect(within(filas[0]).getByRole('link', { name: /reintentar pago/i })).toBeInTheDocument();
    expect(within(filas[1]).getByRole('link', { name: /ver boleta/i })).toBeInTheDocument();
    expect(screen.getByTestId('resumen-compras')).toHaveTextContent(/1 compra pagada · total gastado \$5\.500/);
  });

  it('sin compras invita a pedir', async () => {
    cliente();
    await renderApp('/mi-cuenta?tab=compras');
    expect(screen.getByText(/aún no has hecho compras/i)).toBeInTheDocument();
  });
});
