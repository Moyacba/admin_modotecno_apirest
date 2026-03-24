import { PrismaClient } from "db";
const prisma = new PrismaClient();

export const checkCashLock = async (req, res, next) => {
  const { id } = req.params;

  try {
    const movement = await prisma.cashMovement.findUnique({
      where: { id }
    });

    if (!movement) {
      return res.status(404).json({ error: "Movimiento no encontrado." });
    }

    if (movement.isLocked) {
      return res.status(403).json({ 
        error: "La caja está cerrada. Los movimientos no pueden ser modificados." 
      });
    }

    next();
  } catch (error) {
    console.error("Error checking cash lock:", error);
    res.status(500).json({ error: "Error de servidor al validar bloqueo de caja." });
  }
};
