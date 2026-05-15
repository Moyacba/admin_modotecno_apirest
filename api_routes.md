# API Routes del E-commerce (MODOTECNO ERP)

Este documento vincula los modelos detallados en el archivo `ecommerce_schema_analysis.md` con las rutas (Endpoints) reales expuestas por la API en Express.

---

## 1. Catálogo y Productos
Rutas vinculadas a `Product`, `ProductVariant`, `Category`. La plataforma utiliza una **estrategia de caché híbrida** para optimizar la carga del frontend.

### Rutas Híbridas (Lectura Optimizada para Store Global)
*   `GET /api/product/static` -> Devuelve datos estáticos del catálogo (descripciones, imágenes) ideal para caché largo.
*   `GET /api/product/dynamic` -> Devuelve precios actualizados, stock, y estado. Ideal para refrescos rápidos (polling).

### Rutas Tradicionales de Productos y Variantes
*   `GET /api/product` -> Listado general de productos.
    *   **URL Search Params:** `?page=1` (paginación de 12 ítems), `?keyword=texto` (busca en nombre, SKU o código de barras), `?categoryId=ID`, `?subcategoryId=ID` (filtrado por catálogo), `?includeVariants=true` (anida las variantes en la respuesta).
*   `GET /api/product/search` -> Búsqueda rápida optimizada (ideal para la barra de búsqueda del front).
    *   **URL Search Params:** `?query=texto` (busca en productos padre y variantes simultáneamente, unificando resultados).
*   `GET /api/product/:id` -> Obtiene detalle profundo de un producto y atributos heredados.
    *   **URL Search Params:** `?includeVariants=true` (devuelve el producto con todas sus `ProductVariant`).
*   `GET /api/product/:productId/variants` -> Obtiene todas las `ProductVariant` (ej. distintos colores) de un producto padre.
*   `GET /api/product/variants/search` -> Búsqueda directa de variantes, por ejemplo por atributos específicos.

---

## 2. Gestión de Pedidos y Checkout
Rutas vinculadas a `Order` y `OrderDetail`. Estas procesan el carrito de compras y la pasarela de pago.

### Proceso de Checkout y Pagos
*   `POST /api/order/` -> **Crear Orden.** Toma el carrito del usuario, crea el registro en `Order` (con estado *PENDIENTE_PAGO*) y graba los `OrderDetail`.
*   `POST /api/order/webhooks/mercadopago` -> **Webhook MP.** Endpoint que MercadoPago llama cuando el cliente aprueba el pago para cambiar el estado a *PAGADO* e iniciar el descuento de stock.

### Seguimiento de Órdenes (Para el perfil de usuario)
*   `GET /api/order/search/:id` -> Busca detalles unificados de una orden (útil para la página de seguimiento / Tracking de envíos).
*   `GET /api/order/dynamic` -> (Endpoint Híbrido) Obtiene dinámicamente los estados cambiantes de las órdenes del usuario.

---

## 3. Clientes y CRM
Rutas vinculadas a `Buyer` y sus `CommunicationPreferences`.

### Identidad y Perfil (Registro E-commerce)
*   `GET /api/customers` -> Obtiene el listado general de clientes.
    *   **URL Search Params:** `?page=1` (paginación de 10 ítems), `?search=texto` (busca parcial e insensible a mayúsculas por nombre, apellido, o teléfono).
*   `GET /api/customers/search` -> Búsqueda directa para vincular perfiles en checkout.
    *   **URL Search Params:** `?nombre=texto`, `?telefono=numero`, `?limit=10` (filtra clientes ágilmente con OR lógico).
*   `POST /api/customers` -> Crea un nuevo `Buyer` en la base de datos al momento del registro o checkout.
*   `GET /api/customers/:id` -> Obtiene la información del cliente, incluyendo historiales si corresponde.
*   `PATCH /api/customers/:id/addresses` -> Permite al usuario actualizar sus direcciones de envío desde el perfil web.
*   `PATCH /api/customers/:id/preferences` -> El usuario configura si desea recibir Newsletters o notificaciones SMS/WhatsApp (Opt-in).

---

## 4. Matriz de Servicios Técnicos (Presupuestador Automático)
Rutas vinculadas a la selección en cascada del presupuestador.

### Endpoints para armar el cotizador UI
*   `GET /api/service-categories` -> Carga el primer paso: "Celulares", "Tablets", "Notebooks".
*   `GET /api/repair-catalog/brands` *(o ruta homóloga en la API)* -> Obtiene las `BrandRepair` filtradas por la categoría seleccionada (ej. Apple, Samsung).
*   `GET /api/repair-catalog/models` *(o ruta homóloga en la API)* -> Obtiene los `ModelRepair` en base a la marca.
*   `GET /api/repair-types` -> Lista de problemas (`RepairType`) disponibles.

### La Cotización Final
*   `GET /api/repair-options` -> Busca el modelo y la reparación, devolviendo un array de `RepairOption` con el precio (`price`) y si el repuesto es genérico o alternativo (`quality`). Con esto se arma el presupuesto en la pantalla del usuario.
    *   **URL Search Params:** `?modelId=ID` (filtra por el modelo exacto), `?repairTypeId=ID` (filtra por el servicio a realizar), `?quality=ORIGINAL|ALTERNATIVE` (filtra opcionalmente por calidad), `?isActive=true|false` (muestra solo opciones habilitadas).
