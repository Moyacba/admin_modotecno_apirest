import express from 'express';
import {
  getRepairOptions,
  createRepairOption,
  updateRepairOption,
  deleteRepairOption,
} from '../controllers/repairOptionController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getRepairOptions);
router.post('/', requireAuth, createRepairOption);
router.patch('/:id', requireAuth, updateRepairOption);
router.delete('/:id', requireAuth, deleteRepairOption);

export default router;
