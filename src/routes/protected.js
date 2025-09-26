import { Router } from 'express';
const router = Router();

// Ruta protegida
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Acceso a ruta protegida' });
});

export default router;
