import { PrismaClient } from 'db';
const prisma = new PrismaClient();

const products = await prisma.$runCommandRaw({
  find: 'Product',
  filter: { slug: { $exists: false } },
  projection: { _id: 1, name: 1 },
  limit: 3
});

for (const prod of products.cursor.firstBatch) {
  console.log('_id type:', typeof prod._id);
  console.log('_id value:', prod._id);
  console.log('_id constructor:', prod._id?.constructor?.name);
  console.log('toHexString:', typeof prod._id?.toHexString);
  console.log('toString:', prod._id?.toString());
  console.log('---');
}

await prisma.$disconnect();
