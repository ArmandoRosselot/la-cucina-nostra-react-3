# La Cucina Nostra – Inicio (React + Bootstrap + Vitest)

Parte "Inicio" de la tienda, migrada de HTML a React. Incluye Inicio de sesión y Registro.

## Ejecutar
```bash
npm install
npm run dev        # http://localhost:5173
npm test           # pruebas unitarias con Vitest
npm run coverage   # informe de cobertura (consola + carpeta coverage/)
npm install -D @testing-library/dom 
```

## Estructura
```
src/
  data/db.js            "Base de datos" en JS (localStorage): CRUD de productos, carrito, usuarios y sesión
  utils/validaciones.js Validaciones JavaScript (nombre, correo, contraseña, teléfono, búsqueda)
  utils/carrito.js      Lógica pura del carrito
  context/              Estado global: CartContext (carrito) y AuthContext (sesión)
  components/           Navbar, Carousel, CategoriasSection, OfertasSection, MenuSection, ProductCard, ProductDetailModal, CartPanel, About, Historias (Blog), ContactSection, Footer, FormField
  pages/                Home, Login, Register
  styles.css            Fondo de Snoopy en .lcn-home; estilo original de login/registro en .auth-page
public/img/             fondo.jpg (Snoopy), logo.jpg y fotos
```

## Pruebas (Vitest + React Testing Library + jsdom)
Configuración en `vite.config.js` (bloque `test`) y `src/test/setup.js`.
Cubren: renderizado, renderizado condicional, props, estado, eventos y mocks (`vi.fn`, `vi.mock`, `vi.spyOn`).
Los archivos `*.test.js(x)` están junto a cada módulo.

## Vistas de la tienda (Figura 3 del PDF)
| Ruta | Vista |
|---|---|
| `/` | Home (carrusel, categorías, ofertas, menú, nosotros, blog, contacto) |
| `/productos`, `/productos/:id` | Productos y Detalle de producto |
| `/categorias`, `/categorias/:nombre` | Categorías y Categoría #1 |
| `/ofertas` | Ofertas |
| `/nosotros`, `/blog`, `/blog/:id`, `/contacto` | Nosotros, Blog, Detalle de blog, Contacto |
| `/comprar` | Checkout (datos del cliente + dirección; se autocompleta si hay sesión) |
| `/pago-correcto/:id`, `/pago-error/:id` | Resultado del pago |
| `/login`, `/register` | Inicio de sesión y registro |

El pago es una simulación (`src/utils/pago.js`): ~80 % de las veces resulta correcto y el resto falla,
para poder mostrar ambas vistas. En las pruebas se controla con `vi.spyOn(Math, 'random')`.
