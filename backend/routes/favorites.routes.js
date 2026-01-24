const router = require("express").Router();
const db = require("../src/db");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, async (req, res) => {
  const userId = req.user.id;

  const r = await db.query(
    `SELECT f.post_id, p.title, p.price,
            (SELECT image_url FROM post_images WHERE post_id=p.id LIMIT 1) AS cover_url
     FROM favorites f
     JOIN posts p ON p.id=f.post_id
     WHERE f.user_id=$1
     ORDER BY f.id DESC`,
    [userId]
  );

  res.json(r.rows);
});

router.post("/", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { post_id } = req.body;
  if (!post_id) return res.status(400).json({ message: "post_id requerido" });

  try {
    await db.query("INSERT INTO favorites(user_id, post_id) VALUES($1,$2)", [userId, post_id]);
    res.json({ ok: true });
  } catch (e) {
    if (e.code === "23505") return res.status(409).json({ message: "Ya está en favoritos" });
    res.status(500).json({ message: "Error servidor" });
  }
});

router.delete("/:post_id", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const postId = Number(req.params.post_id);

  const r = await db.query("DELETE FROM favorites WHERE user_id=$1 AND post_id=$2", [userId, postId]);
  res.json({ ok: true });
});

module.exports = router;
