import { Router } from "express";
import {
  getCashStatus,
  openSession,
  closeSession,
  addMovement,
  updateMovement,
  deleteMovement,
  getHistory,
  getSessionById
} from "../controllers/cashRegisterController.js";
import { checkCashLock } from "../middlewares/checkCashLock.js";

const router = Router();

router.get("/status", getCashStatus); // Get current session status
router.post("/open", openSession);    // Open new session
router.post("/close", closeSession);  // Close current session
router.get("/history", getHistory);   // Get past sessions

// Movimientos
router.post("/movement", addMovement);
router.put("/movement/:id", checkCashLock, updateMovement);
router.delete("/movement/:id", checkCashLock, deleteMovement);

router.get("/:id", getSessionById);   // Get session details

export default router;
