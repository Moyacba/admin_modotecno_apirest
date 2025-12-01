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

// Verificar variables de entorno críticas
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Variables de entorno faltantes:', missingEnvVars.join(', '));
  process.exit(1);
}

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

// Configurar logging según el entorno
const isProduction = process.env.NODE_ENV === 'production';
app.use(morgan(isProduction ? 'dev' : 'dev'));

// Rutas
app.use("/api", router);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: "1.0.0"
  });
});

app.get("/example", (req, res) => {
  res.json({ message: "Example" });
});

// app.use("/users", userRoutes);

// Middleware para manejar errores
app.use(handleErrors);

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📅 Iniciado: ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recibido. Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recibido. Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

export default app;
