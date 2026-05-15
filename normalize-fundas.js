import { PrismaClient } from './prisma/db/index.js';
const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Normalización de Fundas ---');

  // 1. Cargar Catálogos
  const brands = await prisma.brandRepair.findMany();
  const models = await prisma.modelRepair.findMany();
  
  const brandNames = brands
    .map(b => b.name.toUpperCase())
    .filter(name => name !== 'APPLE')
    .sort((a, b) => b.length - a.length);

  // 2. Cargar Subcategoría "Fundas"
  const subcategory = await prisma.subcategory.findFirst({
    where: { name: 'Fundas' }
  });

  if (!subcategory) {
    console.error('No se encontró la subcategoría "Fundas"');
    return;
  }

  // 3. Cargar Productos de "Fundas"
  const products = await prisma.product.findMany({
    where: { subcategoryId: subcategory.id }
  });

  console.log(`Procesando ${products.length} productos...`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const title = product.name.toUpperCase();
    let detectedBrand = null;
    let detectedModel = null;

    if (i % 50 === 0) {
      console.log(`Progreso: ${i}/${products.length}...`);
    }

    // A. Detectar Marca
    if (title.includes('IPHONE')) {
      detectedBrand = 'IPHONE';
    } else {
      for (const brandName of brandNames) {
        if (title.includes(brandName)) {
          detectedBrand = brandName;
          break;
        }
      }
    }

    if (!detectedBrand) {
      skippedCount++;
      continue;
    }

    // B. Detectar Modelo
    const brandObj = brands.find(b => b.name.toUpperCase() === detectedBrand);
    const brandModels = models
      .filter(m => m.brandId === brandObj.id)
      .sort((a, b) => b.name.length - a.name.length);

    for (const model of brandModels) {
      const modelName = model.name.toUpperCase();
      
      if (detectedBrand === 'IPHONE') {
        if (modelName.includes('PRO MAX') && title.includes('PRO MAX')) {
          detectedModel = model.name;
          break;
        }
        if (modelName.includes(' PRO') || modelName.includes(' PRO ')) {
             if (title.includes('PRO MAX')) continue;
             if (title.includes(modelName)) {
                 detectedModel = model.name;
                 break;
             }
        }
      }

      if (title.includes(modelName)) {
        detectedModel = model.name;
        break;
      }
      
      if (modelName.includes('/')) {
         const parts = modelName.split('/').map(p => p.trim().toUpperCase());
         if (parts.some(p => p && title.includes(p))) {
             detectedModel = model.name;
             break;
         }
      }
    }

    if (detectedBrand && detectedModel) {
      const currentAttributes = product.attributes || {};
      const newAttributes = {
        ...currentAttributes,
        marca: detectedBrand,
        modelo: detectedModel
      };

      await prisma.product.update({
        where: { id: product.id },
        data: { attributes: newAttributes }
      });
      updatedCount++;
    } else {
      skippedCount++;
    }
  }

  console.log('--- Resumen de Normalización ---');
  console.log(`Total Productos: ${products.length}`);
  console.log(`Actualizados: ${updatedCount}`);
  console.log(`Omitidos: ${skippedCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
