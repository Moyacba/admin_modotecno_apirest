import { Router } from "express";
import {
  getCashStatus,
  openSession,
  closeSession,
  addMovement,
  getHistory,
  getSessionById
} from "../controllers/cashRegisterController.js";

const router = Router();

router.get("/status", getCashStatus); // Get current session status
router.post("/open", openSession);    // Open new session
router.post("/close", closeSession);  // Close current session
router.post("/movement", addMovement);// Add manual movement
router.get("/history", getHistory);   // Get past sessions
router.get("/:id", getSessionById);   // Get session details

export default router;
