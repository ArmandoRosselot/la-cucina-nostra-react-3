export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg app-navbar">
      <div className="container">
        <a className="navbar-brand app-titulo" href="#">🍕 Pizzería del Beagle</a>
        <ul className="navbar-nav ms-auto flex-row gap-3">
          <li className="nav-item"><a className="nav-link" href="#armar">Armar pizza</a></li>
          <li className="nav-item"><a className="nav-link" href="#contacto">Contacto</a></li>
        </ul>
      </div>
    </nav>
  );
}
