import Cabecera from './Cabecera.jsx';
import PerfilForm from '../PerfilForm.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

/* Perfil del administrador (mismo formulario que «Mi cuenta», sin dirección). */
export default function Perfil({ onVolver }) {
  const { usuario } = useAuth();
  return (
    <div>
      <Cabecera titulo="Perfil" subtitulo={`${usuario.email} · rol ${usuario.rol}`} onVolver={onVolver} />
      <div className="card border-0 shadow-sm"><div className="card-body"><PerfilForm pedirDireccion={false} /></div></div>
    </div>
  );
}
