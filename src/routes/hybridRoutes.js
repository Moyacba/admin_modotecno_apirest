import express from "express";
import {
  // Productos híbridos
  getProductsStatic,
  getProductsDynamic,
  getProductStaticById,
  getProductDynamicById,
  updateProductStock,
  updateProductPrices,
  updateProductStatus,
  batchUpdateProductsStock
} from "../controllers/hybridProductController.js";

import {
  // Servicios híbridos
  getServicesStatic,
  getServicesDynamic,
  getServiceStaticById,
  getServiceDynamicById,
  updateServiceStatus,
  updateServicePayments,
  updateServiceDiagnostic,
  searchServicesByDevice,
  getServiceStats
} from "../controllers/hybridServiceController.js";

import {
  // Clientes híbridos
  getCustomersStatic,
  getCustomersDynamic,
  getCustomerStaticById,
  getCustomerDynamicById,
  updateCustomerCredit,
  updateCustomerAddresses,
  updateCustomerPreferences,
  updateCustomerSegment,
  searchCustomersForSale,
  getCustomerDevices,
  createCustomerDevice,
  getCustomerPurchases,
  getCustomerServices
} from "../controllers/hybridCustomerController.js";

import {
  // Órdenes híbridas
  getOrdersStatic,
  getOrdersDynamic,
  getOrderStaticById,
  getOrderDynamicById,
  updateOrderStatus,
  updatePOSOrderStatus,
  searchUnifiedOrders,
  getOrderStats
} from "../controllers/hybridOrderController.js";

import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

// ====== RUTAS PARA PRODUCTOS HÍBRIDOS ======

// Datos estáticos de productos (cache largo)
router.get("/product/static", getProductsStatic);
router.get("/product/:id/static", getProductStaticById);

// Datos dinámicos de productos (cache corto + polling)
router.get("/product/dynamic", getProductsDynamic);
router.get("/product/:id/dynamic", getProductDynamicById);

// Actualizaciones específicas de productos
router.patch("/product/:id/stock", requireAuth, updateProductStock);
router.patch("/product/:id/prices", requireAuth, updateProductPrices);
router.patch("/product/:id/status", requireAuth, updateProductStatus);

// Actualizaciones batch
router.patch("/product/batch/stock", requireAuth, batchUpdateProductsStock);

// ====== RUTAS PARA SERVICIOS HÍBRIDOS ======

// Datos estáticos de servicios (cache largo)
router.get("/service/static", getServicesStatic);
router.get("/service/:id/static", getServiceStaticById);

// Datos dinámicos de servicios (cache corto + polling)
router.get("/service/dynamic", getServicesDynamic);
router.get("/service/:id/dynamic", getServiceDynamicById);

// Actualizaciones específicas de servicios
router.patch("/service/:id/status", requireAuth, updateServiceStatus);
router.patch("/service/:id/payments", requireAuth, updateServicePayments);
router.patch("/service/:id/diagnostic", requireAuth, updateServiceDiagnostic);

// Búsqueda y estadísticas
router.get("/service/search/device", searchServicesByDevice);
router.get("/service/stats", getServiceStats);

// ====== RUTAS PARA CLIENTES HÍBRIDOS ======

// Datos estáticos de clientes (cache largo)
router.get("/customers/static", getCustomersStatic);
router.get("/customers/:id/static", getCustomerStaticById);

// Datos dinámicos de clientes (cache corto + polling)
router.get("/customers/dynamic", getCustomersDynamic);
router.get("/customers/:id/dynamic", getCustomerDynamicById);

// Actualizaciones específicas de clientes
router.patch("/customers/:id/credit", requireAuth, updateCustomerCredit);
router.patch("/customers/:id/addresses", requireAuth, updateCustomerAddresses);
router.patch("/customers/:id/preferences", requireAuth, updateCustomerPreferences);
router.patch("/customers/:id/segment", requireAuth, updateCustomerSegment);

// Búsqueda específica para POS/Ventas
router.get("/customers/search/sale", searchCustomersForSale);

// Relaciones con otras entidades
router.get("/customers/:id/devices", getCustomerDevices);
router.post("/customers/:id/devices", requireAuth, createCustomerDevice);
router.get("/customers/:id/purchases", getCustomerPurchases);
router.get("/customers/:id/services", getCustomerServices);

// ====== RUTAS PARA ÓRDENES HÍBRIDAS ======

// Datos estáticos de órdenes (cache largo)
router.get("/order/static", getOrdersStatic);
router.get("/order/:id/static", getOrderStaticById);

// Datos dinámicos de órdenes (cache corto + polling)
router.get("/order/dynamic", getOrdersDynamic);
router.get("/order/:id/dynamic", getOrderDynamicById);

// Actualizaciones específicas de órdenes
router.patch("/order/:id/status", requireAuth, updateOrderStatus);
router.patch("/pos-order/:id/status", requireAuth, updatePOSOrderStatus);

// Búsqueda unificada (online + POS)
router.get("/order/search/:id", searchUnifiedOrders);

// Estadísticas
router.get("/order/stats", getOrderStats);

// ====== RUTAS DE SALUD Y MONITOREO ======

// Health check específico para endpoints híbridos
router.get("/hybrid/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    hybridEndpoints: {
      products: "✓ Available",
      services: "✓ Available", 
      customers: "✓ Available",
      orders: "✓ Available"
    },
    cacheStrategy: "Static (30min) + Dynamic (30sec) + Polling",
    version: "1.0.0"
  });
});

// Información sobre endpoints disponibles
router.get("/hybrid/endpoints", (req, res) => {
  res.json({
    products: {
      static: [
        "GET /api/product/static",
        "GET /api/product/:id/static"
      ],
      dynamic: [
        "GET /api/product/dynamic", 
        "GET /api/product/:id/dynamic"
      ],
      mutations: [
        "PATCH /api/product/:id/stock",
        "PATCH /api/product/:id/prices",
        "PATCH /api/product/:id/status",
        "PATCH /api/product/batch/stock"
      ]
    },
    services: {
      static: [
        "GET /api/service/static",
        "GET /api/service/:id/static"
      ],
      dynamic: [
        "GET /api/service/dynamic",
        "GET /api/service/:id/dynamic"
      ],
      mutations: [
        "PATCH /api/service/:id/status",
        "PATCH /api/service/:id/payments",
        "PATCH /api/service/:id/diagnostic"
      ],
      utils: [
        "GET /api/service/search/device",
        "GET /api/service/stats"
      ]
    },
    customers: {
      static: [
        "GET /api/customers/static",
        "GET /api/customers/:id/static"
      ],
      dynamic: [
        "GET /api/customers/dynamic",
        "GET /api/customers/:id/dynamic"
      ],
      mutations: [
        "PATCH /api/customers/:id/credit",
        "PATCH /api/customers/:id/addresses",
        "PATCH /api/customers/:id/preferences",
        "PATCH /api/customers/:id/segment"
      ],
      utils: [
        "GET /api/customers/search/sale",
        "GET /api/customers/:id/devices",
        "POST /api/customers/:id/devices",
        "GET /api/customers/:id/purchases",
        "GET /api/customers/:id/services"
      ]
    },
    orders: {
      static: [
        "GET /api/order/static",
        "GET /api/order/:id/static"
      ],
      dynamic: [
        "GET /api/order/dynamic",
        "GET /api/order/:id/dynamic"
      ],
      mutations: [
        "PATCH /api/order/:id/status",
        "PATCH /api/pos-order/:id/status"
      ],
      utils: [
        "GET /api/order/search/:id",
        "GET /api/order/stats"
      ]
    },
    cacheRecommendations: {
      static: "Cache for 30 minutes",
      dynamic: "Cache for 30 seconds with polling",
      mutations: "Invalidate related caches immediately"
    }
  });
});

export default router;
