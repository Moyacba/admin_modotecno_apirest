# 📦 Endpoints de Stock en Tiempo Real

Nuevos endpoints implementados para validación de stock en tiempo real desde el ecommerce.

---

## 🆕 Endpoints Implementados

### **1. POST /api/product/validate-stock**

Valida si hay stock suficiente para múltiples productos.

**URL:** `http://localhost:3000/api/product/validate-stock`

**Method:** `POST`

**Request Body:**
```json
{
  "items": [
    {
      "id": "producto-id-1",
      "quantity": 2
    },
    {
      "id": "producto-id-2",
      "quantity": 5
    }
  ]
}
```

**Response (Stock Suficiente):**
```json
{
  "valid": true
}
```

**Response (Stock Insuficiente):**
```json
{
  "valid": false,
  "errors": [
    {
      "productId": "producto-id-1",
      "productName": "Auriculares Haylou X1",
      "requested": 5,
      "available": 3
    }
  ]
}
```

**Códigos de Estado:**
- `200 OK` - Validación completada (revisar campo `valid`)
- `400 Bad Request` - Datos inválidos
- `500 Internal Server Error` - Error del servidor

---

### **2. POST /api/product/stock-batch**

Obtiene el stock actual de múltiples productos en una sola petición.

**URL:** `http://localhost:3000/api/product/stock-batch`

**Method:** `POST`

**Request Body:**
```json
{
  "ids": ["producto-id-1", "producto-id-2", "producto-id-3"]
}
```

**Response:**
```json
{
  "products": [
    {
      "id": "producto-id-1",
      "stock": 15
    },
    {
      "id": "producto-id-2",
      "stock": 0
    },
    {
      "id": "producto-id-3",
      "stock": 8
    }
  ]
}
```

**Nota:** Si un ID no existe en la base de datos, se devuelve con `stock: 0`.

**Códigos de Estado:**
- `200 OK` - Stock obtenido exitosamente
- `400 Bad Request` - IDs inválidos o vacíos
- `500 Internal Server Error` - Error del servidor

---

## 🧪 Testing con cURL

### **Test 1: Validar Stock Suficiente**
```bash
curl -X POST http://localhost:3000/api/product/validate-stock \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"id": "tu-producto-id", "quantity": 1}
    ]
  }'
```

**Respuesta Esperada:** `{"valid": true}`

---

### **Test 2: Validar Stock Insuficiente**
```bash
curl -X POST http://localhost:3000/api/product/validate-stock \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"id": "tu-producto-id", "quantity": 999}
    ]
  }'
```

**Respuesta Esperada:**
```json
{
  "valid": false,
  "errors": [
    {
      "productId": "...",
      "productName": "...",
      "requested": 999,
      "available": X
    }
  ]
}
```

---

### **Test 3: Obtener Stock en Batch**
```bash
curl -X POST http://localhost:3000/api/product/stock-batch \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["producto-id-1", "producto-id-2"]
  }'
```

**Respuesta Esperada:**
```json
{
  "products": [
    {"id": "producto-id-1", "stock": 10},
    {"id": "producto-id-2", "stock": 5}
  ]
}
```

---

### **Test 4: Validación con Producto Inexistente**
```bash
curl -X POST http://localhost:3000/api/product/validate-stock \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"id": "producto-que-no-existe", "quantity": 1}
    ]
  }'
```

**Respuesta Esperada:**
```json
{
  "valid": false,
  "errors": [
    {
      "productId": "producto-que-no-existe",
      "productName": "Producto no encontrado",
      "requested": 1,
      "available": 0
    }
  ]
}
```

---

### **Test 5: Validación con Datos Inválidos**
```bash
curl -X POST http://localhost:3000/api/product/validate-stock \
  -H "Content-Type: application/json" \
  -d '{
    "items": []
  }'
```

**Respuesta Esperada:**
```json
{
  "error": "Se requiere un array de items con id y quantity",
  "valid": false
}
```

---

## 🔧 Testing con Postman/Thunder Client

### **Collection de Postman**

Puedes importar esta colección:

```json
{
  "info": {
    "name": "Stock en Tiempo Real",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Validar Stock",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"items\": [\n    {\n      \"id\": \"{{productId}}\",\n      \"quantity\": 2\n    }\n  ]\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/product/validate-stock",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "product", "validate-stock"]
        }
      }
    },
    {
      "name": "Obtener Stock Batch",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"ids\": [\"{{productId1}}\", \"{{productId2}}\"]\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/product/stock-batch",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "product", "stock-batch"]
        }
      }
    }
  ]
}
```

---

## ✅ Validaciones Implementadas

### **validateStock:**
1. ✅ Valida que `items` sea un array no vacío
2. ✅ Valida que cada item tenga `id` (string)
3. ✅ Valida que cada item tenga `quantity` (número positivo)
4. ✅ Verifica existencia del producto en DB
5. ✅ Compara stock disponible vs cantidad solicitada
6. ✅ Retorna lista de errores detallada

### **getStockBatch:**
1. ✅ Valida que `ids` sea un array no vacío
2. ✅ Consulta eficiente usando `in` de Prisma
3. ✅ Retorna stock 0 para productos inexistentes
4. ✅ Respuesta consistente para todos los IDs solicitados

---

## 🚀 Integración con Frontend

El frontend (ecommerceMT) ya está configurado para usar estos endpoints:

**Archivo:** `ecommerceMT/src/services/apiService.ts`

```typescript
// Validar stock
const validation = await productService.validateStock([
  { id: "prod-123", quantity: 2 }
]);

// Obtener stock en batch
const stocks = await productService.getStockBatch([
  "prod-123", "prod-456"
]);
```

**CartPage** implementa:
- Polling cada 30 segundos
- Validación pre-checkout
- Alertas visuales de stock insuficiente

---

## 📊 Performance

- **Consultas optimizadas** con Prisma
- **Select específico** (solo campos necesarios)
- **Batch queries** para reducir llamadas a DB
- **Sin transacciones** (solo lectura)

**Tiempo estimado:**
- `validate-stock`: ~50-100ms para 5 productos
- `stock-batch`: ~30-50ms para 10 productos

---

## 🐛 Troubleshooting

### **Error: "Cannot find module"**
Verifica que hayas importado correctamente en `productRoutes.js`:
```javascript
import { validateStock, getStockBatch } from "../controllers/productController.js";
```

### **Error 404 Not Found**
Asegúrate de que las rutas estén ANTES de las rutas con `:id`:
```javascript
router.post("/validate-stock", validateStock);  // ✅ Antes
router.post("/stock-batch", getStockBatch);     // ✅ Antes
router.get("/:id", getProductById);             // ❌ Después
```

### **Error: "items is required"**
Verifica el formato del body en tu request:
```json
{
  "items": [...]  // ✅ Correcto
}
// NO: { "products": [...] } ❌
```

---

## 📝 Notas de Implementación

1. **Sin modificaciones a endpoints existentes**: Los endpoints nuevos son completamente independientes
2. **Compatible con sistema actual**: No afecta el flujo de órdenes existente
3. **Prisma ORM**: Usa las mismas herramientas y convenciones del proyecto
4. **Error handling robusto**: Maneja todos los casos edge
5. **Logging**: Imprime errores en consola para debugging

---

**Fecha de implementación:** 2025-10-01  
**Versión Backend:** Compatible con adminMTapirest v1.0.0  
**Versión Frontend:** Compatible con ecommerceMT v0.1.0
