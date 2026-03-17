import express from 'express';
import * as providerController from '../controllers/providerController.js';

const router = express.Router();

router.get('/', providerController.getAllProviders);
router.post('/', providerController.createProvider);
router.put('/:id', providerController.updateProvider);
router.delete('/:id', providerController.deleteProvider);
router.patch('/:id/toggle', providerController.toggleProviderActive);

export default router;
