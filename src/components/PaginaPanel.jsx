/* Contenedor estándar para las vistas internas (mismo diseño de panel del inicio). */
export default function PaginaPanel({ subtitulo, titulo, children }) {
  return (
    <section className="lcn-section">
      <div className="container">
        <div className="lcn-panel">
          {titulo && (
            <header className="lcn-section-title">
              {subtitulo && <span>{subtitulo}</span>}
              <h2>{titulo}</h2>
            </header>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
