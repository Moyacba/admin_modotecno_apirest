import express from 'express';
import {
    createStockEntry,
    getStockEntries,
    getStockEntryById
} from '../controllers/stockEntryController.js';
// import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas las rutas están protegidas
// router.use(protect);

router.post('/', createStockEntry);
router.get('/', getStockEntries);
router.get('/:id', getStockEntryById);

export default router;
