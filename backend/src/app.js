if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ quiet: true });
}

const express = require("express");
const cors = require("cors");

const authRoutes = require("../routes/auth.routes");
const usersRoutes = require("../routes/users.routes");
const categoriesRoutes = require("../routes/categories.routes");
const postsRoutes = require("../routes/posts.routes");
const favoritesRoutes = require("../routes/favorites.routes");

const app = express();

// (Opcional) log para debug
app.use((req, res, next) => {
  console.log("ORIGIN:", req.headers.origin, "|", req.method, req.url);
  next();
});

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:3001",
  process.env.FRONTEND_URL, // https://kot3d.netlify.app
].filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    // requests sin Origin (Postman/curl)
    if (!origin) return cb(null, true);

    // allowlist
    if (allowedOrigins.includes(origin)) return cb(null, true);

    // bloquear
    return cb(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

// ✅ CORS SIEMPRE antes de rutas
app.use(cors(corsOptions));
// ✅ Preflight global (responde 204 con headers correctos)
app.options("*", cors(corsOptions));

app.use(express.json());

app.get("/", (req, res) => res.json({ ok: true, name: "KOT3D API" }));

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/categories", categoriesRoutes);
app.use("/posts", postsRoutes);
app.use("/favorites", favoritesRoutes);

// ❗ Quita el middleware que devuelve 403 "CORS blocked"
// porque rompe el preflight del navegador.

module.exports = app;
