/* Cálculos del panel administrador a partir de órdenes y productos reales.
   Funciones puras: fáciles de probar. Solo las órdenes 'pagada' cuentan como venta. */

export function resumenVentas(ordenes) {
  const pagadas = ordenes.filter((o) => o.estado === 'pagada');
  const ingresos = pagadas.reduce((s, o) => s + o.total, 0);
  return {
    totalOrdenes: ordenes.length,
    pagadas: pagadas.length,
    rechazadas: ordenes.filter((o) => o.estado === 'rechazada').length,
    pendientes: ordenes.filter((o) => o.estado === 'pendiente').length,
    ingresos,
    ticketPromedio: pagadas.length ? Math.round(ingresos / pagadas.length) : 0
  };
}

/* Platos más vendidos (solo órdenes pagadas). */
export function topProductos(ordenes, n = 5) {
  const mapa = new Map();
  ordenes.filter((o) => o.estado === 'pagada').forEach((o) =>
    o.items.forEach((i) => {
      const previo = mapa.get(i.id) ?? { id: i.id, nombre: i.nombre, unidades: 0, ingresos: 0 };
      mapa.set(i.id, { ...previo, unidades: previo.unidades + i.cantidad, ingresos: previo.ingresos + i.subtotal });
    })
  );
  return [...mapa.values()].sort((a, b) => b.unidades - a.unidades).slice(0, n);
}

export function ventasPorCategoria(ordenes, productos) {
  const categoriaDe = new Map(productos.map((p) => [p.id, p.categoria]));
  const mapa = {};
  ordenes.filter((o) => o.estado === 'pagada').forEach((o) =>
    o.items.forEach((i) => {
      const c = categoriaDe.get(i.id) ?? (i.personalizada ? 'Pizza personalizada' : 'Otros');
      mapa[c] = (mapa[c] ?? 0) + i.subtotal;
    })
  );
  return Object.entries(mapa).map(([categoria, ingresos]) => ({ categoria, ingresos })).sort((a, b) => b.ingresos - a.ingresos);
}

/* Platos con poco stock (incluye agotados). */
export const stockCritico = (productos, umbral = 5) =>
  productos.filter((p) => p.stock <= umbral).sort((a, b) => a.stock - b.stock);
