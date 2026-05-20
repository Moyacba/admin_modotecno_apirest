import { PrismaClient } from 'db';
import { generateSlug, ensureUniqueSlug } from '../src/utils/slugify.js';

const prisma = new PrismaClient();

async function backfillSlugs() {
  console.log('Starting slug backfill...');
  
  let totalCreated = 0;
  let totalErrors = 0;
  let batchNum = 1;

  while (true) {
    const products = await prisma.$runCommandRaw({
      find: 'Product',
      filter: { $or: [{ slug: null }, { slug: { $exists: false } }] },
      projection: { _id: 1, name: 1 },
      batchSize: 500
    });

    const batch = products.cursor.firstBatch;
    if (batch.length === 0) break;

    console.log(`\nBatch ${batchNum}: processing ${batch.length} products...`);

    for (const prod of batch) {
      try {
        const prodId = prod._id.$oid;
        const name = prod.name || 'producto-sin-nombre';
        const baseSlug = generateSlug(name);
        const uniqueSlug = await ensureUniqueSlug(prisma, baseSlug, prodId);

        await prisma.product.update({
          where: { id: prodId },
          data: { slug: uniqueSlug },
        });

        totalCreated++;
      } catch (err) {
        console.error(`  ✗ Error: ${err.message}`);
        totalErrors++;
      }
    }

    console.log(`  ✓ Batch ${batchNum} complete (${totalCreated} total so far)`);
    batchNum++;
  }

  console.log(`\nBackfill complete:`);
  console.log(`  Created: ${totalCreated}`);
  console.log(`  Errors: ${totalErrors}`);
  
  await prisma.$disconnect();
}

backfillSlugs().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
