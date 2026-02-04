const router = require("express").Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const db = require("../src/db"); // ajusta si tu ruta real es otra
const { requireAuth } = require("../middlewares/auth");

// ---------------------------
// Helpers
// ---------------------------
function makeOrderCode() {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 900000 + 100000); // 6 dígitos
  return `KOT3D-${year}-${rand}`;
}

function ensureUploadsDir() {
  const dir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// ---------------------------
// Multer config (guardar archivo local)
// ---------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, ensureUploadsDir()),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `order_${req.params.id}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

// ---------------------------
// POST /orders/transfer (SOLO LOGEADO)
// Crea orden + items y devuelve datos transferencia
// ---------------------------
router.post("/transfer", requireAuth, async (req, res) => {
  const userId = req.user.id;

  try {
    const { items, total, currency } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Carrito vacío" });
    }

    const amount = Number(total);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Total inválido" });
    }

    // Normaliza items
    const cleanItems = items
      .map((it) => ({
        post_id: Number(it.post_id),
        qty: Math.max(1, Number(it.qty) || 1),
        unit_price: Math.max(0, Number(it.unit_price) || 0),
      }))
      .filter((it) => Number.isInteger(it.post_id));

    if (cleanItems.length === 0) {
      return res.status(400).json({ message: "Items inválidos" });
    }

    // Recalcula total desde items (evita manipulación del front)
    const calcTotal = cleanItems.reduce((acc, it) => acc + it.qty * it.unit_price, 0);

    // Si quieres exigir que coincida:
    // if (Math.abs(calcTotal - amount) > 0.01) return res.status(400).json({ message: "Total no coincide" });

    const code = makeOrderCode();
    const cur = currency || "CLP";

    // Transacción (requiere db.pool)
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");

      // Crear orden
      const created = await client.query(
        `INSERT INTO orders(user_id, code, amount, currency, status, payment_method)
         VALUES ($1,$2,$3,$4,'pending_payment','transfer')
         RETURNING id, code, amount, currency`,
        [userId, code, calcTotal, cur]
      );

      const order = created.rows[0];

      // Insertar items
      for (const it of cleanItems) {
        await client.query(
          `INSERT INTO order_items(order_id, post_id, qty, unit_price)
           VALUES ($1,$2,$3,$4)`,
          [order.id, it.post_id, it.qty, it.unit_price]
        );
      }

      await client.query("COMMIT");

      return res.json({
        order_id: order.id,
        order_code: order.code,
        amount: Number(order.amount),
        currency: order.currency,
        bank: {
          name: process.env.BANK_NAME || "TU BANCO",
          account_type: process.env.BANK_ACCOUNT_TYPE || "Cuenta Corriente",
          account_number: process.env.BANK_ACCOUNT_NUMBER || "123456789",
          rut: process.env.BANK_RUT || "12.345.678-9",
          holder: process.env.BANK_HOLDER || "KOT3D SpA",
          email: process.env.BANK_EMAIL || "pagos@kot3d.cl",
        },
        instructions:
          "Realiza la transferencia por el monto exacto e incluye el código de orden en el comentario. Luego presiona “Ya transferí” para subir el comprobante.",
      });
    } catch (err) {
      try {
        await client.query("ROLLBACK");
      } catch (_) {}
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("POST /orders/transfer ERROR:", err);
    return res.status(500).json({ message: "Error servidor" });
  }
});

// ---------------------------
// POST /orders/:id/proof (SOLO LOGEADO)
// Subir comprobante y marcar orden como payment_submitted
// ---------------------------
router.post("/:id/proof", requireAuth, upload.single("proof"), async (req, res) => {
  const userId = req.user.id;

  try {
    const orderId = Number(req.params.id);
    if (!Number.isInteger(orderId)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Archivo requerido" });
    }

    // Verificar que la orden exista y sea del usuario
    const own = await db.query("SELECT id, user_id, status FROM orders WHERE id=$1", [orderId]);
    const row = own.rows[0];

    if (!row) return res.status(404).json({ message: "Orden no encontrada" });
    if (row.user_id !== userId) return res.status(403).json({ message: "No autorizado" });

    // Actualizar order con proof y status
    await db.query(
      `UPDATE orders
       SET proof_url=$1,
           status='payment_submitted'
       WHERE id=$2`,
      [req.file.filename, orderId]
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error("POST /orders/:id/proof ERROR:", err);
    return res.status(500).json({ message: "Error servidor" });
  }
});

module.exports = router;
