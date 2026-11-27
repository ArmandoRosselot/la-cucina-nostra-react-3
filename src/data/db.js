/* ============================================================
   db.js  —  "Base de datos" simulada en JavaScript
   Persistencia en localStorage. Expone funciones CRUD para:
     - productos (platos del menú)
     - carrito
     - usuarios y sesión (registro / inicio de sesión)
   Ningún componente toca localStorage directamente: todo pasa
   por este archivo, así es fácil de probar con mocks.
   ============================================================ */

export const KEYS = {
  PRODUCTOS: 'lcn_productos',
  CARRITO: 'lcn_carrito',
  USUARIOS: 'lcn_usuarios',
  SESION: 'lcn_sesion',
  MENSAJES: 'lcn_mensajes',
  ORDENES: 'lcn_ordenes'
};

import { CATEGORIAS, DETALLES, construirProductosIniciales } from './seed.js';

export { CATEGORIAS };
export const PRODUCTOS_INICIALES = construirProductosIniciales();

/* Completa los campos de detalle que falten (datos guardados antes de existir el detalle). */
function normalizarProducto(p) {
  const base = DETALLES[p.id] ? { ...DETALLES[p.id], ...p } : p;
  return {
    ...base,
    descripcion: base.descripcion ?? '',
    porcion: base.porcion ?? '',
    tiempo: base.tiempo ?? null,
    calorias: base.calorias ?? null,
    alergenos: Array.isArray(base.alergenos) ? base.alergenos : [],
    etiquetas: Array.isArray(base.etiquetas) ? base.etiquetas : [],
    stock: base.stock ?? 20
  };
}

/* ---------- utilidades internas ---------- */

function leer(clave, porDefecto) {
  try {
    const crudo = localStorage.getItem(clave);
    return crudo === null ? porDefecto : JSON.parse(crudo);
  } catch {
    return porDefecto;
  }
}

function escribir(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

/* ============================================================
   PRODUCTOS  (CRUD)
   ============================================================ */

/* READ: lista completa. Si es la primera visita, siembra los datos. */
export function obtenerProductos() {
  const guardados = leer(KEYS.PRODUCTOS, null);
  if (!Array.isArray(guardados)) {
    escribir(KEYS.PRODUCTOS, PRODUCTOS_INICIALES);
    return PRODUCTOS_INICIALES.map(normalizarProducto);
  }
  return guardados.map(normalizarProducto);
}

/* READ: un producto por id (o null). */
export function obtenerProductoPorId(id) {
  return obtenerProductos().find((p) => p.id === Number(id)) ?? null;
}

/* READ: productos de una categoría. */
export function obtenerProductosPorCategoria(categoria) {
  return obtenerProductos().filter((p) => p.categoria === categoria);
}

/* READ: productos con precio de oferta vigente. */
export function obtenerOfertas() {
  return obtenerProductos().filter((p) => p.precioOferta != null && p.precioOferta < p.precio);
}

/* CREATE */
export function crearProducto({ nombre, categoria, ingredientes, precio, imagen = '', precioOferta = null, ...detalle }) {
  const productos = obtenerProductos();
  const siguienteId = productos.length ? Math.max(...productos.map((p) => p.id)) + 1 : 1;
  const nuevo = normalizarProducto({
    id: siguienteId,
    nombre: String(nombre).trim(),
    categoria,
    ingredientes: String(ingredientes ?? '').trim(),
    precio: Number(precio),
    imagen,
    ...(precioOferta != null && precioOferta !== '' ? { precioOferta: Number(precioOferta) } : {}),
    ...detalle,
    stock: detalle.stock !== undefined ? Number(detalle.stock) : 20
  });
  escribir(KEYS.PRODUCTOS, [...productos, nuevo]);
  return nuevo;
}

/* UPDATE: devuelve el producto actualizado o null si no existe. */
export function actualizarProducto(id, cambios) {
  const productos = obtenerProductos();
  const indice = productos.findIndex((p) => p.id === Number(id));
  if (indice === -1) return null;
  const actualizado = { ...productos[indice], ...cambios, id: productos[indice].id };
  if (cambios.precio !== undefined) actualizado.precio = Number(cambios.precio);
  if (cambios.precioOferta === null || cambios.precioOferta === '') {
    delete actualizado.precioOferta; // quitar la oferta
  } else if (cambios.precioOferta !== undefined) {
    actualizado.precioOferta = Number(cambios.precioOferta);
  }
  for (const campo of ['stock', 'tiempo', 'calorias']) {
    if (cambios[campo] !== undefined && cambios[campo] !== null && cambios[campo] !== '') {
      actualizado[campo] = Number(cambios[campo]);
    }
  }
  productos[indice] = actualizado;
  escribir(KEYS.PRODUCTOS, productos);
  return actualizado;
}

/* DELETE: devuelve true si eliminó algo. */
export function eliminarProducto(id) {
  const productos = obtenerProductos();
  const restantes = productos.filter((p) => p.id !== Number(id));
  if (restantes.length === productos.length) return false;
  escribir(KEYS.PRODUCTOS, restantes);
  return true;
}

export function restablecerProductos() {
  escribir(KEYS.PRODUCTOS, PRODUCTOS_INICIALES);
}

/* ---------- Stock ----------
   El stock baja solo cuando un pago resulta correcto. */
export function descontarStock(items) {
  const productos = obtenerProductos().map((p) => {
    const linea = items.find((i) => i.id === p.id);
    return linea ? { ...p, stock: Math.max(0, p.stock - linea.cantidad) } : p;
  });
  escribir(KEYS.PRODUCTOS, productos);
}

/* ============================================================
   CARRITO  (persistencia)
   Cada ítem: { id, cantidad }
   ============================================================ */

export function obtenerCarrito() {
  const carrito = leer(KEYS.CARRITO, []);
  return Array.isArray(carrito) ? carrito : [];
}

export function guardarCarrito(items) {
  escribir(KEYS.CARRITO, items);
}

export function vaciarCarritoGuardado() {
  localStorage.removeItem(KEYS.CARRITO);
}

/* ============================================================
   USUARIOS Y SESIÓN
   (Simulación académica: en un sistema real la contraseña
   nunca se guarda en texto plano ni en el navegador.)
   ============================================================ */

/* Usuario administrador predefinido.
   Credenciales para el login:
     correo:     admin@lacucinanostra.cl
     contraseña: Admin123 */
export const USUARIO_ADMIN = {
  id: 0,
  nombre: 'Administrador',
  email: 'admin@lacucinanostra.cl',
  password: 'Admin123',
  telefono: '',
  region: '',
  comuna: '',
  rol: 'admin'
};

export function obtenerUsuarios() {
  const usuarios = leer(KEYS.USUARIOS, []);
  const lista = Array.isArray(usuarios) ? usuarios : [];
  /* El admin siempre existe, aunque localStorage ya tenga otros usuarios. */
  const hayAdmin = lista.some((u) => u.email.toLowerCase() === USUARIO_ADMIN.email);
  return hayAdmin ? lista : [USUARIO_ADMIN, ...lista];
}

export function buscarUsuarioPorEmail(email) {
  const buscado = String(email).trim().toLowerCase();
  return obtenerUsuarios().find((u) => u.email.toLowerCase() === buscado) ?? null;
}

export function obtenerUsuarioPorId(id) {
  return obtenerUsuarios().find((u) => u.id === Number(id)) ?? null;
}

/* Cambia datos de una cuenta. El correo y el id no se modifican; el admin principal
   (id 0) no puede perder su rol. Devuelve el usuario actualizado o null. */
export function actualizarUsuario(id, cambios) {
  const usuarios = obtenerUsuarios();
  const indice = usuarios.findIndex((u) => u.id === Number(id));
  if (indice === -1) return null;
  const { id: _id, email: _email, ...permitidos } = cambios;
  if (usuarios[indice].id === USUARIO_ADMIN.id) delete permitidos.rol;
  usuarios[indice] = { ...usuarios[indice], ...permitidos };
  escribir(KEYS.USUARIOS, usuarios);
  return usuarios[indice];
}

/* El administrador principal no se puede eliminar. */
export function eliminarUsuario(id) {
  if (Number(id) === USUARIO_ADMIN.id) return false;
  const usuarios = obtenerUsuarios();
  const restantes = usuarios.filter((u) => u.id !== Number(id));
  if (restantes.length === usuarios.length) return false;
  escribir(KEYS.USUARIOS, restantes);
  return true;
}

/* Devuelve { ok:true, usuario } o { ok:false, error }. */
export function registrarUsuario({ nombre, email, password, telefono = '', region = '', comuna = '' }) {
  if (buscarUsuarioPorEmail(email)) {
    return { ok: false, error: 'Ya existe una cuenta registrada con ese correo.' };
  }
  const usuarios = obtenerUsuarios();
  const usuario = {
    id: usuarios.length ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1,
    nombre: String(nombre).trim(),
    email: String(email).trim().toLowerCase(),
    password,
    telefono: String(telefono).trim(),
    region,
    comuna,
    rol: 'cliente'
  };
  escribir(KEYS.USUARIOS, [...usuarios, usuario]);
  return { ok: true, usuario };
}

/* Devuelve { ok:true, usuario } o { ok:false, error }. */
export function autenticarUsuario(email, password) {
  const usuario = buscarUsuarioPorEmail(email);
  if (!usuario || usuario.password !== password) {
    return { ok: false, error: 'Correo o contraseña incorrectos.' };
  }
  return { ok: true, usuario };
}

export function iniciarSesion(usuario) {
  escribir(KEYS.SESION, {
    id: usuario.id, nombre: usuario.nombre, email: usuario.email,
    region: usuario.region ?? '', comuna: usuario.comuna ?? '',
    rol: usuario.rol ?? 'cliente'
  });
}

export function obtenerSesion() {
  return leer(KEYS.SESION, null);
}

export function cerrarSesion() {
  localStorage.removeItem(KEYS.SESION);
}

/* ============================================================
   MENSAJES DE CONTACTO  (CREATE / READ / DELETE)
   ============================================================ */

export function obtenerMensajes() {
  const mensajes = leer(KEYS.MENSAJES, []);
  return Array.isArray(mensajes) ? mensajes : [];
}

export function crearMensaje({ nombre, email, mensaje }) {
  const mensajes = obtenerMensajes();
  const nuevo = {
    id: mensajes.length ? Math.max(...mensajes.map((m) => m.id)) + 1 : 1,
    nombre: String(nombre).trim(),
    email: String(email).trim().toLowerCase(),
    mensaje: String(mensaje).trim(),
    fecha: new Date().toISOString()
  };
  escribir(KEYS.MENSAJES, [...mensajes, nuevo]);
  return nuevo;
}

export function eliminarMensaje(id) {
  const mensajes = obtenerMensajes();
  const restantes = mensajes.filter((m) => m.id !== Number(id));
  if (restantes.length === mensajes.length) return false;
  escribir(KEYS.MENSAJES, restantes);
  return true;
}

/* ============================================================
   ÓRDENES DE COMPRA  (CREATE / READ / UPDATE)
   estado: 'pendiente' | 'pagada' | 'rechazada'
   ============================================================ */

export function obtenerOrdenes() {
  const ordenes = leer(KEYS.ORDENES, []);
  return Array.isArray(ordenes) ? ordenes : [];
}

export function obtenerOrdenPorId(id) {
  return obtenerOrdenes().find((o) => o.id === Number(id)) ?? null;
}

/* orden = { cliente, direccion, items, total, usuarioId? } */
export function crearOrden({ cliente, direccion, items, total, usuarioId = null }) {
  const ordenes = obtenerOrdenes();
  const id = ordenes.length ? Math.max(...ordenes.map((o) => o.id)) + 1 : 1;
  const hoy = new Date();
  const ymd = hoy.toISOString().slice(0, 10).replace(/-/g, '');
  const nueva = {
    id,
    numero: `${ymd}${String(id).padStart(2, '0')}`,
    codigo: `ORDER${String(id).padStart(5, '0')}`,
    fecha: hoy.toISOString(),
    estado: 'pendiente',
    cliente,
    direccion,
    items,
    total,
    usuarioId
  };
  escribir(KEYS.ORDENES, [...ordenes, nueva]);
  return nueva;
}

export function obtenerOrdenesDeUsuario(usuarioId) {
  return obtenerOrdenes().filter((o) => o.usuarioId === Number(usuarioId));
}

export function actualizarOrden(id, cambios) {
  const ordenes = obtenerOrdenes();
  const indice = ordenes.findIndex((o) => o.id === Number(id));
  if (indice === -1) return null;
  ordenes[indice] = { ...ordenes[indice], ...cambios, id: ordenes[indice].id };
  escribir(KEYS.ORDENES, ordenes);
  return ordenes[indice];
}
