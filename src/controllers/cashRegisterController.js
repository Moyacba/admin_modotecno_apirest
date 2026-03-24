import { PrismaClient } from "db";

const prisma = new PrismaClient();

// Obtener estado actual de la caja (sesión activa)
export const getCashStatus = async (req, res) => {
  try {
    const activeSession = await prisma.cashRegisterSession.findFirst({
      where: { status: "OPEN" },
      include: {
        movements: true,
        sales: {
          select: {
            id: true,
            monto_total: true,
            metodo_pago: true,
          }
        },
        expenses: true
      }
    });

    if (!activeSession) {
      const lastSession = await prisma.cashRegisterSession.findFirst({
        where: { status: "CLOSED" },
        orderBy: { closedAt: 'desc' },
        select: { nextSessionFund: true }
      });
      return res.json({ 
        status: "CLOSED", 
        activeSession: null,
        expectedInitialCash: lastSession?.nextSessionFund || 0 
      });
    }

    // Calcular totales en tiempo real
    const initialCash = activeSession.initialCash;

    // Sumar movimientos manuales de efectivo
    const manualIncome = activeSession.movements
      .filter(m => m.type === "INGRESO_MANUAL")
      .reduce((sum, m) => sum + m.amount, 0);

    const manualWithdrawal = activeSession.movements
      .filter(m => m.type === "RETIRO_MANUAL")
      .reduce((sum, m) => sum + m.amount, 0);

    // Sumar ventas (filtrar solo efectivo si es necesario, o agrupar por método)
    // Nota: metodo_pago es un JSON. Asumiremos por ahora que necesitamos iterar.
    let cashSales = 0;
    let cardSales = 0;
    let transferSales = 0;
    let otherSales = 0;

    activeSession.sales.forEach(sale => {
      const methods = sale.metodo_pago; // Array or Object
      if (Array.isArray(methods)) {
        methods.forEach(payment => {
          const value = (payment.amount / 100);
          if (payment.method === 'cash') {
            cashSales += value;
          } else if (payment.method === 'debit' || payment.method === 'credit' || payment.method === 'installments' || payment.method === 'gocuotas') {
            cardSales += value;
          } else if (payment.method === 'transfer' || payment.method === 'qr') {
            transferSales += value;
          } else {
            otherSales += value;
          }
        });
      }
    });

    // Gastos (asumiendo que los gastos registrados son en efectivo a menos que se diga lo contrario)
    // Deberíamos agregar un campo 'method' a Expense si no existe, o asumir efectivo.
    // El modelo Expense tiene 'method'.
    const expenses = activeSession.expenses.reduce((sum, e) => {
      // Solo restar si es efectivo, o restar del total global?
      // Generalmente caja chica maneja efectivo.
      return sum + e.amount;
    }, 0);

    const currentCash = initialCash + manualIncome - manualWithdrawal + cashSales - expenses;

    return res.json({
      status: "OPEN",
      activeSession: {
        ...activeSession,
        audit: {
          initialCash,
          manualIncome,
          manualWithdrawal,
          cashSales,
          cardSales,
          transferSales,
          expenses,
          currentCash // Lo que debería haber en el cajón
        }
      }
    });

  } catch (error) {
    console.error("Error getting cash status:", error);
    res.status(500).json({ error: "Error getting cash status" });
  }
};

// Abrir caja
export const openSession = async (req, res) => {
  const { initialCash, observations, userId } = req.body;

  try {
    const activeSession = await prisma.cashRegisterSession.findFirst({
      where: { status: "OPEN" }
    });

    if (activeSession) {
      return res.status(400).json({ error: "Ya hay una caja abierta." });
    }

    // Buscar la última sesión cerrada para obtener el fondo esperado
    const lastSession = await prisma.cashRegisterSession.findFirst({
      where: { status: "CLOSED" },
      orderBy: { closedAt: 'desc' }
    });

    const expectedInitialCash = lastSession?.nextSessionFund || 0;
    let finalObservations = observations || "";

    if (parseFloat(initialCash) !== expectedInitialCash) {
      const warning = `⚠️ Apertura con diferencia: se esperaba $${expectedInitialCash.toLocaleString()}`;
      finalObservations = finalObservations ? `${warning}\n${finalObservations}` : warning;
    }

    const newSession = await prisma.cashRegisterSession.create({
      data: {
        initialCash: parseFloat(initialCash) || 0,
        expectedInitialCash,
        status: "OPEN",
        openedBy: userId,
        observations: finalObservations
      }
    });

    res.json(newSession);
  } catch (error) {
    console.error("Error opening session:", error);
    res.status(500).json({ error: "Error opening session" });
  }
};

// Cerrar caja
export const closeSession = async (req, res) => {
  const { finalCashCounted, nextSessionFund, userId, observations } = req.body;

  try {
    const activeSession = await prisma.cashRegisterSession.findFirst({
      where: { status: "OPEN" },
      include: {
        movements: true,
        sales: true,
        expenses: true
      }
    });

    if (!activeSession) {
      return res.status(400).json({ error: "No hay caja abierta para cerrar." });
    }

    // 1. Cálculos de Totales Segmentados
    let cashSales = 0;
    let totalCard = 0;
    let totalDigital = 0;

    activeSession.sales.forEach(sale => {
      const methods = sale.metodo_pago;
      if (Array.isArray(methods)) {
        methods.forEach(payment => {
          const amount = (payment.amount / 100);
          const method = payment.method?.toLowerCase();

          if (method === 'cash') {
            cashSales += amount;
          } else if (['debit', 'credit', 'installments', 'gocuotas'].includes(method)) {
            totalCard += amount;
          } else if (['transfer', 'qr'].includes(method)) {
            totalDigital += amount;
          }
        });
      }
    });

    // Totales de movimientos manuales
    const manualIncome = activeSession.movements
      .filter(m => m.type === "INGRESO_MANUAL")
      .reduce((sum, m) => sum + m.amount, 0);

    const manualWithdrawal = activeSession.movements
      .filter(m => m.type === "RETIRO_MANUAL")
      .reduce((sum, m) => sum + m.amount, 0);

    const totalExpenses = activeSession.expenses.reduce((sum, e) => sum + e.amount, 0);

    // 2. Cálculo de Efectivo Esperado
    const calculatedCash = activeSession.initialCash + manualIncome - manualWithdrawal + cashSales - totalExpenses;
    const difference = (parseFloat(finalCashCounted) - calculatedCash);

    // 3. Control de fondo — cuánto queda para mañana y cuánto se retira
    const nextFund = parseFloat(nextSessionFund) || 0;
    const withdrawalAmount = parseFloat(finalCashCounted) - nextFund;

    // 4. Inmutabilidad: Bloquear movimientos de esta sesión
    await prisma.cashMovement.updateMany({
      where: { cashRegisterSessionId: activeSession.id },
      data: { isLocked: true }
    });

    const closedSession = await prisma.cashRegisterSession.update({
      where: { id: activeSession.id },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
        closedBy: userId,
        finalCashCounted: parseFloat(finalCashCounted),
        finalCashCalculated: calculatedCash,
        difference,
        nextSessionFund: nextFund,
        withdrawalAmount,
        totalCard,
        totalDigital,
        totalExpenses,
        observations: observations ? `${activeSession.observations || ''}\nCierre: ${observations}` : activeSession.observations
      }
    });

    res.json(closedSession);

  } catch (error) {
    console.error("Error closing session:", error);
    res.status(500).json({ error: "Error closing session" });
  }
};

// Agregar movimiento manual
export const addMovement = async (req, res) => {
  const { type, amount, description, category, paymentMethod, userId } = req.body;

  try {
    const activeSession = await prisma.cashRegisterSession.findFirst({
      where: { status: "OPEN" }
    });

    if (!activeSession) {
      return res.status(400).json({ error: "Debe abrir la caja antes de registrar movimientos." });
    }

    const movement = await prisma.cashMovement.create({
      data: {
        cashRegisterSessionId: activeSession.id,
        type, // INGRESO_MANUAL, RETIRO_MANUAL
        category,
        paymentMethod: paymentMethod || "CASH",
        amount: parseFloat(amount),
        description,
        userId
      }
    });

    res.json(movement);

  } catch (error) {
    console.error("Error adding movement:", error);
    res.status(500).json({ error: "Error adding movement" });
  }
};

// Actualizar movimiento
export const updateMovement = async (req, res) => {
  const { id } = req.params;
  const { amount, description, category, paymentMethod } = req.body;

  try {
    const updated = await prisma.cashMovement.update({
      where: { id },
      data: {
        amount: amount ? parseFloat(amount) : undefined,
        description,
        category,
        paymentMethod
      }
    });
    res.json(updated);
  } catch (error) {
    console.error("Error updating movement:", error);
    res.status(500).json({ error: "Error updating movement" });
  }
};

// Eliminar movimiento
export const deleteMovement = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.cashMovement.delete({
      where: { id }
    });
    res.json({ message: "Movimiento eliminado" });
  } catch (error) {
    console.error("Error deleting movement:", error);
    res.status(500).json({ error: "Error deleting movement" });
  }
};

// Historial de sesiones
export const getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [total, sessions] = await Promise.all([
      prisma.cashRegisterSession.count({ where: { status: "CLOSED" } }),
      prisma.cashRegisterSession.findMany({
        where: { status: "CLOSED" },
        orderBy: { closedAt: 'desc' },
        skip,
        take: limit
      })
    ]);

    res.json({
      data: sessions,
      meta: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error("Error getting history:", error);
    res.status(500).json({ error: "Error getting history" });
  }
};

// Obtener detalles de una sesión específica
export const getSessionById = async (req, res) => {
  const { id } = req.params;
  try {
    const session = await prisma.cashRegisterSession.findUnique({
      where: { id },
      include: {
        movements: true,
        sales: {
          include: {
            buyer: true, // Incluir datos del comprador
            detalles: true
          }
        },
        expenses: true
      }
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Recalcular métricas para mostrar en el detalle (similar a getCashStatus)
    const initialCash = session.initialCash;

    // Movimientos Manuales
    const manualIncome = session.movements
      .filter(m => m.type === "INGRESO_MANUAL")
      .reduce((sum, m) => sum + m.amount, 0);

    const manualWithdrawal = session.movements
      .filter(m => m.type === "RETIRO_MANUAL")
      .reduce((sum, m) => sum + m.amount, 0);

    // Ventas
    let cashSales = 0;
    let cardSales = 0;
    let transferSales = 0;
    let otherSales = 0;

    session.sales.forEach(sale => {
      const methods = sale.metodo_pago;
      // Ensure methods is an array before iterating
      if (methods && Array.isArray(methods)) {
        methods.forEach(payment => {
          // Normalize amount to number and handle null/undefined
          const rawAmount = Number(payment.amount) || 0;
          const value = rawAmount / 100;

          if (payment.method === 'cash') cashSales += value;
          else if (['debit', 'credit', 'installments', 'gocuotas'].includes(payment.method)) cardSales += value;
          else if (['transfer', 'qr'].includes(payment.method)) transferSales += value;
          else otherSales += value;
        });
      }
    });

    const totalCollected = manualIncome + cashSales + cardSales + transferSales + otherSales;
    const currentCash = initialCash + manualIncome - manualWithdrawal + cashSales - (session.expenses?.reduce((s, e) => s + e.amount, 0) || 0);

    res.json({
      ...session,
      audit: {
        initialCash,
        manualIncome,
        manualWithdrawal,
        cashSales,
        cardSales,
        transferSales,
        expenses: session.expenses?.reduce((s, e) => s + e.amount, 0) || 0,
        currentCash,
        totalCollected
      }
    });

  } catch (error) {
    console.error("Error getting session details:", error);
    res.status(500).json({ error: "Error getting session details" });
  }
};
