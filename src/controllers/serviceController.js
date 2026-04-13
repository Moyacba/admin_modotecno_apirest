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
  const {
    device,
    client,
    state,
    repair,
    total,
    date,
    payments,
    discount,
    defectId,
    defectName,
    additionalDetails,
    privateNotes,
    isWarranty,
    // Nuevos campos relacionales (opcionales — Fase 1/2)
    serviceCategoryId,
    brandRepairId,
    modelRepairId,
    repairTypeId,
    repairOptionId,
  } = req.body;

  try {
    let finalDefectId = defectId;
    let resolvedCategoryId = null;

    // 1. Normalización y Auto-inyección de Marcas/Modelos (Matriz de Reparación)
    if (device?.branch && device?.model) {
      const brandName = device.branch.trim().toUpperCase();
      const modelName = device.model.trim().toUpperCase();

      // Asegurar Marca
      const brand = await prisma.brandRepair.upsert({
        where: { name: brandName },
        update: {},
        create: { name: brandName },
      });

      // Asegurar Modelo
      await prisma.modelRepair.upsert({
        where: {
          name_brandId: {
            name: modelName,
            brandId: brand.id,
          },
        },
        update: {},
        create: {
          name: modelName,
          brandId: brand.id,
        },
      });

      // 2. Resolver Categoría para la Matriz de Fallas
      if (device.category) {
        const category = await prisma.category.findFirst({
          where: { name: { equals: device.category.trim(), mode: "insensitive" } },
        });
        if (category) {
          resolvedCategoryId = category.id;

          // 3. Auto-inyección de Falla (si viene nombre y no ID)
          if (!finalDefectId && defectName) {
            const defName = defectName.trim().toUpperCase();
            const defect = await prisma.serviceDefect.upsert({
              where: {
                name_categoryId: {
                  name: defName,
                  categoryId: resolvedCategoryId,
                },
              },
              update: {},
              create: {
                name: defName,
                categoryId: resolvedCategoryId,
              },
            });
            finalDefectId = defect.id;
          }
        }
      }
    }
    let finalBuyerId = null;

    // 3.5. Alta o Actualización Automática del Cliente en la Base de Datos Global (Buyer)
    if (client?.name && client?.phone1) {
      const clientPhone = client.phone1.trim();
      const [firstName, ...lastNameParts] = client.name.trim().split(' ');
      const lastName = lastNameParts.join(' ').trim();

      // Intentar encontrar por Nombre Y (Teléfono o Whatsapp)
      const existingBuyer = await prisma.buyer.findFirst({
        where: {
          AND: [
            { nombre: { equals: firstName, mode: 'insensitive' } },
            { apellido: { equals: lastName, mode: 'insensitive' } },
            {
              OR: [
                { telefono: clientPhone },
                { whatsapp: clientPhone }
              ]
            }
          ]
        }
      });

      if (existingBuyer) {
        // Actualizar datos de contacto si ya existe
        const updated = await prisma.buyer.update({
          where: { id: existingBuyer.id },
          data: {
            nombre: firstName,
            apellido: lastName || existingBuyer.apellido,
            direccion: client.details || existingBuyer.direccion,
            telefono: clientPhone,
            whatsapp: client.phone2?.trim() || clientPhone
          }
        });
        finalBuyerId = updated.id;
      } else {
        // Crear nuevo cliente
        const newBuyer = await prisma.buyer.create({
          data: {
            nombre: firstName,
            apellido: lastName || '',
            email: `cliente_${Date.now()}@modotecno.com`,
            telefono: clientPhone,
            whatsapp: client.phone2?.trim() || clientPhone,
            direccion: client.details || '',
            segment: 'NUEVO'
          }
        });
        finalBuyerId = newBuyer.id;
      }
    }

    // 3.9 VALIDACIÓN DE JERARQUÍA RELACIONAL (solo cuando se proveen los campos nuevos)
    // Si faltan los IDs, el servicio se crea con los campos legacy — sin cambios en el flujo.
    if (brandRepairId && serviceCategoryId) {
      const link = await prisma.brandRepairCategory.findUnique({
        where: { brandId_categoryId: { brandId: brandRepairId, categoryId: serviceCategoryId } },
      });
      if (!link) return res.status(400).json({ error: 'La marca no pertenece a la categoría indicada' });
    }
    if (modelRepairId && brandRepairId) {
      const model = await prisma.modelRepair.findUnique({ where: { id: modelRepairId } });
      if (model && model.brandId !== brandRepairId)
        return res.status(400).json({ error: 'El modelo no pertenece a la marca indicada' });
    }
    if (repairTypeId && serviceCategoryId) {
      const rt = await prisma.repairType.findUnique({ where: { id: repairTypeId } });
      if (rt && rt.categoryId !== serviceCategoryId)
        return res.status(400).json({ error: 'El tipo de reparación no pertenece a la categoría indicada' });
    }
    if (repairOptionId && (modelRepairId || repairTypeId)) {
      const opt = await prisma.repairOption.findUnique({ where: { id: repairOptionId } });
      if (opt) {
        if (modelRepairId && opt.modelId !== modelRepairId)
          return res.status(400).json({ error: 'La opción de reparación no corresponde al modelo' });
        if (repairTypeId && opt.repairTypeId !== repairTypeId)
          return res.status(400).json({ error: 'La opción de reparación no corresponde al tipo de reparación' });
      }
    }

    const newService = await prisma.service.create({
      data: {
        device,
        client,
        buyerId: finalBuyerId,
        state,
        repair,
        total,
        date,
        payments,
        discount,
        defectId: finalDefectId,
        additionalDetails,
        privateNotes,
        isWarranty: isWarranty || false,
        // Campos relacionales opcionales:
        serviceCategoryId: serviceCategoryId || null,
        brandRepairId: brandRepairId || null,
        modelRepairId: modelRepairId || null,
        repairTypeId: repairTypeId || null,
        repairOptionId: repairOptionId || null,
      },
    });

    // 4. Registro de Seña en Caja (si existe pago al ingresar)
    if (payments && Array.isArray(payments) && payments.length > 0) {
      const activeSession = await prisma.cashRegisterSession.findFirst({
        where: { status: "OPEN" },
      });

      if (activeSession) {
        for (const p of payments) {
          if (p.amount > 0) {
            // Mapeo de método de pago a enum de caja
            let internalMethod = "CASH";
            const m = p.method?.toUpperCase();
            if (m === "EFECTIVO" || m === "CASH") internalMethod = "CASH";
            else if (m?.includes("TRANSFERENCIA")) internalMethod = "TRANSFERENCIA";
            else if (m?.includes("TARJETA")) internalMethod = "CREDITO";
            else if (m?.includes("QR")) internalMethod = "QR";

            await prisma.cashMovement.create({
              data: {
                cashRegisterSessionId: activeSession.id,
                amount: p.amount,
                type: "INGRESO_MANUAL", // O el tipo que uses para ingresos extra
                category: "SERVICIO",
                paymentMethod: internalMethod,
                description: `SEÑA SERVICIO: ${device.branch} ${device.model} - Cliente: ${client.name}`,
                date: new Date(),
              },
            });
          }
        }
      }
    }

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
    console.log(`[CheckoutPrep] Solicitud para ID: ${id}`);
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

    // Preparar descripción descriptiva
    const brand = service.device?.branch || service.device?.brand || '';
    const model = service.device?.model || '';
    const issue = service.repair || service.device?.details || '';
    const description = `Reparación: ${[brand, model].filter(Boolean).join(' ')}${issue ? ` - ${issue}` : ''}`;

    console.log(`[CheckoutPrep] Éxito para ID: ${id}. Pending: ${pendingAmount}`);

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
    console.error(`[CheckoutPrep] Error crítico para ID: ${id}:`, err);
    res.status(500).json({ 
      error: 'Error interno al preparar el checkout del servicio', 
      details: err.message || String(err)
    });
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
