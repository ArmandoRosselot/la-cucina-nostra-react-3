import { useState } from 'react';
import Cabecera from './Cabecera.jsx';
import RichTextEditor from '../RichTextEditor.jsx';
import { CATEGORIAS, obtenerProductos, crearProducto, actualizarProducto, eliminarProducto } from '../../data/db.js';
import { validarProducto, formatearPrecio } from '../../utils/validaciones.js';

const VACIO = {
  nombre: '', categoria: '', ingredientes: '', precio: '', precioOferta: '', imagen: '', descripcion: '',
  porcion: '', tiempo: '', calorias: '', alergenos: '', etiquetas: '', stock: 20
};
const aLista = (t) => String(t).split(',').map((x) => x.trim()).filter(Boolean);

/* Mantenedor de los platos de la tienda (CRUD sobre db.js): lo que se cambia aquí
   se ve de inmediato en el menú. */
export default function Productos({ onVolver }) {
  const [productos, setProductos] = useState(() => obtenerProductos());
  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState(null); // null = lista, 'nuevo' o id
  const [valores, setValores] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [aviso, setAviso] = useState('');
  const recargar = () => setProductos(obtenerProductos());

  const abrir = (p) => {
    setErrores({});
    setEditando(p ? p.id : 'nuevo');
    setValores(p ? { ...VACIO, ...p, precioOferta: p.precioOferta ?? '', tiempo: p.tiempo ?? '', calorias: p.calorias ?? '',
      alergenos: p.alergenos.join(', '), etiquetas: p.etiquetas.join(', ') } : VACIO);
  };
  const cambiar = (e) => setValores((v) => ({ ...v, [e.target.name]: e.target.value }));

  const guardar = (e) => {
    e.preventDefault();
    const nuevos = validarProducto(valores);
    setErrores(nuevos);
    if (Object.keys(nuevos).length) return;
    const datos = {
      ...valores,
      nombre: valores.nombre.trim(),
      precioOferta: valores.precioOferta === '' ? null : valores.precioOferta,
      alergenos: aLista(valores.alergenos),
      etiquetas: aLista(valores.etiquetas)
    };
    if (editando === 'nuevo') crearProducto(datos); else actualizarProducto(editando, datos);
    setAviso(editando === 'nuevo' ? 'Plato creado.' : 'Plato actualizado.');
    setEditando(null);
    recargar();
  };

  const borrar = (p) => {
    if (!window.confirm(`¿Eliminar "${p.nombre}" del menú?`)) return;
    eliminarProducto(p.id);
    setAviso('Plato eliminado.');
    recargar();
  };

  const campo = (name, etiqueta, props = {}) => (
    <div className={props.col ?? 'col-md-6'}>
      <label htmlFor={`p-${name}`} className="form-label">{etiqueta}</label>
      <input id={`p-${name}`} name={name} value={valores[name]} onChange={cambiar}
        className={`form-control ${errores[name] ? 'is-invalid' : ''}`} {...props.input} />
      {errores[name] && <div className="invalid-feedback">{errores[name]}</div>}
    </div>
  );

  if (editando !== null) {
    return (
      <div>
        <Cabecera titulo={editando === 'nuevo' ? 'Nuevo plato' : 'Editar plato'} subtitulo="Los cambios se publican en la tienda" onVolver={() => setEditando(null)} />
        <form onSubmit={guardar} noValidate className="card border-0 shadow-sm"><div className="card-body row g-3">
          {campo('nombre', 'Nombre')}
          <div className="col-md-6">
            <label htmlFor="p-categoria" className="form-label">Categoría</label>
            <select id="p-categoria" name="categoria" value={valores.categoria} onChange={cambiar} className={`form-select ${errores.categoria ? 'is-invalid' : ''}`}>
              <option value="">Selecciona</option>
              {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
            </select>
            {errores.categoria && <div className="invalid-feedback">{errores.categoria}</div>}
          </div>
          {campo('precio', 'Precio ($)', { col: 'col-md-4', input: { type: 'number', min: 1 } })}
          {campo('precioOferta', 'Precio de oferta ($, opcional)', { col: 'col-md-4', input: { type: 'number', min: 1 } })}
          {campo('stock', 'Stock', { col: 'col-md-4', input: { type: 'number', min: 0 } })}
          {campo('ingredientes', 'Ingredientes (separados por coma)', { col: 'col-12' })}
          <div className="col-12">
            <label htmlFor="p-descripcion" className="form-label">Descripción</label>
            <RichTextEditor id="p-descripcion" value={valores.descripcion} onChange={(html) => setValores((v) => ({ ...v, descripcion: html }))} />
          </div>
          {campo('porcion', 'Porción', { col: 'col-md-4' })}
          {campo('tiempo', 'Preparación (min)', { col: 'col-md-4', input: { type: 'number', min: 0 } })}
          {campo('calorias', 'Calorías (kcal)', { col: 'col-md-4', input: { type: 'number', min: 0 } })}
          {campo('alergenos', 'Alérgenos (coma)')}
          {campo('etiquetas', 'Etiquetas (coma: Vegano, Picante…)')}
          {campo('imagen', 'URL de la imagen', { col: 'col-12' })}
          <div className="col-12 text-end">
            <button type="button" className="btn btn-outline-secondary me-2" onClick={() => setEditando(null)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Guardar</button>
          </div>
        </div></form>
      </div>
    );
  }

  const q = busqueda.trim().toLowerCase();
  const visibles = productos.filter((p) => !q || `${p.nombre} ${p.categoria}`.toLowerCase().includes(q));

  return (
    <div>
      <Cabecera titulo="Productos" subtitulo="Platos del menú, precios y stock" onVolver={onVolver}>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => abrir(null)}>+ Nuevo plato</button>
      </Cabecera>
      {aviso && <div className="alert alert-success py-2" role="status">{aviso}</div>}
      <input className="form-control mb-3" placeholder="Buscar plato o categoría" aria-label="Buscar plato" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
      <div className="card border-0 shadow-sm"><div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light"><tr><th className="ps-4">Plato</th><th>Categoría</th><th>Precio</th><th>Stock</th><th /></tr></thead>
          <tbody>
            {visibles.map((p) => (
              <tr key={p.id} data-testid="producto-admin">
                <td className="ps-4 fw-bold">{p.nombre}</td>
                <td>{p.categoria}</td>
                <td>{p.precioOferta ? <><del className="text-muted me-1">{formatearPrecio(p.precio)}</del>{formatearPrecio(p.precioOferta)}</> : formatearPrecio(p.precio)}</td>
                <td><span className={`badge ${p.stock === 0 ? 'bg-danger' : p.stock <= 5 ? 'bg-warning text-dark' : 'bg-success'}`}>{p.stock}</span></td>
                <td className="text-end pe-3">
                  <button type="button" className="btn btn-sm btn-outline-primary me-1" onClick={() => abrir(p)}>Editar</button>
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => borrar(p)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></div>
    </div>
  );
}
