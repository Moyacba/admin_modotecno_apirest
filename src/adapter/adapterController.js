import { PrismaClient as PrismaClientOld } from "dbOld";

const prisma = new PrismaClientOld();

// // Obtener todos los servicios
export const getOldServices = async (req, res) => {
  try {
    const pageSize = 10;
    const page = parseInt(req.query.page) || 1;

    const services = await prisma.servicios.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        fechaIn: "desc",
      },
    });

    res.status(200).json(services);
  } catch (err) {
    res.status(500).json({ error: "Error fetching services ", err });
  }
};

export const getOldServiceByQuery = async (req, res) => {
  const { keyword } = req.query;
  if (!keyword) {
    return res.status(400).json({ message: "Falta el parámetro de búsqueda" });
  }

  try {
    const resultados = await prisma.servicios.aggregateRaw({
      pipeline: [
        {
          $match: {
            $or: [
              { marca: { $regex: keyword, $options: "i" } },
              { cliente: { $regex: keyword, $options: "i" } },
              { telefono1: { $regex: keyword, $options: "i" } },
              { telefono2: { $regex: keyword, $options: "i" } },
            ],
          },
        },
      ],
    });

    res.json(resultados);
  } catch (error) {
    res.status(500).json({ message: "Error en la búsqueda" });
  }
};

export const getOldProducts = async (req, res) => {
  try {
    const pageSize = 10;
    const page = parseInt(req.query.page) || 1;

    const products = await prisma.productos.findMany({
      // skip: (page - 1) * pageSize,
      // take: pageSize,
      // orderBy: {
      //   codigo: "desc",
      // },
    });

    res.status(200).json(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error fetching products ", err });
  }
};
