import { Link, useParams } from 'react-router-dom';
import About from '../components/About.jsx';
import Historias from '../components/Historias.jsx';
import ContactSection from '../components/ContactSection.jsx';
import PaginaPanel from '../components/PaginaPanel.jsx';
import { POSTS } from '../data/blog.js';

export const Nosotros = () => <About />;
export const Blog = () => <Historias />;
export const Contacto = () => <ContactSection />;

/* Vista "Detalle blog" (/blog/:id). */
export function BlogDetalle() {
  const { id } = useParams();
  const post = POSTS.find((p) => p.id === Number(id));

  if (!post) {
    return (
      <PaginaPanel titulo="Entrada no encontrada">
        <p className="text-center mb-0">Esa entrada no existe. <Link to="/blog">Volver al blog</Link></p>
      </PaginaPanel>
    );
  }
  return (
    <PaginaPanel subtitulo="Blog" titulo={post.titulo}>
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <img src={post.imagen} alt={post.titulo} className="img-fluid rounded-4 mb-3 w-100" />
          {post.contenido.map((parrafo) => <p key={parrafo.slice(0, 30)}>{parrafo}</p>)}
          <Link to="/blog" className="btn lcn-btn-outline">← Volver al blog</Link>
        </div>
      </div>
    </PaginaPanel>
  );
}
