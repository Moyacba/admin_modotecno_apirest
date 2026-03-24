import { PrismaClient } from "db";

const prisma = new PrismaClient();

// Obtener todos los servicios
export const getServices = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const clientName = req.query.clientName?.trim();
    const stateFilter = req.query.state?.trim();

    // Construir filtro de MongoDB
    const mongoWhere = {};
    if (clientName) {
      // client es un campo JSON: buscar por client.name con regex (case-insensitive)
      mongoWhere["client.name"] = { $regex: clientName, $options: "i" };
    }
    if (stateFilter) {
      mongoWhere["state"] = stateFilter;
    }

    // Usar queryRaw para MongoDB cuando hay filtro de nombre (campo JSON anidado)
    // Para Prisma con MongoDB, los campos Json no admiten filtros anidados en where,
    // por lo que usamos la API de aggregation nativa de Prisma
    const hasComplexFilter = Boolean(clientName);

    let services, totalCount;

    if (hasComplexFilter) {
      // Usar findRaw para poder filtrar por campos dentro del JSON
      const pipeline = [
        { $match: mongoWhere },
        { $sort: { date: -1 } },
        {
          $facet: {
            data: [{ $skip: skip }, { $limit: limit }],
            count: [{ $count: "total" }],
          }
        },
      ];

      const [result] = await prisma.service.aggregateRaw({ pipeline });
      services = result.data ?? [];
      totalCount = result.count?.[0]?.total ?? 0;

      // Normalizar _id de MongoDB a string id
      services = services.map(({ _id, ...rest }) => ({
        id: _id?.$oid ?? String(_id),
        ...rest,
      }));
    } else {
      // Sin filtro de nombre: usar Prisma nativo (más eficiente)
      const prismaWhere = {};
      if (stateFilter) prismaWhere.state = stateFilter;

      const [count, data] = await prisma.$transaction([
        prisma.service.count({ where: prismaWhere }),
        prisma.service.findMany({
          where: prismaWhere,
          skip,
          take: limit,
          orderBy: { date: "desc" },
        }),
      ]);

      totalCount = count;
      services = data;
    }

    res.status(200).json({
      services,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error fetching services", err });
  }
};


// Obtener un servicio por ID
export const getServiceById = async (req, res) => {
  const { id } = req.params;
  try {
    const service = await prisma.service.findUnique({
      where: { id },
    });
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.status(201).json(service);
  } catch (error) {
    res.status(501).json({ error: "Error fetchings service" });
  }
};

export const getServiceByQuery = async (req, res) => {
  const { keyword } = req.query;
  if (!keyword) {
    return res.status(400).json({ message: "Falta el parámetro de búsqueda" });
  }

  try {
    const resultados = await prisma.service.findMany({
      where: {
        device: { contains: keyword, mode: "insensitive" },
      },
    });

    res.json(resultados);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error en la búsqueda" });
  }
};

// Crear un nuevo servicio
export const createService = async (req, res) => {
  const { device, client, state, repair, total, date, payments, discount } =
    req.body;
  try {
    const newService = await prisma.service.create({
      data: {
        device,
        client,
        state,
        repair,
        total,
        date,
        payments,
        discount,
      },
    });
    res.status(201).json(newService);
  } catch (err) {
    console.log(err);
    res.status(501).json({ error: "Error creating service ", err });
  }
};

// Actualizar un servicio
export const deliveryService = async (req, res) => {
  const { id } = req.params;
  const { state, payments, dateOut } = req.body;
  console.log(state, payments, dateOut);
  try {
    const deliveryService = await prisma.service.update({
      where: { id },
      data: {
        state,
        dateOut,
        payments,
      },
    });
    res.status(201).json(deliveryService);
  } catch (error) {
    res.status(501).json({ error: "Error updating service" });
  }
};

// Actualizar un servicio
export const updateService = async (req, res) => {
  const { id } = req.params;
  const {
    device,
    client,
    state,
    repair,
    total,
    dateIn,
    payments,
    discount,
  } = req.body;

  try {
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        device,
        client,
        state,
        repair,
        total,
        dateIn,
        payments,
        discount,
      },
    });
    res.status(201).json(updatedService);
  } catch (error) {
    if (error.code === "P2025") {
      // Service not found
      return res.status(404).json({ error: "Service not found" });
    }
    res.status(501).json({ error: "Error updating service" });
  }
};

// Eliminar un servicio
export const deleteService = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.service.delete({
      where: { id },
    });
    res.status(204).send(); // No content
  } catch (error) {
    if (error.code === "P2025") {
      // Service not found
      return res.status(404).json({ error: "Service not found" });
    }
    res.status(501).json({ error: "Error deleting service" });
  }
};

// Preparar datos para cobro en POS
export const getServiceCheckoutPrep = async (req, res) => {
  const { id } = req.params;

  const DELIVERABLE_STATES = ['REPARADO', 'SIN_ARREGLO', 'RECHAZADO'];

  try {
    const service = await prisma.service.findUnique({ where: { id } });

    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    if (!DELIVERABLE_STATES.includes(service.state)) {
      return res.status(400).json({
        error: `El servicio no puede ser entregado en estado "${service.state}". Estados válidos: ${DELIVERABLE_STATES.join(', ')}`
      });
    }

    const total = service.total || 0;
    const paid = (service.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
    const pendingAmount = Math.max(0, total - paid);

    // Nombre del cliente del JSON
    const clientName = service.client?.name || 'Cliente';
    const clientPhone = service.client?.phone1 || '';

    // Descripción: Marca + Modelo + primer detalle de falla
    const brand = service.device?.branch || service.device?.brand || '';
    const model = service.device?.model || '';
    const issue = service.repair || service.device?.details || '';
    const description = `Reparación: ${[brand, model].filter(Boolean).join(' ')}${issue ? ` - ${issue}` : ''}`;

    return res.status(200).json({
      data: {
        serviceId: id,
        clientName,
        clientPhone,
        description,
        total,
        paid,
        pendingAmount,
        canDeliverFree: pendingAmount === 0,
        state: service.state,
      },
      message: 'Checkout preparado correctamente',
      status: 200,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al preparar el checkout del servicio', err });
  }
};

// Registrar ingreso por garantía
export const enterWarranty = async (req, res) => {
  const { id } = req.params;
  const { reason, date } = req.body;

  try {
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        state: "EN_GARANTIA",
        warrantyReturnReason: reason,
        warrantyReturnDate: date,
      },
    });
    res.status(200).json(updatedService);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error registering warranty entry", err });
  }
};
