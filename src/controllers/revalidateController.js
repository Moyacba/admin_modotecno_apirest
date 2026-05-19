import { requireAuth } from '../middlewares/auth.js';

export const revalidateHook = async (req, res) => {
  try {
    const { path, paths } = req.body;

    if (!path && !paths) {
      return res.status(400).json({ error: 'Se requiere path o paths.' });
    }

    const baseUrl = process.env.NEXTJS_BASE_URL;
    if (!baseUrl) {
      return res.status(500).json({ error: 'NEXTJS_BASE_URL no configurada.' });
    }

    const pathsToRevalidate = paths || [path];
    const results = [];

    for (const p of pathsToRevalidate) {
      try {
        const response = await fetch(`${baseUrl}/api/revalidate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: p }),
        });

        const data = await response.json();
        results.push({ path: p, status: response.status, data });
      } catch (err) {
        results.push({ path: p, status: 'error', message: err.message });
      }
    }

    const hasErrors = results.some(r => r.status === 'error');

    if (hasErrors) {
      return res.status(200).json({
        warning: 'Algunas revalidaciones fallaron. El frontend puede estar caído.',
        results,
      });
    }

    res.json({ message: 'Revalidación completada.', results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Error revalidando el cache.' });
  }
};
