// src/routes/customerRoutes.js
import express from "express";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
} from "../controllers/customerController.js";

const router = express.Router();

// Buscar clientes (debe ir antes de /:id para evitar conflictos)
router.get("/search", searchCustomers);

// Obtener todos los clientes
router.get("/", getCustomers);

// Obtener un cliente por ID
router.get("/:id", getCustomerById);

// Crear un nuevo cliente
router.post("/", createCustomer);

// Actualizar un cliente
router.put("/:id", updateCustomer);

// Eliminar un cliente
router.delete("/:id", deleteCustomer);

export default router;
