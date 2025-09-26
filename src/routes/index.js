import { Router } from "express";
import authRoutes from "./auth/authRoutes.js";
import productRoutes from "./productRoutes.js";
import saleRoutes from "./saleRoutes.js";
import cashflowRoutes from "./cashflowRoutes.js";
import customerRoutes from "./customerRoutes.js";
import expenseRoutes from "./expenseRoutes.js";
import serviceRoutes from "./serviceRoutes.js";
import adapterRoutes from "../adapter/adapterRoutes.js";
import cloudinaryRoutes from "./cloudinaryRoutes.js";
import orderRoutes from "./orderRoutes.js";
import posSalesRoutes from "./posSalesRoutes.js";
import hybridRoutes from "./hybridRoutes.js";

const router = Router();

// Rutas tradicionales (compatibilidad)
router.use("/auth", authRoutes);
router.use("/product", productRoutes);
router.use("/sale", saleRoutes);
router.use("/cashflow", cashflowRoutes);
router.use("/customers", customerRoutes);
router.use("/expense", expenseRoutes);
router.use("/service", serviceRoutes);
router.use("/adapter", adapterRoutes);
router.use("/image", cloudinaryRoutes);
router.use("/order", orderRoutes);
router.use("/pos-sales", posSalesRoutes);

// Nuevas rutas híbridas optimizadas para cache
router.use("/", hybridRoutes);

export default router;
