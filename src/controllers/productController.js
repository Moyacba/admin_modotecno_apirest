import { PrismaClient } from "db";
const prisma = new PrismaClient();

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
        const products = await prisma.product.findMany({
          where: andWhere,
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
        return res.status(200).json({ products, totalCount });
      }

      // Si no hay resultados con AND, usar OR
      const orWhere = { ...where, OR: keywordConditions.flatMap(c => c.OR) };
      totalCount = await prisma.product.count({ where: orWhere });
      const products = await prisma.product.findMany({
        where: orWhere,
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
      return res.status(200).json({ products, totalCount });
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
