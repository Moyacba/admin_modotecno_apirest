import { PrismaClient } from "db";
const prisma = new PrismaClient();

// Obtener todas las variantes de un producto
export const getProductVariants = async (req, res) => {
  const { productId } = req.params;
  try {
    const variants = await prisma.productVariant.findMany({
      where: { 
        productId,
        isActive: true 
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(variants);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching product variants" });
  }
};

// Obtener una variante específica por ID
export const getVariantById = async (req, res) => {
  const { id } = req.params;
  try {
    const variant = await prisma.productVariant.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            brand: true
          }
        }
      }
    });
    if (!variant) {
      return res.status(404).json({ error: "Product variant not found" });
    }
    res.status(200).json(variant);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching product variant" });
  }
};

// Crear una nueva variante
export const createVariant = async (req, res) => {
  const { productId } = req.params;
  const {
    barcode,
    sku,
    name,
    description,
    color,
    design,
    size,
    material,
    costPrice,
    salePrice,
    promoPrice,
    percentPrice,
    stock,
    minStock,
    images,
    specifications,
  } = req.body;

  try {
    // Verificar que el producto principal existe
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Crear la variante
    const newVariant = await prisma.productVariant.create({
      data: {
        productId,
        barcode,
        sku,
        name,
        description,
        color,
        design,
        size,
        material,
        costPrice,
        salePrice,
        promoPrice,
        percentPrice,
        stock,
        minStock: minStock || 0,
        images: images || [],
        specifications,
      },
    });

    // Actualizar el producto principal para marcar que tiene variantes
    await prisma.product.update({
      where: { id: productId },
      data: { hasVariants: true }
    });

    res.status(201).json(newVariant);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error creating product variant" });
  }
};

// Actualizar una variante
export const updateVariant = async (req, res) => {
  const { id } = req.params;
  const {
    barcode,
    sku,
    name,
    description,
    color,
    design,
    size,
    material,
    costPrice,
    salePrice,
    promoPrice,
    percentPrice,
    stock,
    minStock,
    images,
    specifications,
    isActive,
  } = req.body;

  try {
    const updatedVariant = await prisma.productVariant.update({
      where: { id },
      data: {
        barcode,
        sku,
        name,
        description,
        color,
        design,
        size,
        material,
        costPrice,
        salePrice,
        promoPrice,
        percentPrice,
        stock,
        minStock: minStock !== undefined ? minStock : 0,
        images,
        specifications,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(),
      },
    });
    res.status(200).json(updatedVariant);
  } catch (error) {
    console.log(error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Product variant not found" });
    }
    res.status(500).json({ error: "Error updating product variant" });
  }
};

// Eliminar una variante (soft delete)
export const deleteVariant = async (req, res) => {
  const { id } = req.params;

  try {
    // Soft delete: marcar como inactiva
    await prisma.productVariant.update({
      where: { id },
      data: { 
        isActive: false,
        updatedAt: new Date()
      }
    });

    // Verificar si el producto principal aún tiene variantes activas
    const variant = await prisma.productVariant.findUnique({
      where: { id },
      select: { productId: true }
    });

    if (variant) {
      const activeVariants = await prisma.productVariant.count({
        where: { 
          productId: variant.productId,
          isActive: true 
        }
      });

      // Si no hay más variantes activas, actualizar el producto principal
      if (activeVariants === 0) {
        await prisma.product.update({
          where: { id: variant.productId },
          data: { hasVariants: false }
        });
      }
    }

    res.status(204).send();
  } catch (error) {
    console.log(error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Product variant not found" });
    }
    res.status(500).json({ error: "Error deleting product variant" });
  }
};

// Buscar variantes por texto
export const searchVariants = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;
    const keyword = (req.query.keyword || "").trim();

    let where = { isActive: true };

    if (keyword) {
      const keywordConditions = keyword.split(' ').filter(k => k).map(key => ({
        OR: [
          { name: { contains: key, mode: 'insensitive' } },
          { barcode: { contains: key, mode: 'insensitive' } },
          { sku: { contains: key, mode: 'insensitive' } },
          { color: { contains: key, mode: 'insensitive' } },
          { design: { contains: key, mode: 'insensitive' } },
          { product: { name: { contains: key, mode: 'insensitive' } } },
        ],
      }));

      where.AND = keywordConditions;
    }

    const totalCount = await prisma.productVariant.count({ where });
    const variants = await prisma.productVariant.findMany({
      where,
      skip,
      take: pageSize,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            brand: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ variants, totalCount });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error searching product variants" });
  }
};
