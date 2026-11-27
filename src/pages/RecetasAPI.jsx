import { useEffect, useState } from 'react';
import {
  buscarRecetas, obtenerRecetaAleatoria, obtenerCategoriasRecetas,
  filtrarPorCategoria, obtenerDetalleReceta, extraerIngredientes
} from '../services/theMealDb.js';

export default function RecetasAPI() {
  const [recetas, setRecetas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('');
  const [seleccionada, setSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerCategoriasRecetas()
      .then(setCategorias)
      .catch(() => setError('No se pudieron cargar las categorías. Intenta nuevamente.'));
    filtrarPorCategoria('Pasta')
      .then((platos) => setRecetas(platos.length ? platos : []))
      .catch(() => setError('No se pudo conectar con TheMealDB. Revisa tu conexión.'));
  }, []);

  const ejecutar = async (accion) => {
    setCargando(true);
    setError('');
    setSeleccionada(null);
    try {
      const resultado = await accion();
      setRecetas(resultado ?? []);
      if (!resultado?.length) setError('No encontramos recetas para esta búsqueda. Prueba con otro término.');
    } catch {
      setError('Ocurrió un problema al consultar la API. Intenta nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  const buscar = (e) => {
    e.preventDefault();
    setCategoria('');
    ejecutar(() => buscarRecetas(busqueda));
  };

  const seleccionarCategoria = (valor) => {
    setCategoria(valor);
    setBusqueda('');
    if (valor) ejecutar(() => filtrarPorCategoria(valor));
    else ejecutar(() => buscarRecetas(''));
  };

  const sorpresa = async () => {
    setCargando(true);
    setError('');
    try {
      const receta = await obtenerRecetaAleatoria();
      if (receta) {
        setRecetas([receta]);
        setSeleccionada(receta);
      } else setError('No se recibió una receta. Intenta nuevamente.');
    } catch {
      setError('No se pudo obtener una receta aleatoria. Intenta nuevamente.');
    } finally { setCargando(false); }
  };

  const verDetalle = async (receta) => {
    setCargando(true);
    setError('');
    try {
      const detalle = await obtenerDetalleReceta(receta.idMeal);
      setSeleccionada(detalle || receta);
    } catch { setError('No se pudieron cargar los detalles de esta receta.'); }
    finally { setCargando(false); }
  };

  return (
    <main className="lcn-section">
      <div className="container">
        <div className="lcn-panel">
          <header className="lcn-section-title mb-4">
            <span>Inspiración culinaria</span>
            <h2>Descubre nuevas recetas</h2>
            <p className="mb-0">Explora platos de todo el mundo con nuestra conexión a TheMealDB.</p>
          </header>

          <form className="row g-2 justify-content-center mb-3" onSubmit={buscar}>
            <div className="col-12 col-md-6">
              <label htmlFor="buscar-receta" className="visually-hidden">Buscar receta</label>
              <input id="buscar-receta" className="form-control" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Ej. pasta, chicken, lasagna..." />
            </div>
            <div className="col-auto"><button className="btn lcn-btn-primary" type="submit"><i className="bi bi-search me-1"/>Buscar</button></div>
            <div className="col-auto"><button className="btn lcn-btn-outline" type="button" onClick={sorpresa}><i className="bi bi-shuffle me-1"/>Receta aleatoria</button></div>
          </form>

          <div className="row justify-content-center mb-4">
            <div className="col-12 col-md-5">
              <label className="form-label fw-semibold" htmlFor="categoria-receta">Filtrar por categoría</label>
              <select id="categoria-receta" className="form-select" value={categoria} onChange={(e) => seleccionarCategoria(e.target.value)}>
                <option value="">Todas las recetas</option>
                {categorias.map((c) => <option key={c.idCategory} value={c.strCategory}>{c.strCategory}</option>)}
              </select>
            </div>
          </div>

          {cargando && <div className="text-center py-4" role="status"><div className="spinner-border text-success"/><p className="mt-2">Consultando recetas...</p></div>}
          {error && <div className="alert alert-warning text-center" role="alert">{error}</div>}

          {!cargando && recetas.length > 0 && <div className="row g-4">
            {recetas.map((receta) => <div className="col-12 col-sm-6 col-lg-4" key={receta.idMeal}>
              <article className="card lcn-card h-100 recipe-api-card">
                <img src={receta.strMealThumb} className="card-img-top" alt={`Imagen de ${receta.strMeal}`} loading="lazy" />
                <div className="card-body d-flex flex-column">
                  <h3 className="h5 card-title">{receta.strMeal}</h3>
                  <div className="small text-muted mb-3">{receta.strCategory && <span>{receta.strCategory}</span>}{receta.strArea && <span>{receta.strCategory ? ' · ' : ''}{receta.strArea}</span>}</div>
                  <button className="btn lcn-btn-outline mt-auto" type="button" onClick={() => verDetalle(receta)}>Ver receta e ingredientes</button>
                </div>
              </article>
            </div>)}
          </div>}

          {seleccionada && <section className="recipe-api-detail mt-4" aria-label="Detalle de receta">
            <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
              <div><span className="lcn-kicker">Detalle de receta</span><h3 className="h2 mb-0">{seleccionada.strMeal}</h3></div>
              <button className="btn btn-sm btn-outline-secondary" type="button" onClick={() => setSeleccionada(null)} aria-label="Cerrar detalle">Cerrar</button>
            </div>
            <div className="row g-4">
              <div className="col-12 col-lg-5"><img className="img-fluid rounded-4 w-100 recipe-api-detail-img" src={seleccionada.strMealThumb} alt={seleccionada.strMeal}/>
                <p className="mt-2 mb-1"><strong>Categoría:</strong> {seleccionada.strCategory || 'No especificada'}</p><p><strong>Origen:</strong> {seleccionada.strArea || 'No especificado'}</p>
                {seleccionada.strYoutube && <a href={seleccionada.strYoutube} target="_blank" rel="noreferrer" className="btn btn-sm lcn-btn-primary"><i className="bi bi-youtube me-1"/>Ver video</a>}
              </div>
              <div className="col-12 col-lg-7">
                <h4>Ingredientes</h4><ul className="recipe-api-ingredients">{extraerIngredientes(seleccionada).map((item, i) => <li key={`${item.ingrediente}-${i}`}>{item.medida && `${item.medida} `}{item.ingrediente}</li>)}</ul>
                <h4>Preparación</h4><p className="recipe-api-instructions">{seleccionada.strInstructions || 'No hay instrucciones disponibles.'}</p>
              </div>
            </div>
          </section>}
          <div className="text-center mt-4 small text-muted">Datos e imágenes proporcionados por <a href="https://www.themealdb.com/" target="_blank" rel="noreferrer">TheMealDB</a>.</div>
        </div>
      </div>
    </main>
  );
}
