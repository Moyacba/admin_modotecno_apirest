import { PrismaClient } from "db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son obligatorios" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Ya existe un usuario con ese correo" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name: name || null },
    });

    const { password: _pw, ...userWithoutPassword } = user;
    return res.status(201).json(userWithoutPassword);
  } catch (err) {
    console.error('[register]', err);
    return res.status(500).json({ error: "Error al registrar usuario" });
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
      return res.status(401).json({ error: "Credenciales inválidas 1" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Credenciales inválidas 2" });
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

    const { password: _pw, ...userWithoutPassword } = user;
    // Devolvemos el token en el body también, para entornos donde las cookies
    // no se envíen correctamente (browsers con SameSite estricto, mobile, etc.)
    res.status(200).json({ ...userWithoutPassword, token });

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
