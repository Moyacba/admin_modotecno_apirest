import { PrismaClient } from "db";
const prisma = new PrismaClient();

// Obtener todas las ventas
export const getSales = async (req, res) => {
  try {
    const pageSize = 10;
    const page = parseInt(req.query.page) || 1;

    const sales = await prisma.sale.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        date: "desc",
      },
    });

    res.status(200).json(sales);
  } catch (err) {
    res.status(500).json({ error: "Error fetching sales" });
  }
};

// Obtener una venta por ID
export const getSaleById = async (req, res) => {
  const { id } = req.params;
  try {
    const sale = await prisma.sale.findUnique({
      where: { id },
    });
    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }
    res.status(200).json(sale);
  } catch (error) {
    res.status(500).json({ error: "Error fetching sale" });
  }
};

// Crear una nueva venta
export const createSale = async (req, res) => {
  const {
    customerId,
    details,
    date,
    products,
    total,
    discount,
    paymentMethod,
  } = req.body;

  try {
    const newSale = await prisma.sale.create({
      data: {
        customerId,
        details,
        date,
        products,
        total,
        discount,
        paymentMethod,
      },
    });
    products.map(async (product) => {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          stock: { decrement: 1 },
        },
      });
    });
    res.status(201).json(newSale);
  } catch (error) {
    res.status(500).json({ error: "Error creating sale" });
  }
};

// Actualizar una venta
export const updateSale = async (req, res) => {
  const { id } = req.params;
  const {
    customerId,
    details,
    date,
    products,
    total,
    discount,
    paymentMethod,
  } = req.body;

  try {
    const updatedSale = await prisma.sale.update({
      where: { id },
      data: {
        customerId,
        details,
        date,
        products,
        total,
        discount,
        paymentMethod,
      },
    });
    res.status(200).json(updatedSale);
  } catch (error) {
    if (error.code === "P2025") {
      // Sale not found
      return res.status(404).json({ error: "Sale not found" });
    }
    res.status(500).json({ error: "Error updating sale" });
  }
};

// Eliminar una venta
export const deleteSale = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.sale.delete({
      where: { id },
    });
    res.status(204).send(); // No content
  } catch (error) {
    if (error.code === "P2025") {
      // Sale not found
      return res.status(404).json({ error: "Sale not found" });
    }
    res.status(500).json({ error: "Error deleting sale" });
  }
};
