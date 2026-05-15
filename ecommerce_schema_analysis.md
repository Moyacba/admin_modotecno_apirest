# Modelos de Prisma para el E-commerce (MODOTECNO ERP)

Basado en el archivo `schema.prisma`, a continuación se detallan y agrupan los modelos y entidades estructurales que dan vida al **E-commerce** del proyecto, separados por responsabilidades funcionales.

---

## 1. Catálogo y Productos (El Core del E-commerce)
Estos modelos dictan cómo se muestran los productos, las variantes disponibles y cómo se navega por el catálogo.

### `Product` y `ProductVariant`
*   **`Product`:** Es la entidad principal. Contiene la información global como `name`, `description`, `brand`, imágenes, especificaciones JSON y los precios de referencia (`salePrice`, `promoPrice`).
*   **`ProductVariant`:** Fundamental para tiendas online. Permite vender un mismo producto en distintas versiones (ej. fundas de distintos colores, vidrios de diferentes tamaños). Cada variante maneja su propio `sku`, `stock`, `salePrice`, `images` y atributos específicos (`color`, `design`, `size`).

### Jerarquía y Filtros
*   **`Category` y `Subcategory`:** Agrupan los productos para la navegación (ej. *Accesorios -> Fundas*).
*   **Sistema de Atributos (`AttributeDefinition`, `CategoryAttribute`, `SubcategoryAttribute`):** Permite construir una interfaz de filtros dinámicos (Facetas). Cada subcategoría puede requerir atributos específicos (ej. tipo de material, compatibilidad con MagSafe) que los usuarios luego usan para filtrar en el front-end.
*   **Compatibilidades (`DeviceBrand`, `DeviceModel`, `ProductCompatibility`):** Crucial para vender accesorios de telefonía. Permite a un cliente filtrar productos diciendo *"Muéstrame todo lo compatible con iPhone 15 Pro Max"*.

### `RecommendationRule`
*   Sirve para armar lógicas de Cross-Selling o Up-Selling en el carrito o en la página de producto ("Los clientes que compraron esto, también llevaron...").

---

## 2. Gestión de Pedidos y Checkout (Órdenes)
A diferencia de `POSSale` (que es exclusivo para venta física en sucursal), el E-commerce utiliza el modelo **`Order`** que está preparado para lidiar con pasarelas de pago y envíos.

### `Order`
Representa un carrito de compras convertido en pedido. Sus campos más relevantes para e-commerce son:
*   **Fechas y Estados:** `fecha_creacion`, `fecha_pagado`, `fecha_enviado`, `fecha_entregado`. 
*   **Estados de vida:** `estado` (PENDIENTE_PAGO, PAGADO, ENVIADO, COMPLETADO, CANCELADO).
*   **Montos:** `monto_total`, `subtotal`, `descuento_aplicado`, `costo_envio`. *Regla clave: todos los montos se manejan en centavos para precisión.*
*   **Pagos y Envíos:** `metodo_pago`, `id_transaccion_pasarela` (útil para Webhooks de MercadoPago), `info_envio` (JSON con detalles del correo/dirección).
*   **Marketing en la Orden:** `canal_venta` ("ECOMMERCE"), cupones de descuento aplicados (`cupon_aplicado`) y parámetros UTM (`utm_source`, `utm_medium`, etc.) para saber de qué campaña de publicidad vino esta venta específica.

### `OrderDetail`
*   Guarda una "foto" del producto comprado. Congela el nombre (`productoName`), cantidad (`cantidad`), y precio unitario (`precio_unitario_al_momento_de_compra`) asegurando que los cambios de precios futuros en el catálogo no alteren el histórico de pedidos de los clientes.

---

## 3. Clientes y CRM
El E-commerce necesita registrar a sus clientes para compras recurrentes, envíos e email marketing.

### `Buyer`
*   Reemplaza al cliente genérico. Para un e-commerce almacena la dirección de envío (`direccion`), datos fiscales si los hubiera (`dni`, `cuit`), y métricas de adquisición (`acquisition_channel`, tags).
*   Relacionado con `Order` (sus compras) y `ProductInteraction` (sus comportamientos).

### `CommunicationPreferences`
*   Maneja los permisos explícitos del cliente (Opt-In/Opt-Out) para recibir *email_marketing*, *sms*, y notificaciones por WhatsApp. Fundamental para no hacer SPAM.

---

## 4. Analíticas y Comportamiento del Usuario (Tracking)
Estos modelos existen exclusivamente para medir el rendimiento de la tienda web y armar embudos de conversión (Funnels).

### `ProductInteraction`
*   Registra acciones de los usuarios con productos específicos (Incluso sin estar logueados usando `session_id`).
*   Los tipos de interacción (`InteractionType`) son claves: `VIEW` (vistas de producto), `ADD_TO_CART` (agregados al carrito), `REMOVE_FROM_CART` (removidos), y `WISHLIST`. Esto permite crear estrategias de recuperación de **Carritos Abandonados**.

### `BrowsingEvent`
*   Actúa como un "Google Analytics" interno. Registra la página visitada (`page_url`), el tiempo de permanencia (`time_spent`), el dispositivo de donde navega (`device_type`) y de dónde vino (`referrer`).

### `Feedback`
*   El sistema de **Reseñas (Reviews)**. Permite que los clientes califiquen productos (estrellas y comentarios), lo cual es crítico para la prueba social de un e-commerce.

---

## 5. Matriz de Servicios Técnicos (Presupuestador Automático)
El E-commerce incluirá una herramienta para que los clientes puedan pre-cotizar y solicitar reparaciones online. Para esto utiliza una matriz relacional estricta, la cual es **independiente** del catálogo de productos de venta regular.

### `ServiceCategory`, `BrandRepair` y `ModelRepair`
*   **`ServiceCategory`:** Define el tipo de equipo a reparar (ej. Celular, Notebook, Tablet).
*   **`BrandRepair`:** Las marcas (ej. Apple, Samsung, Motorola). Se enlazan a las categorías mediante la tabla intermedia `BrandRepairCategory` (ej. para indicar que Apple fabrica Celulares y Notebooks).
*   **`ModelRepair`:** El modelo exacto del dispositivo del cliente (ej. iPhone 15 Pro, Galaxy S23).

### `RepairType` y `RepairOption` (Las opciones de cotización)
*   **`RepairType`:** El problema o servicio canónico a resolver (ej. Cambio de Pantalla, Cambio de Batería, Reparación de Pin de Carga).
*   **`RepairOption`:** Es el corazón del presupuestador automático. Para un modelo específico (`ModelRepair`) y un tipo de reparación específico (`RepairType`), define las opciones de servicio que se le mostrarán al cliente. Contiene el precio final (`price`) y la calidad del repuesto (`quality`: ORIGINAL o ALTERNATIVE), dando autonomía al usuario para elegir.

### Flujo Lógico del Presupuestador Online:
1. El usuario selecciona qué dispositivo tiene (`ServiceCategory` -> `BrandRepair` -> `ModelRepair`).
2. Selecciona qué reparación necesita (`RepairType`).
3. El sistema busca las `RepairOption` correspondientes y le muestra al cliente los precios y calidades disponibles.
4. El cliente confirma y se genera una intención de servicio o un turno, creando eventualmente un registro en el modelo `Service`.

---

## Flujo Lógico de una Venta E-commerce según los Schemas:

1. Un **Visitante** entra a la web y genera un `BrowsingEvent`.
2. Filtra por `Category` / `DeviceModel` y entra a un `Product`. Se genera un `ProductInteraction` tipo `VIEW`.
3. Selecciona un `ProductVariant` y lo agrega al carrito -> `ProductInteraction` tipo `ADD_TO_CART`.
4. El visitante va al Checkout, ingresa sus datos (se crea o actualiza su perfil en `Buyer`) y confirma.
5. Se crea una `Order` con estado `PENDIENTE_PAGO` y `OrderDetail` por cada variante en el carrito.
6. El cliente paga en MercadoPago. La pasarela envía un Webhook al sistema.
7. Se actualiza el `estado` de la `Order` a `PAGADO` registrando el `id_transaccion_pasarela`.
8. Se descuenta el stock transaccionalmente en el `ProductVariant`.
9. Cuando se despacha la orden, la `Order` pasa a `ENVIADO` y se llenan los datos de `info_envio`.
