require("dotenv").config();

    console.log("ENV:", process.env.PORT, process.env.DB_NAME, process.env.DB_USER);

const app = require("./app");

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`KOT3D API running on :${PORT}`));
