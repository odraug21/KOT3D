// routes/posts.routes.js
const router = require("express").Router();
const db = require("../src/db"); // ajusta si tu path real es otro
const { requireAuth } = require("../middlewares/auth");
const requireAdmin = require("../middlewares/requireAdmin");

/**
 * ✅ PÚBLICO: LISTAR POSTS (TIENDA)
 * GET /posts
 */
router.get("/", async (req, res) => {
  try {
    const r = await db.query(
      `SELECT
          p.id,
          p.title,
          p.price,
          p.created_at,
          p.category_id,
          c.name AS category,
          (SELECT image_url
             FROM post_images
            WHERE post_id = p.id
            ORDER BY id
            LIMIT 1) AS cover_url
       FROM posts p
       JOIN categories c ON c.id = p.category_id
       ORDER BY p.created_at DESC`
    );

    return res.json(r.rows);
  } catch (err) {
    console.error("GET /posts ERROR:", err);
    return res.status(500).json({ message: "Error servidor" });
  }
});

/**
 * ✅ ADMIN: LISTAR MIS POSTS (ADMIN)
 * GET /posts/mine
 * (solo admin, porque solo admin publica)
 */
router.get("/mine", requireAuth, requireAdmin, async (req, res) => {
  try {
    const userId = req.user.id;

    const r = await db.query(
      `SELECT
          p.id,
          p.title,
          p.price,
          p.created_at,
          p.category_id,
          c.name AS category,
          (SELECT image_url
             FROM post_images
            WHERE post_id = p.id
            ORDER BY id
            LIMIT 1) AS cover_url
       FROM posts p
       JOIN categories c ON c.id = p.category_id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );

    return res.json(r.rows);
  } catch (err) {
    console.error("GET /posts/mine ERROR:", err);
    return res.status(500).json({ message: "Error servidor" });
  }
});

/**
 * ✅ PÚBLICO: DETALLE POST
 * GET /posts/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const postRes = await db.query(
      `SELECT
          p.*,
          c.name AS category_name,
          u.id AS seller_id,
          u.name AS seller_name
       FROM posts p
       JOIN categories c ON c.id = p.category_id
       JOIN users u ON u.id = p.user_id
       WHERE p.id = $1`,
      [id]
    );

    const post = postRes.rows[0];
    if (!post) return res.status(404).json({ message: "Post no encontrado" });

    const imgs = await db.query(
      "SELECT image_url FROM post_images WHERE post_id=$1 ORDER BY id",
      [id]
    );

    return res.json({
      id: post.id,
      title: post.title,
      description: post.description,
      price: post.price,
      category_id: post.category_id,
      category: post.category_name,
      images: imgs.rows.map((x) => x.image_url),
      seller: { id: post.seller_id, name: post.seller_name },
      created_at: post.created_at,
    });
  } catch (err) {
    console.error("GET /posts/:id ERROR:", err);
    return res.status(500).json({ message: "Error servidor" });
  }
});

/**
 * ✅ ADMIN: CREAR POST
 * POST /posts
 */
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, description, price, category_id, images } = req.body;

    if (!title || price == null || !category_id) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    const userId = req.user.id;

    const created = await db.query(
      `INSERT INTO posts(user_id, category_id, title, description, price)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [userId, category_id, title, description || "", price]
    );

    const postId = created.rows[0].id;

    if (Array.isArray(images)) {
      for (const url of images) {
        if (typeof url === "string" && url.trim()) {
          await db.query(
            "INSERT INTO post_images(post_id, image_url) VALUES ($1,$2)",
            [postId, url.trim()]
          );
        }
      }
    }

    return res.status(201).json({ id: postId });
  } catch (err) {
    console.error("POST /posts ERROR:", err);
    return res.status(500).json({ message: "Error servidor" });
  }
});

/**
 * ✅ ADMIN: EDITAR POST
 * PUT /posts/:id
 * (solo admin; como el admin es quien publica, igual validamos owner)
 */
router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ message: "ID inválido" });

  const { title, description, price, category_id, images } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({ message: "Título requerido" });
  }
  if (price == null || Number.isNaN(Number(price)) || Number(price) < 0) {
    return res.status(400).json({ message: "Precio inválido" });
  }
  if (!category_id || Number.isNaN(Number(category_id))) {
    return res.status(400).json({ message: "Categoría inválida" });
  }

  const userId = req.user.id;

  const cleanImages = Array.isArray(images)
    ? images.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean)
    : [];

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    const ownerRes = await client.query("SELECT user_id FROM posts WHERE id=$1", [id]);
    const row = ownerRes.rows[0];

    if (!row) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Post no encontrado" });
    }
    // aún validamos dueño (por seguridad)
    if (row.user_id !== userId) {
      await client.query("ROLLBACK");
      return res.status(403).json({ message: "No autorizado" });
    }

    await client.query(
      `UPDATE posts
       SET title=$1,
           description=$2,
           price=$3,
           category_id=$4
       WHERE id=$5`,
      [title.trim(), description || "", Number(price), Number(category_id), id]
    );

    await client.query("DELETE FROM post_images WHERE post_id=$1", [id]);

    for (const url of cleanImages) {
      await client.query(
        "INSERT INTO post_images(post_id, image_url) VALUES ($1,$2)",
        [id, url]
      );
    }

    await client.query("COMMIT");
    return res.json({ ok: true, id });
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (_) {}
    console.error("PUT /posts/:id ERROR:", err);
    return res.status(500).json({ message: "Error servidor" });
  } finally {
    client.release();
  }
});

/**
 * ✅ ADMIN: ELIMINAR POST
 * DELETE /posts/:id
 */
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ message: "ID inválido" });

  const userId = req.user.id;

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    const ownerRes = await client.query("SELECT user_id FROM posts WHERE id=$1", [id]);
    const row = ownerRes.rows[0];

    if (!row) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Post no encontrado" });
    }
    if (row.user_id !== userId) {
      await client.query("ROLLBACK");
      return res.status(403).json({ message: "No autorizado" });
    }

    await client.query("DELETE FROM posts WHERE id=$1", [id]);

    await client.query("COMMIT");
    return res.json({ ok: true });
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (_) {}
    console.error("DELETE /posts/:id ERROR:", err);
    return res.status(500).json({ message: "Error servidor" });
  } finally {
    client.release();
  }
});

module.exports = router;
