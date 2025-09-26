import { PrismaClient } from "db";
const prisma = new PrismaClient();

const paymentManager = async (cashflowId, payments, transactionType) => {
  const updates = {
    cashSale: 0,
    cashService: 0,
    digitalSale: 0,
    digitalService: 0,
  };

  payments.forEach((payment) => {
    const { method, amount } = payment;

    if (transactionType === "sale") {
      if (method === "ef") {
        updates.cashSale += amount;
      } else {
        updates.digitalSale += amount;
      }
    } else if (transactionType === "service") {
      if (method === "ef") {
        updates.cashService += amount;
      } else {
        updates.digitalService += amount;
      }
    }
  });

  try {
    await prisma.cashflow.update({
      where: { id: cashflowId },
      data: {
        cashSales: { increment: updates.cashSale },
        cashServices: { increment: updates.cashService },
        digitalSales: { increment: updates.digitalSale },
        digitalServices: { increment: updates.digitalService },
      },
    });
    return 201;
  } catch (error) {
    return 401;
  }
};

// Obtener todos los cashflows
export const getCashflows = async (req, res) => {
  try {
    const pageSize = 10;
    const page = parseInt(req.query.page) || 1;

    const cashflows = await prisma.cashflow.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        openDate: "desc",
      },
    });

    res.status(200).json(cashflows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching cashflows" });
  }
};

// Obtener un cashflow por ID
export const getCashflowActive = async (req, res) => {
  try {
    const cashflow = await prisma.cashflow.findMany({
      where: { active: true },
    });
    if (!cashflow) {
      return res.status(404).json({ error: "Cashflow not found" });
    }
    res.status(200).json(cashflow);
  } catch (error) {
    res.status(500).json({ error: "Error fetching cashflow" });
  }
};

// Crear un nuevo cashflow
export const createCashflow = async (req, res) => {
  console.log(req.body);
  const {
    active,
    openDate,
    openingBalance,
    total,
    expenses,
    cashSales,
    cashServices,
    digitalSales,
    digitalServices,
    observations,
  } = req.body;

  try {
    const newCashflow = await prisma.cashflow.create({
      data: {
        active,
        openDate,
        openingBalance,
        total,
        expenses,
        cashSales,
        cashServices,
        digitalSales,
        digitalServices,
        observations,
      },
    });
    res.status(201).json(newCashflow);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error creating cashflow" });
  }
};

// Agregar pagos a cashflow
export const addPayment = async (req, res) => {
  const cashflowId = req.params.id;
  const { payments, transactionType } = req.body;

  console.log("cashflowId: ", cashflowId);
  console.log("payments: ", payments);
  console.log("transactionType: ", transactionType);

  // res.status(201).json("OK")
  try {
    const result = await paymentManager(cashflowId, payments, transactionType);
    res.status(result).json({ message: "Cashflow actualizado correctamente" });
  } catch (error) {
    console.error("Error actualizando el cashflow:", error);
    res.status(result).json({ error: "Error actualizando el cashflow" });
  }
};

// Actualizar un cashflow
export const updateCashflow = async (req, res) => {
  const { id } = req.params;
  const { expenses } = req.body;
  console.log(expenses);
  try {
    const updatedCashflow = await prisma.cashflow.update({
      where: { id },
      data: {
        expenses: { increment: expenses },
      },
    });
    res.status(201).json(updatedCashflow);
  } catch (error) {
    console.log(error);
    if (error.code === "P2025") {
      // Cashflow not found
      return res.status(404).json({ error: "Cashflow not found" });
    }
    res.status(500).json({ error: "Error updating cashflow" });
  }
};

// Eliminar un cashflow
export const closeCashflow = async (req, res) => {
  const { id } = req.params;
  try {
    const cashflow = await prisma.cashflow.findUnique({ where: { id } });
    await prisma.cashflow.update({
      where: { id },
      data: {
        active: false,
        total:
          cashflow.cashSales +
          cashflow.cashServices +
          cashflow.digitalSales +
          cashflow.digitalServices,
      },
    });
    return res.status(204).send(); // No content
  } catch (error) {
    console.log(error);
    if (error.code === "P2025") {
      // Cashflow not found
      return res.status(404).json({ error: "Cashflow not found" });
    }
    return res.status(500).json({ error: "Error deleting cashflow" });
  }
};
