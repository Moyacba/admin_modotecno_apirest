import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

export const upload = multer({
  storage: multer.memoryStorage(), // Almacena en memoria para evitar el sistema de archivos
  limits: { fileSize: 15728640 }, // 15MB
});

const uploadParams = {
  folder: "news",
  transformation: [{ width: 500, height: 500, crop: "fill" }],
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
  console.log(url);
  try {
    const uploadResult = await cloudinary.uploader.upload(url, uploadParams);
    res.status(201).json(uploadResult.secure_url);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error uploading image" });
  }
};
