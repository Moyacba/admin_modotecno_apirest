import { PrismaClient } from 'db';
const p = new PrismaClient();

const celular = await p.serviceCategory.findFirst({ where: { slug: 'celular' } });

const links = await p.brandRepairCategory.findMany({
  where: { categoryId: celular.id },
  include: { brand: { select: { id: true, name: true } } },
});

console.log(`Links BrandRepairCategory para Celular: ${links.length}`);
links.forEach(l => console.log(`  - ${l.brand.name}`));

await p.$disconnect();
