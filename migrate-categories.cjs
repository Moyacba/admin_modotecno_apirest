const { PrismaClient } = require('./prisma/db');
const prisma = new PrismaClient();

async function migrateCategories() {
  try {
    console.log('--- Iniciando Migración de Categorías ---');

    // 1. Crear categoría "Sin Clasificar" si no existe
    let defaultCategory = await prisma.category.findFirst({
      where: { name: 'Sin Clasificar' }
    });

    if (!defaultCategory) {
      defaultCategory = await prisma.category.create({
        data: { name: 'Sin Clasificar' }
      });
      console.log('Categoría "Sin Clasificar" creada.');
    }

    // 2. Buscar productos que no tengan categoryId
    const productsToMigrate = await prisma.product.findMany({
      where: { categoryId: null }
    });

    console.log(`Encontrados ${productsToMigrate.length} productos para migrar.`);

    // 3. Actualizar productos
    for (const product of productsToMigrate) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          categoryId: defaultCategory.id,
          // Opcional: Podrías mapear el string 'category' actual a un nuevo modelo si quisieras automatizar más
        }
      });
    }

    console.log('Migración completada exitosamente.');
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateCategories();
