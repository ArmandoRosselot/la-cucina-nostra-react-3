import { Link } from 'react-router-dom';
import { POSTS } from '../data/blog.js';

/* Blog: muestra cada entrada con un enlace a su detalle. */
export default function Historias() {
  return (
    <section id="blog" className="lcn-section">
      <div className="container">
        <div className="lcn-panel">
          <header className="lcn-section-title">
            <span>Nuestras historias</span>
            <h2>Blog</h2>
          </header>

          {POSTS.map((post, i) => (
            <div className={`row gy-4 align-items-center ${i === 0 ? 'mb-4' : ''}`} key={post.id}>
              <div className={`col-lg-6 ${i % 2 ? 'order-2 order-lg-1' : ''}`}>
                {i % 2 ? (
                  <img src={post.imagen} alt={post.titulo} className="img-fluid rounded-4" />
                ) : (
                  <>
                    <h3 className="h4">{post.titulo}</h3>
                    <p>{post.resumen}</p>
                    <Link to={`/blog/${post.id}`} className="btn lcn-btn-outline">Ver caso</Link>
                  </>
                )}
              </div>
              <div className={`col-lg-6 ${i % 2 ? 'order-1 order-lg-2' : ''}`}>
                {i % 2 ? (
                  <>
                    <h3 className="h4">{post.titulo}</h3>
                    <p>{post.resumen}</p>
                    <Link to={`/blog/${post.id}`} className="btn lcn-btn-outline">Ver caso</Link>
                  </>
                ) : (
                  <img src={post.imagen} alt={post.titulo} className="img-fluid rounded-4" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
