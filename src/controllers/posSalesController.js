import { PrismaClient } from "db";
const prisma = new PrismaClient();

// ID del buyer por defecto
const DEFAULT_BUYER_ID = "68d5e7a16c34a0f3d5bd120e";

// Métodos de pago válidos
const VALID_PAYMENT_METHODS = ["cash", "qr", "transfer", "debit", "credit", "installments"];

// Obtener todas las ventas POS
export const getAllPOSSales = async (req, res) => {
  try {
    const sales = await prisma.pOSSale.findMany({
      include: {
        buyer: true,
        detalles: true,
      },
      orderBy: {
        fecha_creacion: 'desc'
      }
    });
    res.status(200).json(sales);
  } catch (error) {
    console.error("Error fetching POS sales:", error);
    res.status(500).json({ error: "Error fetching POS sales" });
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
    productos
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

    let finalBuyerId = DEFAULT_BUYER_ID;
    let buyerData = null;

    // Manejar buyer - puede ser un ID existente o datos para crear nuevo buyer
    if (buyerId) {
      // Cliente existente - usar el ID proporcionado
      finalBuyerId = buyerId;
      
      // Verificar que el buyer existe
      buyerData = await prisma.buyer.findUnique({
        where: { id: finalBuyerId }
      });

      if (!buyerData) {
        return res.status(400).json({ error: "Buyer not found" });
      }
    } else if (buyer && buyer.nombre) {
      // Nuevo cliente - crear buyer primero
      try {
        // Generar email único si no se proporciona uno específico
        let uniqueEmail = buyer.email || 'sinregistrar@modotecno.com';
        
        if (uniqueEmail === 'sinregistrar@modotecno.com') {
          // Generar un email único basado en timestamp y nombre
          const timestamp = Date.now();
          const nameSlug = buyer.nombre.toLowerCase().replace(/\s+/g, '').substring(0, 10);
          uniqueEmail = `sinregistrar_${nameSlug}_${timestamp}@modotecno.com`;
        }

        // Intentar buscar un buyer existente con los mismos datos primero
        const existingBuyer = await prisma.buyer.findFirst({
          where: {
            AND: [
              { nombre: buyer.nombre },
              { telefono: buyer.telefono || '' }
            ]
          }
        });

        if (existingBuyer) {
          // Usar el buyer existente si coinciden nombre y teléfono
          buyerData = existingBuyer;
          finalBuyerId = existingBuyer.id;
        } else {
          // Crear nuevo buyer con email único
          buyerData = await prisma.buyer.create({
            data: {
              nombre: buyer.nombre,
              telefono: buyer.telefono || '',
              email: uniqueEmail,
              dni: buyer.dni || '12345678',
              direccion: buyer.direccion || ''
            }
          });
          finalBuyerId = buyerData.id;
        }
      } catch (createError) {
        console.error("Error creating buyer:", createError);
        
        // Si aún falla por email duplicado, intentar con un email más único
        if (createError.code === 'P2002' && createError.meta?.target === 'Buyer_email_key') {
          try {
            const uniqueId = Math.random().toString(36).substring(2, 15);
            const uniqueEmail = `sinregistrar_${uniqueId}@modotecno.com`;
            
            buyerData = await prisma.buyer.create({
              data: {
                nombre: buyer.nombre,
                telefono: buyer.telefono || '',
                email: uniqueEmail,
                dni: buyer.dni || '12345678',
                direccion: buyer.direccion || ''
              }
            });
            finalBuyerId = buyerData.id;
          } catch (retryError) {
            console.error("Error creating buyer on retry:", retryError);
            return res.status(500).json({ error: "Error creating buyer" });
          }
        } else {
          return res.status(500).json({ error: "Error creating buyer" });
        }
      }
    } else {
      // Usar buyer por defecto
      buyerData = await prisma.buyer.findUnique({
        where: { id: DEFAULT_BUYER_ID }
      });

      if (!buyerData) {
        return res.status(400).json({ error: "Default buyer not found" });
      }
    }

    // VALIDACIÓN DE STOCK - Verificar disponibilidad de todos los productos
    const stockValidationErrors = [];
    const productUpdates = [];

    for (const producto of productos) {
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

      // Preparar actualización de stock
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

    // Usar transacción para garantizar consistencia
    const result = await prisma.$transaction(async (tx) => {
      // Crear la venta POS con sus detalles
      const newSale = await tx.pOSSale.create({
        data: {
          buyerId: finalBuyerId,
          monto_total,
          estado: "COMPLETADO",
          metodo_pago,
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
