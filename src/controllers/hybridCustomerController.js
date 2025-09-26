import { PrismaClient } from "db";
const prisma = new PrismaClient();

// ====== ENDPOINTS HÍBRIDOS PARA CLIENTES ======

// Obtener datos ESTÁTICOS de clientes (cache largo - 30 minutos)
export const getCustomersStatic = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * pageSize;

    const keyword = (req.query.keyword || "").trim();
    const segment = req.query.segment || "";

    let where = {};

    if (segment && segment !== 'ALL') {
      where.segment = segment;
    }

    if (keyword) {
      where.OR = [
        { nombre: { contains: keyword, mode: 'insensitive' } },
        { apellido: { contains: keyword, mode: 'insensitive' } },
        { telefono: { contains: keyword, mode: 'insensitive' } },
        { email: { contains: keyword, mode: 'insensitive' } },
        { dni: { contains: keyword, mode: 'insensitive' } },
        { cuit: { contains: keyword, mode: 'insensitive' } }
      ];
    }

    const totalCount = await prisma.buyer.count({ where });
    const customers = await prisma.buyer.findMany({
      where,
      skip,
      take: pageSize,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        whatsapp: true,
        dni: true,
        cuit: true,
        direccion: true, // campo legacy
        fecha_nacimiento: true,
        addresses: true,
        acquisition_channel: true,
        utm_source: true,
        utm_medium: true,
        utm_campaign: true,
        utm_content: true,
        utm_term: true,
        communication_preferences: true,
        segment: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        // NO incluir: credito_disponible, limite_credito (datos dinámicos)
      },
      orderBy: { nombre: "asc" },
    });

    res.status(200).json({ customers, totalCount });

  } catch (err) {
    console.error('Error fetching static customers:', err);
    res.status(500).json({ error: "Error fetching static customer data" });
  }
};

// Obtener datos DINÁMICOS de clientes (cache corto - 30 segundos + polling)
export const getCustomersDynamic = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * pageSize;

    const keyword = (req.query.keyword || "").trim();
    const segment = req.query.segment || "";

    let where = {};

    if (segment && segment !== 'ALL') {
      where.segment = segment;
    }

    if (keyword) {
      where.OR = [
        { nombre: { contains: keyword, mode: 'insensitive' } },
        { apellido: { contains: keyword, mode: 'insensitive' } },
        { telefono: { contains: keyword, mode: 'insensitive' } },
        { email: { contains: keyword, mode: 'insensitive' } },
        { dni: { contains: keyword, mode: 'insensitive' } },
        { cuit: { contains: keyword, mode: 'insensitive' } }
      ];
    }

    const totalCount = await prisma.buyer.count({ where });
    const customers = await prisma.buyer.findMany({
      where,
      skip,
      take: pageSize,
      select: {
        id: true,
        credito_disponible: true,
        limite_credito: true,
        // Solo datos dinámicos que cambian frecuentemente
      },
      orderBy: { nombre: "asc" },
    });

    res.status(200).json({ customers, totalCount });

  } catch (err) {
    console.error('Error fetching dynamic customers:', err);
    res.status(500).json({ error: "Error fetching dynamic customer data" });
  }
};

// Obtener datos estáticos de un cliente específico
export const getCustomerStaticById = async (req, res) => {
  const { id } = req.params;

  try {
    const customer = await prisma.buyer.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        whatsapp: true,
        dni: true,
        cuit: true,
        direccion: true,
        fecha_nacimiento: true,
        addresses: true,
        acquisition_channel: true,
        utm_source: true,
        utm_medium: true,
        utm_campaign: true,
        utm_content: true,
        utm_term: true,
        communication_preferences: true,
        segment: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.status(200).json(customer);
  } catch (error) {
    console.error('Error fetching static customer:', error);
    res.status(500).json({ error: "Error fetching static customer data" });
  }
};

// Obtener datos dinámicos de un cliente específico
export const getCustomerDynamicById = async (req, res) => {
  const { id } = req.params;

  try {
    const customer = await prisma.buyer.findUnique({
      where: { id },
      select: {
        id: true,
        credito_disponible: true,
        limite_credito: true,
      },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.status(200).json(customer);
  } catch (error) {
    console.error('Error fetching dynamic customer:', error);
    res.status(500).json({ error: "Error fetching dynamic customer data" });
  }
};

// ====== ENDPOINTS DE ACTUALIZACIÓN ESPECÍFICA ======

// Actualizar solo el crédito de un cliente
export const updateCustomerCredit = async (req, res) => {
  const { id } = req.params;
  const { credito_disponible, limite_credito } = req.body;

  if (credito_disponible === undefined && limite_credito === undefined) {
    return res.status(400).json({ error: "At least one credit field is required" });
  }

  try {
    const updateData = { updatedAt: new Date() };
    
    if (credito_disponible !== undefined) updateData.credito_disponible = parseFloat(credito_disponible);
    if (limite_credito !== undefined) updateData.limite_credito = parseFloat(limite_credito);

    const updatedCustomer = await prisma.buyer.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        credito_disponible: true,
        limite_credito: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      customer: updatedCustomer,
      message: "Customer credit updated successfully"
    });
  } catch (error) {
    console.error('Error updating customer credit:', error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.status(500).json({ error: "Error updating customer credit" });
  }
};

// Actualizar direcciones de un cliente (semi-dinámico)
export const updateCustomerAddresses = async (req, res) => {
  const { id } = req.params;
  const { addresses } = req.body;

  if (!addresses || !Array.isArray(addresses)) {
    return res.status(400).json({ error: "Valid addresses array is required" });
  }

  try {
    const updatedCustomer = await prisma.buyer.update({
      where: { id },
      data: { 
        addresses,
        updatedAt: new Date()
      },
      select: {
        id: true,
        addresses: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      customer: updatedCustomer,
      message: "Customer addresses updated successfully"
    });
  } catch (error) {
    console.error('Error updating customer addresses:', error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.status(500).json({ error: "Error updating customer addresses" });
  }
};

// Actualizar preferencias de comunicación
export const updateCustomerPreferences = async (req, res) => {
  const { id } = req.params;
  const { communication_preferences } = req.body;

  if (!communication_preferences) {
    return res.status(400).json({ error: "Communication preferences are required" });
  }

  try {
    const updatedCustomer = await prisma.buyer.update({
      where: { id },
      data: { 
        communication_preferences,
        updatedAt: new Date()
      },
      select: {
        id: true,
        communication_preferences: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      customer: updatedCustomer,
      message: "Customer preferences updated successfully"
    });
  } catch (error) {
    console.error('Error updating customer preferences:', error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.status(500).json({ error: "Error updating customer preferences" });
  }
};

// Actualizar segmento del cliente
export const updateCustomerSegment = async (req, res) => {
  const { id } = req.params;
  const { segment, tags } = req.body;

  const validSegments = ['NUEVO', 'REGULAR', 'VIP', 'CORPORATIVO', 'INACTIVO'];
  
  if (segment && !validSegments.includes(segment)) {
    return res.status(400).json({ 
      error: "Valid segment is required", 
      validSegments 
    });
  }

  try {
    const updateData = { updatedAt: new Date() };
    
    if (segment) updateData.segment = segment;
    if (tags !== undefined) updateData.tags = tags;

    const updatedCustomer = await prisma.buyer.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        segment: true,
        tags: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      customer: updatedCustomer,
      message: "Customer segment updated successfully"
    });
  } catch (error) {
    console.error('Error updating customer segment:', error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.status(500).json({ error: "Error updating customer segment" });
  }
};

// ====== BÚSQUEDA ESPECÍFICA ======

// Búsqueda optimizada para autocompletado en POS/Ventas
export const searchCustomersForSale = async (req, res) => {
  try {
    const { nombre, telefono, limit = 10 } = req.query;
    const limitNum = parseInt(limit);

    if (!nombre && !telefono) {
      return res.status(400).json({ error: "Se requiere nombre o telefono para la búsqueda" });
    }

    const searchFilters = [];

    if (nombre) {
      searchFilters.push({
        OR: [
          { nombre: { contains: nombre, mode: 'insensitive' } },
          { apellido: { contains: nombre, mode: 'insensitive' } }
        ]
      });
    }

    if (telefono) {
      searchFilters.push({
        OR: [
          { telefono: { contains: telefono, mode: 'insensitive' } },
          { whatsapp: { contains: telefono, mode: 'insensitive' } }
        ]
      });
    }

    const customers = await prisma.buyer.findMany({
      where: {
        OR: searchFilters
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        telefono: true,
        email: true,
        credito_disponible: true,
        limite_credito: true,
        segment: true
      },
      take: limitNum,
      orderBy: { nombre: 'asc' }
    });

    // Formato normalizado para compatibilidad
    const formattedCustomers = customers.map(customer => ({
      id: customer.id,
      name: `${customer.nombre} ${customer.apellido || ''}`.trim(),
      phone: customer.telefono,
      email: customer.email,
      credit: customer.credito_disponible,
      creditLimit: customer.limite_credito,
      segment: customer.segment
    }));

    res.status(200).json(formattedCustomers);
  } catch (error) {
    console.error('Error searching customers:', error);
    res.status(500).json({ error: "Error en la búsqueda de clientes" });
  }
};

// ====== RELACIONES CON OTRAS ENTIDADES ======

// Obtener dispositivos de un cliente
export const getCustomerDevices = async (req, res) => {
  const { id } = req.params;

  try {
    const devices = await prisma.customerDevice.findMany({
      where: { buyerId: id },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ devices });
  } catch (error) {
    console.error('Error fetching customer devices:', error);
    res.status(500).json({ error: "Error fetching customer devices" });
  }
};

// Crear dispositivo para un cliente
export const createCustomerDevice = async (req, res) => {
  const { id } = req.params;
  const deviceData = req.body;

  try {
    const device = await prisma.customerDevice.create({
      data: {
        ...deviceData,
        buyerId: id
      }
    });

    res.status(201).json({ device, message: "Device created successfully" });
  } catch (error) {
    console.error('Error creating customer device:', error);
    res.status(500).json({ error: "Error creating customer device" });
  }
};

// Obtener historial de compras de un cliente
export const getCustomerPurchases = async (req, res) => {
  const { id } = req.params;

  try {
    const [onlineOrders, posSales] = await Promise.all([
      prisma.order.findMany({
        where: { buyerId: id },
        select: {
          id: true,
          total: true,
          estado: true,
          fecha: true,
          items: true,
          tipo: true
        },
        orderBy: { fecha: 'desc' },
        take: 20
      }),
      prisma.posSale.findMany({
        where: { buyerId: id },
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
          items: true
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      })
    ]);

    // Combinar y formatear historial
    const purchases = [
      ...onlineOrders.map(order => ({
        id: order.id,
        type: 'online',
        total: order.total,
        status: order.estado,
        date: order.fecha,
        items: order.items
      })),
      ...posSales.map(sale => ({
        id: sale.id,
        type: 'pos',
        total: sale.total,
        status: sale.status,
        date: sale.createdAt,
        items: sale.items
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);

    res.status(200).json({ purchases });
  } catch (error) {
    console.error('Error fetching customer purchases:', error);
    res.status(500).json({ error: "Error fetching customer purchases" });
  }
};

// Obtener servicios de un cliente
export const getCustomerServices = async (req, res) => {
  const { id } = req.params;

  try {
    const services = await prisma.service.findMany({
      where: { buyerId: id },
      select: {
        id: true,
        device: true,
        state: true,
        total: true,
        date: true,
        dateOut: true,
        repair: true
      },
      orderBy: { date: 'desc' },
      take: 20
    });

    res.status(200).json({ services });
  } catch (error) {
    console.error('Error fetching customer services:', error);
    res.status(500).json({ error: "Error fetching customer services" });
  }
};
