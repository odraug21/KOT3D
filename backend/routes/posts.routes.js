const router = require("express").Router();
const db = require("../src/db");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, async (req, res) => {
  const { category_id, search } = req.query;

  const params = [];
  let where = "WHERE 1=1";

  if (category_id) {
    params.push(category_id);
    where += ` AND p.category_id=$${params.length}`;
  }
  if (search) {
    params.push(`%${search}%`);
    where += ` AND p.title ILIKE $${params.length}`;
  }

  const r = await db.query(
    `SELECT p.id, p.title, p.price,
            (SELECT image_url FROM post_images WHERE post_id=p.id LIMIT 1) AS cover_url,
            c.name AS category
     FROM posts p
     JOIN categories c ON c.id=p.category_id
     ${where}
     ORDER BY p.created_at DESC`,
    params
  );

  res.json(r.rows);
});

router.get("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const postRes = await db.query(
    `SELECT p.*, c.name AS category_name, u.id AS seller_id, u.name AS seller_name
     FROM posts p
     JOIN categories c ON c.id=p.category_id
     JOIN users u ON u.id=p.user_id
     WHERE p.id=$1`,
    [id]
  );

  const post = postRes.rows[0];
  if (!post) return res.status(404).json({ message: "Post no encontrado" });

  const imgs = await db.query("SELECT image_url FROM post_images WHERE post_id=$1 ORDER BY id", [id]);

  res.json({
    id: post.id,
    title: post.title,
    description: post.description,
    price: post.price,
    category: post.category_name,
    images: imgs.rows.map(x => x.image_url),
    seller: { id: post.seller_id, name: post.seller_name },
    created_at: post.created_at,
  });
});

router.post("/", requireAuth, async (req, res) => {
  const { title, description, price, category_id, images } = req.body;
  if (!title || price == null || !category_id) return res.status(400).json({ message: "Faltan datos" });

  const userId = req.user.id;

  const created = await db.query(
    `INSERT INTO posts(user_id, category_id, title, description, price)
     VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [userId, category_id, title, description || "", price]
  );

  const postId = created.rows[0].id;

  if (Array.isArray(images)) {
    for (const url of images) {
      await db.query("INSERT INTO post_images(post_id, image_url) VALUES ($1,$2)", [postId, url]);
    }
  }

  res.status(201).json({ id: postId });
});

module.exports = router;
