import { PrismaClient } from '../../prisma/db/index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
    console.log('--- Iniciando Sincronización de Catálogo ---');

    const jsonPath = path.join(__dirname, '../../categories_master.JSON');
    const data = JSON.parse(await fs.readFile(jsonPath, 'utf8'));

    // 1. Crear Atributos Globales y Específicos
    console.log('1. Sincronizando Definiciones de Atributos...');
    const allAttributes = [
        ...data.globalAttributes,
        ...data.attributes
    ];

    const attributeMap = {}; // name -> id

    for (const attr of allAttributes) {
        const dbAttr = await prisma.attributeDefinition.upsert({
            where: { key: attr.id },
            update: {
                name: attr.name,
                type: attr.type,
                options: attr.options || []
            },
            create: {
                key: attr.id,
                name: attr.name,
                type: attr.type,
                options: attr.options || []
            }
        });
        attributeMap[attr.id] = dbAttr.id;
        console.log(`   - Atributo: ${attr.name}`);
    }

    // 2. Crear Categorías y Subcategorías
    console.log('2. Sincronizando Categorías y Subcategorías...');
    for (const cat of data.categories) {
        const dbCategory = await prisma.category.upsert({
            where: { key: cat.id },
            update: { name: cat.name },
            create: { key: cat.id, name: cat.name }
        });

        // Vincular atributos heredados a la categoría
        if (cat.inheritedAttributes) {
            for (const [index, attrKey] of cat.inheritedAttributes.entries()) {
                const attrId = attributeMap[attrKey];
                if (attrId) {
                    const existing = await prisma.categoryAttribute.findFirst({
                        where: { categoryId: dbCategory.id, attributeId: attrId }
                    });
                    if (!existing) {
                        await prisma.categoryAttribute.create({
                            data: { categoryId: dbCategory.id, attributeId: attrId, position: index }
                        });
                    } else {
                        await prisma.categoryAttribute.update({
                            where: { id: existing.id },
                            data: { position: index }
                        });
                    }
                }
            }
        }

        for (const sub of cat.subcategories) {
            const dbSubcategory = await prisma.subcategory.upsert({
                where: { key: sub.id },
                update: {
                    name: sub.name,
                    categoryId: dbCategory.id,
                    deviceCompatible: sub.deviceCompatible || false
                },
                create: {
                    key: sub.id,
                    name: sub.name,
                    categoryId: dbCategory.id,
                    deviceCompatible: sub.deviceCompatible || false
                }
            });

            // Vincular atributos específicos a la subcategoría
            if (sub.attributes) {
                for (const [index, attrKey] of sub.attributes.entries()) {
                    const attrId = attributeMap[attrKey];
                    if (attrId) {
                        const existing = await prisma.subcategoryAttribute.findFirst({
                            where: { subcategoryId: dbSubcategory.id, attributeId: attrId }
                        });
                        if (!existing) {
                            await prisma.subcategoryAttribute.create({
                                data: { subcategoryId: dbSubcategory.id, attributeId: attrId, position: index }
                            });
                        } else {
                            await prisma.subcategoryAttribute.update({
                                where: { id: existing.id },
                                data: { position: index }
                            });
                        }
                    }
                }
            }
        }
    }

    // 3. Crear Dispositivos (Brands & Models)
    console.log('3. Sincronizando Dispositivos...');
    if (data.deviceCompatibility) {
        for (const brandName of data.deviceCompatibility.brands) {
            const dbBrand = await prisma.deviceBrand.upsert({
                where: { name: brandName },
                update: {},
                create: { name: brandName }
            });

            const models = data.deviceCompatibility.models[brandName] || [];
            for (const modelName of models) {
                await prisma.deviceModel.upsert({
                   where: { id: 'dummy' }, // No tenemos ID en JSON, usamos findFirst
                   update: {},
                   create: { name: modelName, brandId: dbBrand.id }
                }).catch(async () => {
                    const existing = await prisma.deviceModel.findFirst({
                        where: { name: modelName, brandId: dbBrand.id }
                    });
                    if (!existing) {
                        await prisma.deviceModel.create({
                            data: { name: modelName, brandId: dbBrand.id }
                        });
                    }
                });
            }
        }
    }

    console.log('--- Sincronización Finalizada ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
