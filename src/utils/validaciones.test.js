import { describe, it, expect } from 'vitest';
import {
  validarNombre, validarEmail, validarConfirmacionEmail, validarPassword,
  validarConfirmacionPassword, validarTelefono, validarBusqueda,
  validarFormularioLogin, validarFormularioRegistro, validarMensaje, validarFormularioContacto, validarNombrePropio, validarCalle, validarDepartamento, validarIndicaciones, validarSeleccion, validarFormularioCheckout, validarComuna, formatearPrecio
} from './validaciones.js';

describe('validarNombre', () => {
  it('acepta nombre y apellido con tildes', () => {
    expect(validarNombre('María Núñez')).toBe('');
  });
  it('rechaza vacío, con números y una sola palabra', () => {
    expect(validarNombre('')).toMatch(/obligatorio/);
    expect(validarNombre('Juan123 Pérez')).toMatch(/letras/);
    expect(validarNombre('Juan')).toMatch(/apellido/);
  });
});

describe('validarEmail', () => {
  it('acepta un correo válido', () => {
    expect(validarEmail('cliente@correo.cl')).toBe('');
  });
  it.each(['', 'sin-arroba', 'a@b', 'a b@c.cl'])('rechaza "%s"', (valor) => {
    expect(validarEmail(valor)).not.toBe('');
  });
  it('compara la confirmación sin distinguir mayúsculas', () => {
    expect(validarConfirmacionEmail('a@b.cl', 'A@B.cl')).toBe('');
    expect(validarConfirmacionEmail('a@b.cl', 'x@b.cl')).toMatch(/no coinciden/);
  });
});

describe('validarPassword', () => {
  it('acepta una contraseña fuerte', () => {
    expect(validarPassword('Pasta2024')).toBe('');
  });
  it('exige largo, minúscula, mayúscula y número', () => {
    expect(validarPassword('Ab1')).toMatch(/8 caracteres/);
    expect(validarPassword('SOLOMAYUS1')).toMatch(/minúscula/);
    expect(validarPassword('solominus1')).toMatch(/mayúscula/);
    expect(validarPassword('SinNumeros')).toMatch(/número/);
  });
  it('verifica que ambas contraseñas coincidan', () => {
    expect(validarConfirmacionPassword('Pasta2024', 'Pasta2024')).toBe('');
    expect(validarConfirmacionPassword('Pasta2024', 'Otra2024')).toMatch(/no coinciden/);
  });
});

describe('validarTelefono (opcional)', () => {
  it('permite dejarlo vacío', () => {
    expect(validarTelefono('')).toBe('');
  });
  it('acepta formatos chilenos y rechaza otros', () => {
    expect(validarTelefono('+56 9 1234 5678')).toBe('');
    expect(validarTelefono('912345678')).toBe('');
    expect(validarTelefono('12345')).not.toBe('');
  });
});

describe('validarBusqueda', () => {
  it('rechaza textos largos o con < >', () => {
    expect(validarBusqueda('pizza')).toBe('');
    expect(validarBusqueda('a'.repeat(41))).toMatch(/40/);
    expect(validarBusqueda('<script>')).toMatch(/no permitidos/);
  });
});

describe('formularios completos', () => {
  it('login devuelve errores por campo', () => {
    expect(validarFormularioLogin({ email: '', password: '' })).toHaveProperty('email');
    expect(validarFormularioLogin({ email: '', password: '' })).toHaveProperty('password');
    expect(validarFormularioLogin({ email: 'a@b.cl', password: 'x' })).toEqual({});
  });
  it('registro válido no devuelve errores', () => {
    const ok = {
      nombre: 'Ana Silva', email: 'ana@correo.cl', confirmarEmail: 'ana@correo.cl',
      password: 'Pasta2024', confirmarPassword: 'Pasta2024', telefono: '', region: 'Región de Ñuble', comuna: 'Chillán'
    };
    expect(validarFormularioRegistro(ok)).toEqual({});
    expect(validarFormularioRegistro({ ...ok, confirmarPassword: 'x' })).toHaveProperty('confirmarPassword');
  });
});

describe('formatearPrecio', () => {
  it('usa punto como separador de miles', () => {
    expect(formatearPrecio(5500)).toBe('$5.500');
    expect(formatearPrecio(1234567)).toBe('$1.234.567');
    expect(formatearPrecio(undefined)).toBe('$0');
  });
});

describe('contacto', () => {
  it('valida el largo del mensaje', () => {
    expect(validarMensaje('')).toMatch(/obligatorio/);
    expect(validarMensaje('corto')).toMatch(/10/);
    expect(validarMensaje('x'.repeat(501))).toMatch(/500/);
    expect(validarMensaje('Quiero reservar una mesa')).toBe('');
  });
  it('el formulario completo devuelve errores por campo', () => {
    expect(Object.keys(validarFormularioContacto({ nombre: '', email: '', mensaje: '' }))).toEqual(['nombre', 'email', 'mensaje']);
    expect(validarFormularioContacto({ nombre: 'Ana Silva', email: 'a@b.cl', mensaje: 'Mensaje de prueba' })).toEqual({});
  });
});

describe('checkout', () => {
  it('valida nombre y apellido por separado', () => {
    expect(validarNombrePropio('Pedro')).toBe('');
    expect(validarNombrePropio('', 'apellido')).toMatch(/apellido es obligatorio/);
    expect(validarNombrePropio('P')).toMatch(/2 caracteres/);
    expect(validarNombrePropio('Ped4o')).toMatch(/letras/);
  });
  it('valida calle, departamento (opcional), indicaciones y selección', () => {
    expect(validarCalle('Los Crisantemos 123')).toBe('');
    expect(validarCalle('abc')).toMatch(/detallada/);
    expect(validarDepartamento('')).toBe('');
    expect(validarDepartamento('603')).toBe('');
    expect(validarDepartamento('a'.repeat(11))).toMatch(/10/);
    expect(validarDepartamento('<x>')).toMatch(/no permitidos/);
    expect(validarIndicaciones('x'.repeat(201))).toMatch(/200/);
    expect(validarSeleccion('', 'región')).toBe('Selecciona una región.');
  });
  it('el formulario completo devuelve errores solo de los campos inválidos', () => {
    const ok = { nombre: 'Pedro', apellidos: 'Hacker', email: 'p@c.cl', calle: 'Los Crisantemos 1', departamento: '', region: 'R', comuna: 'C', indicaciones: '' };
    expect(validarFormularioCheckout(ok)).toEqual({});
    expect(Object.keys(validarFormularioCheckout({ ...ok, email: '', comuna: '' }))).toEqual(['email', 'comuna']);
  });
});

describe('región y comuna del registro', () => {
  it('la comuna es obligatoria y debe pertenecer a la región', () => {
    expect(validarComuna('Región de Ñuble', 'Chillán')).toBe('');
    expect(validarComuna('Región de Ñuble', '')).toMatch(/Selecciona/);
    expect(validarComuna('Región de Ñuble', 'Temuco')).toMatch(/no pertenece/);
  });
  it('el registro exige región y comuna', () => {
    const base = { nombre: 'Ana Silva', email: 'a@b.cl', confirmarEmail: 'a@b.cl', password: 'Pasta2024', confirmarPassword: 'Pasta2024', telefono: '' };
    expect(Object.keys(validarFormularioRegistro({ ...base, region: '', comuna: '' }))).toEqual(['region', 'comuna']);
  });
});
