import { PrismaClient } from 'db';

const prisma = new PrismaClient();

// GET /api/repair-catalog/brands
export const getBrands = async (req, res) => {
  try {
    const brands = await prisma.brandRepair.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true }
    });
    return res.json(brands);
  } catch (error) {
    console.error('[repairCatalog] getBrands error:', error);
    return res.status(500).json({ error: 'Error al obtener las marcas' });
  }
};

// GET /api/repair-catalog/models/:brandId
export const getModelsByBrand = async (req, res) => {
  try {
    const { brandId } = req.params;
    const models = await prisma.modelRepair.findMany({
      where: { brandId },
      orderBy: { name: 'asc' },
      select: { id: true, name: true }
    });
    return res.json(models);
  } catch (error) {
    console.error('[repairCatalog] getModelsByBrand error:', error);
    return res.status(500).json({ error: 'Error al obtener los modelos' });
  }
};

// GET /api/repair-catalog/services/:modelId
export const getServicesByModel = async (req, res) => {
  try {
    const { modelId } = req.params;
    const services = await prisma.serviceCatalog.findMany({
      where: { modelId },
      orderBy: { type: 'asc' },
      select: { id: true, type: true, price: true }
    });
    return res.json(services);
  } catch (error) {
    console.error('[repairCatalog] getServicesByModel error:', error);
    return res.status(500).json({ error: 'Error al obtener los servicios' });
  }
};
