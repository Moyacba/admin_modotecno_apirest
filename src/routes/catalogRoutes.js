import express from 'express';
import * as catalogController from '../controllers/catalogController.js';

const router = express.Router();

// ─── Lecturas existentes ─────────────────────────────────────────────────────
router.get('/categories', catalogController.getCategories);
router.get('/categories/:categoryId/subcategories', catalogController.getSubcategoriesByCategory);
router.get('/subcategories/:id/attributes', catalogController.getSubcategoryAttributes);
router.get('/products/:id/recommendations', catalogController.getProductRecommendations);

// ─── Categorías Macro ────────────────────────────────────────────────────────
router.post('/categories', catalogController.createCategory);
router.put('/categories/:id', catalogController.updateCategory);
router.delete('/categories/:id', catalogController.deleteCategory);

// ─── Subcategorías ───────────────────────────────────────────────────────────
router.post('/subcategories', catalogController.createSubcategory);
router.put('/subcategories/:id', catalogController.updateSubcategory);
router.delete('/subcategories/:id', catalogController.deleteSubcategory);

// ─── Definiciones de Atributo ────────────────────────────────────────────────
router.get('/attributes', catalogController.getAllAttributes);
router.post('/attributes', catalogController.createAttribute);
router.put('/attributes/:id', catalogController.updateAttribute);
router.delete('/attributes/:id', catalogController.deleteAttribute);
router.patch('/attributes/:id/options', catalogController.patchAttributeOption);

// ─── Matriz de Compatibilidad ────────────────────────────────────────────────
router.post('/categories/:id/attributes', catalogController.assignAttributeToCategory);
router.delete('/categories/:id/attributes/:attrId', catalogController.unassignAttributeFromCategory);
router.post('/subcategories/:id/attributes', catalogController.assignAttributeToSubcategory);
router.delete('/subcategories/:id/attributes/:attrId', catalogController.unassignAttributeFromSubcategory);

export default router;
