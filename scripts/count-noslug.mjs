import { PrismaClient } from 'db';
const p = new PrismaClient();

const r = await p.$runCommandRaw({
  aggregate: 'Product',
  pipeline: [
    { $match: { slug: { $exists: false } } },
    { $count: 'c' }
  ],
  cursor: {}
});
console.log('Sin slug:', r.cursor.firstBatch[0]?.c || 0);

const r2 = await p.$runCommandRaw({
  aggregate: 'Product',
  pipeline: [
    { $match: { slug: null } },
    { $count: 'c' }
  ],
  cursor: {}
});
console.log('Slug null:', r2.cursor.firstBatch[0]?.c || 0);

await p.$disconnect();
