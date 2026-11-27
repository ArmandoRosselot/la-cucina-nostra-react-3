import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/utils.jsx';
import { PRODUCTOS_INICIALES } from '../data/db.js';

describe('Productos', () => {
  it('"Todos" lista todos los platos', async () => {
    await renderApp('/productos');
    expect(screen.getAllByTestId('producto')).toHaveLength(PRODUCTOS_INICIALES.length);
  });

  it('el parámetro ?q= filtra los resultados', async () => {
    await renderApp('/productos?q=carbonara');
    expect(screen.getAllByTestId('producto')).toHaveLength(1);
    expect(screen.getByText(/resultados para/i)).toBeInTheDocument();
  });

  it('buscar desde el encabezado lleva a Productos filtrado', async () => {
    await renderApp('/');
    await userEvent.type(screen.getByLabelText(/buscar plato/i), 'ravioli');
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByText(/resultados para/i)).toBeInTheDocument();
    expect(screen.getAllByTestId('producto')).toHaveLength(1);
  });

  it('hacer clic en un plato abre su detalle', async () => {
    await renderApp('/productos');
    await userEvent.click(screen.getByRole('button', { name: /ver detalle de bruschetta/i }));
    expect(await screen.findByRole('heading', { name: 'Bruschetta tradicional' })).toBeInTheDocument();
  });
});

describe('Detalle de producto', () => {
  it('muestra nombre, ingredientes y precio', async () => {
    await renderApp('/productos/1');
    expect(screen.getByRole('heading', { name: 'Bruschetta tradicional' })).toBeInTheDocument();
    expect(screen.getByTestId('ingredientes')).toHaveTextContent(/ciabatta/i);
    expect(screen.getAllByText('$5.500').length).toBeGreaterThan(0);
  });

  it('muestra precio de oferta para un producto rebajado', async () => {
    await renderApp('/productos/2');
    expect(screen.getByText('$6.900')).toBeInTheDocument();
    expect(screen.getByText('$8.900').tagName).toBe('DEL');
  });

  it('el selector de cantidad cambia el estado y respeta el mínimo', async () => {
    await renderApp('/productos/1');
    const menos = screen.getByRole('button', { name: /disminuir/i });
    expect(menos).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: /aumentar/i }));
    await userEvent.click(screen.getByRole('button', { name: /aumentar/i }));
    expect(screen.getByTestId('cantidad-detalle')).toHaveTextContent('3');
  });

  it('agrega la cantidad elegida al carrito', async () => {
    await renderApp('/productos/1');
    await userEvent.click(screen.getByRole('button', { name: /aumentar/i }));
    await userEvent.click(screen.getByRole('button', { name: /agregar al carrito/i }));
    expect(screen.getByTestId('contador-carrito')).toHaveTextContent('2');
    expect(screen.getByRole('button', { name: /ver carrito/i })).toHaveTextContent('Carrito $11.000');
  });

  it('un id inexistente muestra un mensaje', async () => {
    await renderApp('/productos/9999');
    expect(screen.getByRole('heading', { name: /producto no encontrado/i })).toBeInTheDocument();
  });
});

describe('Categorías', () => {
  it('sin parámetro pide elegir una categoría', async () => {
    await renderApp('/categorias');
    expect(screen.getByText(/elige una categoría/i)).toBeInTheDocument();
    expect(screen.queryAllByTestId('producto')).toHaveLength(0);
  });

  it('con una categoría lista solo sus platos', async () => {
    await renderApp('/categorias/Cena');
    expect(screen.getAllByTestId('producto')).toHaveLength(3);
    expect(screen.getByRole('heading', { name: 'Cena', level: 2 })).toBeInTheDocument();
  });

  it('una categoría inválida avisa', async () => {
    await renderApp('/categorias/Postres');
    expect(screen.getByRole('heading', { name: /categoría no encontrada/i })).toBeInTheDocument();
  });

  it('hacer clic en una tarjeta navega a la categoría', async () => {
    await renderApp('/categorias');
    await userEvent.click(screen.getByRole('button', { name: /almuerzo/i }));
    expect(await screen.findByRole('heading', { name: 'Almuerzo', level: 2 })).toBeInTheDocument();
  });
});

describe('Ofertas, Nosotros, Blog y Contacto', () => {
  it('Ofertas lista solo productos rebajados', async () => {
    await renderApp('/ofertas');
    expect(screen.getAllByTestId('producto')).toHaveLength(6);
  });

  it('Nosotros y Contacto tienen su propia vista', async () => {
    const { unmount } = await renderApp('/nosotros');
    expect(screen.getByRole('heading', { name: /sobre nosotros/i })).toBeInTheDocument();
    unmount();
    await renderApp('/contacto');
    expect(screen.getByRole('heading', { name: 'Contacto' })).toBeInTheDocument();
  });

  it('Blog enlaza a cada detalle y el detalle muestra el contenido', async () => {
    await renderApp('/blog');
    await userEvent.click(screen.getAllByRole('link', { name: /ver caso/i })[1]);
    expect(await screen.findByRole('heading', { name: 'Caso curioso #2' })).toBeInTheDocument();
    expect(screen.getByText(/horno de leña/i, { selector: 'p' })).toBeInTheDocument();
  });

  it('una entrada inexistente avisa', async () => {
    await renderApp('/blog/99');
    expect(screen.getByRole('heading', { name: /entrada no encontrada/i })).toBeInTheDocument();
  });
});
