# API v2 Ecommerce Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a v2 API under `/api/v2/` for ecommerce-specific endpoints with slug lookup, promoPrice normalization, isActive filtering, and removal of broken category/tree.

**Architecture:** Directory `src/v2/` with controllers, routes, services, and utils. Routes registered in `app.js` under `/api/v2`. Reuses same PrismaClient and DB. Schema modified to add `isActive` to Product model. Migration script handles backfill.

**Tech Stack:** Express.js, Prisma ORM, MongoDB

**Spec:** `docs/superpowers/specs/2026-06-06-api-v2-ecommerce-design.md`

---

## File Structure

```
prisma/schema.prisma                          # MODIFY — add isActive to Product
src/app.js                                    # MODIFY — register v2 router
src/scripts/addIsActiveField.js               # CREATE — migration backfill script
src/v2/
├── controllers/
│   ├── categoryController.js                 # getCategories, getCategoryById (no tree)
│   ├── productController.js                  # getProducts, getProductById, getProductBySlug, searchProducts
│   ├── hybridProductController.js            # static/dynamic endpoints with isActive + normalize
│   └── productVariantController.js           # getProductVariants (read-only)
├── routes/
│   ├── index.js                              # Main v2 router
│   ├── productRoutes.js                      # /product/*
│   ├── categoryRoutes.js                     # /category/*
│   ├── hybridRoutes.js                       # /product/static, /product/dynamic, etc.
│   └── productVariantRoutes.js               # /product/:productId/variants
├── services/
│   └── recommendationService.js              # getRecommendations with isActive filter + normalize
└── utils/
    ├── normalizeProduct.js                   # Helper: promoPrice/percentPrice 0 → null
    └── prisma.js                             # Reexport shared PrismaClient
```

---

### Task 1: Add isActive to Product schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add isActive field to Product model**

In `prisma/schema.prisma`, add `isActive Boolean @default(true)` to the `Product` model after the `isAlertMarked` field (line 49):

```prisma
  isAlertMarked  Boolean          @default(false)
  isActive       Boolean          @default(true)
  lastCost       Float?           // Último costo de compra registrado
```

- [ ] **Step 2: Run prisma generate to update the client**

Run: `npx prisma generate --schema=./prisma/schema.prisma`

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add isActive field to Product model"
```

---

### Task 2: Create migration backfill script

**Files:**
- Create: `src/scripts/addIsActiveField.js`

- [ ] **Step 1: Create the migration script**

Create `src/scripts/addIsActiveField.js`:

```javascript
import { PrismaClient } from 'db';
const prisma = new PrismaClient();

async function main() {
  console.log('Starting isActive backfill...');
  
  const result = await prisma.product.updateMany({
    where: { isActive: { equals: null } },
    data: { isActive: true }
  });

  if (result.count === 0) {
    const allProducts = await prisma.product.findMany({ select: { id: true, isActive: true } });
    const nullProducts = allProducts.filter(p => p.isActive === null);
    
    if (nullProducts.length > 0) {
      console.log(`Found ${nullProducts.length} products with null isActive, updating...`);
      for (const p of nullProducts) {
        await prisma.product.update({ where: { id: p.id }, data: { isActive: true } });
      }
      console.log(`Updated ${nullProducts.length} products.`);
    } else {
      console.log('All products already have isActive set. No changes needed.');
    }
  } else {
    console.log(`Updated ${result.count} products with isActive = true.`);
  }

  const totalActive = await prisma.product.count({ where: { isActive: true } });
  const totalProducts = await prisma.product.count();
  console.log(`Active products: ${totalActive}/${totalProducts}`);

  await prisma.$disconnect();
  console.log('Done.');
}

main().catch(e => {
  console.error('Backfill failed:', e);
  process.exit(1);
});
```

- [ ] **Step 2: Test the script (dry check — ensure it runs without error)**

Run: `node src/scripts/addIsActiveField.js`

Expected: Output listing active products count. No errors.

- [ ] **Step 3: Commit**

```bash
git add src/scripts/addIsActiveField.js
git commit -m "feat: add isActive backfill migration script"
```

---

### Task 3: Create normalizeProduct utility

**Files:**
- Create: `src/v2/utils/normalizeProduct.js`

- [ ] **Step 1: Create the normalizeProduct helper**

Create `src/v2/utils/normalizeProduct.js`:

```javascript
export const normalizeProduct = (product) => {
  if (!product) return product;

  const normalized = {
    ...product,
    promoPrice: product.promoPrice === 0 ? null : product.promoPrice,
    percentPrice: product.percentPrice === 0 ? null : product.percentPrice,
  };

  if (normalized.variants && Array.isArray(normalized.variants)) {
    normalized.variants = normalized.variants.map(variant => ({
      ...variant,
      promoPrice: variant.promoPrice === 0 ? null : variant.promoPrice,
      percentPrice: variant.percentPrice === 0 ? null : variant.percentPrice,
    }));
  }

  return normalized;
};

export const normalizeProducts = (products) => {
  if (!Array.isArray(products)) return products;
  return products.map(normalizeProduct);
};
```

- [ ] **Step 2: Commit**

```bash
git add src/v2/utils/normalizeProduct.js
git commit -m "feat: add normalizeProduct utility for v2"
```

---

### Task 4: Create prisma utility reexport

**Files:**
- Create: `src/v2/utils/prisma.js`

- [ ] **Step 1: Create the prisma reexport**

Create `src/v2/utils/prisma.js`:

```javascript
import { PrismaClient } from 'db';

export const prisma = new PrismaClient();
```

Note: This matches the pattern used in v1 controllers (`const prisma = new PrismaClient()`). Each controller imports from this shared module.

- [ ] **Step 2: Commit**

```bash
git add src/v2/utils/prisma.js
git commit -m "feat: add shared prisma client for v2"
```

---

### Task 5: Create v2 category controller and routes

**Files:**
- Create: `src/v2/controllers/categoryController.js`
- Create: `src/v2/routes/categoryRoutes.js`

- [ ] **Step 1: Create category controller**

Create `src/v2/controllers/categoryController.js`:

```javascript
import { prisma } from '../utils/prisma.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: true
      }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: true
      }
    });
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

- [ ] **Step 2: Create category routes**

Create `src/v2/routes/categoryRoutes.js`:

```javascript
import express from 'express';
import { getCategories, getCategoryById } from '../controllers/categoryController.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);

export default router;
```

- [ ] **Step 3: Commit**

```bash
git add src/v2/controllers/categoryController.js src/v2/routes/categoryRoutes.js
git commit -m "feat: add v2 category controller and routes (no /tree)"
```

---

### Task 6: Create v2 product controller

**Files:**
- Create: `src/v2/controllers/productController.js`

- [ ] **Step 1: Create product controller with all endpoints**

Create `src/v2/controllers/productController.js`. This is the largest file — it includes `getProducts`, `getProductById`, `getProductBySlug`, `searchProducts`, all with `isActive: true` filter and `normalizeProduct`.

The key differences from v1:
- All read queries add `isActive: true` to the `where` clause
- `getProductBySlug` is new — uses `findUnique({ where: { slug } })`
- All responses go through `normalizeProduct`/`normalizeProducts`
- `searchProducts` also filters by `isActive: true`
- `status` field bug from hybrid controller is NOT carried over

```javascript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/v2/controllers/productController.js
git commit -m "feat: add v2 product controller with isActive filter, normalizeProduct, and getBySlug"
```

---

### Task 7: Create v2 product routes

**Files:**
- Create: `src/v2/routes/productRoutes.js`

- [ ] **Step 1: Create product routes**

Create `src/v2/routes/productRoutes.js`:

```javascript
import express from "express";
import {
  getProducts,
  getProductById,
  getProductBySlug,
  searchProducts,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/search", searchProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/", getProducts);
router.get("/:id", getProductById);

export default router;
```

- [ ] **Step 2: Commit**

```bash
git add src/v2/routes/productRoutes.js
git commit -m "feat: add v2 product routes with slug/:slug endpoint"
```

---

### Task 8: Create v2 hybrid product controller

**Files:**
- Create: `src/v2/controllers/hybridProductController.js`

- [ ] **Step 1: Create hybrid product controller**

Create `src/v2/controllers/hybridProductController.js`. Key differences from v1:
- All `where` clauses include `isActive: true`
- All responses go through `normalizeProduct`/`normalizeProducts`
- The `status` field bug is removed from `select` (replaced with `isActive`)
- Variants filtered by `isActive: true`

```javascript
import { prisma } from '../utils/prisma.js';
import { normalizeProduct, normalizeProducts } from '../utils/normalizeProduct.js';

const triggerRevalidation = async (product) => {
  if (!process.env.NEXTJS_BASE_URL) return;
  const paths = [
    '/api/product/static',
    '/api/product/dynamic',
  ];
  if (product?.slug) {
    paths.push(`/producto/${product.slug}`);
  }
  try {
    await fetch(`${process.env.NEXTJS_BASE_URL}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths }),
    });
  } catch (err) {
    console.error('Revalidation trigger failed:', err.message);
  }
};

export const getProductsStatic = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * pageSize;

    const keyword = (req.query.keyword || "").trim();
    const category = req.query.category || "";
    const includeVariants = req.query.includeVariants === 'true';
    const brand = req.query.brand || "";
    const model = req.query.model || "";
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;
    const categoryId = req.query.categoryId || "";
    const subcategoryId = req.query.subcategoryId || "";
    const attribute = req.query.attribute || "";

    let where = { isActive: true };

    if (category) {
      where.category = category;
    }

    if (brand) {
      where.brand = { equals: brand, mode: 'insensitive' };
    }

    if (minPrice !== null) {
      where.salePrice = { ...where.salePrice, gte: minPrice };
    }

    if (maxPrice !== null) {
      where.salePrice = { ...where.salePrice, lte: maxPrice };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (subcategoryId) {
      where.subcategoryId = subcategoryId;
    }

    const selectFields = {
      id: true,
      sku: true,
      slug: true,
      barcode: true,
      name: true,
      description: true,
      category: true,
      brand: true,
      provider: true,
      images: true,
      specifications: true,
      hasVariants: true,
      minStock: true,
      salePrice: true,
      promoPrice: true,
      percentPrice: true,
      isActive: true,
      categoryId: true,
      subcategoryId: true,
      createdAt: true,
      updatedAt: true,
      variants: includeVariants ? {
        select: {
          id: true,
          name: true,
          specifications: true,
          barcode: true,
          sku: true,
          isActive: true,
        },
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      } : false
    };

    const buildKeywordConditions = (keyword) =>
      keyword.split(' ').filter(k => k).map(key => ({
        OR: [
          { name: { contains: key, mode: 'insensitive' } },
          { barcode: { contains: key, mode: 'insensitive' } },
          { sku: { contains: key, mode: 'insensitive' } },
        ],
      }));

    let filteredProducts = [];
    let totalCount = 0;

    if (keyword) {
      const keywordConditions = buildKeywordConditions(keyword);
      const andWhere = { ...where, AND: keywordConditions };
      totalCount = await prisma.product.count({ where: andWhere });

      if (totalCount > 0) {
        filteredProducts = await prisma.product.findMany({
          where: andWhere,
          select: selectFields,
          orderBy: { createdAt: 'desc' },
        });
      } else {
        const orWhere = { ...where, OR: keywordConditions.flatMap(c => c.OR) };
        totalCount = await prisma.product.count({ where: orWhere });
        filteredProducts = await prisma.product.findMany({
          where: orWhere,
          select: selectFields,
          orderBy: { createdAt: 'desc' },
        });
      }
    } else {
      totalCount = await prisma.product.count({ where });
      filteredProducts = await prisma.product.findMany({
        where,
        select: selectFields,
        orderBy: { createdAt: 'desc' },
      });
    }

    if (model) {
      filteredProducts = filteredProducts.filter(p => {
        const attrs = p.specifications || {};
        return attrs.modelo && attrs.modelo.toLowerCase().includes(model.toLowerCase());
      });
      totalCount = filteredProducts.length;
    }

    if (attribute) {
      const [attrKey, attrValue] = attribute.split(':');
      if (attrKey && attrValue !== undefined) {
        filteredProducts = filteredProducts.filter(p => {
          const attrs = p.specifications || {};
          return attrs[attrKey] && String(attrs[attrKey]).toLowerCase() === attrValue.toLowerCase();
        });
        totalCount = filteredProducts.length;
      }
    }

    const brands = [...new Set(filteredProducts.map(p => p.brand).filter(Boolean))];
    const models = [...new Set(filteredProducts.map(p => {
      const attrs = p.specifications || {};
      return attrs.modelo;
    }).filter(Boolean))];
    const salePrices = filteredProducts.map(p => p.salePrice).filter(p => p !== null && p !== undefined);
    const priceRange = salePrices.length > 0 ? {
      min: Math.min(...salePrices),
      max: Math.max(...salePrices),
    } : { min: 0, max: 0 };
    const categoryMap = {};
    filteredProducts.forEach(p => {
      if (p.category) {
        categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
      }
    });
    const categories = Object.entries(categoryMap).map(([name, count]) => ({ name, count }));

    const availableFilters = {
      brands,
      models,
      priceRange,
      categories,
    };

    const paginatedProducts = filteredProducts.slice(skip, skip + pageSize);

    res.status(200).json({ products: normalizeProducts(paginatedProducts), totalCount, availableFilters });

  } catch (err) {
    console.error('Error fetching static products:', err);
    res.status(500).json({ error: "Error fetching static product data" });
  }
};

export const getProductsDynamic = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * pageSize;

    const keyword = (req.query.keyword || "").trim();
    const category = req.query.category || "";
    const includeVariants = req.query.includeVariants === 'true';

    let where = { isActive: true };

    if (category) {
      where.category = category;
    }

    const dynamicSelect = {
      id: true,
      stock: true,
      costPrice: true,
      salePrice: true,
      promoPrice: true,
      percentPrice: true,
      isActive: true,
      variants: includeVariants ? {
        select: {
          id: true,
          stock: true,
          costPrice: true,
          salePrice: true,
          promoPrice: true,
          percentPrice: true,
          isActive: true,
        },
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      } : false
    };

    if (keyword) {
      const keywordConditions = keyword.split(' ').filter(k => k).map(key => ({
        OR: [
          { name: { contains: key, mode: 'insensitive' } },
          { barcode: { contains: key, mode: 'insensitive' } },
          { sku: { contains: key, mode: 'insensitive' } },
        ],
      }));

      const andWhere = { ...where, AND: keywordConditions };
      let totalCount = await prisma.product.count({ where: andWhere });

      if (totalCount > 0) {
        const products = await prisma.product.findMany({
          where: andWhere,
          skip,
          take: pageSize,
          select: dynamicSelect,
          orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json({ products: normalizeProducts(products), totalCount });
      }

      const orWhere = { ...where, OR: keywordConditions.flatMap(c => c.OR) };
      totalCount = await prisma.product.count({ where: orWhere });
      const products = await prisma.product.findMany({
        where: orWhere,
        skip,
        take: pageSize,
        select: dynamicSelect,
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json({ products: normalizeProducts(products), totalCount });
    }

    const totalCount = await prisma.product.count({ where });
    const products = await prisma.product.findMany({
      where,
      skip,
      take: pageSize,
      select: dynamicSelect,
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ products: normalizeProducts(products), totalCount });

  } catch (err) {
    console.error('Error fetching dynamic products:', err);
    res.status(500).json({ error: "Error fetching dynamic product data" });
  }
};

export const getProductStaticById = async (req, res) => {
  const { id } = req.params;
  const includeVariants = req.query.includeVariants === 'true';

  try {
    const product = await prisma.product.findUnique({
      where: { id, isActive: true },
      select: {
        id: true,
        sku: true,
        slug: true,
        barcode: true,
        name: true,
        description: true,
        category: true,
        brand: true,
        provider: true,
        images: true,
        specifications: true,
        hasVariants: true,
        minStock: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        variants: includeVariants ? {
          select: {
            id: true,
            name: true,
            specifications: true,
            barcode: true,
            sku: true,
            isActive: true,
          },
          where: { isActive: true }
        } : false
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(normalizeProduct(product));
  } catch (error) {
    console.error('Error fetching static product:', error);
    res.status(500).json({ error: "Error fetching static product data" });
  }
};

export const getProductDynamicById = async (req, res) => {
  const { id } = req.params;
  const includeVariants = req.query.includeVariants === 'true';

  try {
    const product = await prisma.product.findUnique({
      where: { id, isActive: true },
      select: {
        id: true,
        stock: true,
        costPrice: true,
        salePrice: true,
        promoPrice: true,
        percentPrice: true,
        isActive: true,
        variants: includeVariants ? {
          select: {
            id: true,
            stock: true,
            costPrice: true,
            salePrice: true,
            promoPrice: true,
            percentPrice: true,
            isActive: true,
          },
          where: { isActive: true }
        } : false
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(normalizeProduct(product));
  } catch (error) {
    console.error('Error fetching dynamic product:', error);
    res.status(500).json({ error: "Error fetching dynamic product data" });
  }
};
```

- [ ] **Step 2: Commit**

```bash
git add src/v2/controllers/hybridProductController.js
git commit -m "feat: add v2 hybrid product controller with isActive filter and normalizeProduct"
```

---

### Task 9: Create v2 product variant controller

**Files:**
- Create: `src/v2/controllers/productVariantController.js`

- [ ] **Step 1: Create product variant controller (read-only)**

Create `src/v2/controllers/productVariantController.js`:

```javascript
import { prisma } from '../utils/prisma.js';
import { normalizeProducts } from '../utils/normalizeProduct.js';

export const getProductVariants = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true },
      select: { id: true }
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const variants = await prisma.productVariant.findMany({
      where: {
        productId,
        isActive: true
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(normalizeProducts(variants));
  } catch (error) {
    console.error('Error fetching product variants:', error);
    res.status(500).json({ error: "Error fetching product variants" });
  }
};
```

- [ ] **Step 2: Commit**

```bash
git add src/v2/controllers/productVariantController.js
git commit -m "feat: add v2 product variant controller (read-only, isActive filter)"
```

---

### Task 10: Create v2 recommendation service

**Files:**
- Create: `src/v2/services/recommendationService.js`

- [ ] **Step 1: Create recommendation service with isActive filter**

Create `src/v2/services/recommendationService.js`:

```javascript
import { prisma } from '../utils/prisma.js';
import { normalizeProducts } from '../utils/normalizeProduct.js';

export const getRecommendations = async (productId) => {
    const product = await prisma.product.findUnique({
        where: { id: productId, isActive: true },
        include: { subcategoryRel: true }
    });

    if (!product || !product.subcategoryId) return [];

    const rules = await prisma.recommendationRule.findMany({
        where: { sourceSubcategoryId: product.subcategoryId }
    });

    let recommendedProducts = [];

    for (const rule of rules) {
        let where = {
            subcategoryId: rule.targetSubcategoryId,
            id: { not: productId },
            isActive: true
        };

        if (rule.ruleType === 'attributeMatch' && rule.matchAttributes) {
            const targetProducts = await prisma.product.findMany({ where });
            
            const filtered = targetProducts.filter(p => {
                const productAttrs = product.attributes || {};
                const targetAttrs = p.attributes || {};
                
                return rule.matchAttributes.every(attrName => {
                    const sourceVal = productAttrs[attrName.toLowerCase()];
                    const targetVal = targetAttrs[attrName.toLowerCase()];
                    return sourceVal && targetVal && sourceVal === targetVal;
                });
            });
            
            recommendedProducts = [...recommendedProducts, ...filtered];
        } 
        else if (rule.ruleType === 'deviceMatch') {
            const productCompatIds = await prisma.productCompatibility.findMany({
                where: { productId },
                select: { deviceModelId: true }
            }).then(c => c.map(i => i.deviceModelId));

            const compatProducts = await prisma.product.findMany({
                where: {
                    ...where,
                    compatibilities: {
                        some: {
                            deviceModelId: { in: productCompatIds }
                        }
                    }
                }
            });
            recommendedProducts = [...recommendedProducts, ...compatProducts];
        }
        else if (rule.ruleType === 'categoryCrossSell') {
            const crossProducts = await prisma.product.findMany({ where, take: 5 });
            recommendedProducts = [...recommendedProducts, ...crossProducts];
        }
    }

    const uniqueIds = new Set();
    const unique = recommendedProducts.filter(p => {
        if (uniqueIds.has(p.id)) return false;
        uniqueIds.add(p.id);
        return true;
    });

    return normalizeProducts(unique);
};
```

- [ ] **Step 2: Commit**

```bash
git add src/v2/services/recommendationService.js
git commit -m "feat: add v2 recommendation service with isActive filter and normalizeProduct"
```

---

### Task 11: Create v2 hybrid routes

**Files:**
- Create: `src/v2/routes/hybridRoutes.js`

- [ ] **Step 1: Create hybrid routes (product-only)**

Create `src/v2/routes/hybridRoutes.js`:

```javascript
import express from "express";
import {
  getProductsStatic,
  getProductsDynamic,
  getProductStaticById,
  getProductDynamicById,
} from "../controllers/hybridProductController.js";

const router = express.Router();

router.get("/product/static", getProductsStatic);
router.get("/product/dynamic", getProductsDynamic);
router.get("/product/:id/static", getProductStaticById);
router.get("/product/:id/dynamic", getProductDynamicById);

export default router;
```

- [ ] **Step 2: Commit**

```bash
git add src/v2/routes/hybridRoutes.js
git commit -m "feat: add v2 hybrid routes for products"
```

---

### Task 12: Create v2 product variant routes

**Files:**
- Create: `src/v2/routes/productVariantRoutes.js`

- [ ] **Step 1: Create product variant routes (read-only)**

Create `src/v2/routes/productVariantRoutes.js`:

```javascript
import express from "express";
import { getProductVariants } from "../controllers/productVariantController.js";

const router = express.Router();

router.get("/:productId/variants", getProductVariants);

export default router;
```

- [ ] **Step 2: Commit**

```bash
git add src/v2/routes/productVariantRoutes.js
git commit -m "feat: add v2 product variant routes (read-only)"
```

---

### Task 13: Create v2 routes index

**Files:**
- Create: `src/v2/routes/index.js`

- [ ] **Step 1: Create the main v2 router**

Create `src/v2/routes/index.js`:

```javascript
import { Router } from "express";
import productRoutes from "./productRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import hybridRoutes from "./hybridRoutes.js";
import productVariantRoutes from "./productVariantRoutes.js";

const router = Router();

router.use("/product", productRoutes);
router.use("/product", productVariantRoutes);
router.use("/category", categoryRoutes);
router.use("/", hybridRoutes);

router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      products: [
        "GET /api/v2/product/",
        "GET /api/v2/product/slug/:slug",
        "GET /api/v2/product/search",
        "GET /api/v2/product/:id",
        "GET /api/v2/product/:productId/variants",
      ],
      hybrid: [
        "GET /api/v2/product/static",
        "GET /api/v2/product/dynamic",
        "GET /api/v2/product/:id/static",
        "GET /api/v2/product/:id/dynamic",
      ],
      categories: [
        "GET /api/v2/category/",
        "GET /api/v2/category/:id",
      ],
    },
  });
});

export default router;
```

- [ ] **Step 2: Commit**

```bash
git add src/v2/routes/index.js
git commit -m "feat: add v2 routes index with health endpoint"
```

---

### Task 14: Register v2 router in app.js

**Files:**
- Modify: `src/app.js`

- [ ] **Step 1: Add v2 router import and registration**

In `src/app.js`, add the import after line 6 (`import router from "./routes/index.js";`):

```javascript
import v2Router from "./v2/routes/index.js";
```

And add the v2 route registration after line 49 (`app.use("/api", router);`):

```javascript
app.use("/api/v2", v2Router);
```

- [ ] **Step 2: Verify the app starts without errors**

Run: `node src/app.js` (then Ctrl+C after confirming it starts)

Expected: Server starts successfully with message about port 4000.

- [ ] **Step 3: Commit**

```bash
git add src/app.js
git commit -m "feat: register v2 API routes in app.js"
```

---

### Task 15: Run Prisma migration and backfill

- [ ] **Step 1: Push schema changes to MongoDB**

Run: `npx prisma db push --schema=./prisma/schema.prisma`

Expected: Schema synced, `isActive` field added to Product collection.

- [ ] **Step 2: Generate Prisma client**

Run: `npx prisma generate --schema=./prisma/schema.prisma`

Expected: Prisma client generated with `isActive` field.

- [ ] **Step 3: Run backfill script**

Run: `node src/scripts/addIsActiveField.js`

Expected: All existing products set to `isActive: true`. Output showing count.

- [ ] **Step 4: Verify slug unique index exists**

Run the following in MongoDB shell or via script:

```javascript
// In MongoDB shell: use your_database; db.products.getIndexes()
```

Expected: An index on `slug` field with `unique: true`.

---

### Task 16: Manual endpoint verification

- [ ] **Step 1: Start the server**

Run: `npm run dev`

- [ ] **Step 2: Test v2 product endpoints**

```bash
# Get all products (should only return isActive: true)
curl http://localhost:4000/api/v2/product/

# Get product by ID
curl http://localhost:4000/api/v2/product/<existing-id>

# Get product by slug
curl http://localhost:4000/api/v2/product/slug/<existing-slug>

# Search products
curl "http://localhost:4000/api/v2/product/search?query=funda"

# Verify promoPrice: 0 is returned as null
```

- [ ] **Step 3: Test v2 hybrid endpoints**

```bash
# Static products
curl http://localhost:4000/api/v2/product/static

# Dynamic products
curl http://localhost:4000/api/v2/product/dynamic

# Static by ID
curl http://localhost:4000/api/v2/product/<id>/static

# Dynamic by ID
curl http://localhost:4000/api/v2/product/<id>/dynamic
```

- [ ] **Step 4: Test v2 category endpoints**

```bash
# Get all categories
curl http://localhost:4000/api/v2/category/

# Get category by ID
curl http://localhost:4000/api/v2/category/<id>
```

- [ ] **Step 5: Test v2 health endpoint**

```bash
curl http://localhost:4000/api/v2/health
```

Expected: JSON response with version "2.0.0" and list of endpoints.

- [ ] **Step 6: Verify v1 is intact**

```bash
# Ensure v1 still works
curl http://localhost:4000/api/product/
curl http://localhost:4000/api/category/
curl http://localhost:4000/api/category/tree
```

Expected: All v1 endpoints return same responses as before.