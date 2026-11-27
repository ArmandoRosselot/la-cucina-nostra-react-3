import { describe, it, expect } from 'vitest';
import {
  obtenerProductos, obtenerProductoPorId, crearProducto, actualizarProducto, descontarStock, KEYS,
  registrarUsuario, actualizarUsuario, eliminarUsuario, obtenerUsuarioPorId, USUARIO_ADMIN, crearOrden, obtenerOrdenesDeUsuario
} from './db.js';

describe('detalle de productos', () => {
  it('todos los platos del menú traen descripción, porción, tiempo, calorías y stock', () => {
    obtenerProductos().forEach((p) => {
      expect(p.descripcion).toMatch(/<p>/);
      expect(p.porcion).toBeTruthy();
      expect(p.tiempo).toBeGreaterThan(0);
      expect(p.calorias).toBeGreaterThan(0);
      expect(Array.isArray(p.alergenos)).toBe(true);
      expect(p.stock).toBeGreaterThanOrEqual(0);
    });
  });
  it('completa el detalle de datos guardados antes de que existiera', () => {
    localStorage.setItem(KEYS.PRODUCTOS, JSON.stringify([{ id: 1, nombre: 'Bruschetta', categoria: 'Entradas', ingredientes: 'x', precio: 5500, imagen: '' }]));
    expect(obtenerProductoPorId(1)).toMatchObject({ porcion: '4 unidades', stock: 40 });
  });
  it('un plato creado desde el panel recibe valores por defecto', () => {
    const p = crearProducto({ nombre: ' Tiramisú ', categoria: 'Cena', ingredientes: 'Café', precio: '4500' });
    expect(p).toMatchObject({ nombre: 'Tiramisú', precio: 4500, stock: 20, alergenos: [], etiquetas: [] });
  });
  it('actualizar convierte números y permite quitar la oferta', () => {
    expect(obtenerProductoPorId(2).precioOferta).toBe(6900);
    const a = actualizarProducto(2, { stock: '7', precioOferta: null });
    expect(a.stock).toBe(7);
    expect(a.precioOferta).toBeUndefined();
  });
});

describe('stock', () => {
  it('descontarStock resta lo vendido y nunca baja de 0', () => {
    const antes = obtenerProductoPorId(16).stock; // 5
    descontarStock([{ id: 16, cantidad: 2 }]);
    expect(obtenerProductoPorId(16).stock).toBe(antes - 2);
    descontarStock([{ id: 16, cantidad: 50 }]);
    expect(obtenerProductoPorId(16).stock).toBe(0);
  });
});

describe('usuarios (reglas del admin)', () => {
  it('el admin principal no se elimina ni pierde su rol', () => {
    expect(eliminarUsuario(USUARIO_ADMIN.id)).toBe(false);
    actualizarUsuario(USUARIO_ADMIN.id, { rol: 'cliente' });
    expect(obtenerUsuarioPorId(0).rol).toBe('admin');
  });
  it('se puede cambiar el rol de un cliente, pero no su correo', () => {
    const { usuario } = registrarUsuario({ nombre: 'Ana', email: 'ana@correo.cl', password: 'Pasta2024' });
    const a = actualizarUsuario(usuario.id, { rol: 'admin', email: 'otro@x.cl' });
    expect(a).toMatchObject({ rol: 'admin', email: 'ana@correo.cl' });
    expect(eliminarUsuario(usuario.id)).toBe(true);
    expect(obtenerUsuarioPorId(usuario.id)).toBeNull();
  });
  it('las órdenes quedan asociadas a su dueño', () => {
    const base = { cliente: {}, direccion: {}, items: [], total: 1 };
    crearOrden({ ...base, usuarioId: 3 });
    crearOrden({ ...base, usuarioId: 4 });
    crearOrden(base);
    expect(obtenerOrdenesDeUsuario(3)).toHaveLength(1);
  });
});
