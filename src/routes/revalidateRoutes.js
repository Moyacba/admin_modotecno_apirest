import express from "express";
import { revalidateHook } from "../controllers/revalidateController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/revalidate-hook", requireAuth, revalidateHook);

export default router;
