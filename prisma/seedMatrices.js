import { PrismaClient } from "./db/index.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Service Matrices...");

  // 1. Resolve or Create Categories
  const categoriesToSeed = ["CELULARES", "NOTEBOOKS", "TABLETS"];
  const categoryMap = {};

  for (const catName of categoriesToSeed) {
    let category = await prisma.category.findUnique({
      where: { name: catName }
    });

    if (!category) {
      // Use name as key if missing to avoid null unique conflict in some Mongo envs
      const key = catName.toLowerCase().trim().replace(/\s+/g, '_');
      category = await prisma.category.create({
        data: { 
          name: catName,
          key: key
        }
      });
      console.log(`✨ Created Category: ${catName} with key: ${key}`);
    } else {
      console.log(`ℹ️ Category ${catName} already exists.`);
    }
    
    categoryMap[catName] = category.id;
    console.log(`✅ Category: ${catName} (${category.id})`);
  }

  // 2. Seed Defects (Fallas comunes)
  const commonDefects = [
    { name: "CAMBIO DE PANTALLA / MODULO", categories: ["CELULARES", "TABLETS"] },
    { name: "PIN DE CARGA", categories: ["CELULARES", "TABLETS"] },
    { name: "NO ENCIENDE", categories: ["CELULARES", "NOTEBOOKS", "TABLETS"] },
    { name: "CAMBIO DE BATERIA", categories: ["CELULARES", "NOTEBOOKS", "TABLETS"] },
    { name: "LIMPIEZA Y MANTENIMIENTO", categories: ["NOTEBOOKS"] },
    { name: "CAMBIO DE TECLADO", categories: ["NOTEBOOKS"] },
    { name: "REINSTALACION DE OS / FORMATEO", categories: ["NOTEBOOKS", "TABLETS"] },
    { name: "REPARACION DE BISAGRAS", categories: ["NOTEBOOKS"] },
    { name: "CAMBIO DE DISCO / SSD", categories: ["NOTEBOOKS"] },
    { name: "AMPLIACION DE RAM", categories: ["NOTEBOOKS"] },
    { name: "DAÑO POR AGUA / MOJADO", categories: ["CELULARES", "TABLETS"] },
  ];

  for (const defect of commonDefects) {
    for (const catName of defect.categories) {
      const categoryId = categoryMap[catName];
      if (!categoryId) continue;
      
      await prisma.serviceDefect.upsert({
        where: {
          name_categoryId: {
            name: defect.name,
            categoryId: categoryId,
          },
        },
        update: {},
        create: {
          name: defect.name,
          categoryId: categoryId,
        },
      });
    }
  }
  console.log("✅ Common Defects seeded.");

  // 3. Seed some basic Attributes (Checklist)
  const commonAttributes = [
    { label: "¿Trae cargador?", type: "CHECKBOX", categories: ["CELULARES", "NOTEBOOKS", "TABLETS"] },
    { label: "Estado estético (rayones/golpes)", type: "TEXT", categories: ["CELULARES", "NOTEBOOKS", "TABLETS"] },
    { label: "¿Enciende?", type: "CHECKBOX", categories: ["CELULARES", "NOTEBOOKS", "TABLETS"] },
    { label: "Nivel de batería (%)", type: "TEXT", categories: ["CELULARES", "NOTEBOOKS", "TABLETS"] },
    { label: "¿Trae funda/protector?", type: "CHECKBOX", categories: ["CELULARES", "TABLETS"] },
  ];

  for (const attr of commonAttributes) {
    for (const catName of attr.categories) {
      const categoryId = categoryMap[catName];
      if (!categoryId) continue;

      await prisma.serviceAttribute.upsert({
        where: {
          label_categoryId: {
            label: attr.label,
            categoryId: categoryId,
          },
        },
        update: {},
        create: {
          label: attr.label,
          type: attr.type,
          categoryId: categoryId,
        },
      });
    }
  }
  console.log("✅ Common Attributes seeded.");

  console.log("🏁 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
