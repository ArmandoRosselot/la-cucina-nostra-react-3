import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { actualizarUsuario } from '../data/db.js';
import { REGIONES } from '../data/regiones.js';
import {
  validarNombre, validarTelefono, validarComuna, validarSeleccion, validarPassword, validarConfirmacionPassword
} from '../utils/validaciones.js';

function Campo({ id, etiqueta, error, children }) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">{etiqueta}</label>
      {children}
      {error && <div className="invalid-feedback d-block" id={`${id}-error`}>{error}</div>}
    </div>
  );
}

/* Configuración de la cuenta: datos personales, dirección habitual y cambio de contraseña.
   Lo usan «Mi cuenta» (clientes) y el perfil del panel admin (pedirDireccion = false). */
export default function PerfilForm({ pedirDireccion = true }) {
  const { usuario, refrescar } = useAuth();
  const [datos, setDatos] = useState({
    nombre: usuario.nombre, telefono: usuario.telefono ?? '', region: usuario.region ?? '', comuna: usuario.comuna ?? ''
  });
  const [clave, setClave] = useState({ actual: '', nueva: '', confirmacion: '' });
  const [errDatos, setErrDatos] = useState({});
  const [errClave, setErrClave] = useState({});
  const [aviso, setAviso] = useState('');

  const cambiarDato = (e) => {
    const { name, value } = e.target;
    // Al cambiar de región se reinicia la comuna.
    setDatos((d) => (name === 'region' ? { ...d, region: value, comuna: '' } : { ...d, [name]: value }));
  };
  const cambiarClave = (e) => setClave((c) => ({ ...c, [e.target.name]: e.target.value }));
  const sinVacios = (o) => Object.fromEntries(Object.entries(o).filter(([, m]) => m));

  const guardarDatos = (e) => {
    e.preventDefault();
    const errores = sinVacios({
      nombre: validarNombre(datos.nombre),
      telefono: validarTelefono(datos.telefono),
      ...(pedirDireccion ? { region: validarSeleccion(datos.region, 'región'), comuna: validarComuna(datos.region, datos.comuna) } : {})
    });
    setErrDatos(errores);
    setAviso('');
    if (Object.keys(errores).length) return;
    actualizarUsuario(usuario.id, {
      nombre: datos.nombre.trim(), telefono: datos.telefono.trim(),
      ...(pedirDireccion ? { region: datos.region, comuna: datos.comuna } : {})
    });
    refrescar();
    setAviso('Tus datos se actualizaron.');
  };

  const guardarClave = (e) => {
    e.preventDefault();
    const errores = sinVacios({
      actual: clave.actual !== usuario.password ? 'La contraseña actual no coincide.' : '',
      nueva: validarPassword(clave.nueva),
      confirmacion: validarConfirmacionPassword(clave.nueva, clave.confirmacion)
    });
    setErrClave(errores);
    setAviso('');
    if (Object.keys(errores).length) return;
    actualizarUsuario(usuario.id, { password: clave.nueva });
    refrescar();
    setClave({ actual: '', nueva: '', confirmacion: '' });
    setAviso('Tu contraseña se actualizó.');
  };

  const cls = (err) => `form-control ${err ? 'is-invalid' : ''}`;

  return (
    <div className="row g-4">
      {aviso && <div className="col-12"><div className="alert alert-success py-2 mb-0" role="status">{aviso}</div></div>}

      <form className="col-lg-6" onSubmit={guardarDatos} noValidate aria-label="Datos personales">
        <h3 className="h5">Datos personales</h3>
        <Campo id="perfil-email" etiqueta="Correo (no se puede cambiar)">
          <input id="perfil-email" className="form-control" value={usuario.email} readOnly autoComplete="email" />
        </Campo>
        <Campo id="perfil-nombre" etiqueta="Nombre completo" error={errDatos.nombre}>
          <input id="perfil-nombre" name="nombre" className={cls(errDatos.nombre)} value={datos.nombre} onChange={cambiarDato} autoComplete="name" />
        </Campo>
        <Campo id="perfil-telefono" etiqueta="Teléfono (opcional)" error={errDatos.telefono}>
          <input id="perfil-telefono" name="telefono" type="tel" className={cls(errDatos.telefono)} value={datos.telefono}
            onChange={cambiarDato} autoComplete="tel" placeholder="+56 9 1234 5678" />
        </Campo>
        {pedirDireccion && (
          <>
            <Campo id="perfil-region" etiqueta="Región" error={errDatos.region}>
              <select id="perfil-region" name="region" className={`form-select ${errDatos.region ? 'is-invalid' : ''}`} value={datos.region}
                onChange={cambiarDato} autoComplete="address-level1">
                <option value="">-- Seleccione la región --</option>
                {Object.keys(REGIONES).map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Campo>
            <Campo id="perfil-comuna" etiqueta="Comuna" error={errDatos.comuna}>
              <select id="perfil-comuna" name="comuna" className={`form-select ${errDatos.comuna ? 'is-invalid' : ''}`} value={datos.comuna}
                onChange={cambiarDato} disabled={!datos.region} autoComplete="address-level2">
                <option value="">-- Seleccione la comuna --</option>
                {(REGIONES[datos.region] ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Campo>
          </>
        )}
        <button type="submit" className="btn lcn-btn-primary">Guardar datos</button>
      </form>

      <form className="col-lg-6" onSubmit={guardarClave} noValidate aria-label="Cambiar contraseña">
        <h3 className="h5">Cambiar contraseña</h3>
        <Campo id="perfil-actual" etiqueta="Contraseña actual" error={errClave.actual}>
          <input id="perfil-actual" name="actual" type="password" className={cls(errClave.actual)} value={clave.actual} onChange={cambiarClave} autoComplete="current-password" />
        </Campo>
        <Campo id="perfil-nueva" etiqueta="Nueva contraseña" error={errClave.nueva}>
          <input id="perfil-nueva" name="nueva" type="password" className={cls(errClave.nueva)} value={clave.nueva} onChange={cambiarClave} autoComplete="new-password" />
        </Campo>
        <Campo id="perfil-confirmacion" etiqueta="Repetir nueva contraseña" error={errClave.confirmacion}>
          <input id="perfil-confirmacion" name="confirmacion" type="password" className={cls(errClave.confirmacion)} value={clave.confirmacion} onChange={cambiarClave} autoComplete="new-password" />
        </Campo>
        <button type="submit" className="btn btn-outline-secondary">Cambiar contraseña</button>
      </form>
    </div>
  );
}
