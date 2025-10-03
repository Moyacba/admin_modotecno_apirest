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
} from "../controllers/productController.js ";

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
// RUTAS DE STOCK EN TIEMPO REAL (NUEVAS)
// ========================================
// IMPORTANTE: Estas rutas deben estar ANTES de las rutas con :id
// para evitar que Express las confunda con parámetros dinámicos
router.post("/validate-stock", validateStock);
router.post("/stock-batch", getStockBatch);

// ========================================
// RUTAS DE PRODUCTOS PRINCIPALES
// ========================================
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