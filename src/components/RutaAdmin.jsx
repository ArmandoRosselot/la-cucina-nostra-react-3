import RutaProtegida from './RutaProtegida.jsx';

/* Atajo: ruta exclusiva del administrador. */
export default function RutaAdmin({ children }) {
  return <RutaProtegida roles={['admin']}>{children}</RutaProtegida>;
}
