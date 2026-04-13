import { Router } from 'express';
import {
  getSmartIndex,
  getBrands,
  getModelsByBrand,
  getServicesByModel,
  createBrand,
  createModel,
  updateModel,
  updateBrand,
  deleteBrand,
  deleteModel,
  duplicateModel,
} from '../controllers/repairCatalogController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// Lectura (públicas)
router.get('/smart-index', getSmartIndex);
router.get('/brands', getBrands);
router.get('/models/:brandId', getModelsByBrand);
router.get('/services/:modelId', getServicesByModel);

// Escritura (protegidas)
router.post('/brands', requireAuth, createBrand);
router.patch('/brands/:id', requireAuth, updateBrand);
router.post('/models', requireAuth, createModel);
router.patch('/models/:id', requireAuth, updateModel);
router.post('/models/:id/duplicate', requireAuth, duplicateModel);
router.delete('/brands/:id', requireAuth, deleteBrand);
router.delete('/models/:id', requireAuth, deleteModel);

export default router;
