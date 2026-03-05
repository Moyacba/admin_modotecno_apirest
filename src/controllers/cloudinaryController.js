import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { PrismaClient } from "db";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Usa https
});

export const upload = multer({
  storage: multer.memoryStorage(), // Almacena en memoria para evitar el sistema de archivos
  limits: { fileSize: 15728640 }, // 15MB
});

export const uploadBuffer = (buffer, folder = "news") => {
  return new Promise((resolve, reject) => {
    const uploadParams = {
      folder: folder,
      transformation: [{ width: 1024, height: 1024, crop: "fill" }],
    };

    cloudinary.uploader
      .upload_stream(uploadParams, (error, uploadResult) => {
        if (error) return reject(error);
        return resolve(uploadResult);
      })
      .end(buffer);
  });
};

export const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided" });
  }
  const { buffer } = req.file;
  try {
    const uploadResult = await uploadBuffer(buffer);
    console.log(
      `Buffer upload_stream wth promise success - ${uploadResult.public_id}`
    );
    res.status(201).json(uploadResult.secure_url);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error uploading image" });
  }
};

export const uploadImageUrl = async (req, res) => {
  const url = req.body.url;

  console.log("Intentando subir imagen desde URL:", url);

  // Validación básica de URL
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: "URL inválida o faltante" });
  }

  try {
    // Cloudinary requiere que la URL sea públicamente accesible
    const uploadResult = await cloudinary.uploader.upload(url, {
      ...uploadParams,
      resource_type: 'auto', // Detecta automáticamente el tipo de recurso
    });

    console.log(`URL upload success - ${uploadResult.public_id}`);
    res.status(201).json(uploadResult.secure_url);
  } catch (error) {
    console.error("Error completo al subir imagen desde URL:");
    console.error({
      message: error.message,
      http_code: error.http_code,
      name: error.name,
    });

    // Mensajes de error más específicos
    if (error.http_code === 404) {
      return res.status(400).json({
        error: "La URL de la imagen no es accesible. Verifica que sea una URL pública y válida."
      });
    }

    if (error.message && error.message.includes('Invalid image file')) {
      return res.status(400).json({
        error: "La URL no apunta a una imagen válida."
      });
    }

    res.status(500).json({
      error: "Error al subir imagen desde URL",
      details: error.message
    });
  }
};

export const getStockImages = async (req, res) => {
  try {
    // 1. Obtener todas las imágenes de Products
    const products = await prisma.product.findMany({
      select: { images: true }
    });

    // 2. Obtener todas las imágenes de Variants
    const variants = await prisma.productVariant.findMany({
      select: { images: true }
    });

    // 3. Extraer, aplanar y limpiar nulos
    const allImages = [
      ...products.flatMap(p => p.images || []),
      ...variants.flatMap(v => v.images || [])
    ].filter(url => url && typeof url === 'string' && url.trim() !== '');

    // 4. Obtener las imágenes favoritas de la DB
    const favoriteRecords = await prisma.favoriteImage.findMany({
      orderBy: { createdAt: 'desc' },
      select: { url: true }
    });
    const favoriteUrls = favoriteRecords.map(f => f.url);
    const favoritesSet = new Set(favoriteUrls);

    // 5. Eliminar duplicados usando Set y conservar el orden (los Sets preservan inserción)
    // Para que las nuevas aparezcan primero, las invertimos
    const uniqueImagesArray = [...new Set(allImages)].reverse();

    // 6. Separar favoritas y el resto, para que el frontend las pinte primero si lo desea,
    // o enviarlas en dos arrays.
    res.status(200).json({
      stock: uniqueImagesArray,
      favorites: favoriteUrls
    });
  } catch (error) {
    console.error("Error obteniendo imágenes de stock:", error);
    res.status(500).json({ error: "Error interno al obtener la galería de imágenes" });
  }
};

export const toggleFavoriteImage = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: "URL inválida o faltante" });
    }

    // Buscar si ya es favorita
    const existing = await prisma.favoriteImage.findUnique({
      where: { url }
    });

    if (existing) {
      // Si existe, la eliminamos
      await prisma.favoriteImage.delete({ where: { url } });
      return res.status(200).json({ isFavorite: false, url });
    } else {
      // Si no existe, la creamos
      await prisma.favoriteImage.create({ data: { url } });
      return res.status(201).json({ isFavorite: true, url });
    }
  } catch (error) {
    console.error("Error toggling favorite image:", error);
    res.status(500).json({ error: "Error al actualizar la imagen favorita" });
  }
};
