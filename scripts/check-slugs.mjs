import { PrismaClient } from 'db';
const p = new PrismaClient();

const result = await p.$runCommandRaw({
  aggregate: 'Product',
  pipeline: [
    { $match: { slug: { $exists: false } } },
    { $count: 'count' }
  ],
  cursor: {}
});

const count = result.cursor.firstBatch[0]?.count || 0;
const total = await p.$runCommandRaw({
  aggregate: 'Product',
  pipeline: [{ $count: 'count' }],
  cursor: {}
});
const totalCount = total.cursor.firstBatch[0]?.count || 0;

console.log('Productos sin slug:', count);
console.log('Total productos:', totalCount);

if (count > 0) {
  console.log('\nCompletando slugs faltantes...');
  const products = await p.$runCommandRaw({
    find: 'Product',
    filter: { slug: { $exists: false } },
    projection: { _id: 1, name: 1 }
  });

  const { generateSlug, ensureUniqueSlug } = await import('../src/utils/slugify.js');
  
  for (const prod of products.cursor.firstBatch) {
    const prodId = prod._id.$oid;
    const baseSlug = generateSlug(prod.name || 'producto-sin-nombre');
    const uniqueSlug = await ensureUniqueSlug(p, baseSlug, prodId);
    await p.product.update({
      where: { id: prodId },
      data: { slug: uniqueSlug }
    });
    console.log(`  ✓ "${prod.name}" → "${uniqueSlug}"`);
  }
  console.log('\nSlugs completados.');
}

await p.$disconnect();
