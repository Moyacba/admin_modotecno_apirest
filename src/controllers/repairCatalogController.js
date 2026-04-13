import { PrismaClient } from 'db';

const prisma = new PrismaClient();

const clean = (str) => str?.trim() ?? '';
const removeAccents = (str) => str?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() ?? '';

// ---------------------------------------------------------------------------
// GET /repair-catalog/smart-index
// Fetches combinations for global fuzzy search (options + models as fallback)
// ---------------------------------------------------------------------------
export const getSmartIndex = async (req, res) => {
  try {
    const [optionsData, modelsData, brandsData, categoriesData, repairTypesData] = await Promise.all([
      prisma.repairOption.findMany({ where: { isActive: true } }),
      prisma.modelRepair.findMany(),
      prisma.brandRepair.findMany(),
      prisma.serviceCategory.findMany(),
      prisma.repairType.findMany()
    ]);

    const brandsMap = new Map(brandsData.map(b => [b.id, b]));
    const categoriesMap = new Map(categoriesData.map(c => [c.id, c]));
    const repairTypesMap = new Map(repairTypesData.map(t => [t.id, t]));
    const modelsMap = new Map(modelsData.map(m => [m.id, m]));

    const options = optionsData.map(opt => {
      const model = modelsMap.get(opt.modelId) || {};
      const brand = brandsMap.get(model.brandId) || {};
      const repairType = repairTypesMap.get(opt.repairTypeId) || {};
      const category = categoriesMap.get(repairType.categoryId) || {};

      const rawSearchStr = `${category.name} ${brand.name} ${model.name} ${repairType.name}`;
      const searchStr = removeAccents(rawSearchStr);

      return {
        type: 'option',
        id: opt.id,
        categoryId: category.id,
        categoryName: category.name,
        brandId: brand.id,
        brandName: brand.name,
        modelId: model.id,
        modelName: model.name,
        repairTypeId: repairType.id,
        repairTypeName: repairType.name,
        price: opt.price,
        quality: opt.quality,
        searchStr
      };
    }).filter(opt => opt.modelId && opt.brandId);

    const models = modelsData.map(m => {
      const brand = brandsMap.get(m.brandId) || {};
      const category = categoriesMap.get(m.categoryId) || {};
      
      const rawSearchStr = `${category.name} ${brand.name} ${m.name}`;
      const searchStr = removeAccents(rawSearchStr);

      return {
        type: 'model',
        id: `model-${m.id}`,
        modelId: m.id,
        modelName: m.name,
        brandId: brand.id,
        brandName: brand.name,
        categoryId: category.id,
        categoryName: category.name,
        searchStr
      };
    }).filter(m => m.brandId);

    return res.json([...options, ...models]);
  } catch (error) {
    console.error('[repairCatalog] getSmartIndex error:', error);
    return res.status(500).json({ error: 'Error al obtener el índice inteligente' });
  }
};

// ---------------------------------------------------------------------------
// GET /repair-catalog/brands?categoryId=
// Si se pasa categoryId filtra por BrandRepairCategory join
// ---------------------------------------------------------------------------
export const getBrands = async (req, res) => {
  try {
    const { categoryId } = req.query;

    let brands;
    if (categoryId) {
      const links = await prisma.brandRepairCategory.findMany({
        where: { categoryId },
        include: { brand: { select: { id: true, name: true } } },
        orderBy: { brand: { name: 'asc' } },
      });
      brands = links.map((l) => l.brand);
    } else {
      brands = await prisma.brandRepair.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
      });
    }
    return res.json(brands);
  } catch (error) {
    console.error('[repairCatalog] getBrands error:', error);
    return res.status(500).json({ error: 'Error al obtener las marcas' });
  }
};

// ---------------------------------------------------------------------------
// GET /repair-catalog/models/:brandId
// ---------------------------------------------------------------------------
export const getModelsByBrand = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { categoryId } = req.query;

    const models = await prisma.modelRepair.findMany({
      where: {
        brandId,
        ...(categoryId ? { categoryId } : {}),
      },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, categoryId: true },
    });
    return res.json(models);
  } catch (error) {
    console.error('[repairCatalog] getModelsByBrand error:', error);
    return res.status(500).json({ error: 'Error al obtener los modelos' });
  }
};

// ---------------------------------------------------------------------------
// GET /repair-catalog/services/:modelId
// ---------------------------------------------------------------------------
export const getServicesByModel = async (req, res) => {
  try {
    const { modelId } = req.params;
    const services = await prisma.serviceCatalog.findMany({
      where: { modelId },
      orderBy: { type: 'asc' },
      select: { id: true, type: true, price: true },
    });
    return res.json(services);
  } catch (error) {
    console.error('[repairCatalog] getServicesByModel error:', error);
    return res.status(500).json({ error: 'Error al obtener los servicios' });
  }
};

// ---------------------------------------------------------------------------
// POST /repair-catalog/brands
// Crea BrandRepair con dedup case-insensitive.
// Body: { name, categoryId? }
// ---------------------------------------------------------------------------
export const createBrand = async (req, res) => {
  const { name, categoryId } = req.body;
  const cleanName = clean(name).toUpperCase();

  if (!cleanName) return res.status(400).json({ error: 'name es obligatorio' });

  try {
    const existing = await prisma.brandRepair.findFirst({
      where: { name: { equals: cleanName, mode: 'insensitive' } },
    });
    if (existing) {
      if (categoryId) {
        await prisma.brandRepairCategory.upsert({
          where: { brandId_categoryId: { brandId: existing.id, categoryId } },
          update: {},
          create: { brandId: existing.id, categoryId },
        });
      }
      return res.status(200).json({ ...existing, alreadyExisted: true });
    }

    const brand = await prisma.brandRepair.create({ data: { name: cleanName } });
    if (categoryId) {
      await prisma.brandRepairCategory.create({ data: { brandId: brand.id, categoryId } });
    }
    return res.status(201).json(brand);
  } catch (err) {
    console.error('[repairCatalog] createBrand error:', err);
    return res.status(500).json({ error: 'Error al crear la marca' });
  }
};

// ---------------------------------------------------------------------------
// POST /repair-catalog/models
// Body: { name, brandId, categoryId? }
// ---------------------------------------------------------------------------
export const createModel = async (req, res) => {
  const { name, brandId, categoryId } = req.body;
  const cleanName = clean(name).toUpperCase();

  if (!cleanName || !brandId) {
    return res.status(400).json({ error: 'name y brandId son obligatorios' });
  }

  try {
    const brand = await prisma.brandRepair.findUnique({ where: { id: brandId } });
    if (!brand) return res.status(400).json({ error: 'Marca no encontrada' });

    if (categoryId) {
      const link = await prisma.brandRepairCategory.findUnique({
        where: { brandId_categoryId: { brandId, categoryId } },
      });
      if (!link) {
        return res.status(400).json({ error: 'La marca no está vinculada a esa categoría. Vincularla primero.' });
      }
    }

    const model = await prisma.modelRepair.upsert({
      where: { name_brandId: { name: cleanName, brandId } },
      update: { categoryId: categoryId || undefined },
      create: { name: cleanName, brandId, categoryId: categoryId || null },
    });
    return res.status(201).json(model);
  } catch (err) {
    console.error('[repairCatalog] createModel error:', err);
    return res.status(500).json({ error: 'Error al crear el modelo' });
  }
};

export const updateBrand = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const cleanName = clean(name).toUpperCase();
  if (!cleanName) return res.status(400).json({ error: 'name es obligatorio' });
  try {
    const updated = await prisma.brandRepair.update({
      where: { id },
      data: { name: cleanName },
    });
    return res.json(updated);
  } catch (err) {
    console.error('[repairCatalog] updateBrand error:', err);
    if (err.code === 'P2025') return res.status(404).json({ error: 'Marca no encontrada' });
    return res.status(500).json({ error: 'Error al actualizar la marca' });
  }
};

export const updateModel = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const cleanName = clean(name).toUpperCase();
  if (!cleanName) return res.status(400).json({ error: 'name es obligatorio' });
  try {
    const updated = await prisma.modelRepair.update({
      where: { id },
      data: { name: cleanName },
    });
    return res.json(updated);
  } catch (err) {
    console.error('[repairCatalog] updateModel error:', err);
    if (err.code === 'P2025') return res.status(404).json({ error: 'Modelo no encontrado' });
    return res.status(500).json({ error: 'Error al actualizar el modelo' });
  }
};

// ---------------------------------------------------------------------------
// DELETE /repair-catalog/brands/:id  — guard
// ---------------------------------------------------------------------------
export const deleteBrand = async (req, res) => {
  const { id } = req.params;
  try {
    const [modelCount, serviceCount] = await Promise.all([
      prisma.modelRepair.count({ where: { brandId: id } }),
      prisma.service.count({ where: { brandRepairId: id } }),
    ]);

    if (modelCount > 0)
      return res.status(409).json({ error: `Eliminar primero los ${modelCount} modelo(s) de esta marca` });
    if (serviceCount > 0)
      return res.status(409).json({ error: `No se puede eliminar: ${serviceCount} servicio(s) vinculado(s)` });

    await prisma.brandRepairCategory.deleteMany({ where: { brandId: id } });
    await prisma.brandRepair.delete({ where: { id } });
    return res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Marca no encontrada' });
    console.error('[repairCatalog] deleteBrand error:', err);
    return res.status(500).json({ error: 'Error al eliminar la marca' });
  }
};

// ---------------------------------------------------------------------------
// DELETE /repair-catalog/models/:id  — guard
// ---------------------------------------------------------------------------
export const deleteModel = async (req, res) => {
  const { id } = req.params;
  try {
    const [optionCount, serviceCount] = await Promise.all([
      prisma.repairOption.count({ where: { modelId: id } }),
      prisma.service.count({ where: { modelRepairId: id } }),
    ]);

    if (optionCount > 0)
      return res.status(409).json({ error: `Eliminar primero las ${optionCount} opción(es) de precio` });
    if (serviceCount > 0)
      return res.status(409).json({ error: `No se puede eliminar: ${serviceCount} servicio(s) vinculado(s)` });

    await prisma.modelRepair.delete({ where: { id } });
    return res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Modelo no encontrado' });
    console.error('[repairCatalog] deleteModel error:', err);
    return res.status(500).json({ error: 'Error al eliminar el modelo' });
  }
};

// ---------------------------------------------------------------------------
// POST /repair-catalog/models/:id/duplicate
// Duplica un modelo y todas sus opciones de reparación (precios/fallas)
// ---------------------------------------------------------------------------
export const duplicateModel = async (req, res) => {
  const { id } = req.params;
  try {
    const sourceModel = await prisma.modelRepair.findUnique({
      where: { id },
      include: { repairOptions: true },
    });

    if (!sourceModel) return res.status(404).json({ error: 'Modelo no encontrado' });

    // Generar un nombre único basado en el original
    const newName = `${sourceModel.name} (COPIA)`.toUpperCase();

    // Verificación de duplicado case-insensitive
    const existing = await prisma.modelRepair.findFirst({
      where: { 
        name: { equals: newName, mode: 'insensitive' }, 
        brandId: sourceModel.brandId 
      },
    });

    if (existing) {
      return res.status(409).json({ error: `Ya existe un modelo duplicado con el nombre: ${newName}` });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear el nuevo modelo heredando marca y categoría
      const newModel = await tx.modelRepair.create({
        data: {
          name: newName,
          brandId: sourceModel.brandId,
          categoryId: sourceModel.categoryId,
        },
      });

      // 2. Duplicar las opciones de reparación si existen
      if (sourceModel.repairOptions.length > 0) {
        const optionsToCreate = sourceModel.repairOptions.map((opt) => ({
          modelId: newModel.id,
          repairTypeId: opt.repairTypeId,
          quality: opt.quality,
          price: opt.price,
          cost: opt.cost,
          isActive: opt.isActive,
        }));

        await tx.repairOption.createMany({
          data: optionsToCreate,
        });
      }

      return newModel;
    });

    return res.status(201).json(result);
  } catch (err) {
    console.error('[repairCatalog] duplicateModel error:', err);
    return res.status(500).json({ error: 'Error al duplicar el modelo' });
  }
};
