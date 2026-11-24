import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/utils.jsx';
import { registrarUsuario, iniciarSesion, obtenerOrdenes, obtenerCarrito, guardarCarrito } from '../data/db.js';

afterEach(() => vi.restoreAllMocks());

const conCarrito = () => guardarCarrito([{ id: 1, cantidad: 2 }, { id: 2, cantidad: 1 }]); // 11.000 + 6.900 (oferta)

async function llenarDireccion() {
  await userEvent.type(screen.getByLabelText(/^Calle/), 'Los Crisantemos 123');
  await userEvent.selectOptions(screen.getByLabelText(/Región/), 'Región Metropolitana de Santiago');
  await userEvent.selectOptions(screen.getByLabelText(/Comuna/), 'Cerrillos');
}

async function llenarCliente() {
  await userEvent.type(screen.getByLabelText(/^Nombre/), 'Pedro');
  await userEvent.type(screen.getByLabelText(/^Apellidos/), 'Hacker');
  await userEvent.type(screen.getByLabelText(/^Correo/), 'pedro@correo.cl');
}

describe('Checkout', () => {
  it('con el carrito vacío ofrece ir a los productos', async () => {
    await renderApp('/comprar');
    expect(screen.getByText(/tu carrito está vacío/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ir a los productos/i })).toBeInTheDocument();
  });

  it('muestra los productos y el total (con precios de oferta)', async () => {
    conCarrito();
    await renderApp('/comprar');
    expect(screen.getAllByTestId('fila-item')).toHaveLength(2);
    expect(screen.getByTestId('total-a-pagar')).toHaveTextContent('$17.900');
    expect(screen.getByRole('button', { name: /pagar ahora \$17\.900/i })).toBeInTheDocument();
  });

  it('con sesión iniciada completa los datos del cliente automáticamente', async () => {
    conCarrito();
    const { usuario } = registrarUsuario({ nombre: 'Ana Silva Rojas', email: 'ana@correo.cl', password: 'Pasta2024', region: 'Región de Ñuble', comuna: 'Chillán' });
    iniciarSesion(usuario);
    await renderApp('/comprar');
    expect(screen.getByLabelText(/^Nombre/)).toHaveValue('Ana');
    expect(screen.getByLabelText(/^Apellidos/)).toHaveValue('Silva Rojas');
    expect(screen.getByLabelText(/^Correo/)).toHaveValue('ana@correo.cl');
    expect(screen.getByLabelText(/Región/)).toHaveValue('Región de Ñuble');
    expect(screen.getByLabelText(/Comuna/)).toHaveValue('Chillán');
  });

  it('valida los campos obligatorios y no crea la orden', async () => {
    conCarrito();
    await renderApp('/comprar');
    await userEvent.click(screen.getByRole('button', { name: /pagar ahora/i }));
    expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument();
    expect(screen.getByText('El correo es obligatorio.')).toBeInTheDocument();
    expect(screen.getByText('La calle es obligatoria.')).toBeInTheDocument();
    expect(screen.getByText('Selecciona una región.')).toBeInTheDocument();
    expect(obtenerOrdenes()).toHaveLength(0);
  });

  it('la comuna depende de la región elegida', async () => {
    conCarrito();
    await renderApp('/comprar');
    const comuna = screen.getByLabelText(/Comuna/);
    expect(comuna).toBeDisabled();
    await userEvent.selectOptions(screen.getByLabelText(/Región/), 'Región de Valparaíso');
    expect(comuna).toBeEnabled();
    expect(within(comuna).getByRole('option', { name: 'Viña del Mar' })).toBeInTheDocument();
    expect(within(comuna).queryByRole('option', { name: 'Cerrillos' })).not.toBeInTheDocument();
  });

  it('pago exitoso: crea la orden pagada, vacía el carrito y muestra la compra', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    conCarrito();
    await renderApp('/comprar');
    await llenarCliente();
    await llenarDireccion();
    await userEvent.click(screen.getByRole('button', { name: /pagar ahora/i }));

    expect(await screen.findByRole('heading', { name: /se ha realizado la compra/i })).toBeInTheDocument();
    expect(screen.getByText(/Total pagado: \$17\.900/)).toBeInTheDocument();
    expect(obtenerOrdenes()[0].estado).toBe('pagada');
    expect(obtenerCarrito()).toEqual([]);
    expect(screen.getByRole('button', { name: /imprimir boleta/i })).toBeInTheDocument();
  });

  it('pago rechazado: guarda la orden rechazada y conserva el carrito', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    conCarrito();
    await renderApp('/comprar');
    await llenarCliente();
    await llenarDireccion();
    await userEvent.click(screen.getByRole('button', { name: /pagar ahora/i }));

    expect(await screen.findByRole('heading', { name: /no se pudo realizar el pago/i })).toBeInTheDocument();
    expect(obtenerOrdenes()[0].estado).toBe('rechazada');
    expect(obtenerCarrito()).toHaveLength(2);
  });

  it('"Volver a realizar el pago" reintenta y puede terminar bien', async () => {
    const azar = vi.spyOn(Math, 'random').mockReturnValue(0.99);
    conCarrito();
    await renderApp('/comprar');
    await llenarCliente();
    await llenarDireccion();
    await userEvent.click(screen.getByRole('button', { name: /pagar ahora/i }));
    await screen.findByRole('heading', { name: /no se pudo/i });

    await userEvent.click(screen.getByRole('button', { name: /volver a realizar el pago/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/volvió a fallar/i);

    azar.mockReturnValue(0.1);
    await userEvent.click(screen.getByRole('button', { name: /volver a realizar el pago/i }));
    expect(await screen.findByRole('heading', { name: /se ha realizado la compra/i })).toBeInTheDocument();
    expect(obtenerOrdenes()[0].estado).toBe('pagada');
  });

  it('enviar boleta por email muestra la confirmación', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    conCarrito();
    await renderApp('/comprar');
    await llenarCliente();
    await llenarDireccion();
    await userEvent.click(screen.getByRole('button', { name: /pagar ahora/i }));
    await userEvent.click(await screen.findByRole('button', { name: /enviar boleta por email/i }));
    expect(screen.getByRole('status')).toHaveTextContent('Boleta enviada a pedro@correo.cl');
  });

  it('una orden inexistente muestra un mensaje', async () => {
    await renderApp('/pago-correcto/55');
    expect(screen.getByRole('heading', { name: /orden no encontrada/i })).toBeInTheDocument();
  });

  it('"Realizar pedido" del carrito lateral lleva al checkout', async () => {
    await renderApp('/productos');
    await userEvent.click(screen.getAllByRole('button', { name: /^agregar$/i })[0]);
    await userEvent.click(screen.getByRole('button', { name: /ver carrito/i }));
    await userEvent.click(screen.getByRole('button', { name: /realizar pedido/i }));
    expect(await screen.findByTestId('total-a-pagar')).toBeInTheDocument();
  });
});
