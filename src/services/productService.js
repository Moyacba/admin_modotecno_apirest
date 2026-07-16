import { PrismaClient } from '../../prisma/db/index.js';
import { generateSlug, ensureUniqueSlug } from '../utils/slugify.js';
const prisma = new PrismaClient();

/**
 * Servicio para gestión avanzada de productos y variantes.
 */
export const createFullProduct = async (productData, variants = [], compatibilities = []) => {
    return prisma.$transaction(async (tx) => {
        // 0. Generar slug único
        const baseSlug = generateSlug(productData.name);
        const slug = await ensureUniqueSlug(tx, baseSlug);

        const { equivalenceGroupId } = productData;
        if (equivalenceGroupId) {
            const group = await tx.equivalenceGroup.findUnique({
                where: { id: equivalenceGroupId }
            });
            if (!group) {
                throw new Error(`Equivalence group not found: ${equivalenceGroupId}`);
            }
        }

        // 1. Crear el producto base
        const product = await tx.product.create({
            data: {
                name: productData.name,
                slug,
                description: productData.description,
                sku: productData.sku,
                barcode: productData.barcode,
                brand: productData.brand,
                provider: productData.provider,
                costPrice: parseFloat(productData.costPrice) || 0,
                salePrice: parseFloat(productData.salePrice) || 0,
                promoPrice: parseFloat(productData.promoPrice) || 0,
                percentPrice: parseFloat(productData.percentPrice) || 0,
                stock: parseInt(productData.stock) || 0,
                minStock: parseInt(productData.minStock) || 0,
                images: productData.images || [],
                hasVariants: productData.hasVariants || false,
                attributes: productData.attributes || {},
                categoryId: productData.categoryId,
                subcategoryId: productData.subcategoryId,
                equivalenceGroupId: equivalenceGroupId || null
            }
        });

        // 2. Asignar grupo de equivalencia si se indicó
        if (equivalenceGroupId) {
            await tx.equivalenceGroupMember.create({
                data: { groupId: equivalenceGroupId, productId: product.id }
            });
        }

        // 3. Crear variantes si existen
        if (variants.length > 0) {
            await tx.productVariant.createMany({
                data: variants.map(v => ({
                    productId: product.id,
                    name: v.name,
                    sku: v.sku,
                    barcode: v.barcode,
                    costPrice: parseFloat(v.costPrice) || 0,
                    salePrice: parseFloat(v.salePrice) || 0,
                    stock: parseInt(v.stock) || 0,
                    attributes: v.attributes || {}
                }))
            });
        }

        // 4. Crear compatibilidades
        if (compatibilities.length > 0) {
            await tx.productCompatibility.createMany({
                data: compatibilities.map(c => ({
                    productId: product.id,
                    deviceModelId: c.deviceModelId
                }))
            });
        }

        return product;
    });
};

export const updateFullProduct = async (id, productData, variants = [], compatibilities = []) => {
    return prisma.$transaction(async (tx) => {
        // 0. Regenerar slug si cambió el nombre
        const existingProduct = await tx.product.findUnique({
            where: { id },
            select: { name: true, equivalenceGroupId: true }
        });
        if (!existingProduct) {
            throw new Error('Product not found');
        }

        let slugUpdate = {};
        if (productData.name && productData.name !== existingProduct.name) {
            const baseSlug = generateSlug(productData.name);
            const newSlug = await ensureUniqueSlug(tx, baseSlug, id);
            slugUpdate = { slug: newSlug };
        }

        const { equivalenceGroupId } = productData;
        const hasGroupChange = equivalenceGroupId !== undefined &&
            equivalenceGroupId !== existingProduct.equivalenceGroupId;

        if (equivalenceGroupId) {
            const group = await tx.equivalenceGroup.findUnique({
                where: { id: equivalenceGroupId }
            });
            if (!group) {
                throw new Error(`Equivalence group not found: ${equivalenceGroupId}`);
            }
        }

        // 1. Actualizar producto base
        const product = await tx.product.update({
            where: { id },
            data: {
                name: productData.name,
                ...slugUpdate,
                description: productData.description,
                sku: productData.sku,
                barcode: productData.barcode,
                brand: productData.brand,
                provider: productData.provider,
                costPrice: parseFloat(productData.costPrice) || 0,
                salePrice: parseFloat(productData.salePrice) || 0,
                promoPrice: parseFloat(productData.promoPrice) || 0,
                percentPrice: parseFloat(productData.percentPrice) || 0,
                stock: parseInt(productData.stock) || 0,
                minStock: parseInt(productData.minStock) || 0,
                images: productData.images || [],
                hasVariants: productData.hasVariants || false,
                attributes: productData.attributes || {},
                categoryId: productData.categoryId,
                subcategoryId: productData.subcategoryId,
                ...(hasGroupChange ? { equivalenceGroupId: equivalenceGroupId || null } : {})
            }
        });

        // 2. Sincronizar membresía de grupo de equivalencia
        if (hasGroupChange) {
            await tx.equivalenceGroupMember.deleteMany({ where: { productId: id } });
            if (equivalenceGroupId) {
                await tx.equivalenceGroupMember.create({
                    data: { groupId: equivalenceGroupId, productId: id }
                });
            }
        }

        // 3. Sincronizar variantes (este es un ejemplo simple, en prod se suele hacer diff)
        // Por ahora, si se envían variantes, las reemplazamos o actualizamos
        // (Para simplificar este paso, borramos y recreamos si el volumen es bajo)
        if (variants.length > 0) {
            await tx.productVariant.deleteMany({ where: { productId: id } });
            await tx.productVariant.createMany({
                data: variants.map(v => ({
                    productId: id,
                    name: v.name,
                    sku: v.sku,
                    barcode: v.barcode,
                    costPrice: parseFloat(v.costPrice) || 0,
                    salePrice: parseFloat(v.salePrice) || 0,
                    stock: parseInt(v.stock) || 0,
                    attributes: v.attributes || {}
                }))
            });
        }

        // 4. Sincronizar compatibilidades
        if (compatibilities) {
            await tx.productCompatibility.deleteMany({ where: { productId: id } });
            if (compatibilities.length > 0) {
                await tx.productCompatibility.createMany({
                    data: compatibilities.map(c => ({
                        productId: id,
                        deviceModelId: c.deviceModelId
                    }))
                });
            }
        }

        return product;
    });
};
