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

app.use((req, res, next) => {
  console.log("ORIGIN:", req.headers.origin, "|", req.method, req.url);
  next();
});


const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:3001",
  process.env.FRONTEND_URL, // ejemplo: https://kot3d.netlify.app
].filter(Boolean);

// ✅ CORS options (reutilizable para app.use y preflight)
const corsOptions = {
  origin: (origin, cb) => {
    // Permite llamadas sin Origin (Thunder Client / Postman / curl)
    if (!origin) return cb(null, true);

    // Permite solo los orígenes aprobados
    if (allowedOrigins.includes(origin)) return cb(null, true);

    // ❗Lanzamos error para que lo capture el middleware de abajo
    return cb(new Error("CORS blocked"), false);
  },
  credentials: true,
};

// ✅ CORS principal
app.use(cors(corsOptions));

// ✅ Preflight (NO usar "*" como string; usar regex o "/*")
app.options(/.*/, cors(corsOptions));

app.use(express.json());

app.get("/", (req, res) => res.json({ ok: true, name: "KOT3D API" }));

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/categories", categoriesRoutes);
app.use("/posts", postsRoutes);
app.use("/favorites", favoritesRoutes);

// ✅ Respuesta si CORS bloquea (ahora sí se dispara)
app.use((err, req, res, next) => {
  if (err && String(err.message).toLowerCase().includes("cors")) {
    return res.status(403).json({ message: "CORS blocked" });
  }
  next(err);
});

module.exports = app;
