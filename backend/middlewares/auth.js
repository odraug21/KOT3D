const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  // ✅ Permitir preflight CORS sin token
  if (req.method === "OPTIONS") return next();

  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: "Token requerido" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, email, name }
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
}

module.exports = { requireAuth };
