import { PrismaClient } from './prisma/db/index.js';
const prisma = new PrismaClient();

async function main() {
  console.log('--- Cleaning Catalog Data ---');
  
  // order matters due to relations if enforced, though MongoDB is lenient
  console.log('1. Deleting SubcategoryAttributes...');
  await prisma.subcategoryAttribute.deleteMany({});
  
  console.log('2. Deleting CategoryAttributes...');
  await prisma.categoryAttribute.deleteMany({});
  
  console.log('3. Deleting Subcategories...');
  await prisma.subcategory.deleteMany({});
  
  console.log('4. Deleting Categories...');
  await prisma.category.deleteMany({});
  
  console.log('5. Deleting AttributeDefinitions...');
  await prisma.attributeDefinition.deleteMany({});

  console.log('6. Deleting RecommendationRules...');
  await prisma.recommendationRule.deleteMany({});

  console.log('7. Deleting DeviceModels...');
  await prisma.deviceModel.deleteMany({});

  console.log('8. Deleting DeviceBrands...');
  await prisma.deviceBrand.deleteMany({});
  
  console.log('--- Clean Up Finished ---');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
