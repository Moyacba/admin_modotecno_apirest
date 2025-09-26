import { PrismaClient } from "db";

const prisma = new PrismaClient();

// Obtener todos los servicios
export const getServices = async (req, res) => {
  try {
    const pageSize = 10;
    const page = parseInt(req.query.page) || 1;

    const services = await prisma.service.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        date: "desc",
      },
    });

    res.status(201).json(services);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error fetching services ", err });
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
