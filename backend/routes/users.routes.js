const router = require("express").Router();
const db = require("../src/db");
const { requireAuth } = require("../middlewares/auth");

router.get("/me", requireAuth, async (req, res) => {
  const { id } = req.user;
  const r = await db.query("SELECT id,name,email,avatar_url FROM users WHERE id=$1", [id]);
  res.json(r.rows[0]);
});

router.get("/me/posts", requireAuth, async (req, res) => {
  const { id } = req.user;
  const r = await db.query(
    `SELECT p.id, p.title, p.price, p.created_at
     FROM posts p
     WHERE p.user_id=$1
     ORDER BY p.created_at DESC`,
    [id]
  );
  res.json(r.rows);
});

module.exports = router;
