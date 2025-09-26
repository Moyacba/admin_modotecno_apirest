import { PrismaClient } from "db";
// import bcrypt from "bcrypt";
const prisma = new PrismaClient();

// Obtener todos los clientes
export const getCustomers = async (req, res) => {
  try {
    const pageSize = 10;
    const page = parseInt(req.query.page) || 1;

    const customers = await prisma.buyer.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        nombre: "asc",
      },
    });

    res.status(200).json(customers);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: "Error fetching customers" });
  }
};

// Buscar clientes por nombre o teléfono
export const searchCustomers = async (req, res) => {
  console.log(req.query);
  try {
    const { nombre, telefono, limit = 10 } = req.query;
    const limitNum = parseInt(limit);

    if (!nombre && !telefono) {
      return res.status(400).json({ error: "Se requiere nombre o telefono para la búsqueda" });
    }

    const searchFilters = [];

    if (nombre) {
      searchFilters.push({
        nombre: {
          contains: nombre,
          mode: 'insensitive'
        }
      });
    }

    if (telefono) {
      searchFilters.push({
        telefono: {
          contains: telefono
        }
      });
    }

    const customers = await prisma.buyer.findMany({
      where: {
        OR: searchFilters
      },
      take: limitNum,
      orderBy: {
        nombre: "asc"
      }
    });

    res.status(200).json({
      customers: customers,
      count: customers.length
    });
  } catch (error) {
    console.error('Error searching customers:', error);
    res.status(500).json({ error: "Error searching customers" });
  }
};

// Obtener un cliente por ID
export const getCustomerById = async (req, res) => {
  const { id } = req.params;
  try {
    const buyer = await prisma.buyer.findUnique({
      where: { id },
    });
    if (!buyer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.status(200).json(buyer);
  } catch (error) {
    console.error('Error fetching buyer:', error);
    res.status(500).json({ error: "Error fetching buyer" });
  }
};

// Crear un nuevo cliente
export const createCustomer = async (req, res) => {
  const {
    nombre,
    apellido,
    email,
    dni,
    cuit,
    telefono,
    whatsapp,
    fecha_nacimiento,
    acquisition_channel,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    segment,
    tags,
    // Dirección (legacy field - mantener para compatibilidad)
    direccion
  } = req.body;

  // Validaciones básicas
  if (!nombre) {
    return res.status(400).json({ error: "Nombre es requerido" });
  }

  try {
    // Generar email único si no se proporciona
    const customerEmail = email || `sinregistrar_${Date.now()}@modotecno.com`;

    const newCustomer = await prisma.buyer.create({
      data: {
        nombre,
        apellido,
        email: email ?? customerEmail,
        dni,
        cuit,
        telefono,
        whatsapp,
        fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
        acquisition_channel,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term,
        segment: segment || 'NUEVO',
        tags: tags || [],
        // Campo legacy para compatibilidad
        direccion: direccion ?? '',
      },
    });

    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    if (error.code === "P2002") {
      // Unique constraint violation (email)
      return res.status(400).json({ error: "Email already in use" });
    }
    res.status(500).json({ error: "Error creating customer" });
  }
};

// Actualizar un cliente
export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    apellido,
    email,
    dni,
    cuit,
    telefono,
    whatsapp,
    fecha_nacimiento,
    acquisition_channel,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    segment,
    tags,
    // Campo legacy para compatibilidad
    direccion
  } = req.body;

  const updateData = {};

  // Solo incluir campos que no sean undefined
  if (nombre !== undefined) updateData.nombre = nombre;
  if (apellido !== undefined) updateData.apellido = apellido;
  if (email !== undefined) updateData.email = email;
  if (dni !== undefined) updateData.dni = dni;
  if (cuit !== undefined) updateData.cuit = cuit;
  if (telefono !== undefined) updateData.telefono = telefono;
  if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
  if (fecha_nacimiento !== undefined) {
    updateData.fecha_nacimiento = fecha_nacimiento ? new Date(fecha_nacimiento) : null;
  }
  if (acquisition_channel !== undefined) updateData.acquisition_channel = acquisition_channel;
  if (utm_source !== undefined) updateData.utm_source = utm_source;
  if (utm_medium !== undefined) updateData.utm_medium = utm_medium;
  if (utm_campaign !== undefined) updateData.utm_campaign = utm_campaign;
  if (utm_content !== undefined) updateData.utm_content = utm_content;
  if (utm_term !== undefined) updateData.utm_term = utm_term;
  if (segment !== undefined) updateData.segment = segment;
  if (tags !== undefined) updateData.tags = tags;
  // Campo legacy para compatibilidad
  if (direccion !== undefined) updateData.direccion = direccion;

  try {
    const updatedCustomer = await prisma.buyer.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    if (error.code === "P2025") {
      // Customer not found
      return res.status(404).json({ error: "Customer not found" });
    }
    if (error.code === "P2002") {
      // Unique constraint violation (email)
      return res.status(400).json({ error: "Email already in use" });
    }
    res.status(500).json({ error: "Error updating customer" });
  }
};

// Eliminar un cliente
export const deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.buyer.delete({
      where: { id },
    });
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting buyer:', error);
    if (error.code === "P2025") {
      // Customer not found
      return res.status(404).json({ error: "Customer not found" });
    }
    res.status(500).json({ error: "Error deleting buyer" });
  }
};

// ===== CONTROLADORES PARA PREFERENCIAS DE COMUNICACIÓN =====
export const getCustomerPreferences = async (req, res) => {
  const { id } = req.params;
  try {
    const preferences = await prisma.communicationPreferences.findUnique({
      where: { buyerId: id }
    });
    res.status(200).json(preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: "Error fetching preferences" });
  }
};

export const updateCustomerPreferences = async (req, res) => {
  const { id } = req.params;
  const preferencesData = req.body;
  
  try {
    const preferences = await prisma.communicationPreferences.upsert({
      where: { buyerId: id },
      update: preferencesData,
      create: {
        buyerId: id,
        ...preferencesData
      }
    });
    res.status(200).json(preferences);
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: "Error updating preferences" });
  }
};

// ===== CONTROLADORES PARA SEGMENTACIÓN =====
export const updateCustomerSegment = async (req, res) => {
  const { id } = req.params;
  const { segment, tags } = req.body;
  
  try {
    const customer = await prisma.buyer.update({
      where: { id },
      data: {
        segment,
        tags: tags || []
      }
    });
    res.status(200).json(customer);
  } catch (error) {
    console.error('Error updating segment:', error);
    res.status(500).json({ error: "Error updating segment" });
  }
};

// ===== CONTROLADORES PARA DIRECCIONES =====
export const getCustomerAddresses = async (req, res) => {
  const { id } = req.params;
  try {
    const addresses = await prisma.address.findMany({
      where: { buyerId: id },
      orderBy: { is_default: 'desc' }
    });
    res.status(200).json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ error: "Error fetching addresses" });
  }
};

export const addCustomerAddress = async (req, res) => {
  const { id } = req.params;
  const { tipo, calle, numero, piso, departamento, codigo_postal, ciudad, provincia, pais, is_default } = req.body;
  
  try {
    // Si esta dirección se marca como default, desmarcar las otras
    if (is_default) {
      await prisma.address.updateMany({
        where: { buyerId: id },
        data: { is_default: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        buyerId: id,
        tipo: tipo || 'personal',
        calle,
        numero,
        piso,
        departamento,
        codigo_postal,
        ciudad,
        provincia,
        pais: pais || 'Argentina',
        is_default: is_default || false
      }
    });

    res.status(201).json(address);
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ error: "Error adding address" });
  }
};

export const updateCustomerAddress = async (req, res) => {
  const { id, addressId } = req.params;
  const addressData = req.body;
  
  try {
    // Si esta dirección se marca como default, desmarcar las otras
    if (addressData.is_default) {
      await prisma.address.updateMany({
        where: { buyerId: id },
        data: { is_default: false }
      });
    }

    const address = await prisma.address.update({
      where: { id: addressId },
      data: addressData
    });
    res.status(200).json(address);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ error: "Error updating address" });
  }
};

export const deleteCustomerAddress = async (req, res) => {
  const { addressId } = req.params;
  
  try {
    await prisma.address.delete({
      where: { id: addressId }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ error: "Error deleting address" });
  }
};

// ===== CONTROLADORES PARA DISPOSITIVOS =====
export const getCustomerDevices = async (req, res) => {
  const { id } = req.params;
  try {
    const devices = await prisma.customerDevice.findMany({
      where: { buyerId: id },
      orderBy: { created_at: 'desc' }
    });
    res.status(200).json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: "Error fetching devices" });
  }
};

export const addCustomerDevice = async (req, res) => {
  const { id } = req.params;
  const { marca, modelo, numero_serie, imei, estado, observaciones } = req.body;
  
  try {
    const device = await prisma.customerDevice.create({
      data: {
        buyerId: id,
        marca,
        modelo,
        numero_serie,
        imei,
        estado: estado || 'ACTIVO',
        observaciones
      }
    });

    res.status(201).json(device);
  } catch (error) {
    console.error('Error adding device:', error);
    res.status(500).json({ error: "Error adding device" });
  }
};

export const updateCustomerDevice = async (req, res) => {
  const { deviceId } = req.params;
  const deviceData = req.body;
  
  try {
    const device = await prisma.customerDevice.update({
      where: { id: deviceId },
      data: deviceData
    });
    res.status(200).json(device);
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({ error: "Error updating device" });
  }
};

export const deleteCustomerDevice = async (req, res) => {
  const { deviceId } = req.params;
  
  try {
    await prisma.customerDevice.delete({
      where: { id: deviceId }
    });
    res.status(200).json({ message: "Device deleted successfully" });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({ error: "Error deleting device" });
  }
};

// ===== CONTROLADORES PARA INTERACCIONES =====
export const addProductInteraction = async (req, res) => {
  const { id } = req.params;
  const { productId, tipo, metadata } = req.body;
  
  try {
    const interaction = await prisma.productInteraction.create({
      data: {
        buyerId: id,
        productId,
        tipo,
        metadata
      }
    });

    res.status(201).json(interaction);
  } catch (error) {
    console.error('Error adding interaction:', error);
    res.status(500).json({ error: "Error adding interaction" });
  }
};

export const getCustomerInteractions = async (req, res) => {
  const { id } = req.params;
  const { tipo, limit = 50 } = req.query;
  
  const whereCondition = { buyerId: id };
  if (tipo) whereCondition.tipo = tipo;

  try {
    const interactions = await prisma.productInteraction.findMany({
      where: whereCondition,
      take: parseInt(limit),
      orderBy: { timestamp: 'desc' }
    });
    res.status(200).json(interactions);
  } catch (error) {
    console.error('Error fetching interactions:', error);
    res.status(500).json({ error: "Error fetching interactions" });
  }
};

// ===== CONTROLADORES PARA EVENTOS DE NAVEGACIÓN =====
export const getCustomerBrowsingEvents = async (req, res) => {
  const { id } = req.params;
  const { limit = 50 } = req.query;
  
  try {
    const events = await prisma.browsingEvent.findMany({
      where: { buyerId: id },
      take: parseInt(limit),
      orderBy: { timestamp: 'desc' }
    });
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching browsing events:', error);
    res.status(500).json({ error: "Error fetching browsing events" });
  }
};

export const addBrowsingEvent = async (req, res) => {
  const { id } = req.params;
  const eventData = req.body;
  
  try {
    const event = await prisma.browsingEvent.create({
      data: {
        buyerId: id,
        ...eventData
      }
    });
    res.status(201).json(event);
  } catch (error) {
    console.error('Error adding browsing event:', error);
    res.status(500).json({ error: "Error adding browsing event" });
  }
};

// ===== CONTROLADORES PARA FEEDBACK =====
export const getCustomerFeedback = async (req, res) => {
  const { id } = req.params;
  const { tipo } = req.query;
  
  const whereCondition = { buyerId: id };
  if (tipo) whereCondition.tipo = tipo;

  try {
    const feedback = await prisma.feedback.findMany({
      where: whereCondition,
      orderBy: { created_at: 'desc' }
    });
    res.status(200).json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: "Error fetching feedback" });
  }
};

export const addCustomerFeedback = async (req, res) => {
  const { id } = req.params;
  const feedbackData = req.body;
  
  try {
    const feedback = await prisma.feedback.create({
      data: {
        buyerId: id,
        ...feedbackData
      }
    });
    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error adding feedback:', error);
    res.status(500).json({ error: "Error adding feedback" });
  }
};

export const updateFeedbackResponse = async (req, res) => {
  const { feedbackId } = req.params;
  const { respuesta, respondido_por } = req.body;
  
  try {
    const feedback = await prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        respuesta,
        respondido_por,
        respondido_at: new Date()
      }
    });
    res.status(200).json(feedback);
  } catch (error) {
    console.error('Error updating feedback response:', error);
    res.status(500).json({ error: "Error updating feedback response" });
  }
};

// ===== CONTROLADORES PARA HISTORIAL =====
export const getCustomerPurchases = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Obtener órdenes online
    const onlineOrders = await prisma.order.findMany({
      where: { buyerId: id },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // TODO: Agregar integración con sistema POS cuando esté disponible
    const posOrders = [];

    res.status(200).json({
      online: onlineOrders,
      pos: posOrders,
      total: onlineOrders.length + posOrders.length
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ error: "Error fetching purchases" });
  }
};

export const getCustomerServices = async (req, res) => {
  const { id } = req.params;
  
  try {
    const services = await prisma.service.findMany({
      where: { buyerId: id },
      orderBy: { created_at: 'desc' }
    });
    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: "Error fetching services" });
  }
};

// ===== CONTROLADOR PARA ANALYTICS =====
export const getCustomerAnalytics = async (req, res) => {
  const { id } = req.params;
  const { period = '30d' } = req.query; // 7d, 30d, 90d, 1y
  
  try {
    // Calcular fecha de inicio basada en el período
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Obtener datos del cliente
    const customer = await prisma.buyer.findUnique({
      where: { id },
      include: {
        addresses: true,
        devices: true,
        communication_preferences: true
      }
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Obtener métricas de interacciones
    const interactions = await prisma.productInteraction.findMany({
      where: {
        buyerId: id,
        timestamp: { gte: startDate }
      }
    });

    // Obtener eventos de navegación
    const browsingEvents = await prisma.browsingEvent.findMany({
      where: {
        buyerId: id,
        timestamp: { gte: startDate }
      }
    });

    // Obtener órdenes del período
    const orders = await prisma.order.findMany({
      where: {
        buyerId: id,
        createdAt: { gte: startDate }
      },
      include: {
        orderItems: true
      }
    });

    // Obtener feedback
    const feedback = await prisma.feedback.findMany({
      where: {
        buyerId: id,
        created_at: { gte: startDate }
      }
    });

    // Calcular métricas
    const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
    const avgOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;
    const totalItems = orders.reduce((sum, order) => 
      sum + order.orderItems.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );

    // Analizar tipos de interacciones
    const interactionsByType = interactions.reduce((acc, interaction) => {
      acc[interaction.tipo] = (acc[interaction.tipo] || 0) + 1;
      return acc;
    }, {});

    // Analizar páginas más visitadas
    const pageViews = browsingEvents.reduce((acc, event) => {
      if (event.page_url) {
        acc[event.page_url] = (acc[event.page_url] || 0) + 1;
      }
      return acc;
    }, {});

    const analytics = {
      customer: {
        id: customer.id,
        nombre: customer.nombre,
        apellido: customer.apellido,
        email: customer.email,
        segment: customer.segment,
        created_at: customer.created_at
      },
      period: {
        start: startDate,
        end: now,
        days: Math.ceil((now - startDate) / (1000 * 60 * 60 * 24))
      },
      metrics: {
        totalOrders: orders.length,
        totalSpent,
        avgOrderValue,
        totalItems,
        totalInteractions: interactions.length,
        totalPageViews: browsingEvents.length,
        feedbackCount: feedback.length
      },
      interactions: {
        byType: interactionsByType,
        recent: interactions.slice(0, 10)
      },
      browsing: {
        topPages: Object.entries(pageViews)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([page, views]) => ({ page, views })),
        recent: browsingEvents.slice(0, 10)
      },
      orders: {
        recent: orders.slice(0, 5),
        byMonth: orders.reduce((acc, order) => {
          const month = order.createdAt.toISOString().slice(0, 7);
          acc[month] = (acc[month] || 0) + parseFloat(order.total || 0);
          return acc;
        }, {})
      },
      feedback: {
        recent: feedback.slice(0, 5),
        byType: feedback.reduce((acc, fb) => {
          acc[fb.tipo] = (acc[fb.tipo] || 0) + 1;
          return acc;
        }, {}),
        avgRating: feedback.length > 0 ? 
          feedback.reduce((sum, fb) => sum + (fb.rating || 0), 0) / feedback.length : 0
      }
    };

    res.status(200).json(analytics);
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({ error: "Error generating analytics" });
  }
};

// ===== CONTROLADOR PARA TIMELINE =====
export const getCustomerTimeline = async (req, res) => {
  const { id } = req.params;
  const { limit = 100 } = req.query;
  
  try {
    // Obtener diferentes tipos de eventos
    const [orders, interactions, browsingEvents, feedback, services] = await Promise.all([
      prisma.order.findMany({
        where: { buyerId: id },
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit) / 5
      }),
      prisma.productInteraction.findMany({
        where: { buyerId: id },
        select: {
          id: true,
          productId: true,
          tipo: true,
          timestamp: true,
          metadata: true
        },
        orderBy: { timestamp: 'desc' },
        take: parseInt(limit) / 5
      }),
      prisma.browsingEvent.findMany({
        where: { buyerId: id },
        select: {
          id: true,
          page_url: true,
          event_type: true,
          timestamp: true,
          metadata: true
        },
        orderBy: { timestamp: 'desc' },
        take: parseInt(limit) / 5
      }),
      prisma.feedback.findMany({
        where: { buyerId: id },
        select: {
          id: true,
          tipo: true,
          rating: true,
          comentario: true,
          created_at: true
        },
        orderBy: { created_at: 'desc' },
        take: parseInt(limit) / 5
      }),
      prisma.service.findMany({
        where: { buyerId: id },
        select: {
          id: true,
          tipo_servicio: true,
          estado: true,
          created_at: true,
          diagnostico: true
        },
        orderBy: { created_at: 'desc' },
        take: parseInt(limit) / 5
      })
    ]);

    // Convertir a formato unificado de timeline
    const timelineEvents = [];

    // Agregar órdenes
    orders.forEach(order => {
      timelineEvents.push({
        id: `order-${order.id}`,
        type: 'order',
        timestamp: order.createdAt,
        title: 'Nueva Orden',
        description: `Orden por ${order.total} - Estado: ${order.status}`,
        data: order
      });
    });

    // Agregar interacciones
    interactions.forEach(interaction => {
      timelineEvents.push({
        id: `interaction-${interaction.id}`,
        type: 'interaction',
        timestamp: interaction.timestamp,
        title: `Interacción: ${interaction.tipo}`,
        description: `Producto ID: ${interaction.productId}`,
        data: interaction
      });
    });

    // Agregar eventos de navegación
    browsingEvents.forEach(event => {
      timelineEvents.push({
        id: `browsing-${event.id}`,
        type: 'browsing',
        timestamp: event.timestamp,
        title: `Navegación: ${event.event_type}`,
        description: event.page_url,
        data: event
      });
    });

    // Agregar feedback
    feedback.forEach(fb => {
      timelineEvents.push({
        id: `feedback-${fb.id}`,
        type: 'feedback',
        timestamp: fb.created_at,
        title: `Feedback: ${fb.tipo}`,
        description: fb.comentario ? fb.comentario.substring(0, 100) : `Rating: ${fb.rating}`,
        data: fb
      });
    });

    // Agregar servicios
    services.forEach(service => {
      timelineEvents.push({
        id: `service-${service.id}`,
        type: 'service',
        timestamp: service.created_at,
        title: `Servicio: ${service.tipo_servicio}`,
        description: service.diagnostico || `Estado: ${service.estado}`,
        data: service
      });
    });

    // Ordenar por timestamp descendente
    timelineEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Limitar resultados
    const limitedEvents = timelineEvents.slice(0, parseInt(limit));

    res.status(200).json({
      events: limitedEvents,
      total: timelineEvents.length,
      types: {
        orders: orders.length,
        interactions: interactions.length,
        browsing: browsingEvents.length,
        feedback: feedback.length,
        services: services.length
      }
    });
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: "Error fetching customer timeline" });
  }
};
