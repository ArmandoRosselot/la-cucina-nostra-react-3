/* ============================================================
   seed.js — Datos iniciales del menú (sin dependencias del navegador).
   Lo usan db.js (localStorage) y el backend opcional de /server.
   Los valores nutricionales son REFERENCIALES (editables desde el panel).
   ============================================================ */

export const CATEGORIAS = ['Entradas', 'Desayuno', 'Almuerzo', 'Cena'];

const foto = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=80`;

export const PRODUCTOS_BASE = [
  { id: 1, categoria: 'Entradas', nombre: 'Bruschetta tradicional', ingredientes: 'Ciabatta, tomate, ajo, albahaca y aceite de oliva', precio: 5500, imagen: foto('photo-1594978583693-8dfdfc93f052') },
  { id: 2, categoria: 'Entradas', nombre: 'Ensalada Caprese', ingredientes: 'Tomate, mozzarella, albahaca y aceite de oliva', precio: 8900, imagen: foto('photo-1665877417637-a20691d6ee8b') },
  { id: 3, categoria: 'Entradas', nombre: 'Carpaccio de res o salmón', ingredientes: 'Finas láminas de res o salmón, rúcula, parmesano y aceite de oliva', precio: 12900, imagen: foto('photo-1571770110109-46c4d1cfcd21') },
  { id: 4, categoria: 'Entradas', nombre: 'Caponata siciliana', ingredientes: 'Berenjena, tomate, cebolla, alcaparras y aceitunas', precio: 9900, imagen: foto('photo-1651494774473-94a7cb9bd514') },
  { id: 5, categoria: 'Entradas', nombre: 'Arancini', ingredientes: 'Bolitas de arroz rellenas de queso y salsa de tomate', precio: 10500, imagen: foto('photo-1632778140142-d62dee6e124c') },
  { id: 6, categoria: 'Desayuno', nombre: 'Cornetto con Cappuccino', ingredientes: 'Croissant relleno de crema o chocolate con un cappuccino', precio: 7900, imagen: foto('photo-1706698319512-499cd769990a') },
  { id: 7, categoria: 'Desayuno', nombre: 'Bomboloni', ingredientes: 'Donas italianas rellenas de crema, chocolate o mermelada', precio: 3900, imagen: foto('photo-1589199750869-334ae4187406') },
  { id: 8, categoria: 'Desayuno', nombre: 'Uova in Purgatorio', ingredientes: 'Huevos escalfados en salsa de tomate con pan tostado', precio: 8900, imagen: foto('photo-1612950365425-dbf12ef9a1a8') },
  { id: 9, categoria: 'Desayuno', nombre: 'Frittata Italiana', ingredientes: 'Tortilla de huevo con verduras, queso y hierbas', precio: 9900, imagen: foto('photo-1579592886462-5dd9d955124c') },
  { id: 10, categoria: 'Desayuno', nombre: 'Tostada de Burrata', ingredientes: 'Pan tostado con burrata, tomate cherry y pesto', precio: 11500, imagen: foto('photo-1616412689611-ccfc4ad24939') },
  { id: 11, categoria: 'Almuerzo', nombre: 'Pizza Margherita', ingredientes: 'Tomate, mozzarella y albahaca', precio: 9900, imagen: foto('photo-1574071318508-1cdbab80d002') },
  { id: 12, categoria: 'Almuerzo', nombre: 'Pasta al Pesto', ingredientes: 'Pesto, parmesano y albahaca', precio: 10900, imagen: foto('photo-1551183053-bf91a1d81141') },
  { id: 13, categoria: 'Almuerzo', nombre: 'Lasagna della Nonna', ingredientes: 'Carne, pasta, salsa y queso', precio: 11900, imagen: foto('photo-1547592180-85f173990554') },
  { id: 14, categoria: 'Cena', nombre: 'Pizza Prosciutto', ingredientes: 'Prosciutto, mozzarella y rúcula', precio: 12500, imagen: foto('photo-1571997478779-2adcbbe9ab2f') },
  { id: 15, categoria: 'Cena', nombre: 'Spaghetti Carbonara', ingredientes: 'Pasta, huevo, queso y panceta', precio: 10500, imagen: foto('photo-1473093295043-cdd812d0e601') },
  { id: 16, categoria: 'Cena', nombre: 'Ravioli di Ricotta', ingredientes: 'Ricotta, espinaca y salsa pomodoro', precio: 11500, imagen: foto('photo-1563379926898-05f4575a45d8') }
];

/* Precios de oferta (id -> precio rebajado). */
export const OFERTAS = { 2: 6900, 5: 7900, 9: 7500, 12: 8900, 13: 9900, 15: 8500 };

/* Detalle de cada plato: descripcion (HTML simple), porcion, tiempo (min),
   calorias (kcal por porción), alergenos, etiquetas y stock inicial. */
export const DETALLES = {
  1: { descripcion: '<p>Pan ciabatta tostado a la leña, cubierto con tomate fresco picado, ajo y albahaca. Un clásico para <strong>compartir</strong> antes del plato principal.</p>', porcion: '4 unidades', tiempo: 10, calorias: 320, alergenos: ['Gluten'], etiquetas: ['Vegano'], stock: 40 },
  2: { descripcion: '<p>Rodajas de tomate maduro y <strong>mozzarella fresca</strong> con hojas de albahaca y un hilo de aceite de oliva extra virgen.</p>', porcion: '1 plato (250 g)', tiempo: 8, calorias: 290, alergenos: ['Lácteos'], etiquetas: ['Vegetariano', 'Sin gluten'], stock: 35 },
  3: { descripcion: '<p>Láminas muy finas de res o salmón, servidas con rúcula, lascas de parmesano y limón. Se prepara al momento.</p>', porcion: '1 plato (180 g)', tiempo: 12, calorias: 340, alergenos: ['Lácteos', 'Pescado'], etiquetas: ['Sin gluten'], stock: 20 },
  4: { descripcion: '<p>Guiso agridulce siciliano de berenjena con alcaparras y aceitunas. Se sirve <em>tibio o frío</em>.</p>', porcion: '1 plato (220 g)', tiempo: 10, calorias: 210, alergenos: [], etiquetas: ['Vegano', 'Sin gluten'], stock: 30 },
  5: { descripcion: '<p>Croquetas de arroz rellenas de queso y salsa de tomate, empanizadas y fritas hasta quedar <strong>doradas y crujientes</strong>.</p>', porcion: '3 unidades', tiempo: 15, calorias: 480, alergenos: ['Gluten', 'Lácteos', 'Huevo'], etiquetas: ['Vegetariano'], stock: 25 },
  6: { descripcion: '<p>Croissant italiano relleno de crema pastelera o chocolate, acompañado de un cappuccino recién preparado.</p>', porcion: '1 cornetto + 1 taza', tiempo: 7, calorias: 420, alergenos: ['Gluten', 'Lácteos', 'Huevo'], etiquetas: ['Vegetariano'], stock: 50 },
  7: { descripcion: '<p>Donas italianas esponjosas, rellenas de crema, chocolate o mermelada y espolvoreadas con azúcar.</p>', porcion: '1 unidad', tiempo: 5, calorias: 360, alergenos: ['Gluten', 'Lácteos', 'Huevo'], etiquetas: ['Vegetariano'], stock: 60 },
  8: { descripcion: '<p>Huevos escalfados en una salsa de tomate picante, servidos con pan tostado para mojar.</p>', porcion: '2 huevos + pan', tiempo: 15, calorias: 380, alergenos: ['Gluten', 'Huevo'], etiquetas: ['Vegetariano', 'Picante'], stock: 30 },
  9: { descripcion: '<p>Tortilla italiana al horno con verduras de temporada, queso y hierbas frescas.</p>', porcion: '1 porción (200 g)', tiempo: 15, calorias: 340, alergenos: ['Huevo', 'Lácteos'], etiquetas: ['Vegetariano', 'Sin gluten'], stock: 28 },
  10: { descripcion: '<p>Pan de masa madre tostado con <strong>burrata cremosa</strong>, tomate cherry y pesto de albahaca.</p>', porcion: '2 tostadas', tiempo: 10, calorias: 460, alergenos: ['Gluten', 'Lácteos', 'Frutos secos'], etiquetas: ['Vegetariano'], stock: 22 },
  11: { descripcion: '<p>La receta original napolitana: salsa de tomate San Marzano, <strong>mozzarella</strong> y albahaca fresca sobre masa de fermentación lenta.</p>', porcion: '1 pizza (30 cm)', tiempo: 18, calorias: 780, alergenos: ['Gluten', 'Lácteos'], etiquetas: ['Vegetariano'], stock: 45 },
  12: { descripcion: '<p>Pasta fresca con pesto genovés preparado con albahaca, piñones y parmesano.</p>', porcion: '1 plato (350 g)', tiempo: 14, calorias: 620, alergenos: ['Gluten', 'Lácteos', 'Frutos secos'], etiquetas: ['Vegetariano'], stock: 38 },
  13: { descripcion: '<p>Láminas de pasta con ragú de carne cocido por horas, bechamel y queso gratinado. La receta de la nonna.</p>', porcion: '1 porción (380 g)', tiempo: 20, calorias: 720, alergenos: ['Gluten', 'Lácteos', 'Huevo'], etiquetas: [], stock: 30 },
  14: { descripcion: '<p>Pizza con mozzarella, <strong>prosciutto crudo</strong> y rúcula fresca agregada al salir del horno.</p>', porcion: '1 pizza (30 cm)', tiempo: 18, calorias: 840, alergenos: ['Gluten', 'Lácteos'], etiquetas: [], stock: 40 },
  15: { descripcion: '<p>Espaguetis con huevo, queso pecorino y panceta crocante. Sin crema, como se hace en Roma.</p>', porcion: '1 plato (350 g)', tiempo: 15, calorias: 790, alergenos: ['Gluten', 'Lácteos', 'Huevo'], etiquetas: [], stock: 36 },
  16: { descripcion: '<p>Ravioles caseros rellenos de ricota y espinaca, bañados en salsa pomodoro y albahaca.</p>', porcion: '8 ravioles', tiempo: 16, calorias: 590, alergenos: ['Gluten', 'Lácteos', 'Huevo'], etiquetas: ['Vegetariano'], stock: 5 }
};

/* Producto base + oferta + detalle. */
export function construirProductosIniciales() {
  return PRODUCTOS_BASE.map((p) => ({
    ...p,
    ...(OFERTAS[p.id] ? { precioOferta: OFERTAS[p.id] } : {}),
    ...DETALLES[p.id]
  }));
}
