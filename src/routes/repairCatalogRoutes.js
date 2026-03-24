import { Router } from 'express';
import {
  getBrands,
  getModelsByBrand,
  getServicesByModel
} from '../controllers/repairCatalogController.js';

const router = Router();

router.get('/brands', getBrands);
router.get('/models/:brandId', getModelsByBrand);
router.get('/services/:modelId', getServicesByModel);

export default router;
