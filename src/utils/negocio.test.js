import { describe, it, expect } from 'vitest';
import { agregarItem, cambiarCantidad, limiteDe, problemasDeStock, CANTIDAD_MAXIMA } from './carrito.js';
import { resumenVentas, topProductos, ventasPorCategoria, stockCritico } from './estadisticas.js';
import { validarProducto } from './validaciones.js';

describe('stock en el carrito', () => {
  it('el límite es el menor entre el tope general y el stock', () => {
    expect(limiteDe({ stock: 5 })).toBe(5);
    expect(limiteDe({ stock: 100 })).toBe(CANTIDAD_MAXIMA);
    expect(limiteDe({ stock: 0 })).toBe(0);
  });
  it('no deja agregar más que el stock ni agregar un producto agotado', () => {
    let items = [];
    for (let i = 0; i < 10; i++) items = agregarItem(items, 1, 3);
    expect(items).toEqual([{ id: 1, cantidad: 3 }]);
    expect(agregarItem([], 2, 0)).toEqual([]);
    expect(cambiarCantidad(items, 1, +5, 3)[0].cantidad).toBe(3);
  });
  it('detecta líneas que superan el stock', () => {
    const detalle = [{ id: 1, nombre: 'A', cantidad: 4, stock: 3 }, { id: 2, nombre: 'B', cantidad: 1, stock: 9 }];
    expect(problemasDeStock(detalle)).toEqual([{ id: 1, nombre: 'A', pedido: 4, disponible: 3 }]);
  });
});

const ordenes = [
  { estado: 'pagada', total: 20000, items: [{ id: 1, nombre: 'Pizza', cantidad: 2, subtotal: 20000 }] },
  { estado: 'pagada', total: 10000, items: [{ id: 2, nombre: 'Pasta', cantidad: 1, subtotal: 10000 }] },
  { estado: 'rechazada', total: 99999, items: [{ id: 1, nombre: 'Pizza', cantidad: 9, subtotal: 99999 }] },
  { estado: 'pendiente', total: 5000, items: [] }
];

describe('estadísticas del panel', () => {
  it('solo las órdenes pagadas suman ingresos', () => {
    expect(resumenVentas(ordenes)).toEqual({ totalOrdenes: 4, pagadas: 2, rechazadas: 1, pendientes: 1, ingresos: 30000, ticketPromedio: 15000 });
  });
  it('sin órdenes todo es cero (sin dividir por cero)', () => {
    expect(resumenVentas([]).ticketPromedio).toBe(0);
  });
  it('ranking ignora órdenes rechazadas', () => {
    expect(topProductos(ordenes)[0]).toMatchObject({ nombre: 'Pizza', unidades: 2 });
  });
  it('agrupa ventas por categoría y detecta stock crítico', () => {
    const prods = [{ id: 1, categoria: 'Almuerzo', stock: 0 }, { id: 2, categoria: 'Cena', stock: 8 }, { id: 3, categoria: 'Cena', stock: 2 }];
    expect(ventasPorCategoria(ordenes, prods)).toEqual([{ categoria: 'Almuerzo', ingresos: 20000 }, { categoria: 'Cena', ingresos: 10000 }]);
    expect(stockCritico(prods).map((p) => p.id)).toEqual([1, 3]);
  });
});

describe('validarProducto', () => {
  const ok = { nombre: 'Tiramisú', categoria: 'Cena', precio: 5000, precioOferta: '', stock: 10, ingredientes: 'Café, mascarpone' };
  it('acepta un producto válido', () => expect(validarProducto(ok)).toEqual({}));
  it('rechaza precio 0, oferta mayor al precio y stock negativo o decimal', () => {
    const e = validarProducto({ ...ok, precio: 0, stock: -1 });
    expect(e).toHaveProperty('precio');
    expect(e).toHaveProperty('stock');
    expect(validarProducto({ ...ok, precioOferta: 6000 })).toHaveProperty('precioOferta');
    expect(validarProducto({ ...ok, stock: 2.5 })).toHaveProperty('stock');
  });
});
