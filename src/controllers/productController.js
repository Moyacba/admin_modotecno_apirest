import { PrismaClient } from "db";
import * as productService from "../services/productService.js";
const prisma = new PrismaClient();

/**
 * Calcula un score de relevancia para ordenar resultados de búsqueda
 * Mayor score = más relevante
 */
const calculateSearchScore = (product, searchKeyword) => {
  const keyword = searchKeyword.toLowerCase().trim();
  const productName = product.name.toLowerCase();
  const productSku = (product.sku || '').toLowerCase();

  let score = 0;

  // 1. Coincidencia exacta del nombre completo (máxima prioridad)
  if (productName === keyword) {
    score += 1000;
  }

  // 2. El nombre empieza con el keyword
  else if (productName.startsWith(keyword)) {
    score += 500;
  }

  // 3. El keyword está contenido como frase exacta
  else if (productName.includes(keyword)) {
    score += 300;
  }

  // 4. Scoring por palabras individuales
  const keywordWords = keyword.split(/\s+/).filter(w => w.length > 0);
  const productWords = productName.split(/\s+/).filter(w => w.length > 0);

  // Contar cuántas palabras del keyword están en el producto
  let matchedWords = 0;
  let exactWordMatches = 0;
  let wordOrderBonus = 0;

  keywordWords.forEach((kw, index) => {
    const productIndex = productWords.findIndex(pw => pw.includes(kw));
    if (productIndex !== -1) {
      matchedWords++;
      // Bonus si la palabra está en la misma posición relativa
      if (productIndex === index) {
        wordOrderBonus += 20;
      }
      // Bonus si es coincidencia exacta de palabra
      if (productWords[productIndex] === kw) {
        exactWordMatches++;
      }
    }
  });

  score += matchedWords * 50;
  score += exactWordMatches * 30;
  score += wordOrderBonus;

  // 5. Penalizar si el producto tiene muchas palabras extra
  const extraWords = productWords.length - keywordWords.length;
  if (extraWords > 0) {
    score -= extraWords * 10;
  }

  // 6. Bonus si el SKU coincide
  if (productSku === keyword) {
    score += 800;
  } else if (productSku.includes(keyword)) {
    score += 100;
  }

  // 7. Bonus por longitud similar (evita que "iPhone 15 Pro Max" sea mejor que "iPhone 15 Pro")
  const lengthDiff = Math.abs(productName.length - keyword.length);
  const lengthPenalty = Math.min(lengthDiff * 2, 100);
  score -= lengthPenalty;

  return score;
};

/**
 * Aplica filtros de marca y modelo sobre el campo JSON attributes
 */
const applyInAppFilters = (products, brand, model) => {
  if (!brand && !model) return products;

  return products.filter(product => {
    const attrs = product.attributes || {};
    // Buscamos coincidencia exacta (case insensitive) en el campo attributes.marca y attributes.modelo
    const matchesBrand = !brand || (attrs.marca && String(attrs.marca).toLowerCase() === String(brand).toLowerCase());
    const matchesModel = !model || (attrs.modelo && String(attrs.modelo).toLowerCase() === String(model).toLowerCase());
    return matchesBrand && matchesModel;
  });
};

// Obtener todos los productos (incluyendo variantes en búsqueda)
export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 12;
    const skip = (page - 1) * pageSize;

    const keyword = (req.query.keyword || "").trim();
    const categoryId = req.query.categoryId || "";
    const subcategoryId = req.query.subcategoryId || "";
    const brand = req.query.brand || "";
    const model = req.query.model || "";
    const includeVariants = req.query.includeVariants === 'true';
    let where = {};

    if (subcategoryId) {
      where.subcategoryId = subcategoryId;
    } else if (categoryId) {
      where.categoryId = categoryId;
    }



    if (keyword) {
      const keywordConditions = keyword.split(' ').filter(k => k).map(key => ({
        OR: [
          { name: { contains: key, mode: 'insensitive' } },
          { barcode: { contains: key, mode: 'insensitive' } },
          { sku: { contains: key, mode: 'insensitive' } },
        ],
      }));

      // Primero intentar con AND
      const andWhere = { ...where, AND: keywordConditions };

      // Obtener TODOS los resultados para poder filtrar y ordenar por score en memoria
      let allProducts = await prisma.product.findMany({
        where: andWhere,
        include: {
          categoryRel: true,
          subcategoryRel: true,
          ...(includeVariants ? {
            variants: {
              where: { isActive: true },
              orderBy: { createdAt: 'desc' },
            }
          } : {})
        },
      });

      // Aplicar filtros de marca/modelo en memoria
      allProducts = applyInAppFilters(allProducts, brand, model);

      if (allProducts.length > 0) {
        // Calcular métricas sobre el conjunto filtrado (antes de paginar)
        const totalCount = allProducts.length;
        const totalUniqueInStock = allProducts.filter(p => Number(p.stock || 0) > 0).length;
        const totalStock = allProducts.reduce((acc, p) => acc + Number(p.stock || 0), 0);

        const productsWithScore = allProducts.map(product => ({
          ...product,
          _score: calculateSearchScore(product, keyword)
        }));

        productsWithScore.sort((a, b) => {
          if (b._score !== a._score) return b._score - a._score;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        const paginatedProducts = productsWithScore
          .slice(skip, skip + pageSize)
          .map(({ _score, ...product }) => product);

        return res.status(200).json({ products: paginatedProducts, totalCount, totalUniqueInStock, totalStock });
      }


      // Si no hay resultados con AND, usar OR
      const orWhere = { ...where, OR: keywordConditions.flatMap(c => c.OR) };
      let allProductsOr = await prisma.product.findMany({
        where: orWhere,
        include: {
          categoryRel: true,
          subcategoryRel: true,
          ...(includeVariants ? {
            variants: {
              where: { isActive: true },
              orderBy: { createdAt: 'desc' },
            }
          } : {})
        },
      });

      // Aplicar filtros de marca/modelo en memoria
      allProductsOr = applyInAppFilters(allProductsOr, brand, model);

      // Calcular métricas
      const totalCountOr = allProductsOr.length;
      const totalUniqueInStockOr = allProductsOr.filter(p => Number(p.stock || 0) > 0).length;
      const totalStockOr = allProductsOr.reduce((acc, p) => acc + Number(p.stock || 0), 0);

      const productsWithScoreOr = allProductsOr.map(product => ({
        ...product,
        _score: calculateSearchScore(product, keyword)
      }));

      productsWithScoreOr.sort((a, b) => {
        if (b._score !== a._score) return b._score - a._score;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      const paginatedProductsOr = productsWithScoreOr
        .slice(skip, skip + pageSize)
        .map(({ _score, ...product }) => product);

      return res.status(200).json({ products: paginatedProductsOr, totalCount: totalCountOr, totalUniqueInStock: totalUniqueInStockOr, totalStock: totalStockOr });
    }

    // Si no hay keyword, solo filtrar por categoría (si existe) y luego por marca/modelo en memoria
    let allProductsNoKeyword = await prisma.product.findMany({
      where,
      include: {
        categoryRel: true,
        subcategoryRel: true,
        ...(includeVariants ? {
          variants: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
          }
        } : {})
      },
      orderBy: { createdAt: 'desc' },
    });

    // Aplicar filtros de marca/modelo en memoria
    allProductsNoKeyword = applyInAppFilters(allProductsNoKeyword, brand, model);

    const totalCount = allProductsNoKeyword.length;
    const totalUniqueInStock = allProductsNoKeyword.filter(p => Number(p.stock || 0) > 0).length;
    const totalStock = allProductsNoKeyword.reduce((acc, p) => acc + Number(p.stock || 0), 0);
    const paginatedProducts = allProductsNoKeyword.slice(skip, skip + pageSize);

    console.log("keyword", keyword)

    console.log("totalCount", totalCount)
    console.log("totalUniqueInStock", totalUniqueInStock)
    console.log("totalStock", totalStock)
    console.log("paginatedProducts", paginatedProducts)

    res.status(200).json({ products: paginatedProducts, totalCount, totalUniqueInStock, totalStock });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error fetching products" });
  }
};

// Obtener un producto por ID (incluyendo variantes)
export const getProductById = async (req, res) => {
  const { id } = req.params;
  const includeVariants = req.query.includeVariants === 'true';

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        categoryRel: true,
        subcategoryRel: true,
        ...(includeVariants ? {
          variants: {
            where: { isActive: true },
          }
        } : {})
      },
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: "Error fetching product" });
  }
};

// Crear un nuevo producto
export const createProduct = async (req, res) => {
  const { variants = [], compatibilities = [] } = req.body;

  try {
    const newProduct = await productService.createFullProduct(req.body, variants, compatibilities);
    res.status(201).json(newProduct);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error creating product: " + error.message });
  }
};

// Actualizar un producto
export const updateProduct = async (req, res) => {
  const { variants = [], compatibilities = [] } = req.body;
  const { id } = req.params;

  try {
    const updatedProduct = await productService.updateFullProduct(id, req.body, variants, compatibilities);
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.log(error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(500).json({ error: "Error updating product: " + error.message });
  }
};

// Eliminar un producto
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.product.delete({
      where: { id },
    });
    res.status(204).send(); // No content
  } catch (error) {
    if (error.code === "P2025") {
      // Product not found
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(500).json({ error: "Error deleting product" });
  }
};

// ========================================
// ENDPOINTS PARA STOCK EN TIEMPO REAL
// ========================================

/**
 * Validar stock de múltiples productos
 * POST /api/product/validate-stock
 * Body: { items: [{ id: string, quantity: number }] }
 */
export const validateStock = async (req, res) => {
  try {
    const { items } = req.body;

    // Validar que items sea un array válido
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Se requiere un array de items con id y quantity',
        valid: false
      });
    }

    // Validar estructura de cada item
    for (const item of items) {
      if (!item.id || typeof item.quantity !== 'number' || item.quantity <= 0) {
        return res.status(400).json({
          error: 'Cada item debe tener id (string) y quantity (número positivo)',
          valid: false
        });
      }
    }

    const errors = [];

    // Verificar stock para cada producto
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
        select: {
          id: true,
          name: true,
          stock: true,
          hasVariants: true
        }
      });

      if (!product) {
        errors.push({
          productId: item.id,
          productName: 'Producto no encontrado',
          requested: item.quantity,
          available: 0
        });
        continue;
      }

      // Verificar si tiene suficiente stock
      if (product.stock < item.quantity) {
        errors.push({
          productId: product.id,
          productName: product.name,
          requested: item.quantity,
          available: product.stock
        });
      }
    }

    // Retornar resultado de validación
    return res.status(200).json({
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error validando stock:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      valid: false
    });
  }
};

/**
 * Obtener stock de múltiples productos en batch
 * POST /api/product/stock-batch
 * Body: { ids: [string] }
 */
export const getStockBatch = async (req, res) => {
  try {
    const { ids } = req.body;

    // Validar que ids sea un array válido
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        error: 'Se requiere un array de IDs de productos',
        products: []
      });
    }

    // Obtener productos con su stock
    const products = await prisma.product.findMany({
      where: {
        id: { in: ids }
      },
      select: {
        id: true,
        stock: true
      }
    });

    // Si se solicitaron IDs que no existen, agregar con stock 0
    const foundIds = products.map(p => p.id);
    const missingIds = ids.filter(id => !foundIds.includes(id));

    const allProducts = [
      ...products,
      ...missingIds.map(id => ({ id, stock: 0 }))
    ];

    return res.status(200).json({
      products: allProducts
    });

  } catch (error) {
    console.error('Error obteniendo stock en batch:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      products: []
    });
  }
};

// ========================================
// ENDPOINTS PARA GESTIÓN DE CÓDIGOS DE BARRAS
// ========================================

/**
 * Genera un EAN-13 único (13 dígitos con dígito verificador correcto)
 * que no esté en el Set de códigos existentes.
 */
function generateUniqueEAN13(existingCodes) {
  const MAX_TRIES = 100;
  for (let t = 0; t < MAX_TRIES; t++) {
    // Prefijo 200-299 reservado para uso interno
    const prefix = 200 + Math.floor(Math.random() * 100);
    let digits = String(prefix);
    for (let i = 0; i < 9; i++) {
      digits += Math.floor(Math.random() * 10);
    }
    // Calcular dígito verificador EAN-13
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(digits[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const check = (10 - (sum % 10)) % 10;
    const code = digits + check;
    if (!existingCodes.has(code)) {
      existingCodes.add(code);
      return code;
    }
  }
  throw new Error('No se pudo generar un EAN-13 único tras múltiples intentos');
}

/**
 * Listar productos con info de código de barras (paginado + filtros)
 * GET /product/barcodes?page=1&limit=20&keyword=xxx&filter=missing&includeVariants=true
 */
export const getProductsForBarcodes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const keyword = (req.query.keyword || '').trim();
    const filterMissing = req.query.filter === 'missing';
    const includeVariants = req.query.includeVariants === 'true';

    let where = {};

    if (filterMissing) {
      where.OR = [{ barcode: null }, { barcode: '' }];
    }

    if (keyword) {
      const keywordConditions = {
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { sku: { contains: keyword, mode: 'insensitive' } },
          { barcode: { contains: keyword, mode: 'insensitive' } },
        ],
      };
      where = filterMissing
        ? { AND: [where, keywordConditions] }
        : keywordConditions;
    }

    const [totalCount, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          sku: true,
          barcode: true,
          category: true,
          brand: true,
          hasVariants: true,
          images: true,
          ...(includeVariants ? {
            variants: {
              where: { isActive: true },
              select: { id: true, name: true, sku: true, barcode: true },
              orderBy: { createdAt: 'desc' },
            }
          } : {}),
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    // Exponer solo la primera imagen para ahorro de payload
    const result = products.map(({ images, ...p }) => ({
      ...p,
      image: images?.[0] || null,
    }));

    res.status(200).json({ products: result, totalCount, page, totalPages: Math.ceil(totalCount / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching products for barcodes' });
  }
};

/**
 * Verificar unicidad de un código de barras
 * GET /product/barcodes/check?code=XXXX&excludeId=id_producto
 */
export const checkBarcodeUnique = async (req, res) => {
  try {
    const { code, excludeId } = req.query;
    if (!code?.trim()) {
      return res.status(400).json({ error: 'Se requiere el parámetro code' });
    }
    const trimmedCode = code.trim();

    const [productMatch, variantMatch] = await prisma.$transaction([
      prisma.product.findFirst({
        where: {
          barcode: trimmedCode,
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        select: { id: true, name: true },
      }),
      prisma.productVariant.findFirst({
        where: { barcode: trimmedCode },
        select: { id: true, name: true },
      }),
    ]);

    const match = productMatch || variantMatch;
    if (match) {
      return res.status(200).json({ unique: false, usedBy: match });
    }
    res.status(200).json({ unique: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error checking barcode uniqueness' });
  }
};

/**
 * Actualización masiva de códigos de barras
 * PUT /product/barcodes/bulk
 * Body: { updates: [{ id, barcode, isVariant? }] }
 * Si barcode === "__AUTO__" se genera un EAN-13 único automáticamente.
 */
export const bulkUpdateBarcodes = async (req, res) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'Se requiere un array de updates' });
    }

    // 1. Recopilar todos los códigos existentes para garantizar unicidad
    const [existingProducts, existingVariants] = await prisma.$transaction([
      prisma.product.findMany({ select: { barcode: true } }),
      prisma.productVariant.findMany({ select: { barcode: true } }),
    ]);
    const existingCodes = new Set(
      [...existingProducts, ...existingVariants]
        .map(p => p.barcode)
        .filter(Boolean)
    );

    // 2. Resolver códigos "__AUTO__" y validar unicidad de los manuales
    const errors = [];
    const resolved = updates.map((u, idx) => {
      let barcode = u.barcode?.trim() || null;

      if (barcode === '__AUTO__') {
        barcode = generateUniqueEAN13(existingCodes);
      } else if (barcode) {
        if (existingCodes.has(barcode)) {
          errors.push({ index: idx, id: u.id, error: `El código "${barcode}" ya está en uso` });
        } else {
          existingCodes.add(barcode); // reservar para siguientes iteraciones
        }
      }
      return { ...u, barcode };
    });

    if (errors.length > 0) {
      return res.status(409).json({ error: 'Códigos duplicados detectados', errors });
    }

    // 3. Aplicar actualizaciones en transacción
    const ops = resolved.map(u =>
      u.isVariant
        ? prisma.productVariant.update({ where: { id: u.id }, data: { barcode: u.barcode } })
        : prisma.product.update({ where: { id: u.id }, data: { barcode: u.barcode } })
    );

    await prisma.$transaction(ops);

    res.status(200).json({ updated: resolved.length, errors: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating barcodes in bulk' });
  }
};

// Búsqueda rápida optimizada (retorna productos y variantes aplanadas)
export const searchProducts = async (req, res) => {
  try {
    const query = (req.query.query || "").trim();
    if (!query) return res.status(200).json({ products: [] });

    // 1. Buscar en Productos Padre
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { barcode: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
        ]
      },
      include: {
        variants: {
          where: { isActive: true }
        }
      },
      take: 20
    });

    // 2. Buscar en Variantes directamente
    const variants = await prisma.productVariant.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { barcode: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
        ]
      },
      include: {
        product: true
      },
      take: 20
    });

    // 3. Aplanar en un array único sin duplicados usando Map
    const resultsMap = new Map();

    products.forEach(p => {
      // Agregamos el producto padre aunque tenga variantes. El front decide si dejarlo.
      // Omitir si es padre virtual y solo operan las variantes, pero en nuestro caso permitimos
      resultsMap.set(`p-${p.id}`, {
        id: p.id,
        isVariant: false,
        name: p.name,
        sku: p.barcode || p.sku || "N/A",
        costPrice: p.costPrice,
        stock: p.stock,
        image: p.images[0] || null
      });

      // Agregamos sus variantes relacionadas
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach(v => {
          resultsMap.set(`v-${v.id}`, {
            id: v.id,
            productId: p.id,
            isVariant: true,
            name: `${p.name} - ${v.name}`,
            sku: v.barcode || v.sku || "N/A",
            costPrice: v.costPrice,
            stock: v.stock
          });
        });
      }
    });

    variants.forEach(v => {
      if (!resultsMap.has(`v-${v.id}`)) {
        resultsMap.set(`v-${v.id}`, {
          id: v.id,
          productId: v.productId,
          isVariant: true,
          name: `${v.product.name} - ${v.name}`,
          sku: v.barcode || v.sku || "N/A",
          costPrice: v.costPrice,
          stock: v.stock
        });
      }
    });

    console.log("results", results)

    // 4. Convertir a Array y limitar
    // Chequeo si existe match exacto para priorizar
    const results = Array.from(resultsMap.values());
    const exactMatch = results.find(r => r.sku === query || (r.barcode === query));

    // Si hay un match exacto por código y es único, devolvemos solo ese (facilita escáner)
    if (exactMatch && query.length >= 6) {
      return res.status(200).json({ products: [exactMatch] });
    }

    return res.status(200).json({ products: results.slice(0, 15) });

  } catch (err) {
    console.error("Error in searchProducts:", err);
    res.status(500).json({ message: "Error interno en búsqueda de productos", error: err.message });
  }
};

// Obtiene todos los productos y variantes que tienen su stock <= minStock
export const getLowStockProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * pageSize;

    const provider = req.query.provider || "";
    const categoryId = req.query.categoryId || "";
    const subcategoryId = req.query.subcategoryId || "";
    const brand = req.query.brand || "";
    const model = req.query.model || "";

    // Construir where base para filtrar en BD antes de la lógica de stock bajo
    let productWhere = { AND: [{ minStock: { gt: 0 } }] };
    let variantWhere = { isActive: true, minStock: { gt: 0 }, product: {} };

    if (provider) {
      productWhere.AND.push({ provider: provider });
      variantWhere.product.provider = provider;
    }

    if (subcategoryId) {
      productWhere.AND.push({ subcategoryId: subcategoryId });
      variantWhere.product.subcategoryId = subcategoryId;
    } else if (categoryId) {
      productWhere.AND.push({ categoryId: categoryId });
      variantWhere.product.categoryId = categoryId;
    }

    if (brand) {
      // Filtramos en memoria más abajo para evitar problemas de compatibilidad con JSON path en MongoDB
    }

    if (model) {
      // Filtramos en memoria más abajo para evitar problemas de compatibilidad con JSON path en MongoDB
    }

    const stockLevel = req.query.stockLevel || "";

    // 1. Obtener productos padres
    const products = await prisma.product.findMany({
      where: productWhere,
      select: {
        id: true,
        name: true,
        images: true,
        stock: true,
        minStock: true,
        costPrice: true,
        category: true,
        categoryId: true,
        subcategoryId: true,
        provider: true,
        sku: true,
        isAlertMarked: true,
        categoryRel: true,
        subcategoryRel: true,
        attributes: true
      }
    });

    const lowStockProducts = products
      .filter(p => {
        const isLow = p.stock <= p.minStock;
        if (!isLow) return false;
        if (stockLevel === '0' && p.stock !== 0) return false;
        if (stockLevel === '1' && p.stock !== 1) return false;

        // Filtros de Atributos Dinámicos
        if (brand && p.attributes?.marca !== brand) return false;
        if (model && p.attributes?.modelo !== model) return false;

        return true;
      })
      .map(p => ({
        id: p.id,
        isVariant: false,
        name: p.name,
        image: p.images && p.images.length > 0 ? p.images[0] : null,
        stock: p.stock,
        minStock: p.minStock,
        costPrice: p.costPrice,
        category: p.category,
        categoryId: p.categoryId,
        subcategoryId: p.subcategoryId,
        provider: p.provider,
        sku: p.sku,
        isAlertMarked: p.isAlertMarked
      }));

    // 2. Obtener variantes
    const variants = await prisma.productVariant.findMany({
      where: variantWhere,
      select: {
        id: true,
        productId: true,
        name: true,
        images: true,
        stock: true,
        minStock: true,
        costPrice: true,
        sku: true,
        isAlertMarked: true,
        product: {
          select: {
            name: true,
            images: true,
            category: true,
            categoryId: true,
            subcategoryId: true,
            provider: true,
            sku: true,
            categoryRel: true,
            subcategoryRel: true,
            attributes: true
          }
        }
      }
    });

    const lowStockVariants = variants
      .filter(v => {
        const isLow = v.stock <= v.minStock;
        if (!isLow) return false;
        if (stockLevel === '0' && v.stock !== 0) return false;
        if (stockLevel === '1' && v.stock !== 1) return false;

        // Filtros de Atributos Dinámicos (del producto padre)
        if (brand && v.product.attributes?.marca !== brand) return false;
        if (model && v.product.attributes?.modelo !== model) return false;

        return true;
      })
      .map(v => ({
        id: v.id,
        productId: v.productId,
        isVariant: true,
        name: `${v.product.name} - ${v.name}`,
        image: (v.images && v.images.length > 0) ? v.images[0] : (v.product.images && v.product.images.length > 0 ? v.product.images[0] : null),
        stock: v.stock,
        minStock: v.minStock,
        costPrice: v.costPrice,
        category: v.product.category,
        categoryId: v.product.categoryId,
        subcategoryId: v.product.subcategoryId,
        provider: v.product.provider,
        sku: v.sku || v.product.sku,
        isAlertMarked: v.isAlertMarked
      }));

    // 3. Unir, ordenar y paginar
    const allResults = [...lowStockProducts, ...lowStockVariants]
      .sort((a, b) => a.stock - b.stock);

    const globalZeroStockCount = allResults.filter(a => a.stock <= 0).length;
    const totalCount = allResults.length;
    const paginatedResults = allResults.slice(skip, skip + pageSize);
    const globalTotalInvestment = allResults.reduce((sum, item) => {
      const toReplenish = Math.max(0, item.minStock - item.stock);
      return sum + (toReplenish * (item.costPrice || 0));
    }, 0);

    return res.status(200).json({
      alerts: paginatedResults,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      summary: {
        zeroStockCount: globalZeroStockCount,
        totalInvestment: globalTotalInvestment,
        uniqueProviders: Array.from(new Set(allResults.map(a => a.provider).filter(Boolean))).sort()
      }
    });
  } catch (error) {
    console.error("Error in getLowStockProducts:", error);
    res.status(500).json({ message: "Error al cargar alertas de stock", error: error.message });
  }
};

// Toggle marked status for shopping list
export const toggleAlertMark = async (req, res) => {
  const { id } = req.params;
  const { isVariant, marked } = req.body;

  try {
    if (isVariant) {
      await prisma.productVariant.update({
        where: { id },
        data: { isAlertMarked: !!marked }
      });
    } else {
      await prisma.product.update({
        where: { id },
        data: { isAlertMarked: !!marked }
      });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error toggling alert mark:", error);
    res.status(500).json({ error: "Error updating marked status" });
  }
};
// Bulk Toggle marked status for shopping list
export const bulkToggleAlertMark = async (req, res) => {
  const { updates } = req.body;

  if (!Array.isArray(updates)) {
    return res.status(400).json({ error: "Updates must be an array" });
  }

  try {
    const ops = updates.map(u =>
      u.isVariant
        ? prisma.productVariant.update({ where: { id: u.id }, data: { isAlertMarked: !!u.marked } })
        : prisma.product.update({ where: { id: u.id }, data: { isAlertMarked: !!u.marked } })
    );

    await prisma.$transaction(ops);
    res.status(200).json({ success: true, count: updates.length });
  } catch (error) {
    console.error("Error bulk toggling alert mark:", error);
    res.status(500).json({ error: "Error updating marked status in bulk" });
  }
};
