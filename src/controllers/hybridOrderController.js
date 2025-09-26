import { PrismaClient } from "db";
const prisma = new PrismaClient();

// ====== ENDPOINTS HÍBRIDOS PARA ÓRDENES ======

// Obtener datos ESTÁTICOS de órdenes (cache largo - 30 minutos)
export const getOrdersStatic = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * pageSize;

    const customerName = (req.query.customerName || "").trim();
    const status = req.query.status || "";
    const type = req.query.type || ""; // 'online' | 'pos' | ''

    // Si se especifica type, filtrar por tipo de orden
    if (type === 'pos') {
      return await getPOSOrdersStatic(req, res);
    }

    let where = {};

    if (status && status !== 'ALL') {
      where.estado = status;
    }

    if (customerName) {
      where.buyer = {
        OR: [
          { nombre: { contains: customerName, mode: 'insensitive' } },
          { apellido: { contains: customerName, mode: 'insensitive' } }
        ]
      };
    }

    const totalCount = await prisma.order.count({ where });
    const orders = await prisma.order.findMany({
      where,
      skip,
      take: pageSize,
      select: {
        id: true,
        fecha: true,
        metodo_pago: true,
        info_envio: true,
        external_reference: true,
        payment_id: true,
        createdAt: true,
        updatedAt: true,
        // Información del comprador (estática)
        buyer: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
            direccion: true
          }
        },
        // Detalles de productos (estáticos)
        detalles: {
          select: {
            id: true,
            productoId: true,
            productoName: true,
            cantidad: true,
            precio_unitario_al_momento_de_compra: true,
            producto: {
              select: {
                name: true,
                sku: true,
                images: true,
                category: true,
                brand: true
              }
            }
          }
        },
        // NO incluir: estado, monto_total (datos dinámicos)
      },
      orderBy: { fecha: "desc" },
    });

    res.status(200).json({ orders, totalCount, type: 'online' });

  } catch (err) {
    console.error('Error fetching static orders:', err);
    res.status(500).json({ error: "Error fetching static order data" });
  }
};

// Obtener datos DINÁMICOS de órdenes (cache corto - 30 segundos + polling)
export const getOrdersDynamic = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * pageSize;

    const customerName = (req.query.customerName || "").trim();
    const status = req.query.status || "";
    const type = req.query.type || "";

    if (type === 'pos') {
      return await getPOSOrdersDynamic(req, res);
    }

    let where = {};

    if (status && status !== 'ALL') {
      where.estado = status;
    }

    if (customerName) {
      where.buyer = {
        OR: [
          { nombre: { contains: customerName, mode: 'insensitive' } },
          { apellido: { contains: customerName, mode: 'insensitive' } }
        ]
      };
    }

    const totalCount = await prisma.order.count({ where });
    const orders = await prisma.order.findMany({
      where,
      skip,
      take: pageSize,
      select: {
        id: true,
        estado: true,
        monto_total: true,
        // Solo datos dinámicos que cambian frecuentemente
      },
      orderBy: { fecha: "desc" },
    });

    res.status(200).json({ orders, totalCount, type: 'online' });

  } catch (err) {
    console.error('Error fetching dynamic orders:', err);
    res.status(500).json({ error: "Error fetching dynamic order data" });
  }
};

// ====== ENDPOINTS PARA VENTAS POS ======

// Obtener datos estáticos de ventas POS
const getPOSOrdersStatic = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * pageSize;

    const customerName = (req.query.customerName || "").trim();
    const status = req.query.status || "";

    let where = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (customerName) {
      where.OR = [
        { customerName: { contains: customerName, mode: 'insensitive' } },
        { buyer: {
          OR: [
            { nombre: { contains: customerName, mode: 'insensitive' } },
            { apellido: { contains: customerName, mode: 'insensitive' } }
          ]
        }}
      ];
    }

    const totalCount = await prisma.posSale.count({ where });
    const orders = await prisma.posSale.findMany({
      where,
      skip,
      take: pageSize,
      select: {
        id: true,
        customerName: true,
        customerPhone: true,
        paymentMethod: true,
        createdAt: true,
        updatedAt: true,
        // Información del comprador si está vinculado
        buyer: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
            direccion: true
          }
        },
        // Items de la venta (estáticos)
        items: true,
        // NO incluir: status, total (datos dinámicos)
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ orders, totalCount, type: 'pos' });

  } catch (err) {
    console.error('Error fetching static POS orders:', err);
    res.status(500).json({ error: "Error fetching static POS order data" });
  }
};

// Obtener datos dinámicos de ventas POS
const getPOSOrdersDynamic = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * pageSize;

    const customerName = (req.query.customerName || "").trim();
    const status = req.query.status || "";

    let where = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (customerName) {
      where.OR = [
        { customerName: { contains: customerName, mode: 'insensitive' } },
        { buyer: {
          OR: [
            { nombre: { contains: customerName, mode: 'insensitive' } },
            { apellido: { contains: customerName, mode: 'insensitive' } }
          ]
        }}
      ];
    }

    const totalCount = await prisma.posSale.count({ where });
    const orders = await prisma.posSale.findMany({
      where,
      skip,
      take: pageSize,
      select: {
        id: true,
        status: true,
        total: true,
        // Solo datos dinámicos
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ orders, totalCount, type: 'pos' });

  } catch (err) {
    console.error('Error fetching dynamic POS orders:', err);
    res.status(500).json({ error: "Error fetching dynamic POS order data" });
  }
};

// ====== ENDPOINTS POR ID ======

// Obtener datos estáticos de una orden específica
export const getOrderStaticById = async (req, res) => {
  const { id } = req.params;
  const { type } = req.query; // 'online' | 'pos'

  try {
    if (type === 'pos') {
      const order = await prisma.posSale.findUnique({
        where: { id },
        select: {
          id: true,
          customerName: true,
          customerPhone: true,
          paymentMethod: true,
          createdAt: true,
          updatedAt: true,
          items: true,
          buyer: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
              telefono: true,
              direccion: true
            }
          }
        },
      });

      if (!order) {
        return res.status(404).json({ error: "POS Sale not found" });
      }

      return res.status(200).json({ ...order, type: 'pos' });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        fecha: true,
        metodo_pago: true,
        info_envio: true,
        external_reference: true,
        payment_id: true,
        createdAt: true,
        updatedAt: true,
        buyer: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
            direccion: true
          }
        },
        detalles: {
          select: {
            id: true,
            productoId: true,
            productoName: true,
            cantidad: true,
            precio_unitario_al_momento_de_compra: true,
            producto: {
              select: {
                name: true,
                sku: true,
                images: true,
                category: true,
                brand: true
              }
            }
          }
        }
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json({ ...order, type: 'online' });
  } catch (error) {
    console.error('Error fetching static order:', error);
    res.status(500).json({ error: "Error fetching static order data" });
  }
};

// Obtener datos dinámicos de una orden específica
export const getOrderDynamicById = async (req, res) => {
  const { id } = req.params;
  const { type } = req.query;

  try {
    if (type === 'pos') {
      const order = await prisma.posSale.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
          total: true,
        },
      });

      if (!order) {
        return res.status(404).json({ error: "POS Sale not found" });
      }

      return res.status(200).json({ ...order, type: 'pos' });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        estado: true,
        monto_total: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json({ ...order, type: 'online' });
  } catch (error) {
    console.error('Error fetching dynamic order:', error);
    res.status(500).json({ error: "Error fetching dynamic order data" });
  }
};

// ====== ENDPOINTS DE ACTUALIZACIÓN ESPECÍFICA ======

// Actualizar solo el estado de una orden online
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['PENDIENTE_PAGO', 'PAGADO', 'RECHAZADO', 'ENTREGADO'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: "Valid status is required", 
      validStatuses 
    });
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { 
        estado: status,
        updatedAt: new Date()
      },
      select: {
        id: true,
        estado: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      order: updatedOrder,
      message: "Order status updated successfully"
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(500).json({ error: "Error updating order status" });
  }
};

// Actualizar solo el estado de una venta POS
export const updatePOSOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['PENDIENTE', 'COMPLETADO', 'ANULADO'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: "Valid status is required", 
      validStatuses 
    });
  }

  try {
    const updatedOrder = await prisma.posSale.update({
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
      order: updatedOrder,
      message: "POS order status updated successfully"
    });
  } catch (error) {
    console.error('Error updating POS order status:', error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "POS Sale not found" });
    }
    res.status(500).json({ error: "Error updating POS order status" });
  }
};

// ====== BÚSQUEDA UNIFICADA ======

// Buscar en órdenes online y POS con un solo endpoint
export const searchUnifiedOrders = async (req, res) => {
  const { id } = req.params;

  try {
    // Primero buscar en órdenes online
    let order = await prisma.order.findUnique({
      where: { id },
      include: {
        buyer: true,
        detalles: {
          include: {
            producto: true
          }
        }
      }
    });

    if (order) {
      return res.status(200).json({ 
        ...order, 
        type: 'online',
        found: true 
      });
    }

    // Si no se encuentra, buscar en ventas POS
    order = await prisma.posSale.findUnique({
      where: { id },
      include: {
        buyer: true
      }
    });

    if (order) {
      return res.status(200).json({ 
        ...order, 
        type: 'pos',
        found: true 
      });
    }

    // Si no se encuentra en ningún lado
    res.status(404).json({ 
      error: "Order not found in any system",
      found: false 
    });

  } catch (error) {
    console.error('Error in unified order search:', error);
    res.status(500).json({ error: "Error searching for order" });
  }
};

// ====== ESTADÍSTICAS DINÁMICAS ======

// Obtener estadísticas de órdenes (datos dinámicos)
export const getOrderStats = async (req, res) => {
  try {
    const [
      totalOnlineOrders,
      totalPOSOrders,
      pendingOnlineOrders,
      pendingPOSOrders,
      completedOnlineOrders,
      completedPOSOrders,
      totalOnlineRevenue,
      totalPOSRevenue
    ] = await Promise.all([
      prisma.order.count(),
      prisma.posSale.count(),
      prisma.order.count({ where: { estado: 'PENDIENTE_PAGO' } }),
      prisma.posSale.count({ where: { status: 'PENDIENTE' } }),
      prisma.order.count({ where: { estado: 'ENTREGADO' } }),
      prisma.posSale.count({ where: { status: 'COMPLETADO' } }),
      prisma.order.aggregate({
        where: { estado: 'ENTREGADO' },
        _sum: { monto_total: true }
      }),
      prisma.posSale.aggregate({
        where: { status: 'COMPLETADO' },
        _sum: { total: true }
      })
    ]);

    res.status(200).json({
      online: {
        total: totalOnlineOrders,
        pending: pendingOnlineOrders,
        completed: completedOnlineOrders,
        revenue: totalOnlineRevenue._sum.monto_total || 0
      },
      pos: {
        total: totalPOSOrders,
        pending: pendingPOSOrders,
        completed: completedPOSOrders,
        revenue: totalPOSRevenue._sum.total || 0
      },
      combined: {
        totalOrders: totalOnlineOrders + totalPOSOrders,
        totalPending: pendingOnlineOrders + pendingPOSOrders,
        totalCompleted: completedOnlineOrders + completedPOSOrders,
        totalRevenue: (totalOnlineRevenue._sum.monto_total || 0) + (totalPOSRevenue._sum.total || 0)
      },
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({ error: "Error fetching order statistics" });
  }
};
