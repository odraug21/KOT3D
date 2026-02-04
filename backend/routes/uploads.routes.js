const router = require("express").Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { requireAuth } = require("../middlewares/auth");
const requireAdmin = require("../middlewares/requireAdmin");

function ensureUploadsDir() {
  const dir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, ensureUploadsDir()),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `post_${Date.now()}${ext}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024 } });

// ✅ solo admin sube
router.post("/", requireAuth, requireAdmin, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Archivo requerido" });

  // URL pública del archivo
  const url = `/uploads/${req.file.filename}`;
  return res.json({ url });
});

module.exports = router;
