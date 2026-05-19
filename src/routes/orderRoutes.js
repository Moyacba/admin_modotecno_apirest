import express from "express";
import { createOrder, mercadoPagoWebhook, getOrderStatus, getAllOrders, updateOrderStatus, cancelOrder } from "../controllers/orderController.js";

const router = express.Router();

// Obtener todas las órdenes
router.get("/getAllOrders", getAllOrders);

// Crear nueva orden (checkout web)
router.post("/", createOrder);

// Actualizar estado de una orden
router.put("/:id", updateOrderStatus);

// Cancelar una orden pendiente
router.post("/:id/cancel", cancelOrder);

// Consultar estado de una orden
router.get("/:id", getOrderStatus);

// Webhook MercadoPago
router.post("/webhooks/mercadopago", mercadoPagoWebhook);

export default router;
