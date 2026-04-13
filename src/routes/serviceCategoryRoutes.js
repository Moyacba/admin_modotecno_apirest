import express from 'express';
import {
  getServiceCategories,
  getServiceCategoryById,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  linkBrandToCategory,
  unlinkBrandFromCategory,
} from '../controllers/serviceCategoryController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getServiceCategories);
router.get('/:id', getServiceCategoryById);
router.post('/', requireAuth, createServiceCategory);
router.patch('/:id', requireAuth, updateServiceCategory);
router.delete('/:id', requireAuth, deleteServiceCategory);
router.post('/:id/brands', requireAuth, linkBrandToCategory);
router.delete('/:id/brands/:brandId', requireAuth, unlinkBrandFromCategory);

export default router;
