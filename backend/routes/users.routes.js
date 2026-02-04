const router = require("express").Router();
const db = require("../src/db");
const { requireAuth } = require("../middlewares/auth");
const requireAdmin = require("../middlewares/requireAdmin");

// ✅ GET /users/me  (perfil completo)
router.get("/me", requireAuth, async (req, res) => {
  try {
    const { id } = req.user;

    const r = await db.query(
      `SELECT
         id,
         name,
         email,
         avatar_url,
         role,
         created_at,
         rut,
         phone_country_code,
         phone_number,
         address,
         region,
         comuna
       FROM users
       WHERE id=$1`,
      [id]
    );

    const u = r.rows[0];
    if (!u) return res.status(404).json({ message: "Usuario no encontrado" });

    return res.json(u);
  } catch (err) {
    console.error("GET /users/me ERROR:", err);
    return res.status(500).json({ message: "Error servidor" });
  }
});

// ✅ PUT /users/me (editar perfil)
// 🔒 RUT NO editable aquí (solo admin por backend, si quieres luego)
router.put("/me", requireAuth, async (req, res) => {
  try {
    const { id } = req.user;

    const { name, phone_country_code, phone_number, address, region, comuna, avatar_url } = req.body;

    if (!name || String(name).trim() === "") {
      return res.status(400).json({ message: "Nombre requerido" });
    }

    // ✅ Teléfono obligatorio por seguridad (mínimo 8 dígitos)
    const pn = phone_number ? String(phone_number).replace(/[^\d]/g, "") : "";
    if (!pn || pn.length < 8) {
      return res.status(400).json({ message: "Teléfono inválido (mínimo 8 dígitos)" });
    }

    const cleanName = String(name).trim();
    const cc = phone_country_code ? String(phone_country_code).trim() : null;

    const cleanAddress = address ? String(address).trim() : null;
    const cleanRegion = region ? String(region).trim() : null;
    const cleanComuna = comuna ? String(comuna).trim() : null;
    const cleanAvatar = avatar_url ? String(avatar_url).trim() : null;

    const r = await db.query(
      `UPDATE users
       SET
         name=$1,
         phone_country_code=$2,
         phone_number=$3,
         address=$4,
         region=$5,
         comuna=$6,
         avatar_url=$7
       WHERE id=$8
       RETURNING
         id,
         name,
         email,
         avatar_url,
         role,
         created_at,
         rut,
         phone_country_code,
         phone_number,
         address,
         region,
         comuna`,
      [cleanName, cc, pn, cleanAddress, cleanRegion, cleanComuna, cleanAvatar, id]
    );

    const updated = r.rows[0];
    if (!updated) return res.status(404).json({ message: "Usuario no encontrado" });

    return res.json({ user: updated });
  } catch (err) {
    console.error("PUT /users/me ERROR:", err);
    return res.status(500).json({ message: "Error servidor" });
  }
});

/**
 * ✅ GET /users/me/posts
 * Solo admin publica => ruta solo admin.
 */
router.get("/me/posts", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.user;

    const r = await db.query(
      `SELECT p.id, p.title, p.price, p.created_at
       FROM posts p
       WHERE p.user_id=$1
       ORDER BY p.created_at DESC`,
      [id]
    );

    return res.json(r.rows);
  } catch (err) {
    console.error("GET /users/me/posts ERROR:", err);
    return res.status(500).json({ message: "Error servidor" });
  }
});

module.exports = router;
