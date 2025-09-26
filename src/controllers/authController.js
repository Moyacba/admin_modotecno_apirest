import { PrismaClient } from "db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const register = async (req, res) => {
  console.log('entra')
  try {
    const { email, password } = req.body; 
    console.log(email, password);
    if (!email) {
      return res.status(500).json({ error: "Error fetching user" });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(500).json({ error: "Usuario ya existe" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email: email, password: hashedPassword },
    });
    res.status(200).json(user);
  } catch (erro) {
    res.status(500).json({ error: "Error al registrar usuario" + erro });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      throw new Error("No hay email");
    }
    const user = await prisma.user.findUnique({ where: { email: email } });
    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "20h",
      }
    );

    res.cookie("jwtToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 3600000 * 20,
    });
    delete user.password;
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Error al iniciar session: " + error });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwtToken", "", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 36,
    });
    res.status(200).json({ message: "Sesión cerrada" });
  } catch (error) {
    res.status(500).json({ error: "Error al cerrar sesión" });
  }
};
