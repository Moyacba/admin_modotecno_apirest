import { PrismaClient } from 'db';

const prisma = new PrismaClient();

// Crear un nuevo registro de ingreso de mercadería
export const createStockEntry = async (req, res) => {
    try {
        const {
            observations,
            items,
            // Nuevos campos de cabecera
            provider,
            paymentMethod,
            userId,
            exchangeRateUSD,
            auditNotes,
        } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Se requiere al menos un artículo para el ingreso de mercadería' });
        }

        // Calcular totales de cabecera
        const totalUnits = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
        const totalCost = items.reduce((sum, item) => {
            return sum + ((Number(item.quantity) || 0) * (Number(item.costPrice) || 0));
        }, 0);

        // Ejecutar todo en una transacción atómica
        const result = await prisma.$transaction(async (tx) => {
            // 1. Crear el registro base de la entrada
            const stockEntry = await tx.stockEntry.create({
                data: {
                    observations: observations || null,
                    provider: provider || null,
                    paymentMethod: paymentMethod || null,
                    userId: userId || null,
                    exchangeRateUSD: exchangeRateUSD ? Number(exchangeRateUSD) : null,
                    auditNotes: auditNotes || null,
                    totalCost: totalCost || null,
                    totalUnits: totalUnits || null,
                    items: {
                        create: items.map(item => {
                            const costPrice = Number(item.costPrice) || 0;
                            const salePrice = Number(item.salePriceAtMoment) || 0;
                            const profitMargin = salePrice > 0
                                ? ((salePrice - costPrice) / salePrice) * 100
                                : null;

                            return {
                                productId: item.productId,
                                isVariant: item.isVariant || false,
                                productName: item.productName,
                                sku: item.sku,
                                quantity: item.quantity,
                                costPrice: costPrice || null,
                                salePriceAtMoment: salePrice || null,
                                categoryId: item.categoryId || null,
                                categoryName: item.categoryName || null,
                                profitMargin: profitMargin !== null ? Math.round(profitMargin * 100) / 100 : null,
                            };
                        })
                    }
                },
                include: {
                    items: true
                }
            });

            // 2. Por cada item, actualizar su stock en la base de datos
            for (const item of items) {
                if (item.quantity <= 0) {
                    throw new Error(`La cantidad para el producto ${item.productName} debe ser mayor a 0`);
                }

                if (item.isVariant) {
                    await tx.productVariant.update({
                        where: { id: item.productId },
                        data: { stock: { increment: item.quantity } }
                    });
                } else {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: item.quantity } }
                    });
                }
            }

            return stockEntry;
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('Error creando ingreso de mercadería:', error);
        res.status(500).json({ message: error.message || 'Error interno del servidor al procesar el ingreso' });
    }
};

// Obtener listado de ingresos (historial) con paginación y filtros
export const getStockEntries = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Filtros opcionales
        const { provider, dateFrom, dateTo, categoryId } = req.query;

        // Construir el filtro dinámico
        const where = {};

        if (provider) {
            where.provider = { contains: provider, mode: 'insensitive' };
        }

        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom) where.createdAt.gte = new Date(dateFrom);
            if (dateTo) {
                // Incluir todo el día de dateTo
                const endDate = new Date(dateTo);
                endDate.setHours(23, 59, 59, 999);
                where.createdAt.lte = endDate;
            }
        }

        // Si filtramos por categoría, lo hacemos en los items
        let itemsCategoryFilter = {};
        if (categoryId) {
            itemsCategoryFilter = { some: { categoryId } };
        }

        const finalWhere = {
            ...where,
            ...(categoryId ? { items: itemsCategoryFilter } : {})
        };

        const [entries, total] = await Promise.all([
            prisma.stockEntry.findMany({
                where: finalWhere,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { items: true }
            }),
            prisma.stockEntry.count({ where: finalWhere })
        ]);

        // Calcular agregados para el header de la página de historial
        const allEntries = await prisma.stockEntry.findMany({
            where: finalWhere,
            select: {
                provider: true,
                totalCost: true,
                items: {
                    select: {
                        quantity: true,
                        salePriceAtMoment: true,
                        profitMargin: true,
                    }
                }
            }
        });

        const totalInvestment = allEntries.reduce((sum, e) => sum + (e.totalCost || 0), 0);
        const totalEstimatedReturn = allEntries.reduce((sum, e) => {
            return sum + e.items.reduce((s, item) => {
                return s + ((item.salePriceAtMoment || 0) * (item.quantity || 0));
            }, 0);
        }, 0);
        const uniqueProviders = [...new Set(allEntries.map(e => e.provider).filter(Boolean))];

        res.status(200).json({
            entries,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },
            summary: {
                totalInvestment,
                totalEstimatedReturn,
                uniqueProviders,
                entriesCount: total,
            }
        });
    } catch (error) {
        console.error('Error obteniendo ingresos de mercadería:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Obtener el detalle de un ingreso específico
export const getStockEntryById = async (req, res) => {
    try {
        const { id } = req.params;

        const entry = await prisma.stockEntry.findUnique({
            where: { id },
            include: { items: true }
        });

        if (!entry) {
            return res.status(404).json({ message: 'Ingreso no encontrado' });
        }

        res.status(200).json(entry);
    } catch (error) {
        console.error('Error obteniendo ingreso:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
