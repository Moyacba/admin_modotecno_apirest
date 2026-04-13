import express from 'express';
import {
  getRepairTypes,
  createRepairType,
  updateRepairType,
  deleteRepairType,
} from '../controllers/repairTypeController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getRepairTypes);
router.post('/', requireAuth, createRepairType);
router.patch('/:id', requireAuth, updateRepairType);
router.delete('/:id', requireAuth, deleteRepairType);

export default router;
