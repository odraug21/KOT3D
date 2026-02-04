const path = require("path");

// ✅ Carga .env SIEMPRE desde /backend/.env aunque ejecutes desde /backend/src
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({
    path: path.resolve(__dirname, "../.env"),
  });
}

console.log("ENV:", process.env.PORT, process.env.DB_NAME, process.env.DB_USER);

const app = require("./app");

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`KOT3D API running on :${PORT}`));
