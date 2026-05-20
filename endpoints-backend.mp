# AdminMT API REST - Endpoints

**Base URL:** `/api`

---

## Tabla de Contenidos

1. [Health & Utility](#1-health--utility)
2. [Autenticación](#2-autenticación-apiauth)
3. [Productos](#3-productos-apiproduct)
4. [Variantes de Producto](#4-variantes-de-producto-apiproductproductidvariants)
5. [Servicios Técnicos](#5-servicios-técnicos-apiservice)
6. [Órdenes Web](#6-órdenes-web-apiorder)
7. [Ventas POS](#7-ventas-pos-apipos-sales)
8. [Clientes](#8-clientes-apicustomers)
9. [Categorías](#9-categorías-apicategory)
10. [Catálogo](#10-catálogo-apicatalog)
11. [Proveedores](#11-proveedores-apiproviders)
12. [Gastos](#12-gastos-apiexpense)
13. [Caja / Cashflow](#13-caja--cashflow-apicashflow)
14. [Caja Registradora](#14-caja-registradora-apicash-register)
15. [Ingreso de Stock](#15-ingreso-de-stock-apistock-entry)
16. [Catálogo de Reparaciones](#16-catálogo-de-reparaciones-apirepair-catalog)
17. [Matriz de Servicio](#17-matriz-de-servicio-apiservice-matrix)
18. [Categorías de Servicio](#18-categorías-de-servicio-apiservice-categories)
19. [Tipos de Reparación](#19-tipos-de-reparación-apirepair-types)
20. [Opciones de Reparación](#20-opciones-de-reparación-apirepair-options)
21. [Imágenes / Cloudinary](#21-imágenes--cloudinary-apiimage)
22. [Adapter (Datos Legado)](#22-adapter-datos-legado-apiadapter)
23. [Hybrid Endpoints](#23-hybrid-endpoints)
24. [Revalidación de Caché](#24-revalidación-de-caché)

---

## 1. Health & Utility

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check - estado, uptime, entorno |
| GET | `/example` | Endpoint de ejemplo |

---

## 2. Autenticación (`/api/auth`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar nuevo usuario (email, password, name) |
| POST | `/api/auth/login` | Iniciar sesión, retorna JWT + cookie |
| POST | `/api/auth/logout` | Cerrar sesión - limpia cookie JWT |

---

## 3. Productos (`/api/product`)

### CRUD Principal

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/product/` | Listar todos los productos (paginado, filtros) |
| GET | `/api/product/:id` | Obtener producto por ID |
| POST | `/api/product/` | Crear nuevo producto |
| PUT | `/api/product/:id` | Actualizar producto |
| DELETE | `/api/product/:id` | Eliminar producto |
| GET | `/api/product/search` | Buscar productos por keyword |
| GET | `/api/product/low-stock` | Productos con stock bajo |
| PATCH | `/api/product/:id/toggle-alert-mark` | Activar/desactivar marca de alerta |
| PATCH | `/api/product/low-stock/bulk-toggle-mark` | Activar/desactivar marcas en lote |

### Stock en Tiempo Real

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/product/validate-stock` | Validar suficiencia de stock para múltiples productos |
| POST | `/api/product/stock-batch` | Obtener stock actual de múltiples productos |

### Códigos de Barras

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/product/barcodes` | Productos para gestión de códigos de barras |
| GET | `/api/product/barcodes/check` | Verificar si un código de barras es único |
| PUT | `/api/product/barcodes/bulk` | Actualización masiva de códigos de barras |

---

## 4. Variantes de Producto (`/api/product/:productId/variants`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/product/:productId/variants` | Obtener variantes de un producto |
| POST | `/api/product/:productId/variants` | Crear variante para un producto |
| GET | `/api/product/variants/search` | Buscar variantes por atributos |
| GET | `/api/product/variants/:id` | Obtener variante por ID |
| PUT | `/api/product/variants/:id` | Actualizar variante |
| DELETE | `/api/product/variants/:id` | Eliminar variante |

---

## 5. Servicios Técnicos (`/api/service`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/service/` | Listar todos los servicios |
| GET | `/api/service/query` | Buscar servicios por producto, cliente o teléfono |
| GET | `/api/service/:id/checkout-prep` | Preparar checkout para entrega POS |
| GET | `/api/service/:id` | Obtener servicio por ID |
| POST | `/api/service/` | Crear nuevo servicio |
| POST | `/api/service/delivery/:id` | Registrar entrega (POST) |
| PUT | `/api/service/delivery/:id` | Registrar entrega (PUT) |
| PUT | `/api/service/warranty/:id` | Registrar ingreso a garantía |
| PUT | `/api/service/:id` | Actualizar servicio |
| DELETE | `/api/service/:id` | Eliminar servicio |

---

## 6. Órdenes Web (`/api/order`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/order/getAllOrders` | Listar todas las órdenes web |
| POST | `/api/order/` | Crear nueva orden (web checkout) |
| PUT | `/api/order/:id` | Actualizar estado de orden |
| POST | `/api/order/:id/cancel` | Cancelar orden pendiente |
| GET | `/api/order/:id` | Obtener estado de orden por ID |
| POST | `/api/order/webhooks/mercadopago` | Webhook de notificaciones MercadoPago |

---

## 7. Ventas POS (`/api/pos-sales`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/pos-sales/` | Listar todas las ventas POS |
| GET | `/api/pos-sales/:id` | Obtener venta POS por ID |
| POST | `/api/pos-sales/` | Crear nueva venta POS |
| PUT | `/api/pos-sales/:id/status` | Actualizar estado de venta POS |
| DELETE | `/api/pos-sales/:id` | Eliminar venta POS |

---

## 8. Clientes (`/api/customers`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/customers/` | Listar todos los clientes (paginado, búsqueda) |
| GET | `/api/customers/search` | Buscar clientes por nombre, teléfono |
| GET | `/api/customers/:id` | Obtener cliente por ID |
| POST | `/api/customers/` | Crear nuevo cliente |
| PUT | `/api/customers/:id` | Actualizar cliente |
| DELETE | `/api/customers/:id` | Eliminar cliente |

---

## 9. Categorías (`/api/category`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/category/` | Listar todas las categorías |
| GET | `/api/category/tree` | Obtener árbol de categorías |
| POST | `/api/category/` | Crear nueva categoría |
| PUT | `/api/category/:id` | Actualizar categoría |
| DELETE | `/api/category/:id` | Eliminar categoría |

---

## 10. Catálogo (`/api/catalog`)

### General

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/catalog/categories` | Obtener categorías del catálogo |
| GET | `/api/catalog/categories/:categoryId/subcategories` | Obtener subcategorías de una categoría |
| GET | `/api/catalog/subcategories/:id/attributes` | Atributos de una subcategoría |
| GET | `/api/catalog/products/:id/recommendations` | Recomendaciones de productos |

### Macro Categorías CRUD

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/catalog/categories` | Crear categoría de catálogo |
| PUT | `/api/catalog/categories/:id` | Actualizar categoría de catálogo |
| DELETE | `/api/catalog/categories/:id` | Eliminar categoría de catálogo |

### Subcategorías CRUD

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/catalog/subcategories` | Crear subcategoría |
| PUT | `/api/catalog/subcategories/:id` | Actualizar subcategoría |
| DELETE | `/api/catalog/subcategories/:id` | Eliminar subcategoría |

### Definiciones de Atributos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/catalog/attributes` | Obtener todas las definiciones de atributos |
| POST | `/api/catalog/attributes` | Crear definición de atributo |
| PUT | `/api/catalog/attributes/:id` | Actualizar definición de atributo |
| DELETE | `/api/catalog/attributes/:id` | Eliminar definición de atributo |
| PATCH | `/api/catalog/attributes/:id/options` | Modificar opciones de atributo |

### Matriz de Compatibilidad

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/catalog/categories/:id/attributes` | Asignar atributo a categoría |
| DELETE | `/api/catalog/categories/:id/attributes/:attrId` | Remover atributo de categoría |
| POST | `/api/catalog/subcategories/:id/attributes` | Asignar atributo a subcategoría |
| DELETE | `/api/catalog/subcategories/:id/attributes/:attrId` | Remover atributo de subcategoría |

---

## 11. Proveedores (`/api/providers`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/providers/` | Listar todos los proveedores |
| POST | `/api/providers/` | Crear nuevo proveedor |
| PUT | `/api/providers/:id` | Actualizar proveedor |
| DELETE | `/api/providers/:id` | Eliminar proveedor |
| PATCH | `/api/providers/:id/toggle` | Activar/desactivar proveedor |

---

## 12. Gastos (`/api/expense`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/expense/` | Listar todos los gastos |
| GET | `/api/expense/:id` | Obtener gasto por ID |
| POST | `/api/expense/` | Crear gasto (con upload de imagen de ticket via multer) |
| PUT | `/api/expense/:id` | Actualizar gasto |
| DELETE | `/api/expense/:id` | Eliminar gasto |

---

## 13. Caja / Cashflow (`/api/cashflow`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/cashflow/` | Listar flujos de caja |
| GET | `/api/cashflow/active` | Obtener flujo de caja activo |
| POST | `/api/cashflow/` | Crear nuevo flujo de caja |
| POST | `/api/cashflow/:id` | Agregar pago al flujo de caja |
| PUT | `/api/cashflow/:id` | Actualizar flujo de caja |
| POST | `/api/cashflow/close/:id` | Cerrar flujo de caja |

---

## 14. Caja Registradora (`/api/cash-register`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/cash-register/status` | Estado de la sesión de caja actual |
| POST | `/api/cash-register/open` | Abrir nueva sesión de caja |
| POST | `/api/cash-register/close` | Cerrar sesión de caja actual |
| GET | `/api/cash-register/history` | Historial de sesiones de caja |
| POST | `/api/cash-register/movement` | Agregar movimiento de caja |
| PUT | `/api/cash-register/movement/:id` | Actualizar movimiento de caja |
| DELETE | `/api/cash-register/movement/:id` | Eliminar movimiento de caja |
| GET | `/api/cash-register/:id` | Detalle de sesión de caja por ID |

---

## 15. Ingreso de Stock (`/api/stock-entry`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/stock-entry/` | Crear ingreso de mercadería |
| GET | `/api/stock-entry/` | Listar ingresos de stock |
| GET | `/api/stock-entry/:id` | Obtener ingreso de stock por ID |

---

## 16. Catálogo de Reparaciones (`/api/repair-catalog`)

### Consultas Públicas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/repair-catalog/smart-index` | Índice inteligente del catálogo de reparaciones |
| GET | `/api/repair-catalog/brands` | Obtener todas las marcas de reparación |
| GET | `/api/repair-catalog/models/:brandId` | Obtener modelos por marca |
| GET | `/api/repair-catalog/services/:modelId` | Obtener servicios por modelo |

### CRUD (autenticación requerida)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/repair-catalog/brands` | Crear marca de reparación |
| PATCH | `/api/repair-catalog/brands/:id` | Actualizar marca de reparación |
| DELETE | `/api/repair-catalog/brands/:id` | Eliminar marca de reparación |
| POST | `/api/repair-catalog/models` | Crear modelo de reparación |
| PATCH | `/api/repair-catalog/models/:id` | Actualizar modelo de reparación |
| POST | `/api/repair-catalog/models/:id/duplicate` | Duplicar modelo de reparación |
| DELETE | `/api/repair-catalog/models/:id` | Eliminar modelo de reparación |

---

## 17. Matriz de Servicio (`/api/service-matrix`)

### Defectos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/service-matrix/defects` | Listar defectos de servicio |
| POST | `/api/service-matrix/defects` | Crear defecto de servicio |
| PATCH | `/api/service-matrix/defects/:id` | Actualizar defecto de servicio |
| DELETE | `/api/service-matrix/defects/:id` | Eliminar defecto de servicio |

### Atributos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/service-matrix/attributes` | Listar atributos de servicio |
| POST | `/api/service-matrix/attributes` | Crear atributo de servicio |
| PATCH | `/api/service-matrix/attributes/:id` | Actualizar atributo de servicio |
| DELETE | `/api/service-matrix/attributes/:id` | Eliminar atributo de servicio |

---

## 18. Categorías de Servicio (`/api/service-categories`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/service-categories/` | Listar categorías de servicio (Celulares, Tablets, etc.) |
| GET | `/api/service-categories/:id` | Obtener categoría de servicio por ID |
| POST | `/api/service-categories/` | Crear categoría de servicio |
| PATCH | `/api/service-categories/:id` | Actualizar categoría de servicio |
| DELETE | `/api/service-categories/:id` | Eliminar categoría de servicio |
| POST | `/api/service-categories/:id/brands` | Vincular marca a categoría de servicio |
| DELETE | `/api/service-categories/:id/brands/:brandId` | Desvincular marca de categoría de servicio |

---

## 19. Tipos de Reparación (`/api/repair-types`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/repair-types/` | Listar todos los tipos de reparación |
| POST | `/api/repair-types/` | Crear tipo de reparación |
| PATCH | `/api/repair-types/:id` | Actualizar tipo de reparación |
| DELETE | `/api/repair-types/:id` | Eliminar tipo de reparación |

---

## 20. Opciones de Reparación (`/api/repair-options`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/repair-options/` | Listar opciones de reparación (filtros: ?modelId, ?repairTypeId, ?quality) |
| POST | `/api/repair-options/` | Crear opción de reparación |
| PATCH | `/api/repair-options/:id` | Actualizar opción de reparación |
| DELETE | `/api/repair-options/:id` | Eliminar opción de reparación |

---

## 21. Imágenes / Cloudinary (`/api/image`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/image/` | Subir archivo de imagen a Cloudinary (multer) |
| POST | `/api/image/url` | Subir imagen desde URL a Cloudinary |
| GET | `/api/image/stock` | Obtener imágenes de stock desde Cloudinary |
| POST | `/api/image/stock/favorite` | Marcar/desmarcar imagen de stock como favorita |

---

## 22. Adapter (Datos Legado) (`/api/adapter`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/adapter/oldservices` | Obtener servicios del sistema legado |
| GET | `/api/adapter/oldservices/query` | Consultar servicios legados por dispositivo, cliente, teléfono |
| GET | `/api/adapter/oldproducts` | Obtener productos del sistema legado |

---

## 23. Hybrid Endpoints

Endpoints optimizados con caché de dos niveles (estático + dinámico).

### Productos Hybrid

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/product/static` | Datos estáticos de productos (caché 30 min) |
| GET | `/api/product/:id/static` | Producto individual - datos estáticos |
| GET | `/api/product/dynamic` | Datos dinámicos de productos (caché 30 seg) - precios, stock, estado |
| GET | `/api/product/:id/dynamic` | Producto individual - datos dinámicos |
| PATCH | `/api/product/:id/stock` | Actualizar solo stock de producto |
| PATCH | `/api/product/:id/prices` | Actualizar solo precios de producto |
| PATCH | `/api/product/:id/status` | Actualizar solo estado de producto |
| PATCH | `/api/product/batch/stock` | Actualización masiva de stock |

### Servicios Hybrid

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/service/static` | Datos estáticos de servicios (caché larga) |
| GET | `/api/service/:id/static` | Servicio individual - datos estáticos |
| GET | `/api/service/dynamic` | Datos dinámicos de servicios - estado, pagos |
| GET | `/api/service/:id/dynamic` | Servicio individual - datos dinámicos |
| PATCH | `/api/service/:id/status` | Actualizar estado de servicio |
| PATCH | `/api/service/:id/payments` | Actualizar pagos de servicio |
| PATCH | `/api/service/:id/diagnostic` | Actualizar diagnóstico de servicio |
| GET | `/api/service/search/device` | Buscar servicios por dispositivo |
| GET | `/api/service/stats` | Estadísticas de servicios en tiempo real |

### Clientes Hybrid

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/customers/static` | Datos estáticos de clientes (caché larga) |
| GET | `/api/customers/:id/static` | Cliente individual - datos estáticos |
| GET | `/api/customers/dynamic` | Datos dinámicos de clientes - crédito, segmento |
| GET | `/api/customers/:id/dynamic` | Cliente individual - datos dinámicos |
| PATCH | `/api/customers/:id/credit` | Actualizar crédito de cliente |
| PATCH | `/api/customers/:id/addresses` | Actualizar direcciones de cliente |
| PATCH | `/api/customers/:id/preferences` | Actualizar preferencias de cliente |
| PATCH | `/api/customers/:id/segment` | Actualizar segmento de cliente |
| GET | `/api/customers/search/sale` | Buscar clientes para POS/venta |
| GET | `/api/customers/:id/devices` | Obtener dispositivos del cliente |
| POST | `/api/customers/:id/devices` | Crear dispositivo para cliente |
| GET | `/api/customers/:id/purchases` | Historial de compras del cliente |
| GET | `/api/customers/:id/services` | Historial de servicios del cliente |

### Órdenes Hybrid

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/order/static` | Datos estáticos de órdenes (caché larga) |
| GET | `/api/order/:id/static` | Orden individual - datos estáticos |
| GET | `/api/order/dynamic` | Datos dinámicos de órdenes - actualizaciones de estado |
| GET | `/api/order/:id/dynamic` | Orden individual - datos dinámicos |
| PATCH | `/api/order/:id/status` | Actualizar estado de orden |
| PATCH | `/api/pos-order/:id/status` | Actualizar estado de orden POS |
| GET | `/api/order/search/:id` | Búsqueda unificada de órdenes (web + POS) |
| GET | `/api/order/stats` | Estadísticas de órdenes |

### Meta

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/hybrid/health` | Health check de endpoints hybrid |
| GET | `/api/hybrid/endpoints` | Metadata de todos los endpoints hybrid con recomendaciones de caché |

---

## 24. Revalidación de Caché

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/revalidate-hook` | Webhook para revalidar caché de Next.js |

---

**Total de endpoints activos: 189**
