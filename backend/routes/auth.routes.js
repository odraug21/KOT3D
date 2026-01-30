const router = require("express").Router();
const db = require("../src/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "Faltan datos" });

  const hash = await bcrypt.hash(password, 10);

  try {
    const result = await db.query(
      "INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email",
      [name, email, hash]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    if (e.code === "23505") return res.status(409).json({ message: "Email ya registrado" });
    res.status(500).json({ message: "Error servidor" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Faltan datos" });

    const userRes = await db.query("SELECT * FROM users WHERE email=$1", [email]);
    const user = userRes.rows[0];
    if (!user) return res.status(401).json({ message: "Credenciales inválidas" });

    if (!user.password_hash) {
      console.error("Usuario sin password_hash en BD:", user.email);
      return res.status(500).json({ message: "Usuario sin password hash en BD" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET missing en producción");
      return res.status(500).json({ message: "JWT_SECRET faltante" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Credenciales inválidas" });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url || "" },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Error servidor" });
  }
});


module.exports = router;
