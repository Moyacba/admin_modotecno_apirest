# Database Schema Context — adminMTapirest

> **Purpose:** Reference document for AI agents working on this codebase.
> **Database:** MongoDB via Prisma ORM
> **Last updated:** May 2026

---

## Connection

- **Provider:** MongoDB (`mongodb+srv://...`)
- **Prisma Client output:** `./db` (imported as `@prisma/client` → `../../prisma/db`)
- **Binary targets:** `native`, `debian-openssl-3.0.x`

---

## Enums

| Enum | Values | Used By |
|------|--------|---------|
| `InteractionType` | `VIEW`, `ADD_TO_CART`, `REMOVE_FROM_CART`, `PURCHASE`, `WISHLIST`, `SEARCH` | `ProductInteraction.tipo` |
| `FeedbackType` | `ORDER`, `SERVICE`, `WEBSITE`, `PRODUCT`, `OTHER` | `Feedback.tipo` |
| `CommunicationChannel` | `EMAIL`, `SMS`, `WHATSAPP`, `PHONE`, `PUSH_NOTIFICATION` | `CommunicationPreferences.preferred_channel` |
| `DeviceStatus` | `FUNCIONANDO`, `CON_FALLAS`, `NO_ENCIENDE`, `PANTALLA_ROTA`, `BATERIA_DAÑADA`, `MOJADO`, `OTROS` | `Service.estado_dispositivo_al_ingresar` |
| `CustomerSegment` | `VIP`, `FRECUENTE`, `OCASIONAL`, `NUEVO`, `INACTIVO` | `Buyer.segment` |
| `CashMovementType` | `INGRESO_MANUAL`, `RETIRO_MANUAL`, `GASTO`, `VENTA` | `CashMovement.type` |
| `SessionStatus` | `OPEN`, `CLOSED` | `CashRegisterSession.status` |
| `RepairQuality` | `ORIGINAL`, `ALTERNATIVE` | `RepairOption.quality` |

---

## Models

### Product

Core product entity. Supports variants and compatibility mapping.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String @id @db.ObjectId` | Auto-generated |
| `barcode` | `String?` | |
| `sku` | `String` | Required |
| `name` | `String` | |
| `description` | `String` | |
| `brand` | `String` | |
| `provider` | `String` | |
| `costPrice` | `Float` | |
| `salePrice` | `Float` | |
| `promoPrice` | `Float` | |
| `percentPrice` | `Float` | |
| `stock` | `Int` | |
| `minStock` | `Int` | Default `0` |
| `images` | `String[]` | Array of URLs |
| `specifications` | `Json?` | |
| `attributes` | `Json?` | Consolidated attributes (inherited + specific) |
| `hasVariants` | `Boolean` | Default `false` |
| `categoryId` | `String? @db.ObjectId` | FK → Category |
| `subcategoryId` | `String? @db.ObjectId` | FK → Subcategory |
| `category` | `String?` | Legacy text field |
| `isAlertMarked` | `Boolean` | Default `false` |
| `lastCost` | `Float?` | Last purchase cost |
| `createdAt` | `DateTime` | Auto |
| `updatedAt` | `DateTime` | Auto |

**Relations:**
- `categoryRel` → Category (many-to-one)
- `subcategoryRel` → Subcategory (many-to-one)
- `variants` → ProductVariant[] (one-to-many, cascade delete)
- `compatibilities` → ProductCompatibility[] (one-to-many)

---

### ProductVariant

Variant of a parent Product (e.g., color/size combos).

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String @id @db.ObjectId` | |
| `productId` | `String @db.ObjectId` | FK → Product |
| `barcode` | `String?` | |
| `sku` | `String` | |
| `name` | `String` | e.g. "Funda Silicone Case Rosa" |
| `description` | `String?` | |
| `color` | `String?` | |
| `design` | `String?` | |
| `size` | `String?` | |
| `material` | `String?` | |
| `costPrice` | `Float` | |
| `salePrice` | `Float` | |
| `promoPrice` | `Float?` | |
| `percentPrice` | `Float?` | |
| `stock` | `Int` | |
| `minStock` | `Int` | Default `0` |
| `images` | `String[]` | |
| `specifications` | `Json?` | |
| `attributes` | `Json?` | Variant-specific attributes |
| `isActive` | `Boolean` | Default `true` |
| `isAlertMarked` | `Boolean` | Default `false` |
| `lastCost` | `Float?` | |

**Relations:**
- `product` → Product (many-to-one, cascade delete)

---

### Category → Subcategory → AttributeDefinition (Catalog Hierarchy)

**Category**
| Field | Type | Notes |
|-------|------|-------|
| `id` | `String @id @db.ObjectId` | |
| `name` | `String @unique` | |
| `key` | `String? @unique` | Stable seeding key |

Relations: `attributes` → CategoryAttribute[], `subcategories` → Subcategory[], `products` → Product[]

**Subcategory**
| Field | Type | Notes |
|-------|------|-------|
| `id` | `String @id @db.ObjectId` | |
| `name` | `String @unique` | |
| `key` | `String? @unique` | |
| `categoryId` | `String @db.ObjectId` | FK → Category |
| `deviceCompatible` | `Boolean` | Default `false` |

Relations: `attributes` → SubcategoryAttribute[], `products` → Product[], `recommendationRules` (source/target) → RecommendationRule[]

**AttributeDefinition**
| Field | Type | Notes |
|-------|------|-------|
| `id` | `String @id @db.ObjectId` | |
| `name` | `String @unique` | |
| `key` | `String? @unique` | |
| `type` | `String` | `select`, `multiselect`, `boolean`, `number` |
| `options` | `String[]` | For select/multiselect types |

**CategoryAttribute** (join: Category ↔ AttributeDefinition)
| Field | Type | Notes |
|-------|------|-------|
| `categoryId` | `String @db.ObjectId` | FK → Category |
| `attributeId` | `String @db.ObjectId` | FK → AttributeDefinition |
| `required` | `Boolean` | Default `false` |
| `filterable` | `Boolean` | Default `true` |
| `position` | `Int` | Default `0` |

**SubcategoryAttribute** (join: Subcategory ↔ AttributeDefinition)
Same structure as CategoryAttribute but linked to Subcategory.

---

### DeviceBrand / DeviceModel / ProductCompatibility

**DeviceBrand**
| Field | Type |
|-------|------|
| `id` | `String @id @db.ObjectId` |
| `name` | `String @unique` |

Relations: `models` → DeviceModel[]

**DeviceModel**
| Field | Type | Notes |
|-------|------|-------|
| `id` | `String @db.ObjectId` | |
| `name` | `String` | |
| `brandId` | `String @db.ObjectId` | FK → DeviceBrand |

Relations: `compatibilities` → ProductCompatibility[]

**ProductCompatibility** (join: Product ↔ DeviceModel)
| Field | Type |
|-------|------|
| `productId` | `String @db.ObjectId` |
| `deviceModelId` | `String @db.ObjectId` |

---

### RecommendationRule

Links a source Subcategory to a target Subcategory for cross-selling.

| Field | Type | Notes |
|-------|------|-------|
| `sourceSubcategoryId` | `String @db.ObjectId` | |
| `targetSubcategoryId` | `String @db.ObjectId` | |
| `ruleType` | `String` | `attributeMatch`, `deviceMatch`, `categoryCrossSell` |
| `matchAttributes` | `Json?` | Array of attribute name strings |

---

### Customer (Legacy)

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String @id @db.ObjectId` | |
| `firstName` | `String` | |
| `lastName` | `String` | |
| `email` | `String @unique` | |
| `password` | `String` | |
| `address` | `Json` | |
| `phone` | `String` | |
| `purchaseHistory` | `String[]` | |
| `serviceHistory` | `String[]` | |

> **Note:** New code should use `Buyer` instead of `Customer`.

---

### Buyer (Extended Customer Model)

Rich customer profile with marketing, segmentation, devices, and interaction tracking.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String @id @db.ObjectId` | |
| `nombre` | `String` | |
| `apellido` | `String?` | |
| `email` | `String @unique` | |
| `dni` | `String?` | |
| `cuit` | `String?` | CUIT/CUIL |
| `telefono` | `String?` | |
| `whatsapp` | `String?` | |
| `fecha_nacimiento` | `DateTime?` | |
| `direccion` | `String` | |
| `acquisition_channel` | `String?` | e.g. "google_ads", "referido" |
| `utm_source/medium/campaign/content/term` | `String?` | UTM tracking |
| `segment` | `CustomerSegment` | Default `NUEVO` |
| `tags` | `String[]` | Custom tags |
| `last_interaction` | `DateTime?` | |

**Relations:**
- `communication_preferences` → CommunicationPreferences (1-to-1)
- `orders` → Order[]
- `posSales` → POSSale[]
- `devices` → CustomerDevice[]
- `interactions` → ProductInteraction[]
- `browsingEvents` → BrowsingEvent[]
- `feedback` → Feedback[]
- `services` → Service[] (via "CustomerServices")

---

### CommunicationPreferences

| Field | Type | Default |
|-------|------|---------|
| `buyerId` | `String @unique @db.ObjectId` | FK → Buyer |
| `email_marketing` | `Boolean` | `true` |
| `email_transaccional` | `Boolean` | `true` |
| `sms_marketing` | `Boolean` | `false` |
| `sms_transaccional` | `Boolean` | `true` |
| `whatsapp_marketing` | `Boolean` | `true` |
| `whatsapp_transaccional` | `Boolean` | `true` |
| `llamadas_comerciales` | `Boolean` | `false` |
| `preferred_channel` | `CommunicationChannel` | `EMAIL` |
| `best_contact_time` | `String?` | e.g. "mañana" |

---

### CustomerDevice

Device registered by a Buyer for service/repair tracking.

| Field | Type | Notes |
|-------|------|-------|
| `buyerId` | `String @db.ObjectId` | FK → Buyer |
| `marca/modelo/numero_serie/imei/color/capacidad` | Various | Device specs |
| `fecha_compra` / `lugar_compra` / `precio_compra` | Various | Purchase info |
| `tiene_garantia` | `Boolean` | Default `false` |
| `garantia_hasta` | `DateTime?` | Warranty expiry |
| `is_active` | `Boolean` | Default `true` |

**Relations:** `services` → Service[] (via "DeviceServices")

---

### ProductInteraction / BrowsingEvent / Feedback

**ProductInteraction** — tracks buyer interactions (views, cart, wishlist, etc.)
| Field | Type | Notes |
|-------|------|-------|
| `buyerId` | `String @db.ObjectId` | |
| `productoId/productoName` | Various | Denormalized product ref |
| `tipo` | `InteractionType` | |
| `quantity` | `Int?` | |
| `price_at_interaction` | `Float?` | |

**BrowsingEvent** — page visit tracking
| Field | Type | Notes |
|-------|------|-------|
| `buyerId` | `String? @db.ObjectId` | Nullable (anonymous) |
| `session_id/page_url/page_title` | Various | |
| `time_spent` | `Int?` | Seconds on page |
| `device_type` | `String?` | mobile/desktop/tablet |

**Feedback** — ratings and comments
| Field | Type | Notes |
|-------|------|-------|
| `buyerId` | `String @db.ObjectId` | |
| `tipo` | `FeedbackType` | |
| `rating` | `Int?` | 1-5 stars |
| `comentario` | `String?` | |
| `respuesta/respondido_por/fecha_respuesta` | Various | Admin response |

---

### Order → OrderDetail

**Order** — e-commerce purchase order
| Field | Type | Notes |
|-------|------|-------|
| `buyerId` | `String @db.ObjectId` | FK → Buyer |
| `fecha_creacion/pagado/enviado/entregado` | `DateTime?` | Status timeline |
| `monto_total` | `Int` | **In cents** |
| `subtotal/descuento_aplicado/costo_envio` | Various | |
| `estado` | `String` | `PENDIENTE_PAGO`, `PAGADO`, `ENVIADO`, `COMPLETADO`, `CANCELADO` |
| `metodo_pago` | `String` | |
| `id_transaccion_pasarela` | `String?` | Payment gateway ID |
| `info_envio/provincia/codigo_postal/tiempo_estimado_envio` | Various | Shipping |
| `canal_venta` | `String` | Default `"ECOMMERCE"` |
| `utm_*` fields | `String?` | Marketing attribution |
| `session_id/device_type/user_agent/ip_address` | Various | Tech tracking |
| `tiempo_desde_primer_producto_agregado` | `Int?` | Seconds |
| `abandono_carrito_previo` | `Boolean` | Default `false` |

**OrderDetail**
| Field | Type | Notes |
|-------|------|-------|
| `orderId` | `String @db.ObjectId` | FK → Order |
| `productoId/productoName` | Various | Denormalized |
| `cantidad` | `Int` | |
| `precio_unitario_al_momento_de_compra` | `Int` | **In cents** |

---

### POSSale → POSSaleDetail

**POSSale** — point-of-sale transaction (in-store)
| Field | Type | Notes |
|-------|------|-------|
| `buyerId` | `String @db.ObjectId` | FK → Buyer |
| `fecha_creacion` | `DateTime` | Auto |
| `monto_total` | `Int` | **In cents** |
| `descuento` | `Int` | **In cents** |
| `estado` | `String` | e.g. `"COMPLETADO"` |
| `metodo_pago` | `Json?` | Array of `{method, amount}` |
| `cashRegisterSessionId` | `String? @db.ObjectId` | FK → CashRegisterSession |

**POSSaleDetail**
| Field | Type | Notes |
|-------|------|-------|
| `posSaleId` | `String @db.ObjectId` | FK → POSSale |
| `productoId/productoName` | Various | Denormalized |
| `cantidad` | `Int` | |
| `precio_unitario_al_momento_de_compra` | `Int` | **In cents** |

---

### Service (Technical Repair Service)

| Field | Type | Notes |
|-------|------|-------|
| `buyerId` | `String? @db.ObjectId` | FK → Buyer (nullable) |
| `customerDeviceId` | `String? @db.ObjectId` | FK → CustomerDevice |
| `device` | `Json` | Device info (legacy) |
| `client` | `Json` | Client info (legacy) |
| `state` | `String` | `INGRESADO`, `EN_DIAGNOSTICO`, `PRESUPUESTADO`, etc. |
| `diagnostico` | `String?` | |
| `estado_dispositivo_al_ingresar` | `DeviceStatus?` | |
| `observaciones` | `String?` | |
| `repair` | `String` | Repair description |
| `piezas` | `Json?` | Array of parts with prices |
| `total` | `Float` | |
| `discount` | `Float?` | |
| `date` | `DateTime` | Admission date |
| `dateOut` | `DateTime?` | Delivery date |
| `fecha_presupuesto/fecha_aprobacion` | `DateTime?` | |
| `garantia_hasta/observaciones_garantia` | Various | Warranty |
| `warrantyReturnDate/warrantyReturnReason` | Various | Warranty re-entry |
| `payments` | `Json?` | |
| `defectId` | `String? @db.ObjectId` | FK → ServiceDefect |
| `additionalDetails` | `Json?` | Flexible key-value |
| `privateNotes` | `String?` | Not on ticket |
| `isWarranty` | `Boolean` | Default `false` |
| **Relational matrix fields (Fase 1, nullable):** | | |
| `serviceCategoryId` | `String? @db.ObjectId` | FK → ServiceCategory |
| `brandRepairId` | `String? @db.ObjectId` | FK → BrandRepair |
| `modelRepairId` | `String? @db.ObjectId` | FK → ModelRepair |
| `repairTypeId` | `String? @db.ObjectId` | FK → RepairType |
| `repairOptionId` | `String? @db.ObjectId` | FK → RepairOption |

---

### CashRegisterSession → CashMovement

**CashRegisterSession** — daily cash drawer session
| Field | Type | Notes |
|-------|------|-------|
| `initialCash` | `Float` | Physical opening amount |
| `expectedInitialCash` | `Float?` | Amount left from previous session |
| `finalCashCalculated/finalCashCounted/difference` | `Float?` | Closing snapshot |
| `nextSessionFund/withdrawalAmount` | `Float?` | Cash management |
| `totalCashSales/totalCard/totalDigital/totalExpenses/totalCollected` | `Float?` | Summaries |
| `totalManualIncome/totalManualWithdrawal` | `Float?` | Manual adjustments |
| `status` | `SessionStatus` | `OPEN` / `CLOSED` |
| `openedBy/closedBy` | `String?` | User tracking |
| `observations` | `String?` | |

**CashMovement** — individual cash movements within a session
| Field | Type | Notes |
|-------|------|-------|
| `cashRegisterSessionId` | `String @db.ObjectId` | FK → CashRegisterSession |
| `type` | `CashMovementType` | |
| `category` | `String?` | `VENTA`, `SERVICIO`, `GASTO`, `RETIRO`, `APORTE` |
| `paymentMethod` | `String?` | Default `"CASH"`. `CASH`, `DEBITO`, `CREDITO`, `QR`, `TRANSFERENCIA`, `GOCUOTAS` |
| `amount` | `Float` | |
| `description` | `String` | |
| `userId` | `String?` | |
| `isLocked` | `Boolean` | Default `false`. Becomes `true` on session close |

---

### Sale (Legacy POS/Web Sale)

| Field | Type | Notes |
|-------|------|-------|
| `customerId` | `String` | |
| `details` | `String` | |
| `date` | `DateTime` | |
| `products` | `Json` | |
| `total` | `Float` | |
| `discount` | `Float` | |
| `payments` | `Json?` | |
| `cashRegisterSessionId` | `String? @db.ObjectId` | FK → CashRegisterSession |

---

### Expense

| Field | Type | Notes |
|-------|------|-------|
| `product` | `String` | |
| `details` | `String?` | |
| `amount` | `Float` | |
| `method` | `String?` | |
| `date` | `DateTime` | |
| `category/categoryId` | `String?/Int?` | |
| `provider` | `String?` | |
| `ticketUrl` | `String?` | |
| `cashRegisterSessionId` | `String? @db.ObjectId` | FK → CashRegisterSession |

---

### StockEntry → StockEntryItem

**StockEntry** — purchase/receiving record
| Field | Type | Notes |
|-------|------|-------|
| `observations` | `String?` | |
| `provider` | `String?` | |
| `paymentMethod` | `String?` | `efectivo`, `transferencia`, `tarjeta`, `cuenta_corriente` |
| `userId` | `String?` | Who registered |
| `totalCost` | `Float?` | Total ARS |
| `totalUnits` | `Int?` | Total quantity |
| `exchangeRateUSD` | `Float?` | USD exchange rate |

**StockEntryItem** — line item within a StockEntry
| Field | Type | Notes |
|-------|------|-------|
| `stockEntryId` | `String @db.ObjectId` | FK → StockEntry |
| `productId` | `String @db.ObjectId` | |
| `isVariant` | `Boolean` | Default `false` |
| `productName/sku` | `String` | Denormalized |
| `quantity` | `Int` | |
| `costPrice` | `Float?` | |
| `salePriceAtMoment` | `Float?` | Sale price at entry time |
| `categoryId/categoryName` | `String?` | Denormalized |
| `profitMargin` | `Float?` | `((salePrice - costPrice) / salePrice) * 100` |

---

### Provider

| Field | Type | Notes |
|-------|------|-------|
| `name` | `String @unique` | |
| `contact/phone/email/notes` | Various | |
| `isActive` | `Boolean` | Default `true` |

---

### User

| Field | Type | Notes |
|-------|------|-------|
| `username` | `String?` | |
| `name` | `String?` | |
| `email` | `String @unique` | |
| `password` | `String` | Hashed |
| `avatar` | `String?` | |
| `sucursal` | `String?` | Branch |

---

### FavoriteImage

| Field | Type | Notes |
|-------|------|-------|
| `url` | `String @unique` | |
| `createdAt` | `DateTime` | Auto |

---

### Composite Type: PaymentMethod

| Field | Type | Notes |
|-------|------|-------|
| `amount` | `Float` | |
| `method` | `String` | |

---

## Technical Service Matrix (Fase 1 — April 2026)

These models form the relational repair service catalog, linked to `Service` via nullable foreign keys.

### ServiceCategory
| Field | Type | Notes |
|-------|------|-------|
| `name` | `String @unique` | e.g. "Celular", "Notebook" |
| `slug` | `String @unique` | e.g. "celular" for legacy match |
| `icon` | `String?` | lucide-react icon name |
| `isActive` | `Boolean` | Default `true` |

**Relations:** `repairTypes` → RepairType[], `brandLinks` → BrandRepairCategory[], `models` → ModelRepair[], `services` → Service[]

### BrandRepair
| Field | Type | Notes |
|-------|------|-------|
| `name` | `String @unique` | e.g. "Motorola" |

**Relations:** `models` → ModelRepair[], `categoryLinks` → BrandRepairCategory[], `services` → Service[]

### BrandRepairCategory (join: BrandRepair ↔ ServiceCategory)
| Field | Type | Notes |
|-------|------|-------|
| `brandId` | `String @db.ObjectId` | FK → BrandRepair |
| `categoryId` | `String @db.ObjectId` | FK → ServiceCategory |

**Unique constraint:** `@@unique([brandId, categoryId])`

### ModelRepair
| Field | Type | Notes |
|-------|------|-------|
| `name` | `String` | e.g. "Moto G52" |
| `brandId` | `String @db.ObjectId` | FK → BrandRepair |
| `categoryId` | `String? @db.ObjectId` | FK → ServiceCategory (optional Fase 1/2) |

**Unique constraint:** `@@unique([name, brandId])`

**Relations:** `serviceCatalog` → ServiceCatalog[], `repairOptions` → RepairOption[], `services` → Service[]

### RepairType
| Field | Type | Notes |
|-------|------|-------|
| `name` | `String` | Canonical, e.g. "Cambio de batería" |
| `categoryId` | `String @db.ObjectId` | FK → ServiceCategory |
| `position` | `Int` | Visual order, default `0` |
| `icon` | `String?` | lucide-react icon name |
| `isActive` | `Boolean` | Default `true` |

**Unique constraint:** `@@unique([name, categoryId])`

**Relations:** `repairOptions` → RepairOption[], `services` → Service[]

### RepairOption
| Field | Type | Notes |
|-------|------|-------|
| `modelId` | `String @db.ObjectId` | FK → ModelRepair |
| `repairTypeId` | `String @db.ObjectId` | FK → RepairType |
| `quality` | `RepairQuality` | Default `ORIGINAL` |
| `price` | `Float` | Sale price to customer |
| `cost` | `Float?` | Part cost (for future margin analytics) |
| `isActive` | `Boolean` | Default `true` |

**Unique constraint:** `@@unique([modelId, repairTypeId, quality])`

**Relations:** `services` → Service[]

### ServiceCatalog (Legacy price list per model)
| Field | Type | Notes |
|-------|------|-------|
| `type` | `String` | e.g. "MODULO", "PIN", "BATERIA" |
| `price` | `Float` | |
| `modelId` | `String @db.ObjectId` | FK → ModelRepair |

**Index:** `@@index([type])`

### ServiceDefect
| Field | Type | Notes |
|-------|------|-------|
| `name` | `String` | e.g. "Cambio de Pantalla" |
| `categoryId` | `String @db.ObjectId` | |

**Unique constraint:** `@@unique([name, categoryId])`

### ServiceAttribute
| Field | Type | Notes |
|-------|------|-------|
| `label` | `String` | e.g. "¿Trae Cargador?" |
| `type` | `String` | Default `"CHECKBOX"`. `CHECKBOX`, `TEXT`, `SELECT` |
| `categoryId` | `String @db.ObjectId` | |
| `isActive` | `Boolean` | Default `true` |

**Unique constraint:** `@@unique([label, categoryId])`

---

## Key Relationships Summary

```
Category ──┬── Product ──┬── ProductVariant
            │             └── ProductCompatibility ── DeviceModel ── DeviceBrand
            └── CategoryAttribute ── AttributeDefinition
Subcategory ──┬── Product
               └── SubcategoryAttribute ── AttributeDefinition

Buyer ──┬── Order ──── OrderDetail
        ├── POSSale ── POSSaleDetail
        ├── CustomerDevice ── Service (device)
        ├── Service (direct)
        ├── ProductInteraction
        ├── BrowsingEvent
        └── CommunicationPreferences

Service ──┬── ServiceCategory
           ├── BrandRepair ── ModelRepair
           ├── RepairType ── RepairOption
           └── ServiceDefect (via defectId)

CashRegisterSession ──┬── CashMovement
                      ├── POSSale
                      ├── Expense
                      └── Sale

StockEntry ── StockEntryItem ── Product
```

---

## Important Conventions

1. **All IDs** are MongoDB ObjectIds stored as `String` with `@db.ObjectId`
2. **Money amounts** in `Order`, `POSSale`, `OrderDetail`, `POSSaleDetail` are stored **in cents** (Int). All other monetary fields use `Float`.
3. **JSON fields** (`products`, `payments`, `piezas`, `device`, `client`, `specifications`, `attributes`, `additionalDetails`, `info_envio`, `metodo_pago` on POSSale) are untyped — validate at application level.
4. **Denormalization** is common: `productoName`, `categoryName`, `productName` appear alongside IDs for read performance.
5. **Service relational fields** (`serviceCategoryId`, `brandRepairId`, `modelRepairId`, `repairTypeId`, `repairOptionId`) are **nullable** during Fase 1/2 and will become mandatory in Fase 4.
6. **Cascade deletes**: Product→ProductVariant, StockEntry→StockEntryItem, Buyer→CommunicationPreferences.
7. **SetNull on delete**: Buyer→BrowsingEvent, Service→Buyer/CustomerDevice (foreign keys become null).
8. **Customer vs Buyer**: `Customer` is the legacy model; `Buyer` is the enriched replacement with marketing/segmentation. New features should use `Buyer`.
9. **Indices**: Only explicit index is `@@index([status])` on `CashRegisterSession` and `@@index([type])` on `ServiceCatalog`.