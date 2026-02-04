const router = require("express").Router();
const db = require("../src/db");
const { requireAuth, requireAdmin } = require("../middlewares/auth");

// ✅ Admin principal (no degradable)
const PRIMARY_ADMIN_EMAIL = "odraug@email.com";

/**
 * GET /admin/users?q=...&limit=...
 * Lista usuarios (con búsqueda)
 */
router.get("/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const q = String(req.query.q || "").trim().toLowerCase();
    const limit = Math.min(Number(req.query.limit) || 50, 200);

    const r = await db.query(
      `SELECT id, name, email, role, created_at
       FROM users
       WHERE ($1 = '' OR LOWER(email) LIKE '%'||$1||'%' OR LOWER(name) LIKE '%'||$1||'%')
       ORDER BY id DESC
       LIMIT $2`,
      [q, limit]
    );

    return res.json(r.rows);
  } catch (err) {
    console.error("GET /admin/users ERROR:", err);
    return res.status(500).json({ message: "Error servidor" });
  }
});

/**
 * PATCH /admin/users/:id/role
 * body: { role: "admin" | "user" }
 * Cambia rol de un usuario (solo admin)
 */
router.patch("/users/:id/role", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { role } = req.body;

    if (!Number.isInteger(id)) return res.status(400).json({ message: "ID inválido" });
    if (!["admin", "user"].includes(role)) return res.status(400).json({ message: "Rol inválido" });

    // ✅ No permitir que el admin se quite su propio admin (evita auto-bloqueo)
    if (id === req.user.id && role !== "admin") {
      return res.status(400).json({ message: "No puedes quitarte tu rol admin" });
    }

    // Obtener usuario objetivo
    const targetRes = await db.query("SELECT id, email, role FROM users WHERE id=$1", [id]);
    const target = targetRes.rows[0];
    if (!target) return res.status(404).json({ message: "Usuario no encontrado" });

    // ✅ No permitir degradar el admin principal
    if (String(target.email).toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase() && role !== "admin") {
      return res.status(400).json({ message: "No puedes quitar el rol admin al admin principal" });
    }

    // ✅ Evitar dejar el sistema sin admin
    if (target.role === "admin" && role === "user") {
      const countAdmins = await db.query("SELECT COUNT(*)::int AS n FROM users WHERE role='admin'");
      const n = countAdmins.rows[0]?.n ?? 0;
      if (n <= 1) {
        return res.status(400).json({ message: "No puedes dejar el sistema sin administradores" });
      }
    }

    const r = await db.query(
      "UPDATE users SET role=$1 WHERE id=$2 RETURNING id,name,email,role,created_at",
      [role, id]
    );

    return res.json({ ok: true, user: r.rows[0] });
  } catch (err) {
    console.error("PATCH /admin/users/:id/role ERROR:", err);
    return res.status(500).json({ message: "Error servidor" });
  }
});

module.exports = router;
