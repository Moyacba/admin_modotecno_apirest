// src/routes/serviceRoutes.js
import express from "express";
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  deliveryService,
  getServiceByQuery,
  enterWarranty,
  getServiceCheckoutPrep,
} from "../controllers/serviceController.js";

const router = express.Router();

// Obtener todos los servicios
router.get("/", getServices);

// Buscar un servicio por producto, cliente o telefono
router.get("/query", getServiceByQuery);

// Preparar checkout para entrega en POS
router.get("/:id/checkout-prep", getServiceCheckoutPrep);

// Obtener un servicio por ID — debe ir después de las rutas estáticas
router.get("/:id", getServiceById);

// Crear un nuevo servicio
router.post("/", createService);

// Crear un nuevo servicio
router.post("/delivery/:id", deliveryService);
router.put("/delivery/:id", deliveryService);

// Registrar ingreso por garantía
router.put("/warranty/:id", enterWarranty);

// Actualizar un servicio
router.put("/:id", updateService);

// Eliminar un servicio
router.delete("/:id", deleteService);

export default router;
