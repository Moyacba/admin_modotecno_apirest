/**
 * fixBrandCategoryLinks.mjs
 * Vincula todas las BrandRepair existentes a la categoría Celular
 * usando los modelos como pivote: si un ModelRepair de una marca tiene categoryId = celular,
 * entonces la marca DEBE estar vinculada a esa categoría.
 */
import { PrismaClient } from 'db';

const prisma = new PrismaClient();

async function main() {
  // 1. Obtener categoría Celular
  const celular = await prisma.serviceCategory.findFirst({ where: { slug: 'celular' } });
  if (!celular) {
    console.error('ERROR: no existe ServiceCategory con slug "celular"');
    process.exit(1);
  }
  console.log(`Categoria Celular: ${celular.id}`);

  // 2. Obtener todas las marcas que tienen al menos un modelo con categoryId = celular
  const brandsWithCelularModels = await prisma.brandRepair.findMany({
    where: {
      models: {
        some: { categoryId: celular.id },
      },
    },
    select: { id: true, name: true },
  });
  console.log(`Marcas con modelos en Celular: ${brandsWithCelularModels.length}`);

  // 3. También obtener TODAS las marcas (el import puede haber creado marcas sin modelos con categoryId aun)
  const allBrands = await prisma.brandRepair.findMany({ select: { id: true, name: true } });
  console.log(`Total marcas en BD: ${allBrands.length}`);

  // 4. Para cada marca, crear el link si no existe
  let created = 0;
  let skipped = 0;

  for (const brand of allBrands) {
    const existing = await prisma.brandRepairCategory.findFirst({
      where: { brandId: brand.id, categoryId: celular.id },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.brandRepairCategory.create({
      data: { brandId: brand.id, categoryId: celular.id },
    });
    created++;
    console.log(`  + Vinculada: ${brand.name} -> Celular`);
  }

  console.log(`\nRESUMEN:`);
  console.log(`  Links creados: ${created}`);
  console.log(`  Ya existian:   ${skipped}`);
  console.log(`  Total marcas:  ${allBrands.length}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
