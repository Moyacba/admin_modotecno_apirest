import { Router } from "express";
import {
  getAllPOSSales,
  getPOSSaleById,
  createPOSSale,
  updatePOSSaleStatus,
  deletePOSSale,
} from "../controllers/posSalesController.js";

const router = Router();

// GET /api/pos-sales - Obtener todas las ventas POS
router.get("/", getAllPOSSales);

// GET /api/pos-sales/:id - Obtener venta POS por ID
router.get("/:id", getPOSSaleById);

// POST /api/pos-sales - Crear nueva venta POS
router.post("/", createPOSSale);

// PUT /api/pos-sales/:id/status - Actualizar estado de venta POS
router.put("/:id/status", updatePOSSaleStatus);

// DELETE /api/pos-sales/:id - Eliminar venta POS
router.delete("/:id", deletePOSSale);

export default router;
