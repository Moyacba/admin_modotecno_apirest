import { prisma } from '../utils/prisma.js';
import { normalizeProduct, normalizeProducts } from '../utils/normalizeProduct.js';

const calculateSearchScore = (product, searchKeyword) => {
  const keyword = searchKeyword.toLowerCase().trim();
  const productName = product.name.toLowerCase();
  const productSku = (product.sku || '').toLowerCase();

  let score = 0;

  if (productName === keyword) {
    score += 1000;
  } else if (productName.startsWith(keyword)) {
    score += 500;
  } else if (productName.includes(keyword)) {
    score += 300;
  }

  const keywordWords = keyword.split(/\s+/).filter(w => w.length > 0);
  const productWords = productName.split(/\s+/).filter(w => w.length > 0);

  let matchedWords = 0;
  let exactWordMatches = 0;
  let wordOrderBonus = 0;

  keywordWords.forEach((kw, index) => {
    const productIndex = productWords.findIndex(pw => pw.includes(kw));
    if (productIndex !== -1) {
      matchedWords++;
      if (productIndex === index) {
        wordOrderBonus += 20;
      }
      if (productWords[productIndex] === kw) {
        exactWordMatches++;
      }
    }
  });

  score += matchedWords * 50;
  score += exactWordMatches * 30;
  score += wordOrderBonus;

  const extraWords = productWords.length - keywordWords.length;
  if (extraWords > 0) {
    score -= extraWords * 10;
  }

  if (productSku === keyword) {
    score += 800;
  } else if (productSku.includes(keyword)) {
    score += 100;
  }

  const lengthDiff = Math.abs(productName.length - keyword.length);
  const lengthPenalty = Math.min(lengthDiff * 2, 100);
  score -= lengthPenalty;

  return score;
};

const applyInAppFilters = (products, brand, model) => {
  if (!brand && !model) return products;

  return products.filter(product => {
    const attrs = product.attributes || {};
    const matchesBrand = !brand || (attrs.marca && String(attrs.marca).toLowerCase() === String(brand).toLowerCase());
    const matchesModel = !model || (attrs.modelo && String(attrs.modelo).toLowerCase() === String(model).toLowerCase());
    return matchesBrand && matchesModel;
  });
};

const productInclude = (includeVariants) => ({
  categoryRel: true,
  subcategoryRel: true,
  ...(includeVariants ? {
    variants: {
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    }
  } : {})
});

export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 12;
    const all = req.query.all === 'true';
    const skip = (page - 1) * pageSize;

    const keyword = (req.query.keyword || "").trim();
    const categoryId = req.query.categoryId || "";
    const subcategoryId = req.query.subcategoryId || "";
    const brand = req.query.brand || "";
    const model = req.query.model || "";
    const includeVariants = req.query.includeVariants === 'true';
    let where = { isActive: true };

    if (subcategoryId) {
      where.subcategoryId = subcategoryId;
    } else if (categoryId) {
      where.categoryId = categoryId;
    }

    const include = productInclude(includeVariants);

    if (keyword) {
      const keywordConditions = keyword.split(' ').filter(k => k).map(key => ({
        OR: [
          { name: { contains: key, mode: 'insensitive' } },
          { barcode: { contains: key, mode: 'insensitive' } },
          { sku: { contains: key, mode: 'insensitive' } },
        ],
      }));

      const andWhere = { ...where, AND: keywordConditions };

      let allProducts = await prisma.product.findMany({
        where: andWhere,
        include,
      });

      allProducts = applyInAppFilters(allProducts, brand, model);

      if (allProducts.length > 0) {
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

        const paginatedProducts = all
          ? productsWithScore.map(({ _score, ...product }) => product)
          : productsWithScore
              .slice(skip, skip + pageSize)
              .map(({ _score, ...product }) => product);

        return res.status(200).json({ products: normalizeProducts(paginatedProducts), totalCount, totalUniqueInStock, totalStock });
      }

      const orWhere = { ...where, OR: keywordConditions.flatMap(c => c.OR) };
      let allProductsOr = await prisma.product.findMany({
        where: orWhere,
        include,
      });

      allProductsOr = applyInAppFilters(allProductsOr, brand, model);

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

      const paginatedProductsOr = all
        ? productsWithScoreOr.map(({ _score, ...product }) => product)
        : productsWithScoreOr
            .slice(skip, skip + pageSize)
            .map(({ _score, ...product }) => product);

      return res.status(200).json({ products: normalizeProducts(paginatedProductsOr), totalCount: totalCountOr, totalUniqueInStock: totalUniqueInStockOr, totalStock: totalStockOr });
    }

    let allProductsNoKeyword = await prisma.product.findMany({
      where,
      include,
      orderBy: { createdAt: 'desc' },
    });

    allProductsNoKeyword = applyInAppFilters(allProductsNoKeyword, brand, model);

    const totalCount = allProductsNoKeyword.length;
    const totalUniqueInStock = allProductsNoKeyword.filter(p => Number(p.stock || 0) > 0).length;
    const totalStock = allProductsNoKeyword.reduce((acc, p) => acc + Number(p.stock || 0), 0);
    const paginatedProducts = all ? allProductsNoKeyword : allProductsNoKeyword.slice(skip, skip + pageSize);

    res.status(200).json({ products: normalizeProducts(paginatedProducts), totalCount, totalUniqueInStock, totalStock });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error fetching products" });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  const includeVariants = req.query.includeVariants === 'true';

  try {
    const product = await prisma.product.findUnique({
      where: { id, isActive: true },
      include: productInclude(includeVariants),
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(normalizeProduct(product));
  } catch (error) {
    res.status(500).json({ error: "Error fetching product" });
  }
};

export const getProductBySlug = async (req, res) => {
  const { slug } = req.params;
  const includeVariants = req.query.includeVariants === 'true';

  try {
    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: productInclude(includeVariants),
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(normalizeProduct(product));
  } catch (error) {
    res.status(500).json({ error: "Error fetching product" });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const query = (req.query.query || "").trim();
    if (!query) return res.status(200).json({ products: [] });

    const productWhereBase = {
      isActive: true,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { barcode: { contains: query, mode: "insensitive" } },
        { sku: { contains: query, mode: "insensitive" } },
      ]
    };

    const products = await prisma.product.findMany({
      where: productWhereBase,
      include: {
        variants: {
          where: { isActive: true }
        }
      },
      take: 20
    });

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
        product: { where: { isActive: true } }
      },
      take: 20
    });

    const resultsMap = new Map();

    products.forEach(p => {
      resultsMap.set(`p-${p.id}`, {
        id: p.id,
        isVariant: false,
        name: p.name,
        sku: p.barcode || p.sku || "N/A",
        costPrice: p.costPrice,
        stock: p.stock,
        image: p.images[0] || null
      });

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
        if (v.product) {
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
      }
    });

    const results = Array.from(resultsMap.values());
    const exactMatch = results.find(r => r.sku === query);

    if (exactMatch && query.length >= 6) {
      return res.status(200).json({ products: [exactMatch] });
    }

    return res.status(200).json({ products: results.slice(0, 15) });

  } catch (err) {
    console.error("Error in searchProducts:", err);
    res.status(500).json({ message: "Error interno en búsqueda de productos", error: err.message });
  }
};