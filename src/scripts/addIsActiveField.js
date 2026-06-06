import { PrismaClient } from 'db';
const prisma = new PrismaClient();

async function main() {
  console.log('Starting isActive backfill...');
  
  const allProducts = await prisma.product.findMany({ select: { id: true } });
  let updated = 0;
  
  for (const p of allProducts) {
    const product = await prisma.product.findUnique({ where: { id: p.id }, select: { id: true, isActive: true } });
    if (product && product.isActive === null) {
      await prisma.product.update({ where: { id: p.id }, data: { isActive: true } });
      updated++;
    }
  }

  const totalActive = await prisma.product.count({ where: { isActive: true } });
  const totalProducts = await prisma.product.count();
  console.log(`Backfill complete. Updated ${updated} products. Active: ${totalActive}/${totalProducts}`);

  await prisma.$disconnect();
  console.log('Done.');
}

main().catch(e => {
  console.error('Backfill failed:', e);
  process.exit(1);
});