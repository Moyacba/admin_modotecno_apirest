import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import * as equivalenceGroupController from '../controllers/equivalenceGroupController.js';

const router = Router();

router.get('/', requireAuth, equivalenceGroupController.getAll);
router.get('/:id', requireAuth, equivalenceGroupController.getById);
router.post('/', requireAuth, equivalenceGroupController.create);
router.patch('/:id', requireAuth, equivalenceGroupController.update);
router.delete('/:id', requireAuth, equivalenceGroupController.remove);

export default router;
