# API v2 — Ecommerce Mejoras Backend

**Fecha:** 2026-06-06  
**Estado:** Diseño aprobado  

## Resumen

Crear una versión 2 del API REST orientada al ecommerce, con prefijo de ruta `/api/v2/` y directorio `src/v2/`. La v1 permanece completamente intacta (excepto `schema.prisma` para el campo `isActive`). Se reutilizan la misma base de datos y la misma instancia de PrismaClient.

## Decisiones tomadas

| Decisión | Opción elegida |
|----------|---------------|
| Estructura | Prefijo de ruta `/api/v2/` + directorio `src/v2/` |
| Alcance | Solo endpoints afectados por las 5 mejoras |
| Ruta slug | `/api/v2/product/slug/:slug` |
| normalizeProduct | Archivo `src/v2/utils/normalizeProduct.js` |
| Categorías v2 | Endpoint propio sin `/tree` |
| isActive en hybrid | Filtro en static + dynamic |
| normalizeProduct en dynamic | Sí, normalizar promoPrice/percentPrice 0 → null |
| Campo status | Eliminar referencia a `status` inexistente, usar `isActive` |
| Recomendaciones v2 | Servicio interno sin ruta propia |
| Variantes v2 | Solo endpoint de lectura (GET) |
| Migración isActive | Modificar schema + script de migración `addIsActiveField.js` |
| Revalidación | Copiar `triggerRevalidation` a v2 |
| Registro rutas | `app.use('/api/v2', v2Router)` en `app.js` + `src/v2/routes/index.js` |

---

## Punto 1: GET /api/v2/product/slug/:slug

**Archivos nuevos:**
- `src/v2/controllers/productController.js` — agregar `getProductBySlug`

**Detalles:**
- `req.params.slug` = el slug del producto
- `req.query.includeVariants` = opcional, mismo comportamiento que `getProductById`
- Query: `prisma.product.findUnique({ where: { slug }, include: { ... } })`
- Si no encuentra → 404 `{ error: "Product not found" }`
- Mismo select/include que `getProductById` para respuesta consistente
- Ruta ANTES de `/:id` para evitar que Express interprete "slug" como un ID
- Normalización `promoPrice: 0 → null` se aplica aquí (Punto 4)
- Filtro `isActive: true` se aplica aquí (Punto 5)

**Ruta:** `router.get("/slug/:slug", getProductBySlug)` — antes de `router.get("/:id", getProductById)`

---

## Punto 2: Eliminar GET /category/tree

**Enfoque:** La v2 no incluye este endpoint. El controller v2 solo expone:

- `getCategories` — lista categorías con subcategorías
- `getCategoryById` — categoría por ID

No se modifica v1. La eliminación de `/tree` en v1 se hará por separado si se desea.

**Archivos nuevos:**
- `src/v2/controllers/categoryController.js` — solo `getCategories` y `getCategoryById`
- `src/v2/routes/categoryRoutes.js` — solo rutas GET `/` y `/:id`

---

## Punto 3: Índice en campo slug

**Verificación:** El schema Prisma ya tiene `slug String @unique`. MongoDB crea automáticamente un índice único para campos `@unique`.

**Acción:** Sin cambios de código. Confirmar con `npx prisma db push`.

---

## Punto 4: Normalizar promoPrice: 0 → null en respuestas

**Archivo nuevo:**
- `src/v2/utils/normalizeProduct.js`

**Función helper `normalizeProduct(product)`:**
- Si `promoPrice === 0` → lo transforma a `null`
- Si `percentPrice === 0` → lo transforma a `null`
- Retorna el objeto transformado sin mutar el original (spread + override)
- Para variantes: mismo tratamiento si aplica

**Endpoints donde se aplica:**

| Endpoint | Controller | Función a normalizar |
|----------|-----------|---------------------|
| GET /product/ | productController v2 | `getProducts` — mapear array de products |
| GET /product/:id | productController v2 | `getProductById` — normalizar producto |
| GET /product/slug/:slug | productController v2 | `getProductBySlug` — normalizar producto |
| GET /product/search | productController v2 | `searchProducts` — mapear resultados |
| GET /product/static | hybridProductController v2 | `getProductsStatic` — mapear products paginados |
| GET /product/:id/static | hybridProductController v2 | `getProductStaticById` — normalizar producto |
| GET /product/dynamic | hybridProductController v2 | `getProductsDynamic` — mapear products |
| GET /product/:id/dynamic | hybridProductController v2 | `getProductDynamicById` — normalizar producto |
| (interno) | recommendationService v2 | `getRecommendations` — mapear resultados |

**NO se aplica en:**
- `createProduct`, `updateProduct` — el POS escribe 0 como "sin promo"
- Endpoints de admin (barcodes, stock-batch, low-stock)

**Para variantes:** Si `includeVariants=true`, normalizar también `promoPrice: 0 → null` y `percentPrice: 0 → null` dentro de cada variante.

---

## Punto 5: Agregar isActive al modelo Product

**Archivo modificado (compartido con v1):**
- `prisma/schema.prisma` — agregar `isActive Boolean @default(true)` al modelo Product

**Archivo nuevo:**
- `src/scripts/addIsActiveField.js` — script de backfill

**Script de migración:**
```javascript
// Actualizar todos los productos que no tienen isActive
await db.products.updateMany(
  { isActive: { $exists: false } },
  { $set: { isActive: true } }
);
```

**Schema change:**
```prisma
model Product {
  // ...campos existentes...
  isActive  Boolean  @default(true)
}
```

**Endpoints v2 donde agregar el filtro `isActive: true` (solo lectura pública):**

| Endpoint | Filtro |
|----------|--------|
| GET /product/ | `where: { isActive: true }` |
| GET /product/:id | Verificar `isActive` junto con la búsqueda; si no es active → 404 |
| GET /product/slug/:slug | Mismo |
| GET /product/search | En el `where` |
| GET /product/static | En el `where` |
| GET /product/dynamic | En el `where` |
| GET /product/:id/static | Verificar isActive |
| GET /product/:id/dynamic | Verificar isActive |
| GET /product/:productId/variants | Filtro en variantes (ya existe `isActive: true`) |
| recommendationService v2 | En el `where` de los productos recomendados |

**Endpoints donde NO agregar el filtro (admin POS):**
- createProduct, updateProduct, deleteProduct
- validateStock, getStockBatch
- getProductsForBarcodes, checkBarcodeUnique, bulkUpdateBarcodes
- getLowStockProducts
- searchProducts del admin

**Bug corregido:** El `hybridProductController` v1 referencia un campo `status` inexistente en Product. En v2 se elimina del `select` y se reemplaza por `isActive`.

---

## Estructura de archivos v2

```
src/v2/
├── controllers/
│   ├── productController.js      # getProducts, getProductById, getProductBySlug, searchProducts
│   ├── categoryController.js     # getCategories, getCategoryById
│   ├── hybridProductController.js # getProductsStatic, getProductsDynamic, getProductStaticById, getProductDynamicById
│   └── productVariantController.js # getProductVariants (solo lectura)
├── routes/
│   ├── index.js                  # Router principal v2
│   ├── productRoutes.js          # /product/*
│   ├── categoryRoutes.js         # /category/*
│   ├── hybridRoutes.js           # /product/static, /product/dynamic, etc.
│   └── productVariantRoutes.js   # /product/:productId/variants
├── services/
│   └── recommendationService.js  # Servicio interno con filtros v2
└── utils/
    ├── normalizeProduct.js        # Helper promoPrice: 0 → null
    └── prisma.js                  # Reexporta PrismaClient
```

**Archivo modificado (existente):**
- `src/app.js` — agregar `app.use('/api/v2', v2Router)`
- `prisma/schema.prisma` — agregar `isActive Boolean @default(true)` al modelo Product

**Archivo nuevo (scripts):**
- `src/scripts/addIsActiveField.js` — script de backfill

---

## Rutas v2 completas

### Productos
```
GET    /api/v2/product/              → getProducts (isActive: true)
GET    /api/v2/product/slug/:slug    → getProductBySlug (isActive: true)
GET    /api/v2/product/search        → searchProducts (isActive: true)
GET    /api/v2/product/:id            → getProductById (isActive: true)
```

### Productos híbridos
```
GET    /api/v2/product/static         → getProductsStatic (isActive: true)
GET    /api/v2/product/dynamic        → getProductsDynamic (isActive: true)
GET    /api/v2/product/:id/static     → getProductStaticById (isActive: true)
GET    /api/v2/product/:id/dynamic    → getProductDynamicById (isActive: true)
```

### Variantes (solo lectura)
```
GET    /api/v2/product/:productId/variants → getProductVariants (isActive: true en variantes)
```

### Categorías
```
GET    /api/v2/category/             → getCategories
GET    /api/v2/category/:id           → getCategoryById
```

### Health check
```
GET    /api/v2/health                 → Status v2
```

---

## Principios de reutilización

1. **PrismaClient**: Se importa desde `src/utils/prisma.js` compartido (no se crea una nueva instancia)
2. **triggerRevalidation**: Se copia a `src/v2/utils/` con la misma lógica
3. **normalizeProduct**: Función pura, independiente, sin side effects
4. **Controllers v2**: Se basan en la lógica de v1 agregando filtros `isActive` y normalización
5. **Schema**: Compartido entre v1 y v2 — el campo `isActive` con `@default(true)` es retrocompatible

---

## Orden de implementación

1. Modificar `schema.prisma` — agregar `isActive Boolean @default(true)`
2. Crear script `addIsActiveField.js`
3. Crear `src/v2/utils/normalizeProduct.js`
4. Crear `src/v2/utils/prisma.js` (reexport)
5. Crear `src/v2/controllers/categoryController.js`
6. Crear `src/v2/controllers/productController.js`
7. Crear `src/v2/controllers/hybridProductController.js`
8. Crear `src/v2/controllers/productVariantController.js`
9. Crear `src/v2/services/recommendationService.js`
10. Crear `src/v2/routes/categoryRoutes.js`
11. Crear `src/v2/routes/productRoutes.js`
12. Crear `src/v2/routes/hybridRoutes.js`
13. Crear `src/v2/routes/productVariantRoutes.js`
14. Crear `src/v2/routes/index.js`
15. Modificar `src/app.js` — registrar rutas v2
16. Ejecutar `npx prisma db push`
17. Ejecutar script de backfill
18. Probar endpoints v2