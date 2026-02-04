const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  // ✅ Permitir preflight CORS sin token
  if (req.method === "OPTIONS") return next();

  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: "Token requerido" });
  if (!process.env.JWT_SECRET) return res.status(500).json({ message: "JWT_SECRET faltante" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, email, name, role }
    next();
  } catch (e) {
    return res.status(401).json({ message: "Token inválido" });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "No autenticado" });
  if (req.user.role !== "admin") return res.status(403).json({ message: "Solo admin" });
  next();
}

module.exports = { requireAuth, requireAdmin };
