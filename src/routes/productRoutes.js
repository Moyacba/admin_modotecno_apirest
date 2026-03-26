// src/routes/productRoutes.js
import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  validateStock,
  getStockBatch,
  getProductsForBarcodes,
  checkBarcodeUnique,
  bulkUpdateBarcodes,
  searchProducts,
  getLowStockProducts,
  toggleAlertMark,
  bulkToggleAlertMark,
} from "../controllers/productController.js";

import {
  getProductVariants,
  getVariantById,
  createVariant,
  updateVariant,
  deleteVariant,
  searchVariants,
} from "../controllers/productVariantController.js";

const router = express.Router();

// ========================================
// RUTAS DE STOCK EN TIEMPO REAL
// ========================================
// IMPORTANTE: Estas rutas deben estar ANTES de las rutas con :id
router.post("/validate-stock", validateStock);
router.post("/stock-batch", getStockBatch);

// ========================================
// RUTAS DE GESTIÓN DE CÓDIGOS DE BARRAS
// ========================================
router.get("/barcodes", getProductsForBarcodes);
router.get("/barcodes/check", checkBarcodeUnique);
router.patch("/:id/toggle-alert-mark", toggleAlertMark);
router.patch("/low-stock/bulk-toggle-mark", bulkToggleAlertMark);
router.put("/barcodes/bulk", bulkUpdateBarcodes);

// ========================================
// RUTAS DE PRODUCTOS PRINCIPALES
// ========================================
router.get("/low-stock", getLowStockProducts);
router.get("/search", searchProducts);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

// Rutas de variantes de productos
router.get("/:productId/variants", getProductVariants);
router.post("/:productId/variants", createVariant);
router.get("/variants/search", searchVariants);
router.get("/variants/:id", getVariantById);
router.put("/variants/:id", updateVariant);
router.delete("/variants/:id", deleteVariant);

export default router;