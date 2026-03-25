import { PrismaClient } from "db";
const prisma = new PrismaClient();

// ID del buyer por defecto
const DEFAULT_BUYER_ID = "68d5e7a16c34a0f3d5bd120e";

// Métodos de pago válidos
const VALID_PAYMENT_METHODS = ["cash", "qr", "transfer", "debit", "credit", "installments"];

// Obtener todas las ventas POS
export const getAllPOSSales = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;
  try {
    const sales = await prisma.pOSSale.findMany({
      include: {
        // buyer: true,
        detalles: true,
      },
      orderBy: {
        fecha_creacion: 'desc'
      },
      skip,
      take: limit,
    });
    res.status(200).json(sales);
  } catch (error) {
    console.error("Error fetching POS sales:", error);
    res.status(500).json({ error: "Error fetching POS sales", error: error.message });
  }
};

// Obtener una venta POS por ID
export const getPOSSaleById = async (req, res) => {
  const { id } = req.params;

  try {
    const sale = await prisma.pOSSale.findUnique({
      where: { id },
      include: {
        buyer: true,
        detalles: true,
      },
    });

    if (!sale) {
      return res.status(404).json({ error: "POS sale not found" });
    }

    res.status(200).json(sale);
  } catch (error) {
    console.error("Error fetching POS sale:", error);
    res.status(500).json({ error: "Error fetching POS sale" });
  }
};

// Crear una nueva venta POS
export const createPOSSale = async (req, res) => {
  const {
    buyerId,
    buyer,
    monto_total,
    metodo_pago,
    descuento,
    productos,
    serviceId,  // opcional: para vincular el cobro a un servicio técnico
  } = req.body;

  try {
    // Validar que los productos estén presentes
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: "Products are required" });
    }

    // Validar monto total
    if (!monto_total || monto_total <= 0) {
      return res.status(400).json({ error: "Valid total amount is required" });
    }

    // Validar métodos de pago
    if (!metodo_pago || !Array.isArray(metodo_pago) || metodo_pago.length === 0) {
      return res.status(400).json({ error: "Payment methods are required" });
    }

    // Validar que los métodos de pago sean válidos
    const invalidMethods = metodo_pago.filter(payment =>
      !VALID_PAYMENT_METHODS.includes(payment.method)
    );

    if (invalidMethods.length > 0) {
      return res.status(400).json({
        error: `Invalid payment methods: ${invalidMethods.map(m => m.method).join(', ')}`,
        validMethods: VALID_PAYMENT_METHODS
      });
    }

    // Validar que la suma de los pagos sea igual al monto total
    const totalPayments = metodo_pago.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    if (Math.abs(totalPayments - monto_total) > 1) { // Tolerancia de 1 centavo
      return res.status(400).json({
        error: "Payment amounts sum does not match total amount",
        expected: monto_total,
        received: totalPayments
      });
    }

    let finalBuyerId = null;
    let buyerData = null;

    // Nombre y email para el cliente genérico
    const GENERIC_CUSTOMER_NAME = "CLIENTE SIN REGISTRAR";
    const GENERIC_CUSTOMER_EMAIL = "cliente_generico@modotecno.com";

    // 1. Manejar buyer por ID explícito
    if (buyerId) {
      finalBuyerId = buyerId;
      buyerData = await prisma.buyer.findUnique({ where: { id: finalBuyerId } });
      if (!buyerData) return res.status(400).json({ error: "Buyer not found" });
    } 
    // 2. Manejar buyer por objeto (nuevo o búsqueda por nombre)
    else if (buyer && buyer.nombre) {
      const normalizedName = buyer.nombre.trim().toUpperCase();
      
      // Intentar buscar por nombre y teléfono o email
      buyerData = await prisma.buyer.findFirst({
        where: {
          OR: [
            { AND: [{ nombre: normalizedName }, { telefono: buyer.telefono || '' }] },
            { email: buyer.email }
          ]
        }
      });

      if (buyerData) {
        finalBuyerId = buyerData.id;
      } else {
        // Crear nuevo cliente
        let uniqueEmail = buyer.email || 'sinregistrar@modotecno.com';
        if (uniqueEmail === 'sinregistrar@modotecno.com') {
          const timestamp = Date.now();
          const nameSlug = normalizedName.replace(/\s+/g, '').substring(0, 10);
          uniqueEmail = `sinregistrar_${nameSlug}_${timestamp}@modotecno.com`;
        }

        buyerData = await prisma.buyer.create({
          data: {
            nombre: normalizedName,
            telefono: buyer.telefono || '',
            email: uniqueEmail,
            dni: buyer.dni || '12345678',
            direccion: buyer.direccion || ''
          }
        });
        finalBuyerId = buyerData.id;
      }
    } 
    // 3. Fallback: Cliente genérico persistente
    else {
      buyerData = await prisma.buyer.findFirst({
        where: { 
          OR: [
            { nombre: GENERIC_CUSTOMER_NAME },
            { email: GENERIC_CUSTOMER_EMAIL }
          ]
        }
      });

      if (!buyerData) {
        // Crear el cliente genérico si no existe
        buyerData = await prisma.buyer.create({
          data: {
            nombre: GENERIC_CUSTOMER_NAME,
            telefono: "0000000000",
            email: GENERIC_CUSTOMER_EMAIL,
            dni: "00000000",
            direccion: "SISTEMA POS"
          }
        });
      }
      finalBuyerId = buyerData.id;
    }

    // VALIDACIÓN DE STOCK - Verificar disponibilidad de todos los productos
    const stockValidationErrors = [];
    const productUpdates = [];

    for (const producto of productos) {
      // Los ítems de reparación son virtuales, no tocan el stock
      if (producto.isServiceRepair) continue;

      if (!producto.id || !producto.quantity || producto.quantity <= 0) {
        return res.status(400).json({
          error: "Each product must have a valid ID and quantity"
        });
      }

      // Buscar el producto, puede ser un Product regular o un ProductVariant
      let productData = null;
      let isVariant = false;

      // Primero buscar como Product regular
      productData = await prisma.product.findUnique({
        where: { id: producto.id }
      });

      // Si no se encuentra, buscar como ProductVariant
      if (!productData) {
        productData = await prisma.productVariant.findUnique({
          where: { id: producto.id }
        });
        isVariant = true;
      }

      if (!productData) {
        // Si isServiceRepair, no debería llegar aquí, pero por seguridad:
        if (producto.isServiceRepair) {
          continue; // skip — ya filtrado arriba
        }
        stockValidationErrors.push(`Product with ID ${producto.id} not found`);
        continue;
      }

      // Verificar stock disponible
      if (productData.stock < producto.quantity) {
        stockValidationErrors.push(
          `Insufficient stock for product ${productData.name}. Available: ${productData.stock}, Requested: ${producto.quantity}`
        );
        continue;
      }

      // Preparar actualización de stock — saltar ítems de reparación (virtuales)
      productUpdates.push({
        id: producto.id,
        isVariant,
        quantitySold: producto.quantity,
        currentStock: productData.stock,
        newStock: productData.stock - producto.quantity
      });
    }

    // Si hay errores de stock, devolver error
    if (stockValidationErrors.length > 0) {
      return res.status(400).json({
        error: "Stock validation failed",
        details: stockValidationErrors
      });
    }

    // Buscar si hay una sesión de caja abierta
    const activeSession = await prisma.cashRegisterSession.findFirst({
      where: { status: "OPEN" }
    });

    if (!activeSession) {
      return res.status(400).json({ error: "Debe abrir la caja antes de realizar una venta." });
    }

    // Usar transacción para garantizar consistencia
    const result = await prisma.$transaction(async (tx) => {
      // Crear la venta POS con sus detalles
      const newSale = await tx.pOSSale.create({
        data: {
          buyerId: finalBuyerId,
          monto_total,
          estado: "COMPLETADO",
          metodo_pago,
          descuento,
          cashRegisterSessionId: activeSession?.id, // Vincular a la sesión si existe
          detalles: {
            create: productos.map(producto => ({
              productoId: producto.id,
              productoName: producto.name,
              cantidad: producto.quantity,
              precio_unitario_al_momento_de_compra: producto.unitPrice * 100 // convertir a centavos
            }))
          }
        },
        include: {
          buyer: true,
          detalles: true,
        }
      });

      // Actualizar el stock de todos los productos
      for (const update of productUpdates) {
        if (update.isVariant) {
          await tx.productVariant.update({
            where: { id: update.id },
            data: { stock: update.newStock }
          });
        } else {
          await tx.product.update({
            where: { id: update.id },
            data: { stock: update.newStock }
          });
        }
      }

      // Si la venta está vinculada a un servicio técnico, marcarlo como ENTREGADO
      if (serviceId) {
        await tx.service.update({
          where: { id: serviceId },
          data: {
            state: 'ENTREGADO',
            dateOut: new Date(),
          },
        });
      }

      return newSale;
    });

    res.status(201).json({
      message: "POS sale created successfully",
      sale: result,
      stockUpdates: productUpdates.map(update => ({
        productId: update.id,
        quantitySold: update.quantitySold,
        previousStock: update.currentStock,
        newStock: update.newStock
      }))
    });
  } catch (error) {
    console.error("Error creating POS sale:", error);
    res.status(500).json({ error: "Error creating POS sale" });
  }
};

// Actualizar estado de una venta POS
export const updatePOSSaleStatus = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const updatedSale = await prisma.pOSSale.update({
      where: { id },
      data: { estado },
      include: {
        buyer: true,
        detalles: true,
      }
    });

    res.status(200).json({
      message: "POS sale status updated successfully",
      sale: updatedSale
    });
  } catch (error) {
    console.error("Error updating POS sale:", error);
    res.status(500).json({ error: "Error updating POS sale" });
  }
};

// Eliminar una venta POS
export const deletePOSSale = async (req, res) => {
  const { id } = req.params;

  try {
    // Eliminar detalles primero (cascade debería manejar esto, pero por seguridad)
    await prisma.pOSSaleDetail.deleteMany({
      where: { posSaleId: id }
    });

    // Eliminar la venta
    await prisma.pOSSale.delete({
      where: { id }
    });

    res.status(200).json({
      message: "POS sale deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting POS sale:", error);
    res.status(500).json({ error: "Error deleting POS sale" });
  }
};
