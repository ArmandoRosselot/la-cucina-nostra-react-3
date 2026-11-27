const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

async function solicitar(endpoint) {
  const response = await fetch(`${BASE_URL}/${endpoint}`);
  if (!response.ok) throw new Error(`TheMealDB respondió con HTTP ${response.status}`);
  return response.json();
}

export async function buscarRecetas(nombre = '') {
  const data = await solicitar(`search.php?s=${encodeURIComponent(nombre.trim())}`);
  return data.meals ?? [];
}

export async function obtenerRecetaAleatoria() {
  const data = await solicitar('random.php');
  return data.meals?.[0] ?? null;
}

export async function obtenerCategoriasRecetas() {
  const data = await solicitar('categories.php');
  return data.categories ?? [];
}

export async function filtrarPorCategoria(categoria) {
  const data = await solicitar(`filter.php?c=${encodeURIComponent(categoria)}`);
  return data.meals ?? [];
}

export async function obtenerDetalleReceta(id) {
  const data = await solicitar(`lookup.php?i=${encodeURIComponent(id)}`);
  return data.meals?.[0] ?? null;
}

export function extraerIngredientes(receta) {
  if (!receta) return [];
  return Array.from({ length: 20 }, (_, i) => {
    const ingrediente = receta[`strIngredient${i + 1}`]?.trim();
    const medida = receta[`strMeasure${i + 1}`]?.trim();
    return ingrediente ? { ingrediente, medida: medida || '' } : null;
  }).filter(Boolean);
}
