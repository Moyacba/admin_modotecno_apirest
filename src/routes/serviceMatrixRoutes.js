import express from "express";
import {
  getDefects,
  createDefect,
  updateDefect,
  deleteDefect,
  getAttributes,
  createAttribute,
  updateAttribute,
  deleteAttribute,
} from "../controllers/serviceMatrixController.js";

const router = express.Router();

// Service Defects
router.get("/defects", getDefects);
router.post("/defects", createDefect);
router.patch("/defects/:id", updateDefect);
router.delete("/defects/:id", deleteDefect);

// Service Attributes
router.get("/attributes", getAttributes);
router.post("/attributes", createAttribute);
router.patch("/attributes/:id", updateAttribute);
router.delete("/attributes/:id", deleteAttribute);

export default router;
