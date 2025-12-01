import { PrismaClient } from "db";
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

// Obtener todos los productos (incluyendo variantes en búsqueda)
export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 12;
    const skip = (page - 1) * pageSize;

    const keyword = (req.query.keyword || "").trim();
    const category = req.query.category || "";
    const includeVariants = req.query.includeVariants === 'true';

    let where = {};

    if (category) {
      where.category = category;
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
      let totalCount = await prisma.product.count({ where: andWhere });

      if (totalCount > 0) {
        // Obtener TODOS los resultados para poder ordenarlos por score
        const allProducts = await prisma.product.findMany({
          where: andWhere,
          include: includeVariants ? {
            variants: {
              where: { isActive: true },
              orderBy: { createdAt: 'desc' },
            }
          } : undefined,
        });
        
        // Calcular score y ordenar por relevancia
        const productsWithScore = allProducts.map(product => ({
          ...product,
          _score: calculateSearchScore(product, keyword)
        }));
        
        productsWithScore.sort((a, b) => {
          // Primero por score (descendente)
          if (b._score !== a._score) {
            return b._score - a._score;
          }
          // Si tienen el mismo score, por fecha de creación
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        // Aplicar paginación después del ordenamiento
        const paginatedProducts = productsWithScore
          .slice(skip, skip + pageSize)
          .map(({ _score, ...product }) => product); // Remover el score del resultado
        
        return res.status(200).json({ products: paginatedProducts, totalCount });
      }

      // Si no hay resultados con AND, usar OR
      const orWhere = { ...where, OR: keywordConditions.flatMap(c => c.OR) };
      totalCount = await prisma.product.count({ where: orWhere });
      
      // Obtener TODOS los resultados para poder ordenarlos por score
      const allProducts = await prisma.product.findMany({
        where: orWhere,
        include: includeVariants ? {
          variants: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
          }
        } : undefined,
      });
      
      // Calcular score y ordenar por relevancia
      const productsWithScore = allProducts.map(product => ({
        ...product,
        _score: calculateSearchScore(product, keyword)
      }));
      
      productsWithScore.sort((a, b) => {
        // Primero por score (descendente)
        if (b._score !== a._score) {
          return b._score - a._score;
        }
        // Si tienen el mismo score, por fecha de creación
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      // Aplicar paginación después del ordenamiento
      const paginatedProducts = productsWithScore
        .slice(skip, skip + pageSize)
        .map(({ _score, ...product }) => product); // Remover el score del resultado
      
      return res.status(200).json({ products: paginatedProducts, totalCount });
    }

    // Si no hay keyword, solo filtrar por categoría (si existe)
    const totalCount = await prisma.product.count({ where });
    const products = await prisma.product.findMany({
      where,
      skip,
      take: pageSize,
      include: includeVariants ? {
        variants: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        }
      } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ products, totalCount });

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
      include: includeVariants ? {
        variants: {
          where: { isActive: true },
        }
      } : undefined,
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
  const {
    barcode,
    sku,
    name,
    description,
    category,
    brand,
    provider,
    costPrice,
    salePrice,
    promoPrice,
    percentPrice,
    stock,
    minStock,
    images,
    specifications,
    hasVariants,
  } = req.body;

  try {
    const newProduct = await prisma.product.create({
      data: {
        barcode,
        sku,
        name,
        description,
        category,
        brand,
        provider,
        costPrice,
        salePrice,
        promoPrice,
        percentPrice,
        stock,
        minStock: minStock || 0,
        images,
        specifications,
        hasVariants: hasVariants || false,
      },
    });
    res.status(201).json(newProduct);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error creating product" });
  }
};

// Actualizar un producto
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    updatedAt,
    barcode,
    sku,
    name,
    description,
    category,
    brand,
    provider,
    costPrice,
    salePrice,
    promoPrice,
    percentPrice,
    stock,
    minStock,
    images,
    specifications,
    hasVariants,
  } = req.body;

  try {
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        updatedAt,
        barcode,
        sku,
        name,
        description,
        category,
        brand,
        provider,
        costPrice,
        salePrice,
        promoPrice,
        percentPrice,
        stock,
        minStock: minStock !== undefined ? minStock : 0,
        images,
        specifications,
        hasVariants: hasVariants !== undefined ? hasVariants : false,
      },
    });
    res.status(201).json(updatedProduct);
  } catch (error) {
    console.log(error);
    if (error.code === "P2025") {
      // Product not found
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(500).json({ error: "Error updating product" });
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
