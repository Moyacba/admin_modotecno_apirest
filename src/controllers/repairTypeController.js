import { PrismaClient } from 'db';

const prisma = new PrismaClient();

const clean = (str) => str?.trim() ?? '';

// ---------------------------------------------------------------------------
// GET /repair-types?categoryId=
// ---------------------------------------------------------------------------
export const getRepairTypes = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const where = categoryId ? { categoryId, isActive: true } : { isActive: true };

    const types = await prisma.repairType.findMany({
      where,
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { repairOptions: true, services: true } },
      },
    });
    return res.json(types);
  } catch (err) {
    console.error('[RepairType] getAll error:', err);
    return res.status(500).json({ error: 'Error al obtener tipos de reparación' });
  }
};

// ---------------------------------------------------------------------------
// POST /repair-types
// Requiere: name, categoryId
// Opcional: position, icon
// ---------------------------------------------------------------------------
export const createRepairType = async (req, res) => {
  const { name, categoryId, position, icon } = req.body;
  const cleanName = clean(name);

  if (!cleanName || !categoryId) {
    return res.status(400).json({ error: 'name y categoryId son obligatorios' });
  }

  try {
    // Validar que la categoría existe
    const category = await prisma.serviceCategory.findUnique({ where: { id: categoryId } });
    if (!category) return res.status(400).json({ error: 'Categoría de servicio no encontrada' });

    // Dedup case-insensitive dentro de la misma categoría
    const existing = await prisma.repairType.findFirst({
      where: { name: { equals: cleanName, mode: 'insensitive' }, categoryId },
    });
    if (existing) {
      return res.status(409).json({ error: `Ya existe "${existing.name}" en esta categoría` });
    }

    const repairType = await prisma.repairType.create({
      data: {
        name: cleanName,
        categoryId,
        position: position ?? 0,
        icon: icon || null,
      },
      include: { category: { select: { id: true, name: true } } },
    });
    return res.status(201).json(repairType);
  } catch (err) {
    console.error('[RepairType] create error:', err);
    return res.status(500).json({ error: 'Error al crear tipo de reparación' });
  }
};

// ---------------------------------------------------------------------------
// PATCH /repair-types/:id
// ---------------------------------------------------------------------------
export const updateRepairType = async (req, res) => {
  const { id } = req.params;
  const { name, categoryId, position, icon, isActive } = req.body;

  try {
    const data = {};
    if (name !== undefined) {
      const cleanName = clean(name);
      // Dedup check (excluyendo el propio)
      const targetCategoryId = categoryId ?? (await prisma.repairType.findUnique({ where: { id }, select: { categoryId: true } }))?.categoryId;
      const existing = await prisma.repairType.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            { name: { equals: cleanName, mode: 'insensitive' } },
            { categoryId: targetCategoryId },
          ],
        },
      });
      if (existing) return res.status(409).json({ error: `Ya existe "${existing.name}" en esta categoría` });
      data.name = cleanName;
    }
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (position !== undefined) data.position = position;
    if (icon !== undefined) data.icon = icon;
    if (isActive !== undefined) data.isActive = isActive;

    const updated = await prisma.repairType.update({
      where: { id },
      data,
      include: { category: { select: { id: true, name: true } } },
    });
    return res.json(updated);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Tipo de reparación no encontrado' });
    console.error('[RepairType] update error:', err);
    return res.status(500).json({ error: 'Error al actualizar tipo de reparación' });
  }
};

// ---------------------------------------------------------------------------
// DELETE /repair-types/:id
// Guard: sin RepairOptions ni Services vinculados
// ---------------------------------------------------------------------------
export const deleteRepairType = async (req, res) => {
  const { id } = req.params;
  try {
    const [optionCount, serviceCount] = await Promise.all([
      prisma.repairOption.count({ where: { repairTypeId: id } }),
      prisma.service.count({ where: { repairTypeId: id } }),
    ]);

    if (optionCount > 0)
      return res.status(409).json({ error: `No se puede eliminar: ${optionCount} opción(es) de precio vinculadas` });
    if (serviceCount > 0)
      return res.status(409).json({ error: `No se puede eliminar: ${serviceCount} servicio(s) vinculado(s)` });

    await prisma.repairType.delete({ where: { id } });
    return res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Tipo de reparación no encontrado' });
    console.error('[RepairType] delete error:', err);
    return res.status(500).json({ error: 'Error al eliminar tipo de reparación' });
  }
};
