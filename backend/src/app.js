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

// Debug útil (déjalo mientras estabilizas prod)
app.use((req, res, next) => {
  console.log("ORIGIN:", req.headers.origin, "|", req.method, req.url);
  next();
});

// ✅ Lista fija + soporte dominios Vercel (preview)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:5173",
  process.env.FRONTEND_URL, // prod (Vercel)
].filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    // Permitir Postman/curl (sin origin)
    if (!origin) return cb(null, true);

    // Permitir cualquier localhost (evita sufrir por 3000/3002/etc.)
    if (origin.startsWith("http://localhost:")) return cb(null, true);

    // Permitir lista explícita (prod)
    if (allowedOrigins.includes(origin)) return cb(null, true);

    return cb(new Error(`CORS blocked: ${origin}`), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());


app.get("/", (req, res) => res.json({ ok: true, name: "KOT3D API" }));

app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/categories", categoriesRoutes);
app.use("/posts", postsRoutes);
app.use("/favorites", favoritesRoutes);
app.use("/orders", ordersRoutes);

// static + route
app.use("/uploads", require("express").static("uploads"));
app.use("/uploads", uploadsRoutes);

// Handler para respuesta cuando CORS bloquea
app.use((err, req, res, next) => {
  if (err && String(err.message).toLowerCase().includes("cors")) {
    return res.status(403).json({ message: "CORS blocked", origin: req.headers.origin || null });
  }
  next(err);
});

module.exports = app;
