/**
 * Script de prueba para endpoints de stock en tiempo real
 * Ejecutar: node test-stock-endpoints.js
 */

const BASE_URL = 'http://localhost:3000/api/product';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  test: (msg) => console.log(`${colors.yellow}▶${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.blue}${'='.repeat(50)}${colors.reset}\n${msg}\n${colors.blue}${'='.repeat(50)}${colors.reset}`),
};

// Helper para hacer requests
async function request(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

// Test 1: Obtener un producto real para usar en tests
async function getFirstProduct() {
  log.section('🔍 Obteniendo producto de prueba');
  const { status, data } = await request(`${BASE_URL}`);
  
  if (status === 200 && data.products && data.products.length > 0) {
    const product = data.products[0];
    log.success(`Producto encontrado: ${product.name} (ID: ${product.id})`);
    log.info(`Stock disponible: ${product.stock}`);
    return product;
  } else {
    log.error('No se encontraron productos en la base de datos');
    log.info('Crea al menos un producto para ejecutar los tests');
    return null;
  }
}

// Test 2: Validar stock con cantidad válida
async function testValidateStockValid(productId, quantity) {
  log.section('TEST 1: Validar Stock - Cantidad Válida');
  log.test(`Validando ${quantity} unidades del producto ${productId}`);
  
  const { status, data } = await request(`${BASE_URL}/validate-stock`, {
    method: 'POST',
    body: JSON.stringify({
      items: [{ id: productId, quantity }]
    })
  });

  if (status === 200) {
    if (data.valid) {
      log.success('Stock válido - Hay suficiente disponibilidad');
      console.log(JSON.stringify(data, null, 2));
    } else {
      log.error('Stock insuficiente');
      console.log(JSON.stringify(data, null, 2));
    }
  } else {
    log.error(`Error ${status}: ${data.error || 'Unknown error'}`);
  }
}

// Test 3: Validar stock con cantidad excesiva
async function testValidateStockExcessive(productId, stock) {
  log.section('TEST 2: Validar Stock - Cantidad Excesiva');
  const excessiveQuantity = stock + 100;
  log.test(`Intentando validar ${excessiveQuantity} unidades (disponible: ${stock})`);
  
  const { status, data } = await request(`${BASE_URL}/validate-stock`, {
    method: 'POST',
    body: JSON.stringify({
      items: [{ id: productId, quantity: excessiveQuantity }]
    })
  });

  if (status === 200) {
    if (!data.valid && data.errors) {
      log.success('Error detectado correctamente - Stock insuficiente');
      console.log(JSON.stringify(data, null, 2));
    } else {
      log.error('Debería haber detectado stock insuficiente');
      console.log(JSON.stringify(data, null, 2));
    }
  } else {
    log.error(`Error ${status}: ${data.error || 'Unknown error'}`);
  }
}

// Test 4: Validar con producto inexistente
async function testValidateStockNonExistent() {
  log.section('TEST 3: Validar Stock - Producto Inexistente');
  const fakeId = 'producto-que-no-existe-123';
  log.test(`Validando producto inexistente: ${fakeId}`);
  
  const { status, data } = await request(`${BASE_URL}/validate-stock`, {
    method: 'POST',
    body: JSON.stringify({
      items: [{ id: fakeId, quantity: 1 }]
    })
  });

  if (status === 200) {
    if (!data.valid && data.errors) {
      log.success('Error detectado correctamente - Producto no encontrado');
      console.log(JSON.stringify(data, null, 2));
    } else {
      log.error('Debería haber detectado producto inexistente');
      console.log(JSON.stringify(data, null, 2));
    }
  } else {
    log.error(`Error ${status}: ${data.error || 'Unknown error'}`);
  }
}

// Test 5: Obtener stock en batch
async function testStockBatch(productIds) {
  log.section('TEST 4: Obtener Stock en Batch');
  log.test(`Obteniendo stock de ${productIds.length} productos`);
  
  const { status, data } = await request(`${BASE_URL}/stock-batch`, {
    method: 'POST',
    body: JSON.stringify({ ids: productIds })
  });

  if (status === 200 && data.products) {
    log.success(`Stock obtenido para ${data.products.length} productos`);
    console.log(JSON.stringify(data, null, 2));
  } else {
    log.error(`Error ${status}: ${data.error || 'Unknown error'}`);
  }
}

// Test 6: Validación con datos inválidos
async function testInvalidData() {
  log.section('TEST 5: Validación con Datos Inválidos');
  log.test('Enviando array vacío');
  
  const { status, data } = await request(`${BASE_URL}/validate-stock`, {
    method: 'POST',
    body: JSON.stringify({ items: [] })
  });

  if (status === 400 && !data.valid) {
    log.success('Error 400 detectado correctamente - Array vacío');
    console.log(JSON.stringify(data, null, 2));
  } else {
    log.error('Debería retornar error 400 para array vacío');
    console.log(JSON.stringify(data, null, 2));
  }
}

// Ejecutar todos los tests
async function runAllTests() {
  console.log(`
${colors.cyan}╔═══════════════════════════════════════════════════╗
║  🧪 TEST DE ENDPOINTS DE STOCK EN TIEMPO REAL    ║
╚═══════════════════════════════════════════════════╝${colors.reset}
  `);

  log.info('Asegúrate de que el servidor esté corriendo en http://localhost:3000');
  log.info('Esperando 2 segundos...\n');
  
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Obtener producto de prueba
  const product = await getFirstProduct();
  
  if (!product) {
    log.error('No se puede continuar sin productos en la base de datos');
    process.exit(1);
  }

  // Ejecutar tests
  await testValidateStockValid(product.id, 1);
  await testValidateStockExcessive(product.id, product.stock);
  await testValidateStockNonExistent();
  await testStockBatch([product.id, 'otro-producto-fake']);
  await testInvalidData();

  // Resumen final
  log.section('✅ Tests Completados');
  log.info('Revisa los resultados arriba para verificar que todo funciona correctamente');
  log.info('');
  log.info('Próximos pasos:');
  console.log('  1. Inicia el frontend: cd ../ecommerceMT && pnpm dev');
  console.log('  2. Navega a http://localhost:5173');
  console.log('  3. Ve al carrito y observa las validaciones en tiempo real');
}

// Ejecutar
runAllTests().catch(error => {
  log.error(`Error fatal: ${error.message}`);
  process.exit(1);
});
