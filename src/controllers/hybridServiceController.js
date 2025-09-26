import { PrismaClient } from "db";
const prisma = new PrismaClient();

// ====== ENDPOINTS HÍBRIDOS PARA SERVICIOS ======

// Obtener datos ESTÁTICOS de servicios (cache largo - 30 minutos)
export const getServicesStatic = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * pageSize;

    const customerName = (req.query.customerName || "").trim();
    const status = req.query.status || "";

    let where = {};

    if (status && status !== 'ALL') {
      where.state = status;
    }

    if (customerName) {
      where.client = {
        contains: customerName,
        mode: 'insensitive'
      };
    }

    const totalCount = await prisma.service.count({ where });
    const services = await prisma.service.findMany({
      where,
      skip,
      take: pageSize,
      select: {
        id: true,
        device: true,
        client: true,
        repair: true,
        date: true,
        dateOut: true,
        discount: true,
        // Campos estáticos - información que rara vez cambia
        diagnostico: true,
        estado_dispositivo_al_ingresar: true,
        observaciones: true,
        piezas: true,
        garantia_hasta: true,
        // Información del cliente si está vinculado
        buyerId: true,
        customerDeviceId: true,
        createdAt: true,
        updatedAt: true,
        // NO incluir: state, total, payments (datos dinámicos)
      },
      orderBy: { date: "desc" },
    });

    res.status(200).json({ services, totalCount });

  } catch (err) {
    console.error('Error fetching static services:', err);
    res.status(500).json({ error: "Error fetching static service data" });
  }
};

// Obtener datos DINÁMICOS de servicios (cache corto - 30 segundos + polling)
export const getServicesDynamic = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * pageSize;

    const customerName = (req.query.customerName || "").trim();
    const status = req.query.status || "";

    let where = {};

    if (status && status !== 'ALL') {
      where.state = status;
    }

    if (customerName) {
      where.client = {
        contains: customerName,
        mode: 'insensitive'
      };
    }

    const totalCount = await prisma.service.count({ where });
    const services = await prisma.service.findMany({
      where,
      skip,
      take: pageSize,
      select: {
        id: true,
        state: true,
        total: true,
        payments: true,
        // Solo datos dinámicos que cambian frecuentemente
      },
      orderBy: { date: "desc" },
    });

    res.status(200).json({ services, totalCount });

  } catch (err) {
    console.error('Error fetching dynamic services:', err);
    res.status(500).json({ error: "Error fetching dynamic service data" });
  }
};

// Obtener datos estáticos de un servicio específico
export const getServiceStaticById = async (req, res) => {
  const { id } = req.params;

  try {
    const service = await prisma.service.findUnique({
      where: { id },
      select: {
        id: true,
        device: true,
        client: true,
        repair: true,
        date: true,
        dateOut: true,
        discount: true,
        diagnostico: true,
        estado_dispositivo_al_ingresar: true,
        observaciones: true,
        piezas: true,
        garantia_hasta: true,
        buyerId: true,
        customerDeviceId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.status(200).json(service);
  } catch (error) {
    console.error('Error fetching static service:', error);
    res.status(500).json({ error: "Error fetching static service data" });
  }
};

// Obtener datos dinámicos de un servicio específico
export const getServiceDynamicById = async (req, res) => {
  const { id } = req.params;

  try {
    const service = await prisma.service.findUnique({
      where: { id },
      select: {
        id: true,
        state: true,
        total: true,
        payments: true,
      },
    });

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.status(200).json(service);
  } catch (error) {
    console.error('Error fetching dynamic service:', error);
    res.status(500).json({ error: "Error fetching dynamic service data" });
  }
};

// ====== ENDPOINTS DE ACTUALIZACIÓN ESPECÍFICA ======

// Actualizar solo el estado de un servicio
export const updateServiceStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = [
    'INGRESADO',
    'EN_DIAGNOSTICO', 
    'PRESUPUESTADO',
    'APROBADO',
    'EN_REPARACION',
    'REPARADO',
    'ENTREGADO',
    'RECHAZADO',
    'CANCELADO'
  ];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: "Valid status is required", 
      validStatuses 
    });
  }

  try {
    const updatedService = await prisma.service.update({
      where: { id },
      data: { 
        state: status,
        updatedAt: new Date(),
        // Si se marca como entregado, actualizar fecha de salida
        ...(status === 'ENTREGADO' && { dateOut: new Date() })
      },
      select: {
        id: true,
        state: true,
        dateOut: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      service: updatedService,
      message: "Service status updated successfully"
    });
  } catch (error) {
    console.error('Error updating service status:', error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Service not found" });
    }
    res.status(500).json({ error: "Error updating service status" });
  }
};

// Actualizar solo los pagos de un servicio
export const updateServicePayments = async (req, res) => {
  const { id } = req.params;
  const { payments, total } = req.body;

  if (!payments) {
    return res.status(400).json({ error: "Payments data is required" });
  }

  try {
    const updateData = {
      payments,
      updatedAt: new Date()
    };

    if (total !== undefined) {
      updateData.total = parseFloat(total);
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        payments: true,
        total: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      service: updatedService,
      message: "Service payments updated successfully"
    });
  } catch (error) {
    console.error('Error updating service payments:', error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Service not found" });
    }
    res.status(500).json({ error: "Error updating service payments" });
  }
};

// Actualizar diagnóstico y observaciones (datos semi-dinámicos)
export const updateServiceDiagnostic = async (req, res) => {
  const { id } = req.params;
  const { 
    diagnostico,
    estado_dispositivo_al_ingresar,
    observaciones,
    piezas,
    garantia_hasta 
  } = req.body;

  try {
    const updateData = { updatedAt: new Date() };
    
    if (diagnostico !== undefined) updateData.diagnostico = diagnostico;
    if (estado_dispositivo_al_ingresar !== undefined) updateData.estado_dispositivo_al_ingresar = estado_dispositivo_al_ingresar;
    if (observaciones !== undefined) updateData.observaciones = observaciones;
    if (piezas !== undefined) updateData.piezas = piezas;
    if (garantia_hasta !== undefined) updateData.garantia_hasta = new Date(garantia_hasta);

    const updatedService = await prisma.service.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        diagnostico: true,
        estado_dispositivo_al_ingresar: true,
        observaciones: true,
        piezas: true,
        garantia_hasta: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      service: updatedService,
      message: "Service diagnostic updated successfully"
    });
  } catch (error) {
    console.error('Error updating service diagnostic:', error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Service not found" });
    }
    res.status(500).json({ error: "Error updating service diagnostic" });
  }
};

// ====== BÚSQUEDA ESPECÍFICA ======

// Buscar servicios por dispositivo (para autocompletado)
export const searchServicesByDevice = async (req, res) => {
  const { keyword } = req.query;
  
  if (!keyword) {
    return res.status(400).json({ error: "Search keyword is required" });
  }

  try {
    const services = await prisma.service.findMany({
      where: {
        device: { 
          contains: keyword, 
          mode: "insensitive" 
        }
      },
      select: {
        id: true,
        device: true,
        client: true,
        state: true,
        date: true
      },
      take: 10,
      orderBy: { date: 'desc' }
    });

    res.status(200).json({ services });
  } catch (error) {
    console.error('Error searching services:', error);
    res.status(500).json({ error: "Error searching services" });
  }
};

// ====== ESTADÍSTICAS DINÁMICAS ======

// Obtener estadísticas de servicios (datos dinámicos)
export const getServiceStats = async (req, res) => {
  try {
    const [
      totalServices,
      pendingServices,
      inProgressServices,
      completedServices,
      totalRevenue
    ] = await Promise.all([
      prisma.service.count(),
      prisma.service.count({ where: { state: 'INGRESADO' } }),
      prisma.service.count({ 
        where: { 
          state: { 
            in: ['EN_DIAGNOSTICO', 'PRESUPUESTADO', 'APROBADO', 'EN_REPARACION'] 
          } 
        } 
      }),
      prisma.service.count({ where: { state: 'ENTREGADO' } }),
      prisma.service.aggregate({
        where: { state: 'ENTREGADO' },
        _sum: { total: true }
      })
    ]);

    res.status(200).json({
      totalServices,
      pendingServices,
      inProgressServices,
      completedServices,
      totalRevenue: totalRevenue._sum.total || 0,
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching service stats:', error);
    res.status(500).json({ error: "Error fetching service statistics" });
  }
};
