# Análisis del Proyecto Backend: MODOTECNO ERP

A continuación se presenta un análisis detallado de la estructura, base de datos y decisiones de arquitectura del backend de MODOTECNO ERP basado en Node.js, Express, Prisma y MongoDB.

## 1. Esquema de Prisma (Base de Datos en MongoDB)

El proyecto utiliza **Prisma ORM** conectado a **MongoDB** (`datasource db { provider = "mongodb" }`). El esquema está profundamente estructurado y dividido en dominios claros que evitan el acoplamiento innecesario.

### Dominios Principales:

1.  **Inventario y Productos:**
    *   `Product`, `ProductVariant`, `Category`, `Subcategory`: Estructura jerárquica de catálogo. Los productos pueden tener variantes (ej. colores, capacidades) que manejan su propio stock y precios.
    *   `AttributeDefinition`, `CategoryAttribute`: Sistema dinámico de atributos para productos.
2.  **Ventas y Punto de Venta (POS):**
    *   `Sale`, `Order`, `OrderDetail`: Registro de ventas web/ecommerce.
    *   `POSSale`, `POSSaleDetail`: Ventas de sucursal física. Están estrictamente ligadas al flujo de caja (`CashRegisterSession`).
3.  **Flujo de Caja (Cash Register):**
    *   `CashRegisterSession`: Fundamental para la operativa. Controla aperturas y cierres de caja, diferencias y fondos para la siguiente sesión.
    *   `CashMovement`: Registro inmutable de ingresos, egresos, retiros manuales y ventas. Se bloquean (`isLocked = true`) al cerrar la sesión.
    *   `Expense`: Registro de gastos.
4.  **Servicio Técnico (Reparaciones):**
    *   `Service`: Modelo central para reparaciones, enlazado a clientes y dispositivos. Contiene estados del ciclo de vida (`INGRESADO`, `REPARADO`, etc.).
    *   **Matriz de Servicios (Fase 1):** `ServiceCategory`, `RepairType`, `BrandRepairCategory`, `RepairOption`. Separa estrictamente el catálogo de repuestos del catálogo de ventas.
5.  **Clientes (CRM) e Interacciones:**
    *   `Buyer`: Entidad central de cliente. Reemplaza gradualmente al viejo `Customer`.
    *   `CustomerDevice`: Dispositivos de los clientes para seguimiento de garantías y reparaciones.
    *   `ProductInteraction`, `BrowsingEvent`, `Feedback`: Analíticas de comportamiento del cliente en la plataforma.
6.  **Gestión de Stock:**
    *   `StockEntry`, `StockEntryItem`: Movimientos de ingreso de mercadería, afectando costos y unidades.

---

## 2. Estructura de Carpetas

La arquitectura sigue un patrón estándar de Express/Node.js, optimizado para la separación de responsabilidades:

```text
d:\Proyectos\modotecnoERP\adminMTapirest\
├── prisma/
│   ├── schema.prisma       # Definición central de la BD
│   ├── db/                 # Cliente Prisma generado
│   └── data/               # Scripts y datos de "seeding"
├── src/
│   ├── app.js              # Configuración principal de Express y Middlewares
│   ├── routes/             # Definición de rutas de la API (enrutador central en index.js)
│   ├── controllers/        # Lógica de negocio principal (fat controllers)
│   ├── middlewares/        # Lógica interceptora (autenticación, manejo de errores)
│   ├── utils/ & helpers/   # Funciones de apoyo, sanitización y manejo de respuestas
│   ├── services/           # Posible lógica externa o servicios de terceros
│   └── adapter/            # Adaptadores para integraciones externas
├── index.js                # Archivo obsoleto/comentado (entrypoint actual es src/app.js)
├── package.json            # Dependencias y scripts (start, dev, generate:db)
├── .env                    # Variables de entorno críticas
└── *.md                    # Documentación interna (DEPLOY, HYBRID_ENDPOINTS, STOCK)
```

---

## 3. Rutas de la API

El archivo `src/routes/index.js` actúa como el hub central. Destacan dos tipos de rutas:

*   **Rutas Híbridas (`/` -> `hybridRoutes`):**
    *   Son de **prioridad alta**. Sirven para optimizar consultas de solo lectura con estrategias de caché combinadas (Frontend React Query + Zustand).
*   **Rutas Tradicionales o de Dominio:**
    *   `/auth`: Autenticación y JWT.
    *   `/product`, `/category`, `/catalog`: Gestión de catálogo.
    *   `/pos-sales`, `/cash-register`, `/cashflow`, `/expense`: Ecosistema transaccional y financiero.
    *   `/service`, `/service-categories`, `/repair-types`: Flujo de reparaciones.
    *   `/stock-entry`: Control de inventario.
    *   `/customers`, `/providers`: Entidades de contacto.

---

## 4. Decisiones de Arquitectura

1.  **"Fat Controllers" sobre Capa de Servicios Abstracta:**
    *   De acuerdo a las reglas del proyecto (*"Controllers contain business logic"*), la lógica de negocio reside directamente en los controladores (ej. `productController.js`, `cashRegisterController.js`). Esto prioriza la previsibilidad y rapidez de desarrollo sobre una arquitectura exageradamente limpia o "Clean Code" puro.
2.  **Integridad Transaccional Prioritaria:**
    *   Toda mutación que afecta a Stock, Dinero o Ventas (ej. crear una Venta POS, ingresar stock) se maneja utilizando la api `$transaction` de Prisma. Esto asegura que si falla el descuento de stock, no se cree el movimiento de caja.
3.  **Separación de Dominios Estricta:**
    *   El módulo de **Ventas/Inventario** no se mezcla con el módulo de **Servicio Técnico**. Tienen jerarquías separadas (`Category` vs `ServiceCategory`). Un repuesto usado en servicio no es un producto de venta directa.
4.  **Validación Continua de Caja:**
    *   Cualquier operación financiera (una venta, un pago, un gasto) se bloquea a nivel backend si no existe una `CashRegisterSession` en estado `OPEN`.
5.  **Manejo de Moneda y Precisión:**
    *   Las transacciones monetarias del POS se almacenan en **centavos** (Enteros) para evitar problemas de precisión en coma flotante con JavaScript/MongoDB (`POSSale.monto_total`).
6.  **Estrategia Híbrida de Endpoints:**
    *   La existencia de controladores y rutas "híbridas" (`hybridProductController.js`, `hybridRoutes.js`) obedece a un patrón para sincronizar el backend de forma eficiente con stores globales del frontend, enviando payloads consolidados para evitar cascadas de requests.
