import { describe, it, expect } from 'vitest';
import { PRECIO_BASE, resumirPizza, precioPizza, limpiarIngredientes, crearItemPizza, mismaPizza, descripcionPizza } from './pizza.js';
import { detallarCarrito, agregarPizzaAlCarrito, calcularTotal } from './carrito.js';
import { INGREDIENTES } from '../data/ingredientes.js';

const tomate = INGREDIENTES.find((i) => i.id === 'tomate');
const queso = INGREDIENTES.find((i) => i.id === 'queso');

describe('pizza personalizada', () => {
  it('hay más ingredientes que antes y cada emoji es único', () => {
    expect(INGREDIENTES.length).toBeGreaterThan(8);
    expect(new Set(INGREDIENTES.map((i) => i.emoji)).size).toBe(INGREDIENTES.length);
  });
  it('el precio es la base más cada unidad puesta', () => {
    const resumen = resumirPizza([{ emoji: tomate.emoji }, { emoji: tomate.emoji }, { emoji: queso.emoji }]);
    expect(resumen.map((i) => [i.id, i.n])).toEqual([['tomate', 2], ['queso', 1]]);
    expect(precioPizza(resumen)).toBe(PRECIO_BASE + 2 * tomate.precio + queso.precio);
  });
  it('ignora precios manipulados e ingredientes inventados', () => {
    const lista = [{ id: 'tomate', n: 1, precio: 1 }, { id: 'oro', n: 3, precio: 0 }, { id: 'queso', n: -2 }];
    expect(limpiarIngredientes(lista)).toEqual([expect.objectContaining({ id: 'tomate', precio: tomate.precio, n: 1 })]);
    expect(precioPizza(lista)).toBe(PRECIO_BASE + tomate.precio);
  });
  it('dos pizzas iguales se juntan en una línea del carrito', () => {
    const a = crearItemPizza([{ id: 'tomate', n: 2 }, { id: 'queso', n: 1 }]);
    const b = crearItemPizza([{ id: 'queso', n: 1 }, { id: 'tomate', n: 2 }]);
    expect(a.id).not.toBe(b.id);
    expect(mismaPizza(a.personalizada.ingredientes, b.personalizada.ingredientes)).toBe(true);
    const items = agregarPizzaAlCarrito(agregarPizzaAlCarrito([], a), b);
    expect(items).toHaveLength(1);
    expect(items[0].cantidad).toBe(2);
    expect(agregarPizzaAlCarrito(items, crearItemPizza([{ id: 'pollo', n: 1 }]))).toHaveLength(2);
  });
  it('el carrito detalla la pizza con precio recalculado y la suma al total', () => {
    const item = { ...crearItemPizza([{ id: 'tomate', n: 2 }]), cantidad: 2 };
    item.personalizada.precio = 1; // intento de manipular el precio
    const detalle = detallarCarrito([item, { id: 1, cantidad: 1 }], [{ id: 1, nombre: 'Bruschetta', precio: 5500, imagen: '' }]);
    expect(detalle[0]).toMatchObject({ nombre: 'Pizza personalizada', precio: PRECIO_BASE + 2 * tomate.precio, cantidad: 2 });
    expect(calcularTotal(detalle)).toBe(2 * (PRECIO_BASE + 2 * tomate.precio) + 5500);
    expect(descripcionPizza(detalle[0].personalizada.ingredientes)).toContain('Tomate × 2');
  });
  it('una pizza sin ingredientes válidos se descarta del carrito', () => {
    expect(detallarCarrito([{ id: 'pizza-x', cantidad: 1, personalizada: { ingredientes: [{ id: 'oro', n: 1 }] } }], [])).toEqual([]);
  });
});
