// src/routes/cashflowRoutes.js
import express from "express";
import {
  getCashflows,
  createCashflow,
  updateCashflow,
  closeCashflow,
  getCashflowActive,
  addPayment,
} from "../controllers/cashflowController.js";

const router = express.Router();

// Obtener todos los cashflows
router.get("/", getCashflows);

// Obtener un cashflow por ID
router.get("/active", getCashflowActive);

// Crear un nuevo cashflow
router.post("/", createCashflow);

//Agregar pagos a cashflow
router.post("/:id", addPayment);

// Actualizar un cashflow
router.put("/:id", updateCashflow);

// Eliminar un cashflow
router.post("/close/:id", closeCashflow);

export default router;
