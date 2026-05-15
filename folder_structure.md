# Estructura de Carpetas del Backend (MODOTECNO ERP)

A continuación se detalla la estructura completa de carpetas y archivos del proyecto backend, excluyendo los directorios generados por dependencias (`node_modules`), compilaciones de Prisma cliente (`db`, `dbOld`) y control de versiones (`.git`).

```text
d:\Proyectos\modotecnoERP\adminMTapirest\
│
├── .env                          # Variables de entorno
├── .env.example                  # Plantilla de variables de entorno
├── .gitignore                    # Reglas de exclusión de Git
├── DEPLOY.md                     # Documentación de despliegue
├── HYBRID_ENDPOINTS_READY.md     # Documentación de Endpoints Híbridos
├── README.md                     # Documentación principal del proyecto
├── STOCK_ENDPOINTS.md            # Documentación del módulo de stock
├── STOCK_IMPLEMENTATION_COMPLETE.md
├── Procfile                      # Configuración de arranque para Heroku/Railway
├── package.json                  # Dependencias y scripts de Node
├── pnpm-lock.yaml                # Lockfile de pnpm
├── index.js                      # Archivo base (obsoleto, reemplazado por src/app.js)
├── deploy.js                     # Script de despliegue
├── test-stock-endpoints.js       # Script de testeo para rutas de stock
├── clearCatalog.js               # Script utilitario
├── inspect-catalog.js            # Script utilitario
├── migrate-categories.cjs        # Script de migración
├── categories_master.JSON        # Archivo maestro de datos
├── LISTA MODOTECNO.xlsx          # Archivo excel de base
├── *.log / *.txt                 # Archivos de logs (error.log, out.log, etc.)
│
├── prisma/                       # Capa de Base de Datos (Prisma ORM)
│   ├── schema.prisma             # DEFINICIÓN PRINCIPAL DE LA BASE DE DATOS
│   ├── schemaOld.prisma          # Backup de esquema anterior
│   ├── seed.ts                   # Script principal de poblado de BD (Seeding)
│   ├── seedMatrices.js           # Script de seeding específico para Matriz de Servicios
│   ├── debugCats.js              # Script utilitario
│   └── data/                     
│       └── LISTA MODOTECNO.xlsx  # Backup/fuente de datos para migraciones
│
└── src/                          # CÓDIGO FUENTE DE LA APLICACIÓN
    ├── app.js                    # Entrypoint de Express.js y configuración de Middlewares globales
    │
    ├── adapter/                  # Adaptadores e integraciones
    │   ├── adapterController.js
    │   └── adapterRoutes.js
    │
    ├── controllers/              # LÓGICA DE NEGOCIO (Los "Fat Controllers")
    │   ├── authController.js
    │   ├── cashRegisterController.js # Flujo de Caja principal
    │   ├── cashflowController.js
    │   ├── catalogController.js
    │   ├── categoryController.js
    │   ├── cloudinaryController.js
    │   ├── customerController.js
    │   ├── expenseController.js
    │   ├── hybridCustomerController.js # Controladores Híbridos (Estático + Dinámico)
    │   ├── hybridOrderController.js
    │   ├── hybridProductController.js
    │   ├── hybridServiceController.js
    │   ├── orderController.js
    │   ├── posSalesController.js     # Ventas de mostrador
    │   ├── productController.js
    │   ├── productVariantController.js
    │   ├── providerController.js
    │   ├── repairCatalogController.js
    │   ├── repairOptionController.js # Matriz de Servicio
    │   ├── repairTypeController.js   # Matriz de Servicio
    │   ├── saleController.js
    │   ├── serviceCategoryController.js # Matriz de Servicio
    │   ├── serviceController.js      # Servicios Técnicos
    │   ├── serviceMatrixController.js
    │   ├── stockEntryController.js   # Entradas de Stock (Transaccional)
    │   └── userController.js
    │
    ├── helpers/                  # Funciones de ayuda específicas del dominio
    │   └── profitabilityHelper.js    # Cálculos de rentabilidad
    │
    ├── middlewares/              # Interceptores de peticiones
    │   ├── auth.js                   # Verificación de JWT
    │   └── checkCashLock.js          # Verifica que la caja esté abierta para transacciones
    │
    ├── routes/                   # DEFINICIÓN DE ENDPOINTS (API REST)
    │   ├── index.js                  # HUB DE RUTAS CENTRAL (combina todas las rutas)
    │   ├── hybridRoutes.js           # Rutas híbridas optimizadas (GET)
    │   ├── auth/
    │   │   └── authRoutes.js
    │   ├── cashRegisterRoutes.js
    │   ├── cashflowRoutes.js
    │   ├── catalogRoutes.js
    │   ├── categoryRoutes.js
    │   ├── cloudinaryRoutes.js
    │   ├── customerRoutes.js
    │   ├── expenseRoutes.js
    │   ├── orderRoutes.js
    │   ├── posSalesRoutes.js
    │   ├── productRoutes.js
    │   ├── protected.js
    │   ├── providerRoutes.js
    │   ├── repairCatalogRoutes.js
    │   ├── repairOptionRoutes.js
    │   ├── repairTypeRoutes.js
    │   ├── saleRoutes.js
    │   ├── serviceCategoryRoutes.js
    │   ├── serviceMatrixRoutes.js
    │   ├── serviceRoutes.js
    │   ├── stockEntryRoutes.js
    │   └── userRoutes.js
    │
    ├── scripts/                  # Scripts de mantenimiento y migración
    │   ├── _check.mjs
    │   ├── converted-data.json
    │   ├── fixBrandCategoryLinks.mjs
    │   ├── importRepairMatrix.js
    │   ├── migrateMissingCategories.js
    │   ├── migrateServicesToMatrix.js
    │   └── seedCatalog.js
    │
    ├── services/                 # Servicios externos y pasarelas
    │   ├── authService.js
    │   ├── catalogService.js
    │   ├── mercadoPagoService.js # Pasarela de pagos MP
    │   ├── paymentsManager.js
    │   ├── productService.js
    │   ├── providerService.js
    │   └── recommendationService.js
    │
    └── utils/                    # Utilidades generales
        ├── cloudinaryConfig.js   # Manejo de imágenes
        ├── handleErrors.js       # Manejo global de excepciones Express
        ├── orderValidation.js    # Validaciones de pedidos
        └── prisma.js             # Instancia singleton de Prisma Client
```
