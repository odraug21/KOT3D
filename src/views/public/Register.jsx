import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../state/AuthContext";
import api from "../../services/api";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [rut, setRut] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [countryCode, setCountryCode] = useState("+56");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [region, setRegion] = useState("");
  const [comuna, setComuna] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const countryCodes = useMemo(
    () => [
      { code: "+56", label: "Chile (+56)" },
      { code: "+54", label: "Argentina (+54)" },
      { code: "+57", label: "Colombia (+57)" },
      { code: "+51", label: "Perú (+51)" },
      { code: "+593", label: "Ecuador (+593)" },
      { code: "+34", label: "España (+34)" },
      { code: "+1", label: "EE.UU. / Canadá (+1)" },
      { code: "+52", label: "México (+52)" },
      { code: "+55", label: "Brasil (+55)" },
    ],
    []
  );

  const normalizeRut = (v) =>
    String(v || "")
      .replace(/[^0-9kK.-]/g, "")
      .replace(/\s+/g, "")
      .toUpperCase();

  const normalizePhone = (v) => String(v || "").replace(/[^\d]/g, "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setMsg("");
    setLoading(true);

    try {
      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();
      const cleanRut = normalizeRut(rut).trim();
      const cleanPhone = normalizePhone(phone).trim();

      if (!cleanRut) throw new Error("RUT es obligatorio.");
      if (!cleanPhone || cleanPhone.length < 8) throw new Error("Teléfono inválido (mínimo 8 dígitos).");

      const payload = {
        name: cleanName,
        email: cleanEmail,
        password,
        rut: cleanRut,
        phone_country_code: countryCode,
        phone_number: cleanPhone,
        address: address.trim(),
        region: region.trim(),
        comuna: comuna.trim(),
      };

      const res = await api.post("/auth/register", payload);

      if (!res?.data?.token || !res?.data?.user) {
        throw new Error("Respuesta inválida del servidor (falta token/user)");
      }

      login(res.data);
      navigate("/store");
    } catch (err) {
      const serverMsg = err?.response?.data?.message;
      setMsg(serverMsg || err?.message || "No se pudo crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 620 }}>
      <h2 className="fw-bold mb-3">Registro</h2>

      <form className="card p-4" onSubmit={handleSubmit}>
        <label className="form-label">Nombre</label>
        <input className="form-control mb-3" value={name} onChange={(e) => setName(e.target.value)} required />

        <label className="form-label">RUT</label>
        <input
          className="form-control mb-2"
          value={rut}
          onChange={(e) => setRut(normalizeRut(e.target.value))}
          placeholder="12.345.678-9"
          required
        />
        <div className="text-muted small mb-3">* El RUT no se podrá cambiar desde el perfil.</div>

        <label className="form-label">Email</label>
        <input className="form-control mb-3" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />

        <label className="form-label">Teléfono</label>
        <div className="input-group mb-2">
          <select
            className="form-select"
            style={{ maxWidth: 190 }}
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
          >
            {countryCodes.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>

          <input
            className="form-control"
            value={phone}
            onChange={(e) => setPhone(normalizePhone(e.target.value))}
            placeholder="9XXXXXXXX"
            inputMode="numeric"
            required
          />
        </div>
        <div className="text-muted small mb-3">* Mínimo 8 dígitos.</div>

        <label className="form-label">Dirección</label>
        <input className="form-control mb-3" value={address} onChange={(e) => setAddress(e.target.value)} required />

        <div className="row g-2">
          <div className="col-12 col-md-6">
            <label className="form-label">Región</label>
            <input className="form-control mb-3" value={region} onChange={(e) => setRegion(e.target.value)} required />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label">Comuna</label>
            <input className="form-control mb-3" value={comuna} onChange={(e) => setComuna(e.target.value)} required />
          </div>
        </div>

        <label className="form-label">Contraseña</label>
        <input
          className="form-control mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          minLength={6}
          required
        />

        {msg && <div className="alert alert-danger">{msg}</div>}

        <button className="btn btn-warning w-100" type="submit" disabled={loading}>
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        <div className="text-center mt-3">
          <span className="text-muted">¿Ya tienes cuenta?</span> <NavLink to="/login">Inicia sesión</NavLink>
        </div>
      </form>
    </div>
  );
}
