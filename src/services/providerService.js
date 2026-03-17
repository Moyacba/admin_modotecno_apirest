import { PrismaClient } from '../../prisma/db/index.js';
const prisma = new PrismaClient();

export const getAllProviders = async ({ activeOnly = false } = {}) => {
    const where = activeOnly ? { isActive: true } : {};
    return prisma.provider.findMany({ where, orderBy: { name: 'asc' } });
};

export const createProvider = async (data) => {
    return prisma.provider.create({ data });
};

export const updateProvider = async (id, data) => {
    return prisma.provider.update({ where: { id }, data });
};

export const deleteProvider = async (id) => {
    return prisma.provider.delete({ where: { id } });
};

export const toggleProviderActive = async (id) => {
    const provider = await prisma.provider.findUnique({ where: { id } });
    if (!provider) throw new Error('Proveedor no encontrado');
    return prisma.provider.update({
        where: { id },
        data: { isActive: !provider.isActive }
    });
};
