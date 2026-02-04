const router = require("express").Router();
const db = require("../src/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function mustHaveJWTSecret() {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET missing");
    return false;
  }
  return true;
}

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      rut,
      email,
      password,
      phone_country_code,
      phone_number,
      address,
      region,
      comuna,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    // Validaciones básicas
    if (String(password).length < 6) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();

    const cleanRut = rut ? String(rut).trim().toUpperCase() : null;
    const cc = phone_country_code ? String(phone_country_code).trim() : null;
    const pn = phone_number ? String(phone_number).replace(/[^\d]/g, "") : null;

    const cleanAddress = address ? String(address).trim() : null;
    const cleanRegion = region ? String(region).trim() : null;
    const cleanComuna = comuna ? String(comuna).trim() : null;

    // Si tu registro exige estos campos, puedes descomentar:
    // if (!cleanRut || !cc || !pn || !cleanAddress || !cleanRegion || !cleanComuna) {
    //   return res.status(400).json({ message: "Completa todos los campos requeridos" });
    // }

    if (!mustHaveJWTSecret()) {
      return res.status(500).json({ message: "JWT_SECRET faltante" });
    }

    const hash = await bcrypt.hash(password, 10);

    // Insert con los nuevos campos
    const result = await db.query(
      `INSERT INTO users(
        name, email, password_hash, role,
        rut, phone_country_code, phone_number,
        address, region, comuna
      )
      VALUES ($1,$2,$3,'user',$4,$5,$6,$7,$8,$9)
      RETURNING id, name, email, role, rut, phone_country_code, phone_number, address, region, comuna, avatar_url`,
      [
        cleanName,
        cleanEmail,
        hash,
        cleanRut,
        cc,
        pn,
        cleanAddress,
        cleanRegion,
        cleanComuna,
      ]
    );

    const user = result.rows[0];
    const role = user.role || "user";

    // Generar token inmediatamente (así el front funciona al registrar)
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url || "",
        role,
        rut: user.rut || "",
        phone_country_code: user.phone_country_code || "",
        phone_number: user.phone_number || "",
        address: user.address || "",
        region: user.region || "",
        comuna: user.comuna || "",
      },
    });
  } catch (e) {
    // 23505 = unique_violation
    if (e.code === "23505") {
      // Si tienes unique en email, esto aplica:
      // (Si también agregaste unique al rut, también puede caer aquí)
      return res.status(409).json({ message: "Email o RUT ya registrado" });
    }
    console.error("REGISTER ERROR:", e);
    return res.status(500).json({ message: "Error servidor" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Faltan datos" });

    const cleanEmail = String(email).trim().toLowerCase();

    const userRes = await db.query("SELECT * FROM users WHERE email=$1", [cleanEmail]);
    const user = userRes.rows[0];
    if (!user) return res.status(401).json({ message: "Credenciales inválidas" });

    if (!user.password_hash) {
      console.error("Usuario sin password_hash en BD:", user.email);
      return res.status(500).json({ message: "Usuario sin password hash en BD" });
    }

    if (!mustHaveJWTSecret()) {
      return res.status(500).json({ message: "JWT_SECRET faltante" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Credenciales inválidas" });

    const role = user.role || "user";

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url || "",
        role,
        rut: user.rut || "",
        phone_country_code: user.phone_country_code || "",
        phone_number: user.phone_number || "",
        address: user.address || "",
        region: user.region || "",
        comuna: user.comuna || "",
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Error servidor" });
  }
});

module.exports = router;
