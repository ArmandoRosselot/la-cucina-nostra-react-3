/* ============================================================
   validaciones.js
   Funciones puras de validación (sin React, sin DOM).
   Cada validador devuelve '' si el valor es válido, o el
   mensaje de error si no lo es. Así son fáciles de probar.
   ============================================================ */

import { REGIONES } from '../data/regiones.js';

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REGEX_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ '\-.][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*\.?$/;
const REGEX_TELEFONO_CL = /^(?:\+?56)?9\d{8}$/;

export const limpiar = (valor) => String(valor ?? '').trim();

export function validarNombre(valor) {
  const nombre = limpiar(valor);
  if (!nombre) return 'El nombre es obligatorio.';
  if (nombre.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
  if (nombre.length > 60) return 'El nombre no puede superar los 60 caracteres.';
  if (!REGEX_NOMBRE.test(nombre)) return 'El nombre solo puede contener letras y espacios.';
  if (nombre.split(/\s+/).length < 2) return 'Ingresa tu nombre y apellido.';
  return '';
}

export function validarEmail(valor) {
  const email = limpiar(valor);
  if (!email) return 'El correo es obligatorio.';
  if (email.length > 100) return 'El correo no puede superar los 100 caracteres.';
  if (!REGEX_EMAIL.test(email)) return 'Ingresa un correo válido, por ejemplo nombre@correo.cl.';
  return '';
}

export function validarConfirmacionEmail(email, confirmacion) {
  if (!limpiar(confirmacion)) return 'Confirma tu correo.';
  if (limpiar(email).toLowerCase() !== limpiar(confirmacion).toLowerCase()) {
    return 'Los correos no coinciden.';
  }
  return '';
}

export function validarPassword(valor) {
  const password = String(valor ?? '');
  if (!password) return 'La contraseña es obligatoria.';
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (password.length > 50) return 'La contraseña no puede superar los 50 caracteres.';
  if (!/[a-z]/.test(password)) return 'Debe incluir al menos una letra minúscula.';
  if (!/[A-Z]/.test(password)) return 'Debe incluir al menos una letra mayúscula.';
  if (!/\d/.test(password)) return 'Debe incluir al menos un número.';
  return '';
}

export function validarConfirmacionPassword(password, confirmacion) {
  if (!confirmacion) return 'Confirma tu contraseña.';
  if (password !== confirmacion) return 'Las contraseñas no coinciden.';
  return '';
}

/* El teléfono es opcional. Si se escribe, debe ser celular chileno
   (9 XXXX XXXX), con o sin +56. */
export function validarTelefono(valor) {
  const telefono = limpiar(valor).replace(/[\s-]/g, '');
  if (!telefono) return '';
  if (!REGEX_TELEFONO_CL.test(telefono)) {
    return 'Ingresa un celular válido, por ejemplo +56 9 1234 5678.';
  }
  return '';
}

/* La comuna es obligatoria y debe pertenecer a la región elegida. */
export function validarComuna(region, comuna) {
  if (!limpiar(comuna)) return 'Selecciona una comuna.';
  if (!(REGIONES[region] ?? []).includes(comuna)) return 'La comuna no pertenece a la región elegida.';
  return '';
}

/* Validador para el buscador del menú. */
export function validarBusqueda(valor) {
  const texto = String(valor ?? '');
  if (texto.length > 40) return 'La búsqueda no puede superar los 40 caracteres.';
  if (/[<>]/.test(texto)) return 'La búsqueda contiene caracteres no permitidos.';
  return '';
}

export function validarMensaje(valor) {
  const mensaje = limpiar(valor);
  if (!mensaje) return 'El mensaje es obligatorio.';
  if (mensaje.length < 10) return 'El mensaje debe tener al menos 10 caracteres.';
  if (mensaje.length > 500) return 'El mensaje no puede superar los 500 caracteres.';
  return '';
}

/* Nombre o apellido por separado (checkout). */
export function validarNombrePropio(valor, etiqueta = 'nombre') {
  const v = limpiar(valor);
  if (!v) return `El ${etiqueta} es obligatorio.`;
  if (v.length < 2) return `El ${etiqueta} debe tener al menos 2 caracteres.`;
  if (v.length > 40) return `El ${etiqueta} no puede superar los 40 caracteres.`;
  if (!REGEX_NOMBRE.test(v)) return `El ${etiqueta} solo puede contener letras.`;
  return '';
}

export function validarCalle(valor) {
  const v = limpiar(valor);
  if (!v) return 'La calle es obligatoria.';
  if (v.length < 5) return 'Ingresa la dirección de forma detallada (mínimo 5 caracteres).';
  if (v.length > 80) return 'La calle no puede superar los 80 caracteres.';
  return '';
}

/* Opcional. */
export function validarDepartamento(valor) {
  const v = limpiar(valor);
  if (!v) return '';
  if (v.length > 10) return 'El departamento no puede superar los 10 caracteres.';
  if (!/^[A-Za-z0-9\s.\-#°]+$/.test(v)) return 'El departamento contiene caracteres no permitidos.';
  return '';
}

/* Opcional. */
export function validarIndicaciones(valor) {
  return limpiar(valor).length > 200 ? 'Las indicaciones no pueden superar los 200 caracteres.' : '';
}

export function validarSeleccion(valor, etiqueta) {
  return limpiar(valor) ? '' : `Selecciona una ${etiqueta}.`;
}

/* ---- Validadores de formularios completos ---------------- */

const soloConErrores = (errores) =>
  Object.fromEntries(Object.entries(errores).filter(([, mensaje]) => mensaje));

export function validarFormularioLogin({ email, password }) {
  return soloConErrores({
    email: validarEmail(email),
    password: String(password ?? '') ? '' : 'La contraseña es obligatoria.'
  });
}

export function validarFormularioRegistro(valores) {
  return soloConErrores({
    nombre: validarNombre(valores.nombre),
    email: validarEmail(valores.email),
    confirmarEmail: validarConfirmacionEmail(valores.email, valores.confirmarEmail),
    password: validarPassword(valores.password),
    confirmarPassword: validarConfirmacionPassword(valores.password, valores.confirmarPassword),
    telefono: validarTelefono(valores.telefono),
    region: validarSeleccion(valores.region, 'región'),
    comuna: validarComuna(valores.region, valores.comuna)
  });
}

export function validarFormularioContacto({ nombre, email, mensaje }) {
  return soloConErrores({
    nombre: validarNombre(nombre),
    email: validarEmail(email),
    mensaje: validarMensaje(mensaje)
  });
}

export function validarFormularioCheckout(v) {
  return soloConErrores({
    nombre: validarNombrePropio(v.nombre, 'nombre'),
    apellidos: validarNombrePropio(v.apellidos, 'apellido'),
    email: validarEmail(v.email),
    calle: validarCalle(v.calle),
    departamento: validarDepartamento(v.departamento),
    region: validarSeleccion(v.region, 'región'),
    comuna: validarSeleccion(v.comuna, 'comuna'),
    indicaciones: validarIndicaciones(v.indicaciones)
  });
}

/* Formatea un número como precio chileno: 5500 -> "$5.500". */
export function formatearPrecio(monto) {
  const numero = Math.round(Number(monto) || 0);
  return '$' + String(numero).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/* Validación del formulario de producto del panel administrador. Devuelve { campo: mensaje }. */
export function validarProducto(v) {
  const e = {};
  if (!String(v.nombre ?? '').trim()) e.nombre = 'El nombre es obligatorio.';
  else if (String(v.nombre).trim().length > 60) e.nombre = 'Máximo 60 caracteres.';
  if (!v.categoria) e.categoria = 'Selecciona una categoría.';
  if (!(Number(v.precio) > 0)) e.precio = 'El precio debe ser mayor a 0.';
  if (v.precioOferta !== '' && v.precioOferta != null && !(Number(v.precioOferta) > 0 && Number(v.precioOferta) < Number(v.precio))) {
    e.precioOferta = 'La oferta debe ser menor al precio normal.';
  }
  if (!(Number.isInteger(Number(v.stock)) && Number(v.stock) >= 0)) e.stock = 'El stock debe ser un entero desde 0.';
  if (!String(v.ingredientes ?? '').trim()) e.ingredientes = 'Indica los ingredientes.';
  return e;
}
