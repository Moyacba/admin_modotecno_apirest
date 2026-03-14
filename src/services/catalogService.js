import { PrismaClient } from '../../prisma/db/index.js';
const prisma = new PrismaClient();

/**
 * Servicio para gestionar la lógica del catálogo jerárquico.
 */
export const getCategoryAttributes = async (subcategoryId) => {
    // 1. Obtener la subcategoría y su categoría padre
    const subcategory = await prisma.subcategory.findUnique({
        where: { id: subcategoryId },
        include: {
            category: {
                include: {
                    attributes: {
                        include: { attribute: true },
                        orderBy: { position: 'asc' }
                    }
                }
            },
            attributes: {
                include: { attribute: true },
                orderBy: { position: 'asc' }
            }
        }
    });

    if (!subcategory) return [];

    // 2. Combinar atributos heredados (del padre) y específicos (de la subcategoría)
    const inherited = subcategory.category.attributes.map(ca => ({
        ...ca.attribute,
        required: ca.required,
        filterable: ca.filterable,
        source: 'category'
    }));

    const specific = subcategory.attributes.map(sa => ({
        ...sa.attribute,
        required: sa.required,
        filterable: sa.filterable,
        source: 'subcategory'
    }));

    // El orden suele ser: Herencia primero, luego específicos
    return [...inherited, ...specific];
};

export const getCatalogTree = async () => {
    return prisma.category.findMany({
        include: {
            subcategories: true
        }
    });
};
