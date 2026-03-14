import express from 'express';
import * as catalogController from '../controllers/catalogController.js';

const router = express.Router();

router.get('/categories', catalogController.getCategories);
router.get('/subcategories/:id/attributes', catalogController.getSubcategoryAttributes);
router.get('/products/:id/recommendations', catalogController.getProductRecommendations);

export default router;
