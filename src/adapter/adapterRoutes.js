// src/routes/customerRoutes.js
import express from "express";
import {
  getOldProducts,
  getOldServiceByQuery,
  getOldServices,
} from "./adapterController.js";

const router = express.Router();

// Obtener todos los servicios
router.get("/oldservices", getOldServices);

// Buscar por device, client and phone1 and phone2
router.get("/oldservices/query", getOldServiceByQuery);

// Obtener todos los productos
router.get("/oldproducts", getOldProducts);

export default router;
