// src/routes/saleRoutes.js
import express from "express";
import {
  getSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
} from "../controllers/saleController.js";

const router = express.Router();

// Obtener todas las ventas
router.get("/", getSales);

// Obtener una venta por ID
router.get("/:id", getSaleById);

// Crear una nueva venta
router.post("/checkout", createSale);

// Actualizar una venta
router.put("/:id", updateSale);

// Eliminar una venta
router.delete("/:id", deleteSale);

export default router;
