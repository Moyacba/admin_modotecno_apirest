export const generateSlug = (name) => {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[áàäâã]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöôõ]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return base;
};

export const ensureUniqueSlug = async (prisma, baseSlug, excludeId = null) => {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const whereClause = { slug };
    if (excludeId) {
      const idStr = typeof excludeId === 'object' && typeof excludeId.toHexString === 'function'
        ? excludeId.toHexString()
        : String(excludeId);
      whereClause.id = { not: idStr };
    }

    const existing = await prisma.product.findFirst({
      where: whereClause,
      select: { id: true },
    });

    if (!existing) return slug;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};
