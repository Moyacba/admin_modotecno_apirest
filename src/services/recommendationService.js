import { PrismaClient } from '../../prisma/db/index.js';
const prisma = new PrismaClient();

/**
 * Servicio para motor de recomendaciones (Cross-selling).
 */
export const getRecommendations = async (productId) => {
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { subcategoryRel: true }
    });

    if (!product || !product.subcategoryId) return [];

    // 1. Obtener reglas de recomendación para la subcategoría del producto
    const rules = await prisma.recommendationRule.findMany({
        where: { sourceSubcategoryId: product.subcategoryId }
    });

    let recommendedProducts = [];

    for (const rule of rules) {
        let where = {
            subcategoryId: rule.targetSubcategoryId,
            id: { not: productId } // Excluir el mismo producto
        };

        // 2. Lógica según tipo de regla
        if (rule.ruleType === 'attributeMatch' && rule.matchAttributes) {
            // Filtrar productos del target que coincidan en los atributos especificados
            // Nota: Con MongoDB y Json, necesitamos filtrar cuidadosamente
            const targetProducts = await prisma.product.findMany({ where });
            
            const filtered = targetProducts.filter(p => {
                const productAttrs = product.attributes || {};
                const targetAttrs = p.attributes || {};
                
                return rule.matchAttributes.every(attrName => {
                    const sourceVal = productAttrs[attrName.toLowerCase()];
                    const targetVal = targetAttrs[attrName.toLowerCase()];
                    return sourceVal && targetVal && sourceVal === targetVal;
                });
            });
            
            recommendedProducts = [...recommendedProducts, ...filtered];
        } 
        else if (rule.ruleType === 'deviceMatch') {
            // Buscar productos compatibles con los mismos dispositivos
            const productCompatIds = await prisma.productCompatibility.findMany({
                where: { productId },
                select: { deviceModelId: true }
            }).then(c => c.map(i => i.deviceModelId));

            const compatProducts = await prisma.product.findMany({
                where: {
                    ...where,
                    compatibilities: {
                        some: {
                            deviceModelId: { in: productCompatIds }
                        }
                    }
                }
            });
            recommendedProducts = [...recommendedProducts, ...compatProducts];
        }
        else if (rule.ruleType === 'categoryCrossSell') {
            // Simplemente traer productos de la categoría destino
            const crossProducts = await prisma.product.findMany({ where, take: 5 });
            recommendedProducts = [...recommendedProducts, ...crossProducts];
        }
    }

    // Devolver lista única
    const uniqueIds = new Set();
    return recommendedProducts.filter(p => {
        if (uniqueIds.has(p.id)) return false;
        uniqueIds.add(p.id);
        return true;
    });
};
