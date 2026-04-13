import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  // 1. Obtener token de Cookies o Header (Bearer)
  let token = req.cookies.jwtToken;
  
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // console.log('Auth Token detected:', token ? 'YES' : 'NO');

  if (!token || token === "undefined") {
    return res.status(401).json({ message: "Acceso denegado - No hay token" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    console.error('Auth Error:', error.message);
    res.status(401).json({ message: "Token no válido o expirado" });
  }
};


// Alias para compatibilidad con rutas híbridas
export const requireAuth = verifyToken;
