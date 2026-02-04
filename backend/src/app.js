if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ quiet: true });
}

const express = require("express");
const cors = require("cors");

const adminRoutes = require("../routes/admin.routes");
const authRoutes = require("../routes/auth.routes");
const usersRoutes = require("../routes/users.routes");
const categoriesRoutes = require("../routes/categories.routes");
const postsRoutes = require("../routes/posts.routes");
const favoritesRoutes = require("../routes/favorites.routes");
const ordersRoutes = require("../routes/orders.routes");
const uploadsRoutes = require("../routes/uploads.routes");

const app = express();

/**
 * ✅ CORS (Vercel + Local + (opcional) FRONTEND_URL)
 * - Permite:
 *   - localhost
 *   - tu dominio vercel fijo
 *   - dominios preview de vercel (*.vercel.app)
 *   - FRONTEND_URL si lo configuras en Railway (Netlify, dominio propio, etc.)
 */
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",

  // ✅ tu dominio productivo en Vercel (el de tu captura)
  "https://kot-3-d.vercel.app",

  // ✅ opcional: si lo usas en Railway (Netlify / dominio propio)
  process.env.FRONTEND_URL,
].filter(Boolean);

// helper para permitir previews de vercel automáticamente
const isVercelPreview = (origin = "") => {
  try {
    const { hostname } = new URL(origin);
    return hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
};

// Log útil para debug (déjalo por ahora)
app.use((req, _res, next) => {
  console.log("ORIGIN:", req.headers.origin, "|", req.method, req.url);
  next();
});

const corsOptions = {
  origin: (origin, cb) => {
    // Permite llamadas sin origin (Postman/Thunder/curl)
    if (!origin) return cb(null, true);

    // Permite lista fija
    if (allowedOrigins.includes(origin)) return cb(null, true);

    // Permite cualquier preview de Vercel
    if (isVercelPreview(origin)) return cb(null, true);

    return cb(new Error("CORS blocked: " + origin), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// ✅ CORS principal
app.use(cors(corsOptions));

/**
 * ✅ Preflight manual (Express 5)
 * Responde 204 y aplica headers CORS para OPTIONS
 */
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return cors(corsOptions)(req, res, () => res.sendStatus(204));
  }
  next();
});

app.use(express.json());

app.get("/", (_req, res) => res.json({ ok: true, name: "KOT3D API" }));

// Rutas
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/categories", categoriesRoutes);
app.use("/posts", postsRoutes);
app.use("/favorites", favoritesRoutes);
app.use("/orders", ordersRoutes);

// uploads
app.use("/uploads", require("express").static("uploads"));
app.use("/uploads", uploadsRoutes); // POST /uploads

// Respuesta si CORS bloquea
app.use((err, req, res, next) => {
  if (err && String(err.message).toLowerCase().includes("cors blocked")) {
    return res.status(403).json({ message: err.message });
  }
  next(err);
});

module.exports = app;
