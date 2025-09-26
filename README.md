# Documentación de Endpoints — Backend Express

> **Base URL:** `/api` (ajusta según tu configuración de prefix en el backend)

---

## Autenticación (`/auth`)

### POST `/auth/register`
Registra un nuevo usuario.

- **Body (JSON):**
  ```json
  {
    "email": "usuario@dominio.com",
    "password": "contraseña"
  }
  ```
- **Response:**
  - `200 OK`: Usuario registrado
  - `500`: Usuario ya existe o error

---

### POST `/auth/login`
Inicia sesión y devuelve usuario + cookie JWT.

- **Body (JSON):**
  ```json
  {
    "email": "usuario@dominio.com",
    "password": "contraseña"
  }
  ```
- **Response:**
  - `200 OK`: Usuario autenticado, cookie `jwtToken` en la respuesta.
  - `401`: Credenciales inválidas

---

### POST `/auth/logout`
Cierra la sesión (borra la cookie JWT).

- **Response:**
  - `200 OK`: Sesión cerrada

---

## Productos (`/product`)

### GET `/product`
Obtiene todos los productos (paginado).

- **Query Params:**
  - `page` (opcional): número de página
  - `keyword` (opcional): búsqueda por nombre

- **Response:**
  - `200 OK`: Array de productos

---

### GET `/product/:id`
Obtiene un producto por ID.

- **Params:** `id` (string)
- **Response:**  
  - `200 OK`: Producto  
  - `404`: No encontrado

---

### POST `/product`
Crea un producto.

- **Body (JSON):**
  ```json
  {
    "barcode": "string",
    "sku": "string",
    "name": "string",
    "description": "string",
    "category": "string",
    "brand": "string",
    "provider": "string",
    "costPrice": 0,
    "salePrice": 0,
    "promoPrice": 0,
    "percentPrice": 0,
    "stock": 0,
    "images": [],
    "specifications": {}
  }
  ```
- **Response:**  
  - `201 Created`: Producto creado  
  - `500`: Error

---

### PUT `/product/:id`
Actualiza un producto.

- **Params:** `id` (string)
- **Body:** Igual que POST, pero puede omitir campos.
- **Response:**  
  - `201 OK`: Producto actualizado  
  - `404`: No encontrado

---

### DELETE `/product/:id`
Elimina un producto.

- **Params:** `id` (string)
- **Response:**  
  - `204 No Content`: Eliminado  
  - `404`: No encontrado

---

## Ventas (`/sale`)

### GET `/sale`
Obtiene todas las ventas (paginado).

- **Query Params:** `page` (opcional)
- **Response:** Array de ventas

---

### GET `/sale/:id`
Obtiene una venta por ID.

- **Params:** `id` (string)
- **Response:**  
  - `200 OK`: Venta  
  - `404`: No encontrado

---

### POST `/sale/checkout`
Crea una venta.

- **Body (JSON):**
  ```json
  {
    "customerId": "string",
    "details": "string",
    "date": "YYYY-MM-DD",
    "products": [{ "id": "string", ... }],
    "total": 0,
    "discount": 0,
    "paymentMethod": "string"
  }
  ```
- **Response:**  
  - `201 Created`: Venta creada  
  - `500`: Error

---

### PUT `/sale/:id`
Actualiza una venta.

- **Params:** `id` (string)
- **Body:** Igual que POST
- **Response:**  
  - `200 OK`: Venta actualizada  
  - `404`: No encontrado

---

### DELETE `/sale/:id`
Elimina una venta.

- **Params:** `id` (string)
- **Response:**  
  - `204 No Content`: Eliminada  
  - `404`: No encontrado

---

## Cashflow (`/cashflow`)

### GET `/cashflow`
Obtiene todos los cashflows (paginado).

- **Query Params:** `page` (opcional)
- **Response:** Array de cashflows

---

### GET `/cashflow/active`
Obtiene el cashflow activo.

- **Response:** Array de cashflows activos

---

### POST `/cashflow`
Crea un cashflow.

- **Body (JSON):**
  ```json
  {
    "active": true,
    "openDate": "YYYY-MM-DD",
    "openingBalance": 0,
    "total": 0,
    "expenses": 0,
    "cashSales": 0,
    "cashServices": 0,
    "digitalSales": 0,
    "digitalServices": 0,
    "observations": "string"
  }
  ```
- **Response:**  
  - `201 Created`: Cashflow creado  
  - `500`: Error

---

### POST `/cashflow/:id`
Agrega pagos a un cashflow.

- **Params:** `id` (string)
- **Body (JSON):**
  ```json
  {
    "payments": [{ "method": "ef|digital", "amount": 0 }],
    "transactionType": "sale|service"
  }
  ```
- **Response:**  
  - `201 OK`: Cashflow actualizado  
  - `401/500`: Error

---

### PUT `/cashflow/:id`
Actualiza un cashflow.

- **Params:** `id` (string)
- **Body (JSON):**
  ```json
  { "expenses": 0 }
  ```
- **Response:**  
  - `201 OK`: Cashflow actualizado  
  - `404`: No encontrado

---

### POST `/cashflow/close/:id`
Cierra un cashflow.

- **Params:** `id` (string)
- **Response:**  
  - `204 No Content`: Cashflow cerrado  
  - `404`: No encontrado

---

## Clientes (`/customer`)

### GET `/customer`
Obtiene todos los clientes (paginado).

- **Query Params:** `page` (opcional)
- **Response:** Array de clientes

---

### GET `/customer/:id`
Obtiene un cliente por ID.

- **Params:** `id` (string)
- **Response:**  
  - `200 OK`: Cliente  
  - `404`: No encontrado

---

### POST `/customer`
Crea un cliente.

- **Body (JSON):**
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "password": "string",
    "address": "string",
    "phone": "string",
    "purchaseHistory": [],
    "serviceHistory": []
  }
  ```
- **Response:**  
  - `201 Created`: Cliente creado  
  - `400`: Email ya en uso  
  - `500`: Error

---

### PUT `/customer/:id`
Actualiza un cliente.

- **Params:** `id` (string)
- **Body:** Igual que POST (puede omitir campos)
- **Response:**  
  - `200 OK`: Cliente actualizado  
  - `404`: No encontrado  
  - `400`: Email ya en uso

---

### DELETE `/customer/:id`
Elimina un cliente.

- **Params:** `id` (string)
- **Response:**  
  - `204 No Content`: Eliminado  
  - `404`: No encontrado

---

## Gastos (`/expense`)

### GET `/expense`
Obtiene todos los gastos (paginado).

- **Query Params:** `page` (opcional)
- **Response:** Array de gastos

---

### GET `/expense/:id`
Obtiene un gasto por ID.

- **Params:** `id` (string)
- **Response:**  
  - `200 OK`: Gasto  
  - `404`: No encontrado

---

### POST `/expense`
Crea un gasto.

- **Body (JSON):**
  ```json
  {
    "product": "string",
    "details": "string",
    "amount": 0,
    "method": "string",
    "date": "YYYY-MM-DD",
    "category": "string",
    "categoryId": "string"
  }
  ```
- **Response:**  
  - `201 Created`: Gasto creado  
  - `500`: Error

---

### PUT `/expense/:id`
Actualiza un gasto.

- **Params:** `id` (string)
- **Body:** Igual que POST
- **Response:**  
  - `200 OK`: Gasto actualizado  
  - `404`: No encontrado

---

### DELETE `/expense/:id`
Elimina un gasto.

- **Params:** `id` (string)
- **Response:**  
  - `204 No Content`: Eliminado  
  - `404`: No encontrado

---

## Servicios (`/service`)

### GET `/service`
Obtiene todos los servicios (paginado).

- **Query Params:** `page` (opcional)
- **Response:** Array de servicios

---

### GET `/service/query`
Busca servicios por palabra clave.

- **Query Params:**  
  - `keyword`: string (obligatorio)
- **Response:** Array de servicios

---

### POST `/service`
Crea un servicio.

- **Body (JSON):**
  ```json
  {
    "device": "string",
    "client": "string",
    "state": "string",
    "repair": "string",
    "total": 0,
    "date": "YYYY-MM-DD",
    "payments": [],
    "discount": 0
  }
  ```
- **Response:**  
  - `201 Created`: Servicio creado  
  - `501`: Error

---

### POST `/service/delivery/:id`
Marca un servicio como entregado.

- **Params:** `id` (string)
- **Body (JSON):**
  ```json
  {
    "state": "string",
    "payments": [],
    "dateOut": "YYYY-MM-DD"
  }
  ```
- **Response:**  
  - `201 OK`: Servicio actualizado  
  - `501`: Error

---

### PUT `/service/:id`
Actualiza un servicio.

- **Params:** `id` (string)
- **Body:** Igual que POST
- **Response:**  
  - `201 OK`: Servicio actualizado  
  - `404`: No encontrado

---

### DELETE `/service/:id`
Elimina un servicio.

- **Params:** `id` (string)
- **Response:**  
  - `204 No Content`: Eliminado  
  - `404`: No encontrado

---

## Compras Web (`/order`)

### GET `/order`
Obtiene todas las órdenes de compra con paginación y filtros. Ideal para el panel de administración.

- **Query Params:**
  - `page` (opcional): Número de página. Default: `1`.
  - `limit` (opcional): Resultados por página. Default: `10`.
  - `estado` (opcional): Filtra por estado de la orden (ej: `PENDIENTE_PAGO`, `PAGADO`, `RECHAZADO`).
  - `sortBy` (opcional): Campo para ordenar. Default: `fecha_creacion`.
  - `sortOrder` (opcional): Dirección de ordenamiento (`asc` o `desc`). Default: `desc`.

- **Response:**
  - `200 OK`:
    ```json
    {
      "data": [
        {
          "id": "order_id_1",
          "fecha_creacion": "2023-10-27T10:00:00.000Z",
          "monto_total": 5000,
          "estado": "PAGADO",
          "metodo_pago": "mercadopago",
          "buyer": {
            "nombre": "Juan Pérez",
            "email": "juan@example.com"
          },
          "detalles": [
            {
              "productoName": "Producto A",
              "cantidad": 2,
              "precio_unitario_al_momento_de_compra": 2500
            }
          ]
        }
      ],
      "pagination": {
        "total": 100,
        "page": 1,
        "limit": 10,
        "totalPages": 10
      }
    }
    ```

---

### POST `/order`
Crea una nueva orden de compra y genera preferencia de pago Mercado Pago.

- **Body (JSON):**
  ```json
  {
    "buyer": {
      "nombre": "Juan Pérez",
      "email": "juan@mail.com",
      "direccion": { "calle": "Falsa 123", "ciudad": "Springfield", "cp": "1234" },
      "telefono": "123456789"
    },
    "items": [
      { "productoId": "abc123", "cantidad": 2 },
      { "productoId": "def456", "cantidad": 1 }
    ],
    "metodo_pago": "mercadopago",
    "info_envio": { "tipo": "envio", "direccion": "Falsa 123" }
  }
  ```

- **Response:**
  - `201 Created`:
    ```json
    {
      "orderId": "ID_DE_LA_ORDEN",
      "mp_preference_id": "ID_PREFERENCIA_MP",
      "init_point": "https://www.mercadopago.com/checkout/v1/redirect?..."
    }
    ```
  - `400/500`: Error

- **Notas:**
  - Si el método de pago es `bank`, devuelve `{ orderId, bank: true }`.
  - El frontend debe redirigir o mostrar el botón de Mercado Pago usando `init_point` o el SDK JS.

---

### POST `/order/webhooks/mercadopago`
Webhook para recibir notificaciones de Mercado Pago (debe configurarse como `notification_url` en la preferencia).

- **Query Params (GET):**
  - `id`: ID del pago
  - `topic` o `type`: debe ser igual a `payment`

- **Body:** Vacío (Mercado Pago envía notificación tipo GET).

- **Response:**
  - `200 OK`: Procesado correctamente
  - `404`: Orden o pago no encontrado
  - `500`: Error interno

- **Notas:**
  - El backend consulta el pago usando el SDK y actualiza el estado de la orden a `PAGADO`, `RECHAZADO` o `PENDIENTE_PAGO` según corresponda.
  - El endpoint ignora notificaciones que no sean de tipo `payment`.

---

### PUT `/order/:id`
Actualiza el estado de una orden. Principalmente para cambiar de `PENDIENTE_PAGO` a `PAGADO` o `RECHAZADO` manualmente.

- **Params:**
  - `id`: ID de la orden a actualizar.

- **Body (JSON):**
  ```json
  {
    "estado": "PAGADO"
  }
  ```
  *El campo `estado` solo puede ser `PAGADO` o `RECHAZADO`.*

- **Response:**
  - `200 OK`: Devuelve la orden actualizada.
  - `400 Bad Request`: Si el estado no es válido o la orden ya no está pendiente.
  - `404 Not Found`: Si la orden no existe.

---

### GET `/order/:id`
Consulta el estado y los detalles de una orden de compra (seguro para frontend).

- **Params:**
  - `id`: ID de la orden

- **Response:**
  - `200 OK`:
    ```json
    {
      "id": "ID_DE_LA_ORDEN",
      "estado": "PAGADO",
      "metodo_pago": "mercadopago",
      "monto_total": 12000,
      "buyer": { "nombre": "Juan Pérez", "email": "juan@mail.com" },
      "detalles": [
        { "productoId": "abc123", "cantidad": 2, "precio_unitario": 5000 },
        { "productoId": "def456", "cantidad": 1, "precio_unitario": 2000 }
      ],
      "createdAt": "2025-07-24T23:12:00.000Z",
      "info_envio": { "tipo": "envio", "direccion": "Falsa 123" }
    }
    ```
  - `404`: Orden no encontrada
  - `500`: Error

- **Notas:**
  - El frontend puede consultar este endpoint para mostrar el estado actualizado de la compra al usuario.
  - Los campos expuestos son seguros y no incluyen información sensible.

---

## Guía de Creación de Órdenes

A continuación se detalla el paso a paso para crear una nueva orden de compra desde el frontend, según el método de pago elegido por el usuario.

### Flujo 1: Pago con Mercado Pago

Este flujo se utiliza cuando el usuario elige pagar con tarjeta de crédito, débito o dinero en su cuenta de Mercado Pago.

**Paso 1: Enviar la orden al backend**

El frontend debe realizar una petición `POST` al endpoint `/api/order` con los datos del comprador y los productos. Es crucial que el `metodo_pago` sea `"mercadopago"`.

```http
POST /api/order
Content-Type: application/json

{
  "buyer": { ... },
  "items": [ ... ],
  "metodo_pago": "mercadopago",
  "info_envio": { ... }
}
```

**Paso 2: Recibir la preferencia de pago**

El backend validará el stock, creará la orden con estado `PENDIENTE_PAGO` y generará una preferencia en Mercado Pago. Si todo es correcto, responderá con un `201 Created` y los datos para iniciar el pago.

```json
{
  "orderId": "688baf2b8f4a1b2c3d4e5f6a",
  "mp_preference_id": "ID_DE_LA_PREFERENCIA",
  "init_point": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=..."
}
```

**Paso 3: Redirigir al usuario al checkout**

El frontend debe usar la URL `init_point` recibida para redirigir al usuario al checkout de Mercado Pago, donde completará el pago.

**Paso 4: El usuario finaliza el pago**

Una vez que el usuario paga, Mercado Pago lo redirigirá a las `back_urls` configuradas (`/checkout/success`, `/checkout/pending` o `/checkout/failure`). Al mismo tiempo, enviará una notificación al webhook del backend para actualizar el estado de la orden a `PAGADO` o `RECHAZADO`.

**Paso 5 (Opcional): Consultar estado de la orden**

El frontend puede usar el endpoint `GET /api/order/:id` para consultar el estado final de la orden y mostrar un mensaje de confirmación al usuario.

---

### Flujo 2: Pago en el Local (Efectivo o Transferencia)

Este flujo se utiliza si el usuario elige pagar en el local o mediante una transferencia bancaria. La orden se crea pero queda pendiente de confirmación manual por parte de un administrador.

**Paso 1: Enviar la orden al backend**

El frontend realiza una petición `POST` a `/api/order`, similar al flujo anterior, pero especificando `metodo_pago` como `"cash"` (efectivo) o `"transferencia"`.

```http
POST /api/order
Content-Type: application/json

{
  "buyer": { ... },
  "items": [ ... ],
  "metodo_pago": "cash", // o "transferencia"
  "info_envio": { ... }
}
```

**Paso 2: Recibir la confirmación de la orden**

El backend creará la orden con estado `PENDIENTE_PAGO` y reservará el stock. La respuesta será un `201 Created` simple, confirmando que la orden fue recibida.

*Respuesta para pago en efectivo (`cash`):*
```json
{
  "orderId": "688baf2b8f4a1b2c3d4e5f6b",
  "cash": true
}
```

*Respuesta para pago por transferencia (`transferencia`):*
```json
{
  "orderId": "688baf2b8f4a1b2c3d4e5f6c",
  "bank": true
}
```

**Paso 3: Mostrar instrucciones al usuario**

El frontend debe mostrar una pantalla de confirmación con el número de orden (`orderId`) e instrucciones claras para el usuario (ej: "Tu orden ha sido reservada. Acércate a nuestro local para pagar y retirar" o "Realiza la transferencia a la siguiente cuenta y notifícanos").

**Paso 4: Confirmación manual**

La orden permanecerá en estado `PENDIENTE_PAGO` hasta que un administrador verifique el pago y actualice el estado manualmente a través de un sistema de gestión interno.

---

## Advertencias y Buenas Prácticas

- Nunca confíes en precios/calculos del frontend: el backend recalcula y valida stock.
- No expongas el access token de Mercado Pago en el frontend (solo la public key).
- Configura correctamente la variable `BASE_URL` en tu `.env` para que el webhook y las URLs de retorno funcionen.
- El webhook solo procesa eventos de pago (`payment`).
- El backend puede enviar emails/notificaciones tras la confirmación de pago (pendiente de implementación).

---

## Notas Generales

- La mayoría de los endpoints requieren autenticación por JWT (cookie `jwtToken`).
- Las rutas pueden estar prefijadas por `/api` según tu configuración.
- Todos los endpoints devuelven errores en formato JSON: `{ "error": "mensaje" }`.

---
