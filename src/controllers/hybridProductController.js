import { PrismaClient } from "db";
const prisma = new PrismaClient();

// ====== ENDPOINTS HÍBRIDOS PARA PRODUCTOS ======

// Obtener datos ESTÁTICOS de productos (cache largo - 30 minutos)
export const getProductsStatic = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 12;
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

      // Usar AND para búsqueda precisa
      const andWhere = { ...where, AND: keywordConditions };
      let totalCount = await prisma.product.count({ where: andWhere });

      if (totalCount > 0) {
        const products = await prisma.product.findMany({
          where: andWhere,
          skip,
          take: pageSize,
          select: {
            id: true,
            sku: true,
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
            createdAt: true,
            updatedAt: true,
            // NO incluir: stock, costPrice, salePrice, promoPrice, percentPrice
            variants: includeVariants ? {
              select: {
                id: true,
                name: true,
                specifications: true,
                barcode: true,
                sku: true,
                isActive: true,
                // NO incluir: stock, costPrice, salePrice
              },
              where: { isActive: true },
              orderBy: { createdAt: 'desc' }
            } : false
          },
          orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json({ products, totalCount });
      }

      // Fallback a OR si no hay resultados
      const orWhere = { ...where, OR: keywordConditions.flatMap(c => c.OR) };
      totalCount = await prisma.product.count({ where: orWhere });
      const products = await prisma.product.findMany({
        where: orWhere,
        skip,
        take: pageSize,
        select: {
          id: true,
          sku: true,
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
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json({ products, totalCount });
    }

    // Sin keyword, solo filtros
    const totalCount = await prisma.product.count({ where });
    const products = await prisma.product.findMany({
      where,
      skip,
      take: pageSize,
      select: {
        id: true,
        sku: true,
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
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ products, totalCount });

  } catch (err) {
    console.error('Error fetching static products:', err);
    res.status(500).json({ error: "Error fetching static product data" });
  }
};

// Obtener datos DINÁMICOS de productos (cache corto - 30 segundos + polling)
export const getProductsDynamic = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 12;
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

      const andWhere = { ...where, AND: keywordConditions };
      let totalCount = await prisma.product.count({ where: andWhere });

      if (totalCount > 0) {
        const products = await prisma.product.findMany({
          where: andWhere,
          skip,
          take: pageSize,
          select: {
            id: true,
            stock: true,
            costPrice: true,
            salePrice: true,
            promoPrice: true,
            percentPrice: true,
            status: true,
            // Solo datos dinámicos
            variants: includeVariants ? {
              select: {
                id: true,
                stock: true,
                costPrice: true,
                salePrice: true,
                status: true,
              },
              where: { isActive: true },
              orderBy: { createdAt: 'desc' }
            } : false
          },
          orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json({ products, totalCount });
      }

      // Fallback a OR
      const orWhere = { ...where, OR: keywordConditions.flatMap(c => c.OR) };
      totalCount = await prisma.product.count({ where: orWhere });
      const products = await prisma.product.findMany({
        where: orWhere,
        skip,
        take: pageSize,
        select: {
          id: true,
          stock: true,
          costPrice: true,
          salePrice: true,
          promoPrice: true,
          percentPrice: true,
          status: true,
          variants: includeVariants ? {
            select: {
              id: true,
              stock: true,
              costPrice: true,
              salePrice: true,
              status: true,
            },
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
          } : false
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json({ products, totalCount });
    }

    // Sin keyword
    const totalCount = await prisma.product.count({ where });
    const products = await prisma.product.findMany({
      where,
      skip,
      take: pageSize,
      select: {
        id: true,
        stock: true,
        costPrice: true,
        salePrice: true,
        promoPrice: true,
        percentPrice: true,
        status: true,
        variants: includeVariants ? {
          select: {
            id: true,
            stock: true,
            costPrice: true,
            salePrice: true,
            status: true,
          },
          where: { isActive: true },
          orderBy: { createdAt: 'desc' }
        } : false
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ products, totalCount });

  } catch (err) {
    console.error('Error fetching dynamic products:', err);
    res.status(500).json({ error: "Error fetching dynamic product data" });
  }
};

// Obtener datos estáticos de un producto específico
export const getProductStaticById = async (req, res) => {
  const { id } = req.params;
  const includeVariants = req.query.includeVariants === 'true';

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        sku: true,
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

    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching static product:', error);
    res.status(500).json({ error: "Error fetching static product data" });
  }
};

// Obtener datos dinámicos de un producto específico
export const getProductDynamicById = async (req, res) => {
  const { id } = req.params;
  const includeVariants = req.query.includeVariants === 'true';

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        stock: true,
        costPrice: true,
        salePrice: true,
        promoPrice: true,
        percentPrice: true,
        status: true,
        variants: includeVariants ? {
          select: {
            id: true,
            stock: true,
            costPrice: true,
            salePrice: true,
            status: true,
          },
          where: { isActive: true }
        } : false
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching dynamic product:', error);
    res.status(500).json({ error: "Error fetching dynamic product data" });
  }
};

// ====== ENDPOINTS DE ACTUALIZACIÓN ESPECÍFICA ======

// Actualizar solo el stock de un producto
export const updateProductStock = async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  if (stock === undefined || stock < 0) {
    return res.status(400).json({ error: "Valid stock value is required" });
  }

  try {
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { 
        stock: parseInt(stock),
        updatedAt: new Date()
      },
      select: {
        id: true,
        stock: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      product: updatedProduct,
      message: "Stock updated successfully"
    });
  } catch (error) {
    console.error('Error updating product stock:', error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(500).json({ error: "Error updating product stock" });
  }
};

// Actualizar solo los precios de un producto
export const updateProductPrices = async (req, res) => {
  const { id } = req.params;
  const { costPrice, salePrice, promoPrice, percentPrice } = req.body;

  if (!salePrice && !costPrice && !promoPrice && percentPrice === undefined) {
    return res.status(400).json({ error: "At least one price field is required" });
  }

  try {
    const updateData = { updatedAt: new Date() };
    
    if (costPrice !== undefined) updateData.costPrice = parseFloat(costPrice);
    if (salePrice !== undefined) updateData.salePrice = parseFloat(salePrice);
    if (promoPrice !== undefined) updateData.promoPrice = parseFloat(promoPrice);
    if (percentPrice !== undefined) updateData.percentPrice = parseFloat(percentPrice);

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        costPrice: true,
        salePrice: true,
        promoPrice: true,
        percentPrice: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      product: updatedProduct,
      message: "Prices updated successfully"
    });
  } catch (error) {
    console.error('Error updating product prices:', error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(500).json({ error: "Error updating product prices" });
  }
};

// Actualizar solo el status de un producto
export const updateProductStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['ACTIVE', 'INACTIVE', 'DISCONTINUED', 'OUT_OF_STOCK'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: "Valid status is required", 
      validStatuses 
    });
  }

  try {
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      },
      select: {
        id: true,
        status: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      product: updatedProduct,
      message: "Status updated successfully"
    });
  } catch (error) {
    console.error('Error updating product status:', error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(500).json({ error: "Error updating product status" });
  }
};

// ====== ENDPOINTS BATCH PARA MÚLTIPLES PRODUCTOS ======

// Actualizar stock de múltiples productos
export const batchUpdateProductsStock = async (req, res) => {
  const { updates } = req.body;

  if (!updates || !Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ error: "Updates array is required" });
  }

  try {
    const results = [];
    const errors = [];

    for (const update of updates) {
      const { id, stock } = update;
      
      if (!id || stock === undefined) {
        errors.push({ id, error: "ID and stock are required" });
        continue;
      }

      try {
        const updatedProduct = await prisma.product.update({
          where: { id },
          data: { 
            stock: parseInt(stock),
            updatedAt: new Date()
          },
          select: {
            id: true,
            stock: true,
            updatedAt: true
          }
        });
        results.push(updatedProduct);
      } catch (error) {
        errors.push({ id, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      updated: results,
      errors: errors,
      message: `${results.length} products updated successfully`
    });

  } catch (error) {
    console.error('Error in batch stock update:', error);
    res.status(500).json({ error: "Error updating products stock" });
  }
};
