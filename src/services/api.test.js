import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('axios', () => {
  const get = vi.fn();
  return { default: { create: () => ({ get }) }, __get: get };
});

beforeEach(() => { vi.resetModules(); vi.unstubAllEnvs(); });

describe('services/api (Axios)', () => {
  it('sin VITE_API_URL usa los datos locales y no llama a la red', async () => {
    vi.stubEnv('VITE_API_URL', '');
    const { getProductos, hayBackend } = await import('./api.js');
    const axios = await import('axios');
    expect(hayBackend()).toBe(false);
    expect(await getProductos()).toHaveLength(16);
    expect(axios.__get).not.toHaveBeenCalled();
  });

  it('con backend devuelve lo que responde el servidor', async () => {
    vi.stubEnv('VITE_API_URL', 'https://mi-app.azurewebsites.net/api');
    const axios = await import('axios');
    axios.__get.mockResolvedValue({ data: [{ id: 1, nombre: 'Remoto' }] });
    const { getProductos } = await import('./api.js');
    expect(await getProductos()).toEqual([{ id: 1, nombre: 'Remoto' }]);
    expect(axios.__get).toHaveBeenCalledWith('/products');
  });

  it('si el servidor falla vuelve a los datos locales', async () => {
    vi.stubEnv('VITE_API_URL', 'https://mi-app.azurewebsites.net/api');
    const axios = await import('axios');
    axios.__get.mockRejectedValue(new Error('500'));
    const { getProductos, getProducto } = await import('./api.js');
    expect(await getProductos()).toHaveLength(16);
    expect((await getProducto(1)).nombre).toBe('Bruschetta tradicional');
  });
});
