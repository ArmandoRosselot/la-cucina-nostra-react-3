/* Encabezado común de cada módulo del panel. */
export default function Cabecera({ titulo, subtitulo, onVolver, children }) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <div>
        <h1 className="page-title">{titulo}</h1>
        <p className="page-subtitle mb-0">{subtitulo}</p>
      </div>
      <div className="d-flex gap-2">
        {children}
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onVolver}>← Volver al Dashboard</button>
      </div>
    </div>
  );
}
