// cloudinaryConfig.js

import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config'; // Importa y carga las variables de entorno

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Usa https
});

export default cloudinary;