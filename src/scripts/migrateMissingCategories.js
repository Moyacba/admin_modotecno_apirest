import { PrismaClient } from '../../prisma/db/index.js';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Iniciando Migración de Categorías Faltantes ---');

    // 1. Asegurar que existe la categoría "Sin Clasificar"
    console.log('Verificando categoría "Sin Clasificar"...');
    const category = await prisma.category.upsert({
        where: { name: 'Sin Clasificar' },
        update: { key: 'sin-clasificar' },
        create: {
            key: 'sin-clasificar',
            name: 'Sin Clasificar'
        }
    });

    // 2. Asegurar que existe la subcategoría "Sin Clasificar"
    console.log('Verificando subcategoría "Sin Clasificar"...');
    const subcategory = await prisma.subcategory.upsert({
        where: { name: 'Sin Clasificar' },
        update: { 
            key: 'sin-clasificar-sub',
            categoryId: category.id
        },
        create: {
            key: 'sin-clasificar-sub',
            name: 'Sin Clasificar',
            categoryId: category.id
        }
    });

    // 3. Buscar productos sin categoría o subcategoría
    // Nota: Usamos is: null para ser más explícitos con Prisma/MongoDB
    const productsToUpdate = await prisma.product.findMany({
        where: {
            OR: [
                { categoryId: null },
                { subcategoryId: null },
                { categoryId: { isSet: false } },
                { subcategoryId: { isSet: false } }
            ]
        }
    });

    console.log(`Se encontraron ${productsToUpdate.length} productos para actualizar.`);
    if (productsToUpdate.length > 0) {
        console.log('Ejemplo de producto encontrado:', {
            id: productsToUpdate[0].id,
            name: productsToUpdate[0].name,
            categoryId: productsToUpdate[0].categoryId
        });
    }

    if (productsToUpdate.length > 0) {
        const result = await prisma.product.updateMany({
            where: {
                OR: [
                    { categoryId: null },
                    { subcategoryId: null },
                    { categoryId: { isSet: false } },
                    { subcategoryId: { isSet: false } }
                ]
            },
            data: {
                categoryId: category.id,
                subcategoryId: subcategory.id,
                category: 'Sin Clasificar'
            }
        });
        console.log(`Migración completada: ${result.count} productos actualizados.`);
    } else {
        console.log('No hay productos que requieran migración.');
    }

    console.log('--- Migración Finalizada ---');
}

main()
    .catch(e => {
        console.error('Error durante la migración:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
