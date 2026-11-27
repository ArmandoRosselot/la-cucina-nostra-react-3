/* Funciones puras del carrito (no tocan React ni localStorage).
   Un ítem del carrito es { id, cantidad }. */

import { limpiarIngredientes, precioPizza, descripcionPizza, mismaPizza } from './pizza.js';

export const CANTIDAD_MAXIMA = 20;

/* Precio que realmente se cobra: el de oferta si existe. */
export const precioFinal = (p) => (p.precioOferta != null && p.precioOferta < p.precio ? p.precioOferta : p.precio);

export const descuentoPorcentaje = (p) =>
  precioFinal(p) < p.precio ? Math.round((1 - p.precioOferta / p.precio) * 100) : 0;

/* Máximo que se puede llevar de un plato: el tope general o el stock, lo que sea menor. */
export const limiteDe = (producto) =>
  Math.min(CANTIDAD_MAXIMA, Math.max(0, producto?.stock ?? CANTIDAD_MAXIMA));

export function agregarItem(items, id, limite = CANTIDAD_MAXIMA) {
  if (limite <= 0) return items; // agotado: no se agrega
  const existente = items.find((i) => i.id === id);
  if (!existente) return [...items, { id, cantidad: 1 }];
  return items.map((i) =>
    i.id === id ? { ...i, cantidad: Math.min(i.cantidad + 1, limite) } : i
  );
}

/* Suma o resta 'delta'. Si la cantidad llega a 0, el ítem se elimina. */
export function cambiarCantidad(items, id, delta, limite = CANTIDAD_MAXIMA) {
  return items
    .map((i) => (i.id === id ? { ...i, cantidad: Math.min(i.cantidad + delta, limite) } : i))
    .filter((i) => i.cantidad > 0);
}

export function quitarItem(items, id) {
  return items.filter((i) => i.id !== id);
}

/* Une los ítems con los datos del producto y descarta ids que ya no existen. */
export function detallarCarrito(items, productos) {
  return items
    .map((i) => {
      // Pizza armada por el cliente: no está en el menú, se arma desde sus ingredientes.
      if (i.personalizada) {
        const ingredientes = limpiarIngredientes(i.personalizada.ingredientes);
        if (!ingredientes.length) return null;
        const precio = precioPizza(ingredientes);
        return {
          id: i.id, nombre: 'Pizza personalizada', categoria: 'Pizza personalizada', imagen: '',
          precio, cantidad: i.cantidad, subtotal: precio * i.cantidad,
          personalizada: { ingredientes }, ingredientesTexto: descripcionPizza(ingredientes)
        };
      }
      const producto = productos.find((p) => p.id === i.id);
      return producto ? { ...producto, cantidad: i.cantidad, precio: precioFinal(producto), subtotal: precioFinal(producto) * i.cantidad } : null;
    })
    .filter(Boolean);
}

export const calcularTotal = (detalle) => detalle.reduce((suma, i) => suma + i.subtotal, 0);
export const contarUnidades = (items) => items.reduce((suma, i) => suma + i.cantidad, 0);

/* Revisa que cada línea del carrito tenga stock. Devuelve la lista de problemas
   (vacía si todo está bien): [{ id, nombre, pedido, disponible }]. */
export function problemasDeStock(detalle) {
  return detalle
    .filter((i) => i.cantidad > (i.stock ?? Infinity))
    .map((i) => ({ id: i.id, nombre: i.nombre, pedido: i.cantidad, disponible: i.stock }));
}

/* Agrega una pizza armada. Si ya hay una idéntica, suma una unidad a esa línea. */
export function agregarPizzaAlCarrito(items, itemPizza) {
  const igual = items.find((i) => i.personalizada && mismaPizza(i.personalizada.ingredientes, itemPizza.personalizada.ingredientes));
  if (!igual) return [...items, itemPizza];
  return items.map((i) => (i === igual ? { ...i, cantidad: Math.min(i.cantidad + 1, CANTIDAD_MAXIMA) } : i));
}
