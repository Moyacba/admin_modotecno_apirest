# Tipados y DTOs Globales (MODOTECNO ERP)

Este archivo sirve como referencia central para la construcción de **DTOs (Data Transfer Objects)** y la definición de interfaces de TypeScript tanto en el Frontend como en el Backend. Su objetivo es mantener un contrato estricto de datos, previniendo errores de integración entre dominios.

---

## 1. Enums Globales

```typescript
// Comportamiento E-commerce
export enum InteractionType { VIEW, ADD_TO_CART, REMOVE_FROM_CART, PURCHASE, WISHLIST, SEARCH }
export enum FeedbackType { ORDER, SERVICE, WEBSITE, PRODUCT, OTHER }
export enum CommunicationChannel { EMAIL, SMS, WHATSAPP, PHONE, PUSH_NOTIFICATION }
export enum CustomerSegment { VIP, FRECUENTE, OCASIONAL, NUEVO, INACTIVO }

// Flujo de Caja y Finanzas
export enum CashMovementType { INGRESO_MANUAL, RETIRO_MANUAL, GASTO, VENTA }
export enum SessionStatus { OPEN, CLOSED }

// Servicio Técnico
export enum DeviceStatus { FUNCIONANDO, CON_FALLAS, NO_ENCIENDE, PANTALLA_ROTA, BATERIA_DAÑADA, MOJADO, OTROS }
export enum RepairQuality { ORIGINAL, ALTERNATIVE }
```

---

## 2. Inventario y Catálogo

```typescript
export interface CategoryDTO {
  id: string;
  name: string;
  key?: string;
}

export interface SubcategoryDTO {
  id: string;
  name: string;
  categoryId: string;
  deviceCompatible: boolean;
}

export interface ProductVariantDTO {
  id: string;
  productId: string;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  
  // Atributos dinámicos
  color?: string;
  design?: string;
  size?: string;
  material?: string;
  attributes?: Record<string, any>;
  
  // Precios y Stock
  costPrice: number;
  salePrice: number;
  promoPrice?: number;
  stock: number;
  minStock: number;
  
  images: string[];
  isActive: boolean;
}

export interface ProductDTO {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  description: string;
  brand: string;
  provider: string;
  
  costPrice: number;
  salePrice: number;
  promoPrice: number;
  stock: number;
  minStock: number;
  
  images: string[];
  attributes?: Record<string, any>;
  hasVariants: boolean;
  
  categoryId?: string;
  subcategoryId?: string;
  
  // Relaciones anidadas opcionales (Populated)
  variants?: ProductVariantDTO[];
}
```

---

## 3. Ventas y E-commerce (Órdenes)

```typescript
// CRÍTICO: Los montos monetarios en Ventas (monto_total, subtotal) DEBEN ser enteros (Centavos).

export interface OrderDetailDTO {
  id: string;
  orderId: string;
  productoId: string;
  productoName: string;
  cantidad: number;
  precio_unitario_al_momento_de_compra: number; // Centavos
}

export interface OrderDTO {
  id: string;
  buyerId: string;
  
  // Fechas
  fecha_creacion: Date;
  fecha_pagado?: Date;
  fecha_enviado?: Date;
  fecha_entregado?: Date;
  
  // Montos y Pagos (En Centavos)
  monto_total: number;
  subtotal?: number;
  descuento_aplicado: number;
  costo_envio: number;
  
  estado: "PENDIENTE_PAGO" | "PAGADO" | "ENVIADO" | "COMPLETADO" | "CANCELADO";
  metodo_pago: string;
  id_transaccion_pasarela?: string;
  
  info_envio?: Record<string, any>;
  canal_venta: string; // Ej: "ECOMMERCE"
  
  detalles?: OrderDetailDTO[];
}

export interface POSSaleDTO {
  id: string;
  buyerId: string;
  cashRegisterSessionId?: string;
  
  fecha_creacion: Date;
  monto_total: number; // Centavos
  descuento: number; // Centavos
  estado: string; // "COMPLETADO"
  metodo_pago?: Array<{ method: string; amount: number }>;
  
  detalles?: Array<{
    productoId: string;
    productoName: string;
    cantidad: number;
    precio_unitario_al_momento_de_compra: number; // Centavos
  }>;
}
```

---

## 4. Matriz de Servicios Técnicos y Reparaciones

```typescript
export interface ServiceCategoryDTO {
  id: string;
  name: string; // Ej: "Celular"
  slug: string;
  icon?: string;
}

export interface BrandRepairDTO {
  id: string;
  name: string; // Ej: "Motorola"
}

export interface ModelRepairDTO {
  id: string;
  name: string; // Ej: "Moto G52"
  brandId: string;
}

export interface RepairTypeDTO {
  id: string;
  name: string; // Ej: "Cambio de batería"
  categoryId: string;
  icon?: string;
}

export interface RepairOptionDTO {
  id: string;
  modelId: string;
  repairTypeId: string;
  quality: RepairQuality;
  price: number; // Precio de venta (ARS - Float)
  cost?: number; // Costo repuesto
  isActive: boolean;
}

// Servicio Técnico Concreto (La boleta o turno)
export interface ServiceDTO {
  id: string;
  buyerId?: string;
  customerDeviceId?: string;
  
  state: "INGRESADO" | "EN_DIAGNOSTICO" | "PRESUPUESTADO" | "APROBADO" | "EN_REPARACION" | "REPARADO" | "ENTREGADO" | "SIN_ARREGLO" | "RECHAZADO";
  
  diagnostico?: string;
  estado_dispositivo_al_ingresar?: DeviceStatus;
  repair: string;
  
  total: number; // En este dominio se aceptan Floats tradicionales
  discount?: number;
  
  date: Date;
  dateOut?: Date;
  
  isWarranty: boolean;
  
  // Referencias a la matriz
  serviceCategoryId?: string;
  brandRepairId?: string;
  modelRepairId?: string;
  repairTypeId?: string;
  repairOptionId?: string;
}
```

---

## 5. Clientes y CRM

```typescript
export interface BuyerDTO {
  id: string;
  nombre: string;
  apellido?: string;
  email: string;
  dni?: string;
  cuit?: string;
  telefono?: string;
  whatsapp?: string;
  direccion: string;
  
  segment: CustomerSegment;
  tags: string[];
}

export interface CustomerDeviceDTO {
  id: string;
  buyerId: string;
  marca: string;
  modelo: string;
  numero_serie?: string;
  imei?: string;
  
  tiene_garantia: boolean;
  is_active: boolean;
}

export interface CommunicationPreferencesDTO {
  buyerId: string;
  email_marketing: boolean;
  email_transaccional: boolean;
  whatsapp_marketing: boolean;
  whatsapp_transaccional: boolean;
  preferred_channel: CommunicationChannel;
}
```

---

## 6. Caja y Stock (Finanzas Operativas)

```typescript
export interface CashRegisterSessionDTO {
  id: string;
  openedAt: Date;
  closedAt?: Date;
  
  initialCash: number;
  expectedInitialCash?: number;
  finalCashCalculated?: number;
  finalCashCounted?: number;
  difference?: number;
  
  status: SessionStatus;
  openedBy?: string;
}

export interface CashMovementDTO {
  id: string;
  cashRegisterSessionId: string;
  type: CashMovementType;
  category?: string;
  paymentMethod?: string;
  amount: number;
  description: string;
  date: Date;
  isLocked: boolean;
}

export interface StockEntryItemDTO {
  id: string;
  stockEntryId: string;
  productId: string;
  isVariant: boolean;
  productName: string;
  sku: string;
  quantity: number;
  costPrice?: number;
}

export interface StockEntryDTO {
  id: string;
  createdAt: Date;
  provider?: string;
  totalCost?: number;
  totalUnits?: number;
  items?: StockEntryItemDTO[];
}
```
