# La Cucina Nostra API
Backend REST inicial con Spring Boot 3.5, Java 21, Spring Data JPA y PostgreSQL.

## Requisitos
- Java 21 o superior
- Maven 3.9 o superior
- PostgreSQL 15 o superior (o Docker con Docker Compose)

## Base de datos
Crea la base `lacucinanostra` en PostgreSQL y configura `DB_URL`, `DB_USERNAME` y `DB_PASSWORD`. Alternativamente ejecuta `docker compose up -d postgres` desde esta carpeta (requiere Docker).

## Ejecutar
```bash
mvn spring-boot:run
```
API: `http://localhost:8080/api`
Swagger UI: `http://localhost:8080/swagger-ui.html`
OpenAPI JSON: `http://localhost:8080/api-docs`

## CRUD de productos
| Método | Ruta | Acción |
|---|---|---|
| GET | `/api/products` | Listar |
| GET | `/api/products/{id}` | Obtener por ID |
| POST | `/api/products` | Crear |
| PUT | `/api/products/{id}` | Actualizar |
| DELETE | `/api/products/{id}` | Eliminar |

El modelo conserva los nombres de propiedades usados por React: `nombre`, `categoria`, `precio`, `precioOferta`, `alergenos`, `etiquetas`, etc.

Esta primera etapa cubre catálogo y persistencia. JWT, usuarios, órdenes, carga de los 16 productos iniciales e integración definitiva del frontend son etapas siguientes. No se debe publicar el CRUD administrativo sin añadir autorización.
