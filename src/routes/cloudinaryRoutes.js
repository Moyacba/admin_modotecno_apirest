import { Router } from "express";
import { uploadImage, upload, uploadImageUrl } from "../controllers/cloudinaryController.js";

const router = Router();

router.post("/", upload.single("image"), uploadImage);
router.post("/url", uploadImageUrl);

export default router;
