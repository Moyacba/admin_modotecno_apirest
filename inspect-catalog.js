import { PrismaClient } from 'db';
const prisma = new PrismaClient();

async function main() {
  console.log('--- Categories and Subcategories ---');
  const categories = await prisma.category.findMany({
    include: {
      subcategories: true
    }
  });
  console.log(JSON.stringify(categories, null, 2));

  console.log('\n--- Attributes ---');
  const attributes = await prisma.attributeDefinition.findMany();
  console.log(JSON.stringify(attributes, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
