import { PrismaClient } from "db";
import * as fs from 'fs';
import * as path from 'path';
import xlsx from 'xlsx';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Ruta de la carpeta donde deben estar los .xlsx
const DATA_DIR = path.join(__dirname, 'data');

// -------------------------------------------------------------
// Helper: Inferir TIPO DE SERVICIO desde el nombre del archivo
// -------------------------------------------------------------
function inferServiceType(filename: string): string {
  const upper = filename.toUpperCase();
  if (upper.includes('MODULO')) return 'MODULO';
  if (upper.includes('BATERIA')) return 'BATERIA';
  if (upper.includes('PIN') || upper.includes('CARGA')) return 'PIN_DE_CARGA';
  if (upper.includes('TAPA')) return 'TAPA';
  if (upper.includes('GLASS') || upper.includes('VIDRIO')) return 'GLASS';

  // Por defecto, usa el nombre del archivo sin extensión como type
  return filename.split('.')[0].trim().toUpperCase();
}

// -------------------------------------------------------------
// Helper: Inferir MARCA desde el nombre del archivo si es mixto
// -------------------------------------------------------------
function extractBrandFromFilename(filename: string): string | null {
  const upper = filename.toUpperCase();
  const brands = ['SAMSUNG', 'MOTOROLA', 'IPHONE', 'APPLE', 'XIAOMI'];
  for (const b of brands) {
    if (upper.includes(b)) {
      if (b === 'IPHONE') return 'APPLE'; // Agrupa iPhones bajo la marca APPLE
      return b;
    }
  }
  return null;
}

// -------------------------------------------------------------
// Helper: Limpiar strings de precios a Float real
// -------------------------------------------------------------
function cleanPrice(priceStr: any): number {
  if (typeof priceStr === 'number') return priceStr;
  if (!priceStr) return 0;

  // Eliminamos signos $, espacios ocultos
  let cleaned = String(priceStr).replace(/[$\s]/g, '');

  // Si contiene punto para miles y coma para decimales (55.000,50)
  if (cleaned.includes(',') && cleaned.includes('.')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) { // ej: 45000,00
    cleaned = cleaned.replace(',', '.');
  } else if (cleaned.split('.').length > 2) { // Varios puntos ej: 1.000.000
    cleaned = cleaned.replace(/\./g, '');
  }

  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
}

// -------------------------------------------------------------
// Función Principal
// -------------------------------------------------------------
async function main() {
  console.log('🚀 Iniciando Seeding Analizando Excel...\n');

  // Asegurarse de que exista la carpeta
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`⚠️ No existía la carpeta de datos. Se creó en: ${DATA_DIR}.`);
    console.log('💡 Por favor, coloca aquí tus archivos .xlsx y vuelve a correr el script.');
    return;
  }

  const files = fs.readdirSync(DATA_DIR).filter(f => f.toLowerCase().endsWith('.xlsx'));

  if (files.length === 0) {
    console.log('⚠️ No se encontraron archivos .xlsx en prisma/data/');
    return;
  }

  for (const file of files) {
    console.log(`\n📄 Procesando archivo Excel: ${file}`);
    const filePath = path.join(DATA_DIR, file);

    // Parseando XLSX usando la biblioteca xlsx
    const workbook = xlsx.readFile(filePath);
    
    // Contadores para métricas de este archivo
    let successCount = 0;
    let ignoredCount = 0;
    const stats: Record<string, number> = {};

    for (const sheetName of workbook.SheetNames) {
      console.log(`  ➤ Leyendo Pestaña: ${sheetName}`);
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1 });

      if (!rows || rows.length === 0) {
        console.log(`    ⚠️ Pestaña ${sheetName} vacía.`);
        continue;
      }

      const inferredType = inferServiceType(sheetName) || inferServiceType(file);
      const inferredBrand = extractBrandFromFilename(sheetName) || extractBrandFromFilename(file);
      
      // Intentamos detectar automáticamente la ubicación de las columnas
      let headerRowIndex = -1;
      let colMarca = -1, colModelo = -1, colRep = -1, colPrecio = -1;

      for (let i = 0; i < Math.min(10, rows.length); i++) {
        const r = rows[i] || [];
        const strRow = r.map((c: any) => c ? String(c).toUpperCase().trim() : '');
        
        let foundModelo = strRow.findIndex((c: any) => c && c.includes('MODELO'));
        let foundPrecio = strRow.findIndex((c: any) => c && (c.includes('PRECIO') || c.includes('EFECT') || c.includes('EFECTIVO')));
        
        if (foundModelo !== -1 || foundPrecio !== -1) {
          headerRowIndex = i;
          colModelo = foundModelo !== -1 ? foundModelo : 0;
          colPrecio = foundPrecio !== -1 ? foundPrecio : 1;
          colMarca = strRow.findIndex((c: any) => c === 'MARCA');
          colRep = strRow.findIndex((c: any) => c === 'REPARACION' || c === 'REPUESTO' || c === 'TIPO');
          break;
        }
      }

      // Iteramos fila por fila (si hay header empezamos después de él)
      const startRow = headerRowIndex !== -1 ? headerRowIndex + 1 : 0;

      for (let i = startRow; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        try {
          let marcaStr = '';
          let modeloStr = '';
          let tipoRepStr = inferredType;
          let precioVal = 0;

          // Extracción dinámica si detectó columnas
          if (headerRowIndex !== -1) {
            modeloStr = String(row[colModelo] || '').trim().toUpperCase();
            precioVal = cleanPrice(row[colPrecio]);
            if (colMarca !== -1) marcaStr = String(row[colMarca] || '').trim().toUpperCase();
            if (colRep !== -1) tipoRepStr = String(row[colRep] || '').trim().toUpperCase();
          } else {
            // Fallback heurístico 
            if (row.length >= 3) {
              marcaStr = String(row[0] || '').trim().toUpperCase();
              modeloStr = String(row[1] || '').trim().toUpperCase();
              precioVal = cleanPrice(row[2] || row[3]);
            } else {
              modeloStr = String(row[0] || '').trim().toUpperCase();
              precioVal = cleanPrice(row[1] || row[2]);
            }
          }

          // Si marca vino vacía, intenta usar la pestaña
          if (!marcaStr) marcaStr = inferredBrand ? inferredBrand.trim().toUpperCase() : 'NO ESPECIFICADO';

          if (!modeloStr || precioVal <= 0 || modeloStr === 'MODELO' || modeloStr === 'MARCA') {
            ignoredCount++;
            continue; 
          }

          // --- 1. UPSERT MARCA ---
          const brand = await prisma.brandRepair.upsert({
            where: { name: marcaStr },
            update: {},
            create: { name: marcaStr },
          });

          // --- 2. UPSERT MODELO ---
          let model = await prisma.modelRepair.findUnique({
            where: { name_brandId: { name: modeloStr, brandId: brand.id } }
          });

          if (!model) {
            model = await prisma.modelRepair.create({
              data: { name: modeloStr, brandId: brand.id }
            });
          }

          // --- 3. CREATE / UPDATE CATALOGO ---
          let catalog = await prisma.serviceCatalog.findFirst({
            where: { type: tipoRepStr, modelId: model.id }
          });

          if (catalog) {
            await prisma.serviceCatalog.update({
              where: { id: catalog.id },
              data: { price: precioVal }
            });
          } else {
            await prisma.serviceCatalog.create({
              data: { type: tipoRepStr, price: precioVal, modelId: model.id }
            });
          }

          stats[marcaStr] = (stats[marcaStr] || 0) + 1;
          successCount++;

        } catch (error: any) {
          console.log(`    ⚠️ Error en pestaña ${sheetName}, línea ${i + 1}: ${error.message}`);
        }
      }
    }

    // Resumen Local del Archivo
    console.log(`📋 Resumen de ${file}:`);
    for (const [marca, count] of Object.entries(stats)) {
      console.log(`   ✅ Importados ${count} repuestos de la marca ${marca}`);
    }
    if (ignoredCount > 0) console.log(`   ⏭️ ${ignoredCount} filas ignoradas (títulos, espacios o sin precio).`);
  }

  console.log('\n=============================================');
  console.log('🎉 ¡Importación Excel Completada!');
  console.log('=============================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error fatal durante la ejecución del script seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
