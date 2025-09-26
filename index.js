// import express, { json } from "express";
// import helmet from "helmet";
// import cors from "cors";
// import { connect } from "mongoose";
// import { PrismaClient } from "@prisma/client";
// import authRoutes from "./routes/auth";
// import protectedRoutes from "./routes/protected";
// import { verifyToken } from "./middlewares/auth";

// require("dotenv").config();

// const app = express();
// const prisma = new PrismaClient();

// // Conexión a MongoDB
// connect(process.env.DATABASE_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log("Conectado a MongoDB"))
//   .catch((err) => console.error("Error conectando a MongoDB:", err));

// // Middleware de seguridad
// app.use(helmet());
// app.use(cors());
// app.use(json());

// // Rutas
// app.use("/auth", authRoutes); // Rutas públicas
// app.use("/protected", verifyToken, protectedRoutes); // Rutas privadas

// // Iniciar servidor
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Servidor corriendo en el puerto ${PORT}`);
// });
