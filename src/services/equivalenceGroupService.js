import { PrismaClient } from '../../prisma/db/index.js';

const prisma = new PrismaClient();

const MEMBER_PRODUCT_SELECT = {
  id: true,
  sku: true,
  name: true,
  stock: true,
  minStock: true,
  isActive: true,
};

const enrichGroup = (group) => {
  if (!group) return null;
  const totalStock = group.members.reduce(
    (sum, member) => sum + (member.product?.stock || 0),
    0
  );
  return {
    ...group,
    totalStock,
    totalMinStock: group.minStock || 0,
  };
};

const getAll = async (includeInactive = false) => {
  const where = includeInactive ? {} : { isActive: true };

  const groups = await prisma.equivalenceGroup.findMany({
    where,
    include: {
      members: {
        include: {
          product: {
            select: MEMBER_PRODUCT_SELECT,
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return groups.map(enrichGroup);
};

const getById = async (id) => {
  const group = await prisma.equivalenceGroup.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          product: {
            select: MEMBER_PRODUCT_SELECT,
          },
        },
      },
    },
  });

  return enrichGroup(group);
};

const validateProductIds = async (tx, productIds, groupId) => {
  if (productIds.length === 0) return;

  const products = await tx.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, equivalenceGroupId: true },
  });

  if (products.length !== productIds.length) {
    const foundIds = new Set(products.map((p) => p.id));
    const missing = productIds.filter((id) => !foundIds.has(id));
    throw new Error(`Products not found: ${missing.join(', ')}`);
  }

  const alreadyGrouped = products.filter(
    (p) => p.equivalenceGroupId && p.equivalenceGroupId !== groupId
  );

  if (alreadyGrouped.length > 0) {
    throw new Error(
      `Products already in another group: ${alreadyGrouped.map((p) => p.id).join(', ')}`
    );
  }
};

const create = async (data) => {
  const { name, description, minStock = 0, productIds = [] } = data;

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new Error('Name is required');
  }

  const trimmedName = name.trim();

  const existing = await prisma.equivalenceGroup.findUnique({
    where: { name: trimmedName },
  });

  if (existing) {
    throw new Error(`Equivalence group with name "${trimmedName}" already exists`);
  }

  if (!Array.isArray(productIds)) {
    throw new Error('productIds must be an array');
  }

  return prisma.$transaction(async (tx) => {
    const group = await tx.equivalenceGroup.create({
      data: {
        name: trimmedName,
        description,
        minStock: parseInt(minStock, 10) || 0,
      },
    });

    if (productIds.length > 0) {
      await validateProductIds(tx, productIds, group.id);

      await tx.product.updateMany({
        where: { id: { in: productIds } },
        data: { equivalenceGroupId: group.id },
      });

      await tx.equivalenceGroupMember.createMany({
        data: productIds.map((productId) => ({
          groupId: group.id,
          productId,
        })),
      });
    }

    const created = await tx.equivalenceGroup.findUnique({
      where: { id: group.id },
      include: {
        members: {
          include: {
            product: {
              select: MEMBER_PRODUCT_SELECT,
            },
          },
        },
      },
    });

    return enrichGroup(created);
  });
};

const update = async (id, data) => {
  const { name, description, minStock, isActive, productIds } = data;

  const group = await prisma.equivalenceGroup.findUnique({ where: { id } });

  if (!group) {
    throw new Error('Equivalence group not found');
  }

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      throw new Error('Name cannot be empty');
    }

    const trimmedName = name.trim();

    if (trimmedName !== group.name) {
      const existing = await prisma.equivalenceGroup.findUnique({
        where: { name: trimmedName },
      });

      if (existing) {
        throw new Error(`Equivalence group with name "${trimmedName}" already exists`);
      }
    }
  }

  return prisma.$transaction(async (tx) => {
    const updateData = {};

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (minStock !== undefined) updateData.minStock = parseInt(minStock, 10) || 0;
    if (isActive !== undefined) updateData.isActive = !!isActive;

    await tx.equivalenceGroup.update({
      where: { id },
      data: updateData,
    });

    if (productIds !== undefined) {
      if (!Array.isArray(productIds)) {
        throw new Error('productIds must be an array');
      }

      const currentMembers = await tx.equivalenceGroupMember.findMany({
        where: { groupId: id },
        select: { productId: true },
      });

      const currentIds = new Set(currentMembers.map((m) => m.productId));
      const newIds = new Set(productIds);

      const removed = [...currentIds].filter((pid) => !newIds.has(pid));
      const added = [...newIds].filter((pid) => !currentIds.has(pid));

      if (removed.length > 0) {
        await tx.product.updateMany({
          where: { id: { in: removed } },
          data: { equivalenceGroupId: null },
        });

        await tx.equivalenceGroupMember.deleteMany({
          where: { groupId: id, productId: { in: removed } },
        });
      }

      if (added.length > 0) {
        await validateProductIds(tx, added, id);

        await tx.product.updateMany({
          where: { id: { in: added } },
          data: { equivalenceGroupId: id },
        });

        await tx.equivalenceGroupMember.createMany({
          data: added.map((productId) => ({
            groupId: id,
            productId,
          })),
        });
      }
    }

    const updated = await tx.equivalenceGroup.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            product: {
              select: MEMBER_PRODUCT_SELECT,
            },
          },
        },
      },
    });

    return enrichGroup(updated);
  });
};

const remove = async (id) => {
  const group = await prisma.equivalenceGroup.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          product: { select: { id: true } },
        },
      },
    },
  });

  if (!group) {
    throw new Error('Equivalence group not found');
  }

  return prisma.$transaction(async (tx) => {
    const productIds = group.members.map((m) => m.product.id);

    if (productIds.length > 0) {
      await tx.product.updateMany({
        where: { id: { in: productIds } },
        data: { equivalenceGroupId: null },
      });
    }

    await tx.equivalenceGroupMember.deleteMany({
      where: { groupId: id },
    });

    await tx.equivalenceGroup.delete({ where: { id } });

    return group;
  });
};

export default {
  getAll,
  getById,
  create,
  update,
  remove,
};
