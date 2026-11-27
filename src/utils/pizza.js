import { INGREDIENTES } from '../data/ingredientes.js';

/* Reglas de la pizza personalizada (funciones puras). */
export const PRECIO_BASE = 7900;      // masa + salsa + queso
export const MAX_INGREDIENTES = 30;   // unidades totales sobre una pizza

const porId = new Map(INGREDIENTES.map((i) => [i.id, i]));

/* Cuenta cuántas unidades hay de cada ingrediente. puestos = [{ emoji }]. */
export const resumirPizza = (puestos) =>
  INGREDIENTES
    .map((ing) => ({ id: ing.id, nombre: ing.nombre, emoji: ing.emoji, precio: ing.precio, n: puestos.filter((p) => p.emoji === ing.emoji).length }))
    .filter((i) => i.n > 0);

/* El precio se calcula SIEMPRE con el catálogo (ignora precios guardados en el carrito,
   que el usuario podría editar). Ingredientes desconocidos o cantidades inválidas se descartan. */
export function limpiarIngredientes(lista = []) {
  return lista
    .map((i) => ({ ing: porId.get(i.id), n: Math.floor(Number(i.n)) }))
    .filter(({ ing, n }) => ing && n > 0)
    .map(({ ing, n }) => ({ id: ing.id, nombre: ing.nombre, emoji: ing.emoji, precio: ing.precio, n }));
}

export const precioPizza = (ingredientes) =>
  PRECIO_BASE + limpiarIngredientes(ingredientes).reduce((s, i) => s + i.precio * i.n, 0);

export const totalUnidades = (ingredientes) => ingredientes.reduce((s, i) => s + i.n, 0);

export const descripcionPizza = (ingredientes) =>
  limpiarIngredientes(ingredientes).map((i) => `${i.emoji} ${i.nombre} × ${i.n}`).join(' · ');

/* Firma para juntar dos pizzas idénticas en una sola línea del carrito. */
const firma = (ingredientes) =>
  limpiarIngredientes(ingredientes).map((i) => `${i.id}:${i.n}`).sort().join('|');

let contador = 0;
/* Ítem de carrito para una pizza armada. */
export function crearItemPizza(ingredientes) {
  const limpios = limpiarIngredientes(ingredientes);
  contador += 1;
  return { id: `pizza-${Date.now().toString(36)}-${contador}`, cantidad: 1, personalizada: { ingredientes: limpios } };
}

export const mismaPizza = (a, b) => firma(a) === firma(b);
