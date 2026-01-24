const router = require("express").Router();
const db = require("../src/db");

router.get("/", async (_req, res) => {
  const r = await db.query("SELECT id,name FROM categories ORDER BY id");
  res.json(r.rows);
});

module.exports = router;
