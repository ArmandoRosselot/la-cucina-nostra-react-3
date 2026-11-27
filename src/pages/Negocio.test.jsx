import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/utils.jsx';
import {
  guardarCarrito, crearOrden, actualizarOrden, obtenerOrdenPorId, obtenerProductoPorId, obtenerProductos, actualizarProducto,
  registrarUsuario, iniciarSesion, USUARIO_ADMIN
} from '../data/db.js';

afterEach(() => vi.restoreAllMocks());

const nuevaOrden = (estado, extra = {}) => {
  const o = crearOrden({
    cliente: { nombre: 'Pedro', apellidos: 'H', email: 'p@c.cl' },
    direccion: { calle: 'Calle 1', departamento: '', region: 'R', comuna: 'C', indicaciones: '' },
    items: [{ id: 1, nombre: 'Bruschetta', imagen: '', precio: 5500, cantidad: 1, subtotal: 5500 }],
    total: 5500, ...extra
  });
  return actualizarOrden(o.id, { estado });
};

describe('detalle de producto', () => {
  it('muestra descripción, porción, tiempo, calorías, alérgenos y etiquetas', async () => {
    await renderApp('/productos/2');
    expect(await screen.findByText('Porción')).toBeInTheDocument();
    expect(screen.getByText('1 plato (250 g)')).toBeInTheDocument();
    expect(screen.getByText('8 min')).toBeInTheDocument();
    expect(screen.getByText('290 kcal')).toBeInTheDocument();
    expect(screen.getByTestId('alergenos')).toHaveTextContent('Lácteos');
    expect(screen.getAllByTestId('etiqueta').map((e) => e.textContent)).toEqual(['Vegetariano', 'Sin gluten']);
    expect(await screen.findByText(/mozzarella fresca/i)).toBeInTheDocument();
  });

  it('con pocas unidades avisa y limita la cantidad al stock', async () => {
    await renderApp('/productos/16'); // stock 5
    expect(screen.getByText(/últimas 5 unidades/i)).toBeInTheDocument();
    const mas = screen.getByRole('button', { name: /aumentar cantidad/i });
    for (let i = 0; i < 8; i++) await userEvent.click(mas);
    expect(screen.getByTestId('cantidad-detalle')).toHaveTextContent('5');
    expect(mas).toBeDisabled();
  });

  it('un producto agotado no se puede agregar', async () => {
    actualizarProducto(1, { stock: 0 });
    await renderApp('/productos/1');
    expect(screen.getByText(/producto agotado/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sin stock/i })).toBeDisabled();
  });

  it('el listado marca los agotados', async () => {
    actualizarProducto(1, { stock: 0 });
    await renderApp('/productos');
    const tarjeta = screen.getAllByTestId('producto').find((t) => within(t).queryByText('Bruschetta tradicional'));
    expect(within(tarjeta).getByText('Agotado')).toBeInTheDocument();
    expect(within(tarjeta).getByRole('button', { name: /sin stock/i })).toBeDisabled();
  });
});

describe('checkout con stock', () => {
  it('no permite pagar si el stock bajó por debajo de lo pedido', async () => {
    guardarCarrito([{ id: 1, cantidad: 3 }]);
    actualizarProducto(1, { stock: 1 });
    await renderApp('/comprar');
    await userEvent.type(screen.getByLabelText(/^Nombre/), 'Pedro');
    await userEvent.type(screen.getByLabelText(/^Apellidos/), 'Hacker');
    await userEvent.type(screen.getByLabelText(/^Correo/), 'pedro@correo.cl');
    await userEvent.type(screen.getByLabelText(/^Calle/), 'Los Crisantemos 123');
    await userEvent.selectOptions(screen.getByLabelText(/Región/), 'Región Metropolitana de Santiago');
    await userEvent.selectOptions(screen.getByLabelText(/Comuna/), 'Cerrillos');
    await userEvent.click(screen.getByRole('button', { name: /pagar ahora/i }));
    expect(screen.getByText(/stock insuficiente/i)).toBeInTheDocument();
  });

  it('un pago correcto descuenta el stock y asocia la orden a la cuenta', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const { usuario } = registrarUsuario({ nombre: 'Ana Silva', email: 'ana@correo.cl', password: 'Pasta2024', region: 'Región Metropolitana de Santiago', comuna: 'Cerrillos' });
    iniciarSesion(usuario);
    guardarCarrito([{ id: 16, cantidad: 2 }]);
    await renderApp('/comprar');
    await userEvent.type(screen.getByLabelText(/^Calle/), 'Los Crisantemos 123');
    await userEvent.click(screen.getByRole('button', { name: /pagar ahora/i }));
    expect(await screen.findByRole('heading', { name: /se ha realizado la compra/i })).toBeInTheDocument();
    expect(obtenerProductoPorId(16).stock).toBe(3);
    expect(obtenerPrimeraOrden().usuarioId).toBe(usuario.id);
  });
});
const obtenerPrimeraOrden = () => obtenerOrdenPorId(1);

describe('resultado del pago', () => {
  it('una orden rechazada no se puede ver como "compra realizada"', async () => {
    const o = nuevaOrden('rechazada');
    await renderApp(`/pago-correcto/${o.id}`);
    expect(await screen.findByRole('heading', { name: /no se pudo realizar el pago/i })).toBeInTheDocument();
  });

  it('una orden pagada no ofrece volver a pagar', async () => {
    const o = nuevaOrden('pagada');
    await renderApp(`/pago-error/${o.id}`);
    expect(await screen.findByRole('heading', { name: /se ha realizado la compra/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /volver a realizar el pago/i })).not.toBeInTheDocument();
  });

  it('la orden de una cuenta no la ve otro cliente, pero sí el administrador', async () => {
    const { usuario: ana } = registrarUsuario({ nombre: 'Ana', email: 'ana@correo.cl', password: 'Pasta2024' });
    const { usuario: luis } = registrarUsuario({ nombre: 'Luis', email: 'luis@correo.cl', password: 'Pasta2024' });
    const o = nuevaOrden('pagada', { usuarioId: ana.id });

    iniciarSesion(luis);
    const { unmount } = await renderApp(`/pago-correcto/${o.id}`);
    expect(await screen.findByRole('heading', { name: /sin acceso/i })).toBeInTheDocument();
    unmount();

    iniciarSesion(USUARIO_ADMIN);
    await renderApp(`/pago-correcto/${o.id}`);
    expect(await screen.findByRole('heading', { name: /se ha realizado la compra/i })).toBeInTheDocument();
  });

  it('reintentar sin stock suficiente no cobra', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const o = nuevaOrden('rechazada');
    actualizarProducto(1, { stock: 0 });
    await renderApp(`/pago-error/${o.id}`);
    await userEvent.click(screen.getByRole('button', { name: /volver a realizar el pago/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/ya no hay stock/i);
    expect(obtenerOrdenPorId(o.id).estado).toBe('rechazada');
  });
});

describe('mis pedidos', () => {
  it('lista solo los pedidos del cliente con sesión', async () => {
    const { usuario } = registrarUsuario({ nombre: 'Ana', email: 'ana@correo.cl', password: 'Pasta2024' });
    nuevaOrden('pagada', { usuarioId: usuario.id });
    nuevaOrden('pagada', { usuarioId: 999 });
    iniciarSesion(usuario);
    await renderApp('/mi-cuenta?tab=compras');
    expect(await screen.findAllByTestId('pedido')).toHaveLength(1);
  });
});

describe('panel admin conectado a la tienda', () => {
  it('el dashboard muestra KPIs reales y alerta de stock crítico', async () => {
    nuevaOrden('pagada');
    iniciarSesion(USUARIO_ADMIN);
    await renderApp('/LaCucinaNostraAdmin');
    expect(await screen.findByTestId('kpi-Ventas')).toHaveTextContent('$5.500');
    expect(screen.getByTestId('kpi-Productos')).toHaveTextContent(String(obtenerProductos().length));
    expect(screen.getByText(/ravioli di ricotta \(5\)/i)).toBeInTheDocument();
  });

  it('crear un plato en el panel lo deja visible en la tienda', async () => {
    iniciarSesion(USUARIO_ADMIN);
    await renderApp('/LaCucinaNostraAdmin');
    await userEvent.click(await screen.findByRole('link', { name: /productos/i }));
    await userEvent.click(screen.getByRole('button', { name: /nuevo plato/i }));

    // Primero un envío vacío: valida
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }));
    expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument();
    expect(screen.getByText('El precio debe ser mayor a 0.')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Nombre'), 'Tiramisú');
    await userEvent.selectOptions(screen.getByLabelText('Categoría'), 'Cena');
    await userEvent.type(screen.getByLabelText(/^Precio \(\$\)/), '4500');
    await userEvent.type(screen.getByLabelText(/^Ingredientes/), 'Café, mascarpone');
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }));

    expect(await screen.findByText('Plato creado.')).toBeInTheDocument();
    expect(obtenerProductos().some((p) => p.nombre === 'Tiramisú' && p.stock === 20)).toBe(true);
  });

  it('un usuario no puede cambiarse el rol ni eliminarse a sí mismo (ni al admin principal)', async () => {
    registrarUsuario({ nombre: 'Ana', email: 'ana@correo.cl', password: 'Pasta2024' });
    iniciarSesion(USUARIO_ADMIN);
    await renderApp('/LaCucinaNostraAdmin');
    await userEvent.click(await screen.findByRole('link', { name: /usuarios/i }));
    const filas = screen.getAllByTestId('usuario-admin');
    expect(within(filas[0]).getByRole('button', { name: /eliminar/i })).toBeDisabled();
    expect(within(filas[1]).getByRole('button', { name: /eliminar/i })).toBeEnabled();
  });
});
