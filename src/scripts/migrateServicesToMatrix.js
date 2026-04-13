/**
 * migrateServicesToMatrix.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Migra los Services legacy a la nueva Matriz Relacional.
 *
 * Modos:
 *   node src/scripts/migrateServicesToMatrix.js            → migración real
 *   node src/scripts/migrateServicesToMatrix.js --dry-run  → simula sin tocar BD
 *   node src/scripts/migrateServicesToMatrix.js --report   → % de match post-migración
 *   node src/scripts/migrateServicesToMatrix.js --batch=N  → tamaño de batch (default 50)
 *
 * Idempotente: solo actualiza Services donde los campos relacionales están en null.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { PrismaClient } from 'db';
import { writeFileSync } from 'fs';

const prisma = new PrismaClient();

// ─── Flags ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const REPORT_ONLY = args.includes('--report');
const batchArg = args.find((a) => a.startsWith('--batch='));
const BATCH_SIZE = batchArg ? parseInt(batchArg.split('=')[1], 10) : 50;

// ─── Normalización ─────────────────────────────────────────────────────────
function normalize(str) {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // elimina tildes
    .replace(/\s+/g, ' ');
}

// ─── Seed de ServiceCategory (6 categorías base) ───────────────────────────
const CATEGORIES_SEED = [
  {
    name: 'Celular',
    slug: 'celular',
    icon: 'Smartphone',
    legacyMatches: ['celulares', 'celular', 'smartphone', 'iphone', 'android', 'movil', 'telefono'],
  },
  {
    name: 'Notebook',
    slug: 'notebook',
    icon: 'Laptop',
    legacyMatches: ['notebook', 'notebooks', 'laptop', 'laptops', 'portatil'],
  },
  {
    name: 'Computadora',
    slug: 'computadora',
    icon: 'Monitor',
    legacyMatches: ['computadora', 'computadoras', 'pc', 'desktop', 'escritorio'],
  },
  {
    name: 'Tablet',
    slug: 'tablet',
    icon: 'Tablet',
    legacyMatches: ['tablet', 'tablets', 'ipad'],
  },
  {
    name: 'Parlante',
    slug: 'parlante',
    icon: 'Speaker',
    legacyMatches: ['parlante', 'parlantes', 'speaker', 'audio', 'bocina'],
  },
  {
    name: 'Consola',
    slug: 'consola',
    icon: 'Gamepad2',
    legacyMatches: ['consola', 'consolas', 'playstation', 'xbox', 'nintendo', 'ps4', 'ps5'],
  },
];

// ─── Diccionario de equivalencias RepairType ────────────────────────────────
const REPAIR_DICT = {
  // Batería
  'cambio de bateria': 'Cambio de batería',
  'bateria':           'Cambio de batería',
  'batt':              'Cambio de batería',
  'cambio bateria':    'Cambio de batería',
  'reemplazo bateria': 'Cambio de batería',
  'bat':               'Cambio de batería',
  // Módulo / Pantalla
  'modulo':            'Cambio de módulo',
  'cambio de modulo':  'Cambio de módulo',
  'pantalla':          'Cambio de módulo',
  'cambio pantalla':   'Cambio de módulo',
  'display':           'Cambio de módulo',
  'cambio display':    'Cambio de módulo',
  'modulo original':   'Cambio de módulo',
  // Pin de carga
  'pin de carga':      'Pin de carga',
  'conector de carga': 'Pin de carga',
  'carga':             'Pin de carga',
  'pin carga':         'Pin de carga',
  'conector carga':    'Pin de carga',
  // Táctil
  'tactil':            'Cambio de táctil',
  'touch':             'Cambio de táctil',
  'cambio tactil':     'Cambio de táctil',
  'digitalizador':     'Cambio de táctil',
  // Software
  'software':          'Reparación de software',
  'formateo':          'Reparación de software',
  'sistema':           'Reparación de software',
  'sistema operativo': 'Reparación de software',
  'reinstalacion':     'Reparación de software',
  'flasheo':           'Reparación de software',
  // Cámara
  'camara':            'Cambio de cámara',
  'camara trasera':    'Cambio de cámara',
  'camara frontal':    'Cambio de cámara',
  // Auricular
  'auricular':         'Cambio de auricular',
  'parlante interno':  'Cambio de auricular',
  // Microfono
  'microfono':         'Cambio de micrófono',
  'mic':               'Cambio de micrófono',
};

// ─── Funciones de matching ──────────────────────────────────────────────────
function matchCategory(rawCategory, categoryMap) {
  if (!rawCategory) return null;
  const norm = normalize(rawCategory);
  for (const [slug, { id, matches }] of categoryMap.entries()) {
    if (matches.includes(norm)) return id;
  }
  // fallback: includes
  for (const [slug, { id, matches }] of categoryMap.entries()) {
    if (matches.some((m) => norm.includes(m) || m.includes(norm))) return id;
  }
  return null;
}

function matchBrand(rawBrand, brandMap) {
  if (!rawBrand) return null;
  const norm = normalize(rawBrand);
  // exact
  if (brandMap.has(norm)) return brandMap.get(norm);
  // includes
  for (const [key, id] of brandMap.entries()) {
    if (norm.includes(key) || key.includes(norm)) return id;
  }
  return null;
}

function matchModel(rawModel, brandId, modelMap) {
  if (!rawModel || !brandId) return null;
  const norm = normalize(rawModel);
  const key = `${brandId}:${norm}`;
  if (modelMap.has(key)) return modelMap.get(key);
  // includes fallback
  for (const [mKey, mId] of modelMap.entries()) {
    if (!mKey.startsWith(`${brandId}:`)) continue;
    const mName = mKey.split(':').slice(1).join(':');
    if (norm.includes(mName) || mName.includes(norm)) return mId;
  }
  return null;
}

function matchRepairType(rawRepair, categoryId, repairTypeMap) {
  if (!rawRepair || !categoryId) return null;
  const norm = normalize(rawRepair);
  // exact dict lookup
  const canonical = REPAIR_DICT[norm];
  if (canonical) {
    const key = `${categoryId}:${normalize(canonical)}`;
    if (repairTypeMap.has(key)) return repairTypeMap.get(key);
  }
  // direct exact match in repairTypeMap for this category
  const exactKey = `${categoryId}:${norm}`;
  if (repairTypeMap.has(exactKey)) return repairTypeMap.get(exactKey);
  // includes fallback
  for (const [key, id] of repairTypeMap.entries()) {
    if (!key.startsWith(`${categoryId}:`)) continue;
    const typeName = key.split(':').slice(1).join(':');
    if (norm.includes(typeName) || typeName.includes(norm)) return id;
  }
  return null;
}

// ─── Sugerencias para unmatched (Levenshtein simple) ───────────────────────
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function findClosest(raw, candidates) {
  if (!candidates.length) return null;
  let best = candidates[0], bestDist = levenshtein(raw, normalize(candidates[0]));
  for (const c of candidates.slice(1)) {
    const d = levenshtein(raw, normalize(c));
    if (d < bestDist) { best = c; bestDist = d; }
  }
  return bestDist <= 4 ? best : null; // solo si está muy cerca
}

// ─── MODO REPORT ────────────────────────────────────────────────────────────
async function runReport() {
  console.log('\n📊 REPORTE POST-MIGRACIÓN\n');
  const total = await prisma.service.count();
  const withCategory  = await prisma.service.count({ where: { serviceCategoryId: { not: null } } });
  const withBrand     = await prisma.service.count({ where: { brandRepairId: { not: null } } });
  const withModel     = await prisma.service.count({ where: { modelRepairId: { not: null } } });
  const withRepType   = await prisma.service.count({ where: { repairTypeId: { not: null } } });
  const withRepOption = await prisma.service.count({ where: { repairOptionId: { not: null } } });

  const pct = (n) => `${n}/${total} (${((n / total) * 100).toFixed(1)}%)`;
  console.log(`  Total servicios:   ${total}`);
  console.log(`  Con Categoría:     ${pct(withCategory)}`);
  console.log(`  Con Marca:         ${pct(withBrand)}`);
  console.log(`  Con Modelo:        ${pct(withModel)}`);
  console.log(`  Con RepairType:    ${pct(withRepType)}`);
  console.log(`  Con RepairOption:  ${pct(withRepOption)}`);
  console.log('');
}

// ─── MIGRACIÓN PRINCIPAL ────────────────────────────────────────────────────
async function runMigration() {
  console.log(`\n🔄 MIGRACIÓN SERVICIOS → MATRIZ`);
  console.log(`   Modo: ${DRY_RUN ? '🔍 DRY RUN (sin cambios)' : '✏️  REAL'}`);
  console.log(`   Batch size: ${BATCH_SIZE}\n`);

  // 1. SEED ServiceCategory (idempotente)
  const categoryIdMap = new Map(); // slug → id
  if (!DRY_RUN) {
    console.log('📁 Seeding ServiceCategory...');
    for (const cat of CATEGORIES_SEED) {
      const saved = await prisma.serviceCategory.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name, icon: cat.icon },
        create: { name: cat.name, slug: cat.slug, icon: cat.icon },
      });
      categoryIdMap.set(cat.slug, saved.id);
    }
    console.log(`   ✓ ${CATEGORIES_SEED.length} categorías aseguradas\n`);
  } else {
    // En dry-run usamos slugs ficticios para simular
    CATEGORIES_SEED.forEach((c, i) => categoryIdMap.set(c.slug, `dry-cat-${i}`));
  }

  // Map legacy → ServiceCategory.id (por matches)
  const categoryMatchMap = new Map(); // slug → { id, matches }
  for (const cat of CATEGORIES_SEED) {
    categoryMatchMap.set(cat.slug, {
      id: categoryIdMap.get(cat.slug) || `dry-cat-${cat.slug}`,
      matches: cat.legacyMatches,
    });
  }

  // 2. Cargar BrandRepair en map (normalizado → id)
  const allBrands = await prisma.brandRepair.findMany({ select: { id: true, name: true } });
  const brandMap = new Map(allBrands.map((b) => [normalize(b.name), b.id]));
  const brandNameMap = new Map(allBrands.map((b) => [b.id, b.name])); // para sugerencias

  // 3. Cargar ModelRepair en map (brandId:normalizedName → id)
  const allModels = await prisma.modelRepair.findMany({ select: { id: true, name: true, brandId: true } });
  const modelMap = new Map(allModels.map((m) => [`${m.brandId}:${normalize(m.name)}`, m.id]));

  // 4. Cargar RepairType en map (categoryId:normalizedName → id)
  const allRepairTypes = await prisma.repairType.findMany({ select: { id: true, name: true, categoryId: true } });
  const repairTypeMap = new Map(allRepairTypes.map((rt) => [`${rt.categoryId}:${normalize(rt.name)}`, rt.id]));

  // 5. Contar servicios pendientes (campos null)
  const total = await prisma.service.count({
    where: {
      OR: [
        { serviceCategoryId: null },
        { brandRepairId: null },
        { modelRepairId: null },
      ],
    },
  });
  console.log(`📋 Servicios a procesar: ${total}`);
  if (total === 0) {
    console.log('✅ Nada para migrar.\n');
    return;
  }

  // 6. Procesar en batches
  const totalBatches = Math.ceil(total / BATCH_SIZE);
  const stats = { success: 0, failed: 0, skipped: 0 };
  const unmatched = {
    categoryUnmatched: [],
    brandUnmatched: [],
    modelUnmatched: [],
    repairTypeUnmatched: [],
  };
  const allErrors = [];

  for (let batch = 0; batch < totalBatches; batch++) {
    const services = await prisma.service.findMany({
      where: {
        OR: [
          { serviceCategoryId: null },
          { brandRepairId: null },
          { modelRepairId: null },
        ],
      },
      skip: batch * BATCH_SIZE,
      take: BATCH_SIZE,
      select: {
        id: true,
        device: true,
        repair: true,
        serviceCategoryId: true,
        brandRepairId: true,
        modelRepairId: true,
        repairTypeId: true,
      },
    });

    let batchSuccess = 0, batchFailed = 0, batchSkipped = 0;

    for (const svc of services) {
      try {
        const device = svc.device || {};
        const rawCategory = device.category || '';
        const rawBrand    = device.branch || device.brand || '';
        const rawModel    = device.model || '';
        const rawRepair   = svc.repair || '';

        const newCategoryId  = svc.serviceCategoryId || matchCategory(rawCategory, categoryMatchMap);
        const newBrandId     = svc.brandRepairId     || matchBrand(rawBrand, brandMap);
        const newModelId     = svc.modelRepairId     || matchModel(rawModel, newBrandId, modelMap);
        const newRepairTypeId = svc.repairTypeId     || matchRepairType(rawRepair, newCategoryId, repairTypeMap);

        // Registrar unmatcheds
        if (!newCategoryId && rawCategory) {
          const prev = unmatched.categoryUnmatched.find((u) => u.rawValue === rawCategory);
          if (prev) prev.count = (prev.count || 1) + 1;
          else unmatched.categoryUnmatched.push({ serviceId: svc.id, rawValue: rawCategory, count: 1 });
        }
        if (!newBrandId && rawBrand) {
          const norm = normalize(rawBrand);
          const closest = findClosest(norm, allBrands.map((b) => b.name));
          const prev = unmatched.brandUnmatched.find((u) => u.rawValue === rawBrand);
          if (prev) prev.count = (prev.count || 1) + 1;
          else unmatched.brandUnmatched.push({ serviceId: svc.id, rawValue: rawBrand, closest, count: 1 });
        }
        if (!newModelId && rawModel) {
          const prev = unmatched.modelUnmatched.find((u) => u.rawValue === rawModel);
          if (prev) prev.count = (prev.count || 1) + 1;
          else unmatched.modelUnmatched.push({ serviceId: svc.id, rawValue: rawModel, brandId: newBrandId, count: 1 });
        }
        if (!newRepairTypeId && rawRepair) {
          const norm = normalize(rawRepair);
          const closest = findClosest(norm, Object.values(REPAIR_DICT));
          const prev = unmatched.repairTypeUnmatched.find((u) => u.rawValue === rawRepair);
          if (prev) prev.count = (prev.count || 1) + 1;
          else unmatched.repairTypeUnmatched.push({ serviceId: svc.id, rawValue: rawRepair, closest, count: 1 });
        }

        // Si no hay nada nuevo para actualizar, skip
        const updates = {};
        if (newCategoryId  && !svc.serviceCategoryId) updates.serviceCategoryId = newCategoryId;
        if (newBrandId     && !svc.brandRepairId)     updates.brandRepairId     = newBrandId;
        if (newModelId     && !svc.modelRepairId)     updates.modelRepairId     = newModelId;
        if (newRepairTypeId && !svc.repairTypeId)     updates.repairTypeId      = newRepairTypeId;

        if (Object.keys(updates).length === 0) {
          batchSkipped++;
          continue;
        }

        if (!DRY_RUN) {
          await prisma.service.update({ where: { id: svc.id }, data: updates });
        }
        batchSuccess++;
      } catch (err) {
        batchFailed++;
        allErrors.push({ serviceId: svc.id, reason: err.message });
      }
    }

    stats.success += batchSuccess;
    stats.failed  += batchFailed;
    stats.skipped += batchSkipped;

    const batchNum = batch + 1;
    process.stdout.write(
      `[BATCH ${batchNum}/${totalBatches}] ✓${batchSuccess} ✗${batchFailed} →${batchSkipped}\n`
    );
  }

  // 7. También poblar ModelRepair.categoryId para modelos ya existentes
  if (!DRY_RUN) {
    console.log('\n🔗 Poblando ModelRepair.categoryId...');
    // Para cada brand que tenga link, propagar categoryId al primer modelo sin categoryId
    const brandLinks = await prisma.brandRepairCategory.findMany({
      select: { brandId: true, categoryId: true },
    });
    for (const link of brandLinks) {
      await prisma.modelRepair.updateMany({
        where: { brandId: link.brandId, categoryId: null },
        data: { categoryId: link.categoryId },
      });
    }
    console.log('   ✓ ModelRepair.categoryId poblado desde los links de marca\n');
  }

  // 8. Resumen final
  console.log('\n═══════════════════════════════════════');
  console.log('  RESUMEN FINAL');
  console.log('═══════════════════════════════════════');
  console.log(`  Total procesados:  ${total}`);
  console.log(`  Exitosos:          ${stats.success} (${((stats.success / total) * 100).toFixed(1)}%)`);
  console.log(`  Fallados:          ${stats.failed}  (${((stats.failed / total) * 100).toFixed(1)}%)`);
  console.log(`  Sin datos:         ${stats.skipped}  (${((stats.skipped / total) * 100).toFixed(1)}%)`);
  console.log('');
  console.log('  UNMATCHED SUMMARY:');
  console.log(`    Categorías:        ${unmatched.categoryUnmatched.length} valores únicos`);
  console.log(`    Marcas:            ${unmatched.brandUnmatched.length} valores únicos`);
  console.log(`    Modelos:           ${unmatched.modelUnmatched.length} valores únicos`);
  console.log(`    Tipos reparación:  ${unmatched.repairTypeUnmatched.length} valores únicos`);

  if (allErrors.length > 0) {
    console.log(`\n  ERRORES (${allErrors.length}):`);
    allErrors.slice(0, 10).forEach((e) => console.log(`    - ${e.serviceId}: ${e.reason}`));
    if (allErrors.length > 10) console.log(`    ... y ${allErrors.length - 10} más`);
  }

  // 9. Generar archivo de unmatched
  if (!DRY_RUN) {
    // Generar dictSuggestions: agrupar brandUnmatched por rawValue con closest
    const dictSuggestions = [
      ...unmatched.brandUnmatched.map((u) => ({
        field: 'brand',
        raw: normalize(u.rawValue),
        closest: u.closest,
        count: u.count,
      })),
      ...unmatched.repairTypeUnmatched.map((u) => ({
        field: 'repairType',
        raw: normalize(u.rawValue),
        closest: u.closest,
        count: u.count,
      })),
    ]
      .filter((s) => s.closest)
      .sort((a, b) => b.count - a.count);

    const report = {
      timestamp: new Date().toISOString(),
      stats,
      ...unmatched,
      dictSuggestions,
      errors: allErrors,
    };

    const filename = `migration_unmatched_${Date.now()}.json`;
    writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`\n📄 Unmatched exportado: ${filename}`);
    console.log('   Revisá dictSuggestions para extender REPAIR_DICT y re-ejecutar.\n');
  }
}

// ─── Entry point ─────────────────────────────────────────────────────────────
(async () => {
  try {
    if (REPORT_ONLY) {
      await runReport();
    } else {
      await runMigration();
      if (!DRY_RUN) await runReport();
    }
  } catch (err) {
    console.error('💥 Error fatal:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
