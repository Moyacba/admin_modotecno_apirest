import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

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

const uploadParams = {
  folder: "news",
  transformation: [{ width: 1024, height: 1024, crop: "fill" }],
};

export const uploadImage = async (req, res) => {
  const { buffer } = req.file;
  try {
    new Promise((resolve) => {
      cloudinary.uploader
        .upload_stream(uploadParams, (error, uploadResult) => {
          if (error) throw error;
          return resolve(uploadResult);
        })
        .end(buffer);
    }).then((uploadResult) => {
      console.log(
        `Buffer upload_stream wth promise success - ${uploadResult.public_id}`
      );
      res.status(201).json(uploadResult.secure_url);
    });
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
