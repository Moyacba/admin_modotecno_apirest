/**
 * importRepairMatrix.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Importa masivamente el JSON de lista de precios a la Matriz Relacional.
 *
 * Uso:
 *   node src/scripts/importRepairMatrix.js
 *   node src/scripts/importRepairMatrix.js --dry-run
 *   node src/scripts/importRepairMatrix.js --path=./otra-ruta.json
 *
 * Idempotente: puede re-ejecutarse sin duplicar datos.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { PrismaClient } from 'db';
import data from './converted-data.json' assert { type: 'json' };

const prisma = new PrismaClient();

// ─── FLAGS ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');

// ─── NORMALIZACIÓN ────────────────────────────────────────────────────────────

/**
 * Capitaliza correctamente una marca:
 *   SAMSUNG → Samsung
 *   APPLE/IPHONE → Apple/Iphone (respeta separadores)
 */
function normalizeBrand(raw) {
  if (!raw) return '';
  return raw
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Normaliza el nombre final del modelo: "Brand Modelo"
 * Mantiene el original del campo MODELO en uppercase, precedido por la marca.
 * Ej: Samsung + "A01 CORE" → "Samsung A01 Core"
 */
function normalizeModel(rawModel) {
  const modelClean = rawModel
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return `${modelClean}`;
}

/**
 * Mapea la columna REPARACION al RepairType canónico.
 * Retorna: { typeName: string, quality: 'ORIGINAL' | 'ALTERNATIVE' }
 */
function mapRepairType(raw) {
  if (!raw) return null;

  const norm = raw.trim().toLowerCase();

  // ─── Módulo / Pantalla
  if (
    norm.includes('modulo original') ||
    norm.includes('módulo original') ||
    norm.includes('modulo samsung ori') ||
    norm.includes('módulo samsung ori')
  ) {
    return { typeName: 'Cambio de módulo', quality: 'ORIGINAL' };
  }
  if (
    norm.includes('modulo alter') ||
    norm.includes('módulo alter') ||
    norm === 'modulo' ||
    norm === 'módulo'
  ) {
    return { typeName: 'Cambio de módulo', quality: 'ALTERNATIVE' };
  }

  // ─── Batería
  if (norm.includes('bateria original') || norm.includes('batería original')) {
    return { typeName: 'Cambio de batería', quality: 'ORIGINAL' };
  }
  if (norm.includes('bateria alter') || norm.includes('batería alter')) {
    return { typeName: 'Cambio de batería', quality: 'ALTERNATIVE' };
  }
  if (norm.includes('bateria') || norm.includes('batería')) {
    return { typeName: 'Cambio de batería', quality: 'ORIGINAL' };
  }

  // ─── Pin de carga
  if (
    norm.includes('pin de carga') ||
    norm.includes('conector de carga') ||
    norm.includes('pin carga') ||
    norm.includes('conector carga')
  ) {
    return { typeName: 'Pin de carga', quality: 'ORIGINAL' };
  }

  // ─── Placa de carga
  if (
    norm.includes('PLACA DE CARGA') ||
    norm.includes('placa de carga')
  ) {
    return { typeName: 'Cambio de placa de carga', quality: 'ORIGINAL' };
  }

  // ─── Tapa trasera
  if (
    norm.includes('TAPA') ||
    norm.includes('tapa')
  ) {
    return { typeName: 'Cambio de tapa trasera', quality: 'ORIGINAL' };
  }

  // ─── Táctil
  if (norm.includes('tactil') || norm.includes('táctil') || norm.includes('touch')) {
    return { typeName: 'Cambio de táctil', quality: 'ORIGINAL' };
  }

  // ─── Software
  if (
    norm.includes('software') ||
    norm.includes('formateo') ||
    norm.includes('sistema') ||
    norm.includes('flasheo')
  ) {
    return { typeName: 'Reparación de software', quality: 'ORIGINAL' };
  }

  // ─── Cámara
  if (norm.includes('camara') || norm.includes('cámara') || norm.includes('camera')) {
    return { typeName: 'Cambio de cámara', quality: 'ORIGINAL' };
  }

  // ─── Auricular / parlante interno
  if (norm.includes('auricular') || norm.includes('parlante interno') || norm.includes('earpiece')) {
    return { typeName: 'Cambio de auricular', quality: 'ORIGINAL' };
  }

  // ─── Micrófono
  if (norm.includes('microfono') || norm.includes('micrófono') || norm.includes('mic')) {
    return { typeName: 'Cambio de micrófono', quality: 'ORIGINAL' };
  }

  // No reconocido → fallback con ORIGINAL
  return { typeName: raw.trim(), quality: 'ORIGINAL' };
}

/**
 * Parsea el precio. Si está vacío o es inválido → 0.
 */
function parsePrice(raw) {
  if (!raw || typeof raw !== 'string' || raw.trim() === '') return 0;
  const num = parseFloat(raw.replace(',', '.'));
  return isNaN(num) ? 0 : num;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  const records = data;

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  IMPORTADOR DE MATRIZ DE REPARACIÓN`);
  console.log(`  Modo: ${DRY_RUN ? '🔍 DRY RUN (sin cambios en BD)' : '✏️  REAL'}`);
  console.log(`  Fuente: ./converted-data.json (${records.length} registros)`);
  console.log(`${'═'.repeat(60)}\n`);

  console.log(`[IMPORT] Procesando ${records.length} registros...\n`);

  // ── 2. Seed ServiceCategory "Celular"
  let category;
  if (!DRY_RUN) {
    category = await prisma.serviceCategory.upsert({
      where: { slug: 'celular' },
      update: { name: 'Celular', icon: 'Smartphone' },
      create: { name: 'Celular', slug: 'celular', icon: 'Smartphone', isActive: true },
    });
    console.log(`✔ Categoría asegurada: ${category.name} (id: ${category.id})\n`);
  } else {
    category = { id: 'dry-cat-id', name: 'Celular' };
    console.log(`✔ [DRY] Categoría: Celular\n`);
  }

  // ── 3. Cachés en memoria para evitar consultas repetidas
  /** Map<nameNormalized, BrandRepair> */
  const brandCache = new Map();
  /** Map<`${brandId}:${nameNormalized}`, ModelRepair> */
  const modelCache = new Map();
  /** Map<`${categoryId}:${typeName}`, RepairType> */
  const repairTypeCache = new Map();
  /** Set<`${modelId}:${typeId}:${quality}`> — para dedup de opciones */
  const optionExistsSet = new Set();
  /** Set<`${brandId}:${categoryId}`> — para dedup de links marca-categoría */
  const brandLinkedSet = new Set();

  // Pre-cargar datos existentes en caché
  const existingBrands = await prisma.brandRepair.findMany({ select: { id: true, name: true } });
  existingBrands.forEach((b) => brandCache.set(b.name.toLowerCase().trim(), b));

  const existingBrandLinks = await prisma.brandRepairCategory.findMany({
    where: { categoryId: category.id },
    select: { brandId: true },
  });
  existingBrandLinks.forEach((l) => brandLinkedSet.add(`${l.brandId}:${category.id}`));


  const existingModels = await prisma.modelRepair.findMany({ select: { id: true, name: true, brandId: true } });
  existingModels.forEach((m) => modelCache.set(`${m.brandId}:${m.name.toLowerCase().trim()}`, m));

  const existingTypes = await prisma.repairType.findMany({ select: { id: true, name: true, categoryId: true } });
  existingTypes.forEach((t) => repairTypeCache.set(`${t.categoryId}:${t.name.toLowerCase().trim()}`, t));

  const existingOptions = await prisma.repairOption.findMany({
    select: { id: true, modelId: true, repairTypeId: true, quality: true },
  });
  existingOptions.forEach((o) => optionExistsSet.add(`${o.modelId}:${o.repairTypeId}:${o.quality}`));

  console.log(
    `[CACHE] Pre-cargado: ${existingBrands.length} marcas, ${existingModels.length} modelos, ` +
    `${existingTypes.length} tipos, ${existingOptions.length} opciones existentes\n`
  );

  // ── 4. Contadores
  const stats = {
    brandsCreated: 0,
    modelsCreated: 0,
    typesCreated: 0,
    optionsCreated: 0,
    optionsSkipped: 0,
    errors: 0,
    unknownRepairs: [],
  };

  // ── 5. Procesar registros
  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    const recNum = i + 1;

    try {
      const rawBrand = rec.MARCA?.trim() || '';
      const rawModel = rec.MODELO?.trim() || '';
      const rawRepair = rec.REPARACION?.trim() || '';
      const rawPrice = rec.EFECTIVO || '';

      if (!rawBrand || !rawModel || !rawRepair) {
        console.warn(`  ⚠ [#${recNum}] Registro incompleto, omitido: ${JSON.stringify(rec)}`);
        stats.errors++;
        continue;
      }

      // ── 5a. Brand
      const brandNorm = normalizeBrand(rawBrand);
      const brandKey = brandNorm.toLowerCase().trim();
      let brand = brandCache.get(brandKey);

      if (!brand) {
        if (!DRY_RUN) {
          // Buscar case-insensitive por si existe con capitalización diferente
          const found = await prisma.brandRepair.findFirst({
            where: { name: { equals: brandNorm, mode: 'insensitive' } },
          });
          if (found) {
            brand = found;
          } else {
            brand = await prisma.brandRepair.create({ data: { name: brandNorm } });
            stats.brandsCreated++;
            console.log(`  ✔ Marca creada: ${brandNorm}`);
          }
        } else {
          brand = { id: `dry-brand-${brandKey}`, name: brandNorm };
          stats.brandsCreated++;
          console.log(`  ✔ [DRY] Marca: ${brandNorm}`);
        }
        brandCache.set(brandKey, brand);
      }

      // ── 5a.2. Vincular Brand con Category si es necesario
      if (!brandLinkedSet.has(`${brand.id}:${category.id}`)) {
        if (!DRY_RUN) {
          await prisma.brandRepairCategory.upsert({
            where: { brandId_categoryId: { brandId: brand.id, categoryId: category.id } },
            update: {},
            create: { brandId: brand.id, categoryId: category.id },
          });
        }
        brandLinkedSet.add(`${brand.id}:${category.id}`);
      }

      // ── 5b. Model
      const modelNorm = normalizeModel(rawModel);
      const modelKey = `${brand.id}:${modelNorm.toLowerCase().trim()}`;
      let model = modelCache.get(modelKey);

      if (!model) {
        if (!DRY_RUN) {
          const found = await prisma.modelRepair.findFirst({
            where: {
              brandId: brand.id,
              name: { equals: modelNorm, mode: 'insensitive' },
            },
          });
          if (found) {
            model = found;
          } else {
            model = await prisma.modelRepair.create({
              data: { name: modelNorm, brandId: brand.id, categoryId: category.id },
            });
            stats.modelsCreated++;
            console.log(`  ✔ Modelo creado: ${modelNorm}`);
          }
        } else {
          model = { id: `dry-model-${modelKey}`, name: modelNorm, brandId: brand.id };
          stats.modelsCreated++;
          console.log(`  ✔ [DRY] Modelo: ${modelNorm}`);
        }
        modelCache.set(modelKey, model);
      }

      // ── 5c. RepairType
      const mapped = mapRepairType(rawRepair);
      if (!mapped) {
        console.warn(`  ⚠ [#${recNum}] REPARACION no reconocida: "${rawRepair}" — omitida`);
        stats.errors++;
        continue;
      }

      const { typeName, quality } = mapped;
      const typeKey = `${category.id}:${typeName.toLowerCase().trim()}`;
      let repairType = repairTypeCache.get(typeKey);

      // Registrar reparaciones no conocidas para revisión
      const knownTypes = [
        'Cambio de módulo', 'Cambio de batería', 'Pin de carga',
        'Cambio de táctil', 'Reparación de software', 'Cambio de cámara',
        'Cambio de auricular', 'Cambio de micrófono',
      ];
      if (!knownTypes.includes(typeName)) {
        const alreadyLogged = stats.unknownRepairs.find((r) => r.raw === rawRepair);
        if (!alreadyLogged) stats.unknownRepairs.push({ raw: rawRepair, mapped: typeName });
      }

      if (!repairType) {
        if (!DRY_RUN) {
          const found = await prisma.repairType.findFirst({
            where: {
              categoryId: category.id,
              name: { equals: typeName, mode: 'insensitive' },
            },
          });
          if (found) {
            repairType = found;
          } else {
            // Calcular la posición siguiente
            const maxPos = await prisma.repairType.count({ where: { categoryId: category.id } });
            repairType = await prisma.repairType.create({
              data: {
                name: typeName,
                categoryId: category.id,
                position: maxPos + 1,
                isActive: true,
              },
            });
            stats.typesCreated++;
            console.log(`  ✔ RepairType creado: ${typeName}`);
          }
        } else {
          repairType = { id: `dry-type-${typeKey}`, name: typeName };
          stats.typesCreated++;
          console.log(`  ✔ [DRY] RepairType: ${typeName}`);
        }
        repairTypeCache.set(typeKey, repairType);
      }

      // ── 5d. RepairOption
      const price = parsePrice(rawPrice);
      const optKey = `${model.id}:${repairType.id}:${quality}`;

      if (optionExistsSet.has(optKey)) {
        stats.optionsSkipped++;
        // Silencioso — no loggear para no inundar la consola
        continue;
      }

      if (!DRY_RUN) {
        await prisma.repairOption.create({
          data: {
            modelId: model.id,
            repairTypeId: repairType.id,
            quality,
            price,
            isActive: true,
          },
        });
      }
      optionExistsSet.add(optKey);
      stats.optionsCreated++;
      console.log(
        `  ✔ RepairOption: ${modelNorm} | ${typeName} | ${quality} | $${price.toLocaleString('es-AR')}`
      );
    } catch (err) {
      console.error(`  ✖ [#${recNum}] ERROR en registro:`, JSON.stringify(rec));
      console.error(`    → ${err.message}`);
      stats.errors++;
    }
  }

  // ── 6. Resumen
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  RESUMEN ${DRY_RUN ? '(DRY RUN — nada fue escrito)' : ''}`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`  Registros procesados:     ${records.length}`);
  console.log(`  Marcas nuevas:            ${stats.brandsCreated}`);
  console.log(`  Modelos nuevos:           ${stats.modelsCreated}`);
  console.log(`  RepairTypes nuevos:       ${stats.typesCreated}`);
  console.log(`  RepairOptions creadas:    ${stats.optionsCreated}`);
  console.log(`  Duplicados ignorados:     ${stats.optionsSkipped}`);
  console.log(`  Errores:                  ${stats.errors}`);

  if (stats.unknownRepairs.length > 0) {
    console.log(`\n  ⚠ REPARACIONES NO ESTÁNDAR (mapeadas con fallback):`);
    stats.unknownRepairs.forEach((r) =>
      console.log(`    "${r.raw}" → "${r.mapped}"`)
    );
    console.log(`\n  → Revisá estos valores y actualizá mapRepairType() si es necesario.`);
  }

  console.log(`${'═'.repeat(60)}\n`);
}

main()
  .catch((err) => {
    console.error('💥 Error fatal:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
