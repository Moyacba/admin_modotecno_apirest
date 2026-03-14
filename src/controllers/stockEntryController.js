import { PrismaClient } from 'db';

const prisma = new PrismaClient();

// Crear un nuevo registro de ingreso de mercadería
export const createStockEntry = async (req, res) => {
    try {
        const { observations, items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Se requiere al menos un artículo para el ingreso de mercadería' });
        }

        // Ejecutar todo en una transacción atómica
        const result = await prisma.$transaction(async (tx) => {
            // 1. Crear el registro base de la entrada
            const stockEntry = await tx.stockEntry.create({
                data: {
                    observations: observations || null,
                    items: {
                        create: items.map(item => ({
                            productId: item.productId,
                            isVariant: item.isVariant || false,
                            productName: item.productName,
                            sku: item.sku,
                            quantity: item.quantity,
                            costPrice: item.costPrice || null,
                        }))
                    }
                },
                include: {
                    items: true
                }
            });

            // 2. Por cada item, actualizar su stock en la base de datos
            for (const item of items) {
                // Validación para evitar negativos inyectados (por seguridad)
                if (item.quantity <= 0) {
                    throw new Error(`La cantidad para el producto ${item.productName} debe ser mayor a 0`);
                }

                if (item.isVariant) {
                    await tx.productVariant.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                increment: item.quantity
                            }
                        }
                    });
                } else {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                increment: item.quantity
                            }
                        }
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

// Obtener listado de ingresos (historial) con paginación
export const getStockEntries = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [entries, total] = await Promise.all([
            prisma.stockEntry.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    items: true
                }
            }),
            prisma.stockEntry.count()
        ]);

        res.status(200).json({
            entries,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
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
            include: {
                items: true
            }
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
