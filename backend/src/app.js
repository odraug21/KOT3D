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
const allowedExactOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:5173",
  "https://kot-3-d.vercel.app",
  process.env.FRONTEND_URL, // si la tienes seteada en Railway
].filter(Boolean);

// acepta previews tipo https://algo.vercel.app
const vercelPreviewRegex = /^https:\/\/.*\.vercel\.app$/i;

const corsOptions = {
  origin: (origin, cb) => {
    // requests sin Origin (Postman/curl/mobile) => permitir
    if (!origin) return cb(null, true);

    if (allowedExactOrigins.includes(origin)) return cb(null, true);
    if (vercelPreviewRegex.test(origin)) return cb(null, true);

    console.log("CORS BLOCKED ORIGIN:", origin);
    return cb(new Error("CORS blocked"), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

// ✅ CORS primero
app.use(cors(corsOptions));

// ✅ Preflight (Express 5 friendly)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return cors(corsOptions)(req, res, () => res.sendStatus(204));
  }
  next();
});

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
