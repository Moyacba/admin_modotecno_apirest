import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Función para actualizar cashflow en la base de datos
export const paymentManager = async (cashflowId, payments, transactionType) => {
  const updates = {
    cashSale: 0,
    cashService: 0,
    digitalSale: 0,
    digitalService: 0,
  };

  payments.forEach((payment) => {
    const { method, amount } = payment;

    if (transactionType === "sale") {
      if (method === MethodType.EFECTIVO) {
        updates.cashSale += amount;
      } else {
        updates.digitalSale += amount;
      }
    } else if (transactionType === "service") {
      if (method === MethodType.EFECTIVO) {
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
        cashSale: { increment: updates.cashSale },
        cashService: { increment: updates.cashService },
        digitalSale: { increment: updates.digitalSale },
        digitalService: { increment: updates.digitalService },
      },
    });
    return 200;
  } catch (error) {
    return 400;
  }
}
