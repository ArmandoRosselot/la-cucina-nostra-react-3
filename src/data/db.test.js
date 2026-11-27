import { describe, it, expect, vi } from 'vitest';
import {
  KEYS, PRODUCTOS_INICIALES, obtenerProductos, obtenerProductoPorId, obtenerProductosPorCategoria,
  crearProducto, actualizarProducto, eliminarProducto, restablecerProductos,
  obtenerCarrito, guardarCarrito, registrarUsuario, autenticarUsuario,
  iniciarSesion, obtenerSesion, cerrarSesion, obtenerUsuarios, obtenerOfertas, crearMensaje, obtenerMensajes, eliminarMensaje, crearOrden, obtenerOrdenes, obtenerOrdenPorId, actualizarOrden
} from './db.js';

describe('productos (CRUD)', () => {
  it('READ: siembra los datos iniciales en la primera lectura', () => {
    expect(localStorage.getItem(KEYS.PRODUCTOS)).toBeNull();
    expect(obtenerProductos()).toHaveLength(PRODUCTOS_INICIALES.length);
    expect(localStorage.getItem(KEYS.PRODUCTOS)).not.toBeNull();
  });

  it('READ: filtra por categoría y por id', () => {
    expect(obtenerProductosPorCategoria('Entradas').every((p) => p.categoria === 'Entradas')).toBe(true);
    expect(obtenerProductoPorId(1).nombre).toBe('Bruschetta tradicional');
    expect(obtenerProductoPorId(9999)).toBeNull();
  });

  it('CREATE: asigna id correlativo y persiste', () => {
    const nuevo = crearProducto({ nombre: ' Tiramisú ', categoria: 'Cena', ingredientes: 'Café', precio: '6500' });
    expect(nuevo.id).toBe(PRODUCTOS_INICIALES.length + 1);
    expect(nuevo.nombre).toBe('Tiramisú');
    expect(nuevo.precio).toBe(6500);
    expect(obtenerProductoPorId(nuevo.id)).not.toBeNull();
  });

  it('UPDATE: modifica un producto y devuelve null si no existe', () => {
    expect(actualizarProducto(1, { precio: '6000' }).precio).toBe(6000);
    expect(obtenerProductoPorId(1).precio).toBe(6000);
    expect(actualizarProducto(9999, { precio: 1 })).toBeNull();
  });

  it('DELETE: elimina y reporta si no encontró', () => {
    expect(eliminarProducto(1)).toBe(true);
    expect(obtenerProductoPorId(1)).toBeNull();
    expect(eliminarProducto(1)).toBe(false);
  });

  it('restablece los datos de ejemplo', () => {
    eliminarProducto(1);
    restablecerProductos();
    expect(obtenerProductos()).toHaveLength(PRODUCTOS_INICIALES.length);
  });

  it('tolera JSON corrupto en localStorage', () => {
    localStorage.setItem(KEYS.PRODUCTOS, '{no-es-json');
    expect(obtenerProductos()).toHaveLength(PRODUCTOS_INICIALES.length);
  });
});

describe('carrito (persistencia)', () => {
  it('guarda y recupera ítems', () => {
    expect(obtenerCarrito()).toEqual([]);
    guardarCarrito([{ id: 1, cantidad: 2 }]);
    expect(obtenerCarrito()).toEqual([{ id: 1, cantidad: 2 }]);
  });
});

describe('usuarios y sesión', () => {
  const datos = { nombre: 'Ana Silva', email: 'Ana@Correo.cl', password: 'Pasta2024', telefono: '' };

  it('registra un usuario y guarda el correo en minúsculas', () => {
    const r = registrarUsuario(datos);
    expect(r.ok).toBe(true);
    expect(obtenerUsuarios().find((u) => u.rol === 'cliente').email).toBe('ana@correo.cl');
  });

  it('no permite correos duplicados', () => {
    registrarUsuario(datos);
    const r = registrarUsuario({ ...datos, email: 'ANA@correo.cl' });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/Ya existe/);
  });

  it('autentica con credenciales correctas e incorrectas', () => {
    registrarUsuario(datos);
    expect(autenticarUsuario('ana@correo.cl', 'Pasta2024').ok).toBe(true);
    expect(autenticarUsuario('ana@correo.cl', 'mala').ok).toBe(false);
    expect(autenticarUsuario('otro@correo.cl', 'Pasta2024').ok).toBe(false);
  });

  it('maneja la sesión sin guardar la contraseña', () => {
    const { usuario } = registrarUsuario(datos);
    iniciarSesion(usuario);
    expect(obtenerSesion()).toEqual({ id: usuario.id, nombre: 'Ana Silva', email: 'ana@correo.cl', region: '', comuna: '', rol: 'cliente' });
    cerrarSesion();
    expect(obtenerSesion()).toBeNull();
  });

  it('usa un mock de localStorage para comprobar la escritura', () => {
    const espia = vi.spyOn(Storage.prototype, 'setItem');
    guardarCarrito([{ id: 3, cantidad: 1 }]);
    expect(espia).toHaveBeenCalledWith(KEYS.CARRITO, JSON.stringify([{ id: 3, cantidad: 1 }]));
    espia.mockRestore();
  });
});

describe('ofertas y mensajes', () => {
  it('obtenerOfertas devuelve solo productos con precio rebajado', () => {
    const ofertas = obtenerOfertas();
    expect(ofertas.length).toBeGreaterThan(0);
    expect(ofertas.every((p) => p.precioOferta < p.precio)).toBe(true);
  });

  it('actualizar el precio de oferta cambia la lista de ofertas', () => {
    const antes = obtenerOfertas().length;
    actualizarProducto(1, { precioOferta: 4000 });
    expect(obtenerOfertas()).toHaveLength(antes + 1);
  });

  it('mensajes de contacto: crear, leer y eliminar', () => {
    const m = crearMensaje({ nombre: ' Ana Silva ', email: 'ANA@correo.cl', mensaje: ' Hola, quiero reservar ' });
    expect(m).toMatchObject({ id: 1, nombre: 'Ana Silva', email: 'ana@correo.cl', mensaje: 'Hola, quiero reservar' });
    expect(obtenerMensajes()).toHaveLength(1);
    expect(eliminarMensaje(1)).toBe(true);
    expect(eliminarMensaje(1)).toBe(false);
  });
});

describe('órdenes de compra', () => {
  const datos = { cliente: { nombre: 'Pedro', apellidos: 'Hacker', email: 'p@c.cl' }, direccion: { calle: 'Calle 1' }, items: [], total: 1000 };

  it('crea órdenes con id correlativo, número y código', () => {
    const a = crearOrden(datos);
    const b = crearOrden(datos);
    expect([a.id, b.id]).toEqual([1, 2]);
    expect(a.numero).toMatch(/^\d{8}01$/);
    expect(a.codigo).toBe('ORDER00001');
    expect(a.estado).toBe('pendiente');
  });

  it('lee y actualiza el estado de una orden', () => {
    const { id } = crearOrden(datos);
    expect(obtenerOrdenPorId(id).total).toBe(1000);
    expect(actualizarOrden(id, { estado: 'pagada' }).estado).toBe('pagada');
    expect(obtenerOrdenes()[0].estado).toBe('pagada');
    expect(actualizarOrden(99, { estado: 'x' })).toBeNull();
    expect(obtenerOrdenPorId(99)).toBeNull();
  });
});
