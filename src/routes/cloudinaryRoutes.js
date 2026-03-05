import { Router } from "express";
import { uploadImage, upload, uploadImageUrl, getStockImages, toggleFavoriteImage } from "../controllers/cloudinaryController.js";

const router = Router();

router.post("/", upload.single("image"), uploadImage);
router.post("/url", uploadImageUrl);
router.get("/stock", getStockImages);
router.post("/stock/favorite", toggleFavoriteImage);

export default router;
