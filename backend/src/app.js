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

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:3001",
  process.env.FRONTEND_URL, // https://kot3d.netlify.app
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // Thunder/Postman
      return allowedOrigins.includes(origin) ? cb(null, true) : cb(null, false);
    },
    credentials: true,
  })
);

// Preflight
app.options("*", cors());

app.use(express.json());

app.get("/", (req, res) => res.json({ ok: true, name: "KOT3D API" }));

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/categories", categoriesRoutes);
app.use("/posts", postsRoutes);
app.use("/favorites", favoritesRoutes);

// Respuesta  si CORS bloquea
app.use((err, req, res, next) => {
  if (err && String(err.message).toLowerCase().includes("cors")) {
    return res.status(403).json({ message: "CORS blocked" });
  }
  next(err);
});

module.exports = app;
