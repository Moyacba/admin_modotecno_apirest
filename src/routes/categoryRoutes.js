import express from 'express';
import { getCategories, getCategoryById, getCategoryTree, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
// import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

// Todas las rutas están protegidas
// router.use(protect);
router.get('/', getCategories);
router.get('/tree', getCategoryTree);
router.get('/:id', getCategoryById);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;
