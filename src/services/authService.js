// src/services/authService.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class AuthService {
  async register(userData) {
    const { email, password } = userData;
    if (!email) {
      throw new Error("No hay email");
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error("El usuario ya existe");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    return user;
  }

  async login(userData) {
    const { email, password } = userData;
    if (!email) {
      throw new Error("No hay email");
    }
    const user = await prisma.user.findUnique({ where: { email: email } });
    if (!user) {
      throw new Error("Credenciales inválidas");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Credenciales inválidas");
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return token;
  }
}
