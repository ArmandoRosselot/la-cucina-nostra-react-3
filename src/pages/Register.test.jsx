import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderConApp } from '../test/utils.jsx';
import Register from './Register.jsx';
import { obtenerUsuarios, registrarUsuario } from '../data/db.js';

const navegar = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => navegar
}));

beforeEach(() => navegar.mockClear());

async function llenar({ nombre = 'Ana Silva', email = 'ana@correo.cl', confirmarEmail = email,
  password = 'Pasta2024', confirmarPassword = password, region = 'Región de Ñuble', comuna = 'Chillán' } = {}) {
  await userEvent.type(screen.getByLabelText('Nombre Completo'), nombre);
  await userEvent.type(screen.getByLabelText('Correo Electrónico'), email);
  await userEvent.type(screen.getByLabelText('Confirmar Correo Electrónico'), confirmarEmail);
  await userEvent.type(screen.getByLabelText('Ingrese Una Contraseña'), password);
  await userEvent.type(screen.getByLabelText('Confirmar Contraseña'), confirmarPassword);
  if (region) await userEvent.selectOptions(screen.getByLabelText('Región'), region);
  if (comuna) await userEvent.selectOptions(screen.getByLabelText('Comuna'), comuna);
}

describe('<Register />', () => {
  it('muestra el error de un campo solo después de tocarlo', async () => {
    renderConApp(<Register />);
    expect(screen.queryByText('El correo es obligatorio.')).not.toBeInTheDocument();
    const email = screen.getByLabelText('Correo Electrónico');
    await userEvent.click(email);
    await userEvent.tab(); // sale del campo -> queda "tocado"
    expect(screen.getByText('El correo es obligatorio.')).toBeInTheDocument();
  });

  it('valida en vivo que las contraseñas coincidan', async () => {
    renderConApp(<Register />);
    await userEvent.type(screen.getByLabelText('Ingrese Una Contraseña'), 'Pasta2024');
    await userEvent.type(screen.getByLabelText('Confirmar Contraseña'), 'Distinta1');
    await userEvent.tab();
    expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument();
  });

  it('al enviar vacío marca todos los campos obligatorios y no registra', async () => {
    renderConApp(<Register />);
    await userEvent.click(screen.getByRole('button', { name: /registrar/i }));
    expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument();
    expect(screen.getByText('Confirma tu correo.')).toBeInTheDocument();
    expect(obtenerUsuarios()).toHaveLength(0);
  });

  it('registra al usuario, inicia sesión y redirige', async () => {
    renderConApp(<Register />);
    await llenar();
    await userEvent.click(screen.getByRole('button', { name: /registrar/i }));
    expect(obtenerUsuarios()).toHaveLength(1);
    expect(navegar).toHaveBeenCalledWith('/');
  });

  it('rechaza un correo ya registrado', async () => {
    registrarUsuario({ nombre: 'Ana Silva', email: 'ana@correo.cl', password: 'Pasta2024' });
    renderConApp(<Register />);
    await llenar();
    await userEvent.click(screen.getByRole('button', { name: /registrar/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/ya existe/i);
    expect(navegar).not.toHaveBeenCalled();
  });

  it('tiene los campos del wireframe, incluidos región y comuna', () => {
    renderConApp(<Register />);
    ['Nombre Completo', 'Correo Electrónico', 'Confirmar Correo Electrónico', 'Ingrese Una Contraseña',
      'Confirmar Contraseña', 'Teléfono (opcional)', 'Región', 'Comuna'].forEach((l) =>
      expect(screen.getByLabelText(l)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'REGISTRAR' })).toBeInTheDocument();
  });

  it('la comuna depende de la región elegida', async () => {
    renderConApp(<Register />);
    const comuna = screen.getByLabelText('Comuna');
    expect(comuna).toBeDisabled();
    await userEvent.selectOptions(screen.getByLabelText('Región'), 'Región de Ñuble');
    expect(comuna).toBeEnabled();
    expect(screen.getByRole('option', { name: 'Chillán' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Temuco' })).not.toBeInTheDocument();
  });

  it('exige región y comuna', async () => {
    renderConApp(<Register />);
    await llenar({ region: '', comuna: '' });
    await userEvent.click(screen.getByRole('button', { name: /registrar/i }));
    expect(screen.getByText('Selecciona una región.')).toBeInTheDocument();
    expect(screen.getByText('Selecciona una comuna.')).toBeInTheDocument();
    expect(obtenerUsuarios()).toHaveLength(0);
  });

  it('guarda la región y la comuna en la cuenta', async () => {
    renderConApp(<Register />);
    await llenar();
    await userEvent.click(screen.getByRole('button', { name: /registrar/i }));
    expect(obtenerUsuarios()[0]).toMatchObject({ region: 'Región de Ñuble', comuna: 'Chillán' });
  });
});
