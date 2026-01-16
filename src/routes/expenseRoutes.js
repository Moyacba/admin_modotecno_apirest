// src/routes/expenseRoutes.js
import express from "express";
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController.js";

const router = express.Router();

// Obtener todos los gastos
router.get("/", getExpenses);

// Obtener un gasto por ID
router.get("/:id", getExpenseById);

// Crear un nuevo gasto
// Crear un nuevo gasto
import { upload } from "../controllers/cloudinaryController.js";
router.post("/", upload.single("ticket"), createExpense);

// Actualizar un gasto
router.put("/:id", updateExpense);

// Eliminar un gasto
router.delete("/:id", deleteExpense);

export default router;
