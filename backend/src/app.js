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

// ✅ Importante cuando estás detrás de Railway proxy
app.set("trust proxy", 1);

// Log útil para debug (déjalo mientras corriges)
app.use((req, _res, next) => {
  console.log("ORIGIN:", req.headers.origin, "|", req.method, req.url);
  next();
});

const fixedAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "https://kot-3-d.vercel.app",
].filter(Boolean);

function isVercelPreview(origin = "") {
  try {
    const { hostname } = new URL(origin);
    return hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

function isAllowedOrigin(origin) {
  if (!origin) return true; // Postman/curl
  if (fixedAllowedOrigins.includes(origin)) return true;
  if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return true;
  if (isVercelPreview(origin)) return true;
  return false;
}

/**
 * ✅ En vez de lanzar error, decidimos origin permitido y lo devolvemos.
 * Así el preflight SIEMPRE recibe headers cuando corresponde.
 */
const corsOptionsDelegate = (req, cb) => {
  const origin = req.header("Origin");
  const allowed = isAllowedOrigin(origin);

  cb(null, {
    origin: allowed ? origin : false, // si no permitido, no setea allow-origin
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  });
};

app.use(cors(corsOptionsDelegate));

// ✅ responder preflight siempre
app.options("*", cors(corsOptionsDelegate));

app.use(express.json());

app.get("/", (_req, res) => res.json({ ok: true, name: "KOT3D API" }));

app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/categories", categoriesRoutes);
app.use("/posts", postsRoutes);
app.use("/favorites", favoritesRoutes);
app.use("/orders", ordersRoutes);

app.use("/uploads", express.static("uploads"));
app.use("/uploads", uploadsRoutes);

module.exports = app;
