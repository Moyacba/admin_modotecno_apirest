import { PrismaClient } from 'db';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// GET /repair-options?modelId=&repairTypeId=&quality=&isActive=
// ---------------------------------------------------------------------------
export const getRepairOptions = async (req, res) => {
  try {
    const { modelId, repairTypeId, quality, isActive } = req.query;
    const where = {};
    if (modelId) where.modelId = modelId;
    if (repairTypeId) where.repairTypeId = repairTypeId;
    if (quality) where.quality = quality;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const options = await prisma.repairOption.findMany({
      where,
      orderBy: [{ quality: 'desc' }],
      include: {
        model: { select: { id: true, name: true, brandId: true } },
        repairType: { select: { id: true, name: true, categoryId: true } },
        _count: { select: { services: true } },
      },
    });
    return res.json(options);
  } catch (err) {
    console.error('[RepairOption] getAll error:', err);
    return res.status(500).json({ error: 'Error al obtener opciones de reparación' });
  }
};

// ---------------------------------------------------------------------------
// POST /repair-options
// Requiere: modelId, repairTypeId, quality, price
// Opcional: cost
// ---------------------------------------------------------------------------
export const createRepairOption = async (req, res) => {
  const { modelId, repairTypeId, quality, price, cost } = req.body;

  if (!modelId || !repairTypeId || !quality || price === undefined) {
    return res.status(400).json({ error: 'modelId, repairTypeId, quality y price son obligatorios' });
  }
  if (!['ORIGINAL', 'ALTERNATIVE'].includes(quality)) {
    return res.status(400).json({ error: "quality debe ser 'ORIGINAL' o 'ALTERNATIVE'" });
  }

  try {
    // 1. Verificar modelo y obtener su brand con links de categoría
    const model = await prisma.modelRepair.findUnique({
      where: { id: modelId },
      include: { brand: { include: { categoryLinks: { select: { categoryId: true } } } } },
    });
    if (!model) return res.status(400).json({ error: 'Modelo no encontrado' });

    // 2. Verificar repairType y obtener su categoría
    const repairType = await prisma.repairType.findUnique({ where: { id: repairTypeId } });
    if (!repairType) return res.status(400).json({ error: 'Tipo de reparación no encontrado' });

    // 3. Validar jerarquía: brand del modelo debe estar vinculada a la categoría del repairType
    const brandLinkedToCategory = model.brand.categoryLinks.some(
      (l) => l.categoryId === repairType.categoryId
    );
    // Si el modelo tiene categoryId directo, también validarlo
    const modelCategoryMatches = !model.categoryId || model.categoryId === repairType.categoryId;

    if (!brandLinkedToCategory && !modelCategoryMatches) {
      return res.status(400).json({
        error: 'La marca del modelo no está vinculada a la categoría del tipo de reparación',
      });
    }

    const option = await prisma.repairOption.create({
      data: {
        modelId,
        repairTypeId,
        quality,
        price: Number(price),
        cost: cost !== undefined ? Number(cost) : null,
      },
      include: {
        model: { select: { id: true, name: true } },
        repairType: { select: { id: true, name: true } },
      },
    });
    return res.status(201).json(option);
  } catch (err) {
    // Unique constraint violated
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe una opción con ese modelo, tipo y calidad' });
    }
    console.error('[RepairOption] create error:', err);
    return res.status(500).json({ error: 'Error al crear opción de reparación' });
  }
};

// ---------------------------------------------------------------------------
// PATCH /repair-options/:id
// Permite editar: price, cost, quality, isActive
// ---------------------------------------------------------------------------
export const updateRepairOption = async (req, res) => {
  const { id } = req.params;
  const { price, cost, quality, isActive } = req.body;

  try {
    const data = {};
    if (price !== undefined) data.price = Number(price);
    if (cost !== undefined) data.cost = cost !== null ? Number(cost) : null;
    if (quality !== undefined) {
      if (!['ORIGINAL', 'ALTERNATIVE'].includes(quality))
        return res.status(400).json({ error: "quality debe ser 'ORIGINAL' o 'ALTERNATIVE'" });
      data.quality = quality;
    }
    if (isActive !== undefined) data.isActive = isActive;

    const updated = await prisma.repairOption.update({
      where: { id },
      data,
      include: {
        model: { select: { id: true, name: true } },
        repairType: { select: { id: true, name: true } },
      },
    });
    return res.json(updated);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Opción no encontrada' });
    if (err.code === 'P2002') return res.status(409).json({ error: 'Ya existe una opción con ese modelo, tipo y calidad' });
    console.error('[RepairOption] update error:', err);
    return res.status(500).json({ error: 'Error al actualizar opción de reparación' });
  }
};

// ---------------------------------------------------------------------------
// DELETE /repair-options/:id
// Guard: sin Services vinculados
// ---------------------------------------------------------------------------
export const deleteRepairOption = async (req, res) => {
  const { id } = req.params;
  try {
    const serviceCount = await prisma.service.count({ where: { repairOptionId: id } });
    if (serviceCount > 0) {
      return res.status(409).json({ error: `No se puede eliminar: ${serviceCount} servicio(s) usan esta opción` });
    }
    await prisma.repairOption.delete({ where: { id } });
    return res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Opción no encontrada' });
    console.error('[RepairOption] delete error:', err);
    return res.status(500).json({ error: 'Error al eliminar opción de reparación' });
  }
};
