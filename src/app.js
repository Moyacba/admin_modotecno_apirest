// src/app.ts
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/index.js";
import { handleErrors } from "./utils/handleErrors.js";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();

const app = express();
// app.use(cors());
// Configuración de CORS dinámica
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '').split(',');

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir peticiones sin origen (ej. Postman) o si el origen está en la lista blanca
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
// Middlewares globales
app.use(cookieParser());
app.use(helmet());
app.use(express.json());

app.use(morgan("dev"));

// Rutas
app.use("/api", router);

app.get("/example", (req, res) => {
  res.json({ message: "Example" });
});

// app.use("/users", userRoutes);

// Middleware para manejar errores
app.use(handleErrors);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

export default app;
