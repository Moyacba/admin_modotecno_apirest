import { PrismaClient } from 'db';

const prisma = new PrismaClient();

/** Normaliza strings: trim + dedup guard (case-insensitive se hace en DB) */
const clean = (str) => str?.trim() ?? '';

// ---------------------------------------------------------------------------
// GET /service-categories
// ---------------------------------------------------------------------------
export const getServiceCategories = async (req, res) => {
  try {
    const categories = await prisma.serviceCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { repairTypes: true, brandLinks: true, services: true, models: true },
        },
      },
    });
    return res.json(categories);
  } catch (err) {
    console.error('[ServiceCategory] getAll error:', err);
    return res.status(500).json({ error: 'Error al obtener categorías de servicio' });
  }
};

// ---------------------------------------------------------------------------
// GET /service-categories/:id
// ---------------------------------------------------------------------------
export const getServiceCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await prisma.serviceCategory.findUnique({
      where: { id },
      include: {
        repairTypes: { orderBy: { position: 'asc' } },
        brandLinks: { include: { brand: { select: { id: true, name: true } } } },
        _count: { select: { services: true } },
      },
    });
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
    return res.json(category);
  } catch (err) {
    console.error('[ServiceCategory] getById error:', err);
    return res.status(500).json({ error: 'Error al obtener la categoría' });
  }
};

// ---------------------------------------------------------------------------
// POST /service-categories
// ---------------------------------------------------------------------------
export const createServiceCategory = async (req, res) => {
  const { name, slug, icon } = req.body;
  const cleanName = clean(name);
  const cleanSlug = clean(slug).toLowerCase().replace(/\s+/g, '-');

  if (!cleanName || !cleanSlug) {
    return res.status(400).json({ error: 'name y slug son obligatorios' });
  }

  try {
    // Dedup case-insensitive
    const existing = await prisma.serviceCategory.findFirst({
      where: {
        OR: [
          { name: { equals: cleanName, mode: 'insensitive' } },
          { slug: { equals: cleanSlug, mode: 'insensitive' } },
        ],
      },
    });
    if (existing) {
      return res.status(409).json({ error: `Ya existe una categoría con ese nombre o slug` });
    }

    const category = await prisma.serviceCategory.create({
      data: { name: cleanName, slug: cleanSlug, icon: icon || null },
    });
    return res.status(201).json(category);
  } catch (err) {
    console.error('[ServiceCategory] create error:', err);
    return res.status(500).json({ error: 'Error al crear la categoría' });
  }
};

// ---------------------------------------------------------------------------
// PATCH /service-categories/:id
// ---------------------------------------------------------------------------
export const updateServiceCategory = async (req, res) => {
  const { id } = req.params;
  const { name, slug, icon, isActive } = req.body;

  try {
    const data = {};
    if (name !== undefined) data.name = clean(name);
    if (slug !== undefined) data.slug = clean(slug).toLowerCase().replace(/\s+/g, '-');
    if (icon !== undefined) data.icon = icon;
    if (isActive !== undefined) data.isActive = isActive;

    if (data.name || data.slug) {
      // Dedup check (excluyendo el propio registro)
      const existing = await prisma.serviceCategory.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                data.name ? { name: { equals: data.name, mode: 'insensitive' } } : {},
                data.slug ? { slug: { equals: data.slug, mode: 'insensitive' } } : {},
              ],
            },
          ],
        },
      });
      if (existing) return res.status(409).json({ error: 'Ya existe una categoría con ese nombre o slug' });
    }

    const updated = await prisma.serviceCategory.update({ where: { id }, data });
    return res.json(updated);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Categoría no encontrada' });
    console.error('[ServiceCategory] update error:', err);
    return res.status(500).json({ error: 'Error al actualizar la categoría' });
  }
};

// ---------------------------------------------------------------------------
// DELETE /service-categories/:id
// DELETE guard: sin servicios ni tipos de reparación vinculados
// ---------------------------------------------------------------------------
export const deleteServiceCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const [serviceCount, typeCount, modelCount] = await Promise.all([
      prisma.service.count({ where: { serviceCategoryId: id } }),
      prisma.repairType.count({ where: { categoryId: id } }),
      prisma.modelRepair.count({ where: { categoryId: id } }),
    ]);

    if (serviceCount > 0)
      return res.status(409).json({ error: `No se puede eliminar: ${serviceCount} servicio(s) vinculado(s)` });
    if (typeCount > 0)
      return res.status(409).json({ error: `Eliminar primero los ${typeCount} tipo(s) de reparación vinculados` });
    if (modelCount > 0)
      return res.status(409).json({ error: `Eliminar primero los ${modelCount} modelo(s) vinculados directamente` });

    await prisma.serviceCategory.delete({ where: { id } });
    return res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Categoría no encontrada' });
    console.error('[ServiceCategory] delete error:', err);
    return res.status(500).json({ error: 'Error al eliminar la categoría' });
  }
};

// ---------------------------------------------------------------------------
// POST /service-categories/:id/brands   → vincular BrandRepair a categoría
// ---------------------------------------------------------------------------
export const linkBrandToCategory = async (req, res) => {
  const { id: categoryId } = req.params;
  const { brandId } = req.body;

  if (!brandId) return res.status(400).json({ error: 'brandId es obligatorio' });

  try {
    // Verificar que ambos existen
    const [category, brand] = await Promise.all([
      prisma.serviceCategory.findUnique({ where: { id: categoryId } }),
      prisma.brandRepair.findUnique({ where: { id: brandId } }),
    ]);
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
    if (!brand) return res.status(404).json({ error: 'Marca no encontrada' });

    const link = await prisma.brandRepairCategory.upsert({
      where: { brandId_categoryId: { brandId, categoryId } },
      update: {},
      create: { brandId, categoryId },
    });
    return res.status(201).json(link);
  } catch (err) {
    console.error('[ServiceCategory] linkBrand error:', err);
    return res.status(500).json({ error: 'Error al vincular marca' });
  }
};

// ---------------------------------------------------------------------------
// DELETE /service-categories/:id/brands/:brandId  → desvincular
// ---------------------------------------------------------------------------
export const unlinkBrandFromCategory = async (req, res) => {
  const { id: categoryId, brandId } = req.params;
  try {
    await prisma.brandRepairCategory.delete({
      where: { brandId_categoryId: { brandId, categoryId } },
    });
    return res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Vínculo no encontrado' });
    console.error('[ServiceCategory] unlinkBrand error:', err);
    return res.status(500).json({ error: 'Error al desvincular marca' });
  }
};
