import axios from 'axios';
import { obtenerProductos, obtenerProductoPorId } from '../data/db.js';

/* Capa de acceso a datos (Clase React V: Axios).
   - Si existe VITE_API_URL (por ejemplo la URL del App Service en Azure) se consulta
     el backend REST: GET {API}/products y GET {API}/products/:id.
   - Si no existe, o el servidor falla, se usan los datos locales de db.js.
   Así la tienda funciona sin backend y puede conectarse a uno cuando esté desplegado. */
const API_URL = import.meta.env?.VITE_API_URL;

export const http = axios.create({ baseURL: API_URL, timeout: 8000 });

export const hayBackend = () => Boolean(API_URL);

export async function getProductos() {
  if (!hayBackend()) return obtenerProductos();
  try {
    const { data } = await http.get('/products');
    return Array.isArray(data) ? data : obtenerProductos();
  } catch {
    return obtenerProductos();
  }
}

export async function getProducto(id) {
  if (!hayBackend()) return obtenerProductoPorId(id);
  try {
    const { data } = await http.get(`/products/${id}`);
    return data;
  } catch {
    return obtenerProductoPorId(id);
  }
}
