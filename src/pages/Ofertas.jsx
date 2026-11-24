import { useState } from 'react';
import OfertasSection from '../components/OfertasSection.jsx';
import PaginaPanel from '../components/PaginaPanel.jsx';
import { useTienda } from '../components/TiendaLayout.jsx';
import { obtenerOfertas } from '../data/db.js';

export default function Ofertas() {
  const [ofertas] = useState(() => obtenerOfertas());
  const { agregarProducto, verDetalle } = useTienda();

  if (ofertas.length === 0) {
    return (
      <PaginaPanel subtitulo="Aprovecha" titulo="Ofertas">
        <p className="text-center mb-0">Por ahora no hay ofertas vigentes. ¡Vuelve pronto!</p>
      </PaginaPanel>
    );
  }
  return <OfertasSection productos={ofertas} onAgregar={agregarProducto} onVerDetalle={verDetalle} />;
}
