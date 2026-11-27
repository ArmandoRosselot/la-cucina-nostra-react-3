import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { INGREDIENTES } from '../data/ingredientes.js';
import { useCart } from '../context/CartContext.jsx';
import { useTienda } from './TiendaLayout.jsx';
import { PRECIO_BASE, MAX_INGREDIENTES, resumirPizza, precioPizza, crearItemPizza } from '../utils/pizza.js';
import { formatearPrecio } from '../utils/validaciones.js';

let consecutivo = 0;
const nuevaClave = () => `topping-${(consecutivo += 1)}`;

const LIMITE = 0.45; // radio máximo (0..0.5) donde se puede poner un ingrediente

export default function PizzaBuilder() {
  const [seleccion, setSeleccion] = useState(INGREDIENTES[0]);
  const [puestos, setPuestos] = useState([]); // [{ key, emoji, x, y, giro }]
  const [pedido, setPedido] = useState(false);   // true = pizza agregada al carrito, muestra a Snoopy
  const { agregarPizza } = useCart();
  const { abrirCarrito } = useTienda();
  const navigate = useNavigate();
  const [hayImagen, setHayImagen] = useState(true); // false si no existe /img/snoopy.png
  const pizzaRef = useRef(null);
  const arrastrando = useRef(null); // key del ingrediente que se está moviendo

  // Convierte la posición del mouse a coordenadas 0..1 dentro de la pizza
  const posicion = (e) => {
    const r = pizzaRef.current.getBoundingClientRect();
    let x = r.width ? (e.clientX - r.left) / r.width : 0.5;
    let y = r.height ? (e.clientY - r.top) / r.height : 0.5;
    // Si se sale de la masa, lo deja en el borde
    const dx = x - 0.5, dy = y - 0.5;
    const d = Math.hypot(dx, dy);
    if (d > LIMITE) { x = 0.5 + (dx / d) * LIMITE; y = 0.5 + (dy / d) * LIMITE; }
    return { x, y };
  };

  const agregarEn = (ing, x, y) => {
    if (puestos.length >= MAX_INGREDIENTES) return;
    setPuestos((p) => [...p, { key: nuevaClave(), emoji: ing.emoji, x, y, giro: Math.round(Math.random() * 360) }]);
  };
  const agregar = (ing, e) => {
    const { x, y } = posicion(e);
    agregarEn(ing, x, y);
  };
  // Alternativa sin mouse (teclado / táctil): pone el ingrediente en un punto al azar de la masa.
  const agregarAlAzar = (ing) => {
    const ang = Math.random() * Math.PI * 2;
    const radio = Math.sqrt(Math.random()) * LIMITE;
    agregarEn(ing, 0.5 + Math.cos(ang) * radio, 0.5 + Math.sin(ang) * radio);
  };

  // 1) Clic en la pizza: pone el ingrediente seleccionado
  const clicPizza = (e) => agregar(seleccion, e);

  // 2) Arrastrar desde la lista y soltar sobre la pizza
  const soltar = (e) => {
    e.preventDefault();
    const ing = INGREDIENTES.find((i) => i.id === e.dataTransfer.getData('text/plain'));
    if (ing) agregar(ing, e);
  };

  // 3) Mover un ingrediente ya puesto
  const iniciarMover = (e, key) => {
    e.stopPropagation();
    arrastrando.current = key;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const mover = (e) => {
    if (!arrastrando.current) return;
    const { x, y } = posicion(e);
    setPuestos((p) => p.map((i) => (i.key === arrastrando.current ? { ...i, x, y } : i)));
  };
  const terminarMover = () => { arrastrando.current = null; };

  // Doble clic: quitar
  const quitar = (key) => setPuestos((p) => p.filter((i) => i.key !== key));

  const nuevaPizza = () => { setPuestos([]); setPedido(false); };

  const resumen = resumirPizza(puestos);
  const precio = precioPizza(resumen);
  const lleno = puestos.length >= MAX_INGREDIENTES;

  const agregarAlCarrito = () => {
    agregarPizza(crearItemPizza(resumen));
    setPedido(true);
  };
  const irAPagar = () => navigate('/comprar');
  const verCarrito = () => { nuevaPizza(); abrirCarrito(); };

  return (
    <section id="armar" className="row g-4 align-items-start">
      <div className="col-lg-7">
        <div className="lcn-hoja text-center">
          <h1 className="hoja-script">Crea tu propia</h1>
          <div className="hoja-grande">PIZZA</div>
          <p className="text-muted mb-3">
            Arrastra los ingredientes a la pizza (o elige uno y haz clic). Arrastra los que ya están puestos para moverlos; doble clic para quitarlos.
          </p>

          <div
            ref={pizzaRef}
            className="pizza"
            onClick={clicPizza}
            onDragOver={(e) => e.preventDefault()}
            onDrop={soltar}
            role="img"
            aria-label="Pizza para decorar"
          >
            <div className="pizza-salsa" />
            <div className="pizza-queso" />
            {puestos.map((i) => (
              <span
                key={i.key}
                className="topping-puesto"
                style={{ left: `${i.x * 100}%`, top: `${i.y * 100}%`, transform: `translate(-50%,-50%) rotate(${i.giro}deg)` }}
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={() => quitar(i.key)}
                onPointerDown={(e) => iniciarMover(e, i.key)}
                onPointerMove={mover}
                onPointerUp={terminarMover}
                onPointerCancel={terminarMover}
              >
                {i.emoji}
              </span>
            ))}
          </div>

          {lleno && <p className="text-danger small mt-2 mb-0" role="status">Llegaste al máximo de {MAX_INGREDIENTES} ingredientes por pizza.</p>}
          <div className="d-flex justify-content-center gap-2 mt-3">
            <button className="btn btn-outline-danger" onClick={() => setPuestos([])} disabled={!puestos.length}>
              Limpiar pizza
            </button>
            <button className="btn btn-success" onClick={agregarAlCarrito} disabled={!puestos.length}>
              <i className="bi bi-cart-plus" aria-hidden="true" /> Agregar al carrito · {formatearPrecio(precio)}
            </button>
          </div>
        </div>
      </div>

      <div className="col-lg-5">
        <div className="lcn-hoja">
          <h2 className="hoja-script text-center">Ingredientes</h2>
          <div className="topping-grid mb-3">
            {INGREDIENTES.map((ing) => (
              <button
                key={ing.id}
                draggable
                onDragStart={(e) => { setSeleccion(ing); e.dataTransfer.setData('text/plain', ing.id); }}
                className={`btn topping-btn ${seleccion.id === ing.id ? 'activo' : ''}`}
                onClick={() => setSeleccion(ing)}
              >
                <span className="topping-emoji">{ing.emoji}</span>
                <span className="small">{ing.nombre}</span>
                <span className="small text-muted">+{formatearPrecio(ing.precio)}</span>
              </button>
            ))}
          </div>

          <button type="button" className="btn btn-outline-secondary btn-sm w-100 mb-3" onClick={() => agregarAlAzar(seleccion)} disabled={lleno}>
            + Agregar {seleccion.nombre} {seleccion.emoji}
          </button>

          <h3 className="h6 fw-bold">Tu pizza lleva:</h3>
          {resumen.length === 0 ? (
            <p className="text-muted">Todavía no agregas nada.</p>
          ) : (
            <ul className="list-unstyled mb-0">
              {resumen.map((i) => (<li key={i.id}>{i.emoji} {i.nombre} × {i.n} <span className="text-muted small">({formatearPrecio(i.precio * i.n)})</span></li>))}
            </ul>
          )}
          <hr />
          <div className="d-flex justify-content-between"><span>Masa, salsa y queso</span><span>{formatearPrecio(PRECIO_BASE)}</span></div>
          <div className="d-flex justify-content-between fw-bold fs-5" data-testid="precio-pizza"><span>Total pizza</span><span>{formatearPrecio(precio)}</span></div>
        </div>
      </div>

      {pedido && (
        <div className="pedido-overlay" role="dialog" aria-modal="true">
          <div className="pedido-caja lcn-panel text-center">
            <div className="pedido-globo">¡Pizza agregada al carrito!</div>
            {hayImagen ? (
              <img
                className="pedido-snoopy"
                src="/img/snoopy.png"
                alt="Snoopy"
                onError={() => setHayImagen(false)}
              />
            ) : (
              <span className="pedido-snoopy-emoji">🐶</span>
            )}
            <p className="mt-3 mb-1 fw-bold">Tu pizza lleva:</p>
            <p>{resumen.map((i) => `${i.emoji} ${i.nombre} × ${i.n}`).join(' · ')}</p>
            <p className="fw-bold">{formatearPrecio(precio)}</p>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              <button className="btn btn-success" onClick={irAPagar}>Ir a pagar</button>
              <button className="btn btn-outline-secondary" onClick={verCarrito}>Ver carrito</button>
              <button className="btn btn-danger" onClick={nuevaPizza}>Armar otra pizza</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
