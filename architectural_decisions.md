# Decisiones de Arquitectura (ADR) - MODOTECNO ERP Backend

Este documento compila las decisiones arquitectónicas clave (Architecture Decision Records) adoptadas en el backend de MODOTECNO ERP. Estas reglas rigen cómo se organiza el código, cómo interactúan los dominios y cómo se garantiza la consistencia de los datos.

---

## 1. Patrón "Fat Controllers" (Lógica en Controladores)
A diferencia del enfoque tradicional de "Clean Code" que fuerza una separación estricta en una capa de Servicios abstracta, en este proyecto **la lógica de negocio reside principalmente en los Controladores** (ej. `customerController.js`, `productController.js`).
*   **Justificación:** Se prioriza una arquitectura predecible y explícita por encima de abstracciones profundas. Resulta más rápido rastrear el flujo de una petición HTTP directamente en el controlador que saltar entre múltiples capas de abstracción innecesarias.

## 2. Estrategia de Endpoints Híbridos
El backend expone un conjunto de rutas bajo el paraguas de **"Rutas Híbridas"** (`/api/product/static`, `/api/product/dynamic`, etc.).
*   **Justificación:** Optimizar la sincronización con el Frontend (React Query + Zustand).
*   **Funcionamiento:**
    *   **Endpoints Estáticos:** Envían payloads grandes (catálogos enteros, descripciones, imágenes) que el frontend cachea por tiempos largos (ej. 30 min).
    *   **Endpoints Dinámicos:** Son livianos y responden a polling frecuente (ej. cada 30 segundos) enviando solo datos mutables como precios exactos, variaciones de stock o estados cambiantes.

## 3. Integridad Transaccional Mandatoria (Prisma `$transaction`)
Toda operación que afecte simultáneamente al Stock y al Dinero debe envolverse obligatoriamente en un **`prisma.$transaction`**.
*   **Contexto:** Aplicable a ventas en sucursal (`POSSale`), cobros en la tienda o ingresos de stock (`StockEntry`).
*   **Justificación:** Evitar inconsistencias de datos por fallos de red o de ejecución parcial. Si falla el descuento de stock de un producto, la venta entera hace un *rollback* y no se registra el ingreso de dinero.

## 4. Separación Estricta de Dominios (Inventario vs. Reparaciones)
Existen dos ecosistemas que conviven en el backend pero **no se mezclan a nivel de base de datos**:
1.  **Inventario/Ventas:** Usa los modelos `Product`, `ProductVariant`, `Category`.
2.  **Reparaciones:** Usa los modelos `ServiceCategory`, `BrandRepair`, `ModelRepair` (La Matriz de Servicios).
*   **Justificación:** Históricamente, tratar de que un "Repuesto de Servicio Técnico" se comporte igual que un "Accesorio de Venta a Público" genera problemas logísticos masivos. El dominio de servicio tiene reglas propias (mano de obra, garantías, tiempos) que son incompatibles con un flujo simple de e-commerce.

## 5. Control Obligatorio de Sesión de Caja (Cash Register Lock)
Ninguna operación financiera física (ventas POS, ingresos manuales, gastos) puede procesarse en el backend si no existe una **`CashRegisterSession` en estado `OPEN`**.
*   **Mecanismo:** Las rutas están protegidas por verificaciones (ej. middlewares `checkCashLock.js` o lógica en controladores) que consultan el estado de la caja.
*   **Inmutabilidad:** Al cerrar una caja, todos sus `CashMovement` vinculados pasan a estado `isLocked = true` y no pueden ser modificados jamás.

## 6. Precisión Monetaria (Manejo de Centavos)
Para evitar los clásicos errores de precisión de punto flotante en JavaScript y MongoDB:
*   Los montos de las ventas del punto de venta (`POSSale.monto_total`, `OrderDetail.precio_unitario_al_momento_de_compra`) y de las órdenes de Ecommerce (`Order`) se almacenan como **enteros expresados en centavos**.
*   El front-end es responsable de multiplicar x100 antes de enviar al backend y dividir por 100 al renderizar la UI.
*   *Excepción:* Los totales abstractos o informativos como `Service.total` (Reparaciones) aún mantienen formato float (`ARS`), respetando reglas *legacy*.

## 7. Persistencia NoSQL con Esquemas Rígidos (Prisma + MongoDB)
Se utiliza **MongoDB** como base de datos, pero modelada a través de **Prisma ORM**.
*   **Justificación:** Otorga la flexibilidad propia de MongoDB (uso de campos Json dinámicos como `specifications` o `attributes` en productos) combinada con el rigor transaccional y el tipado estricto de Prisma que previene el desorden estructural a largo plazo.

## 8. Arquitectura de Ruteo Centralizada
El archivo `src/routes/index.js` funciona como el hub absoluto. Todos los enrutadores de los distintos dominios convergen allí.
*   **Justificación:** Evita tener declaraciones de rutas esparcidas en la inicialización principal (`app.js`). Facilita ver "de un vistazo" todos los módulos funcionales del ERP y establecer prioridades (como poner los `hybridRoutes` por encima del resto para que los intercepten primero).
