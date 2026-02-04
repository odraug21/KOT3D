import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../state/AuthContext";

export default function Profile() {
  const { user: authUser, login } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    rut: "",
    phone_country_code: "+56",
    phone_number: "",
    address: "",
    region: "",
    comuna: "",
    avatar_url: "",
    role: "",
    created_at: "",
  });

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

  const normalizePhone = (v) => String(v || "").replace(/[^\d]/g, "");

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    let alive = true;

    async function loadMe() {
      setLoading(true);
      setMsg("");
      try {
        const res = await api.get("/users/me");
        if (!alive) return;

        const u = res.data || {};
        setForm({
          name: u.name || "",
          email: u.email || "",
          rut: u.rut || "",
          phone_country_code: u.phone_country_code || "+56",
          phone_number: u.phone_number || "",
          address: u.address || "",
          region: u.region || "",
          comuna: u.comuna || "",
          avatar_url: u.avatar_url || "",
          role: u.role || "",
          created_at: u.created_at || "",
        });
      } catch (err) {
        console.error(err);
        if (!alive) return;

        setForm((p) => ({
          ...p,
          name: authUser?.name || "",
          email: authUser?.email || "",
          role: authUser?.role || "",
        }));

        setMsg(err?.response?.data?.message || "No se pudo cargar tu perfil");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadMe();
    return () => {
      alive = false;
    };
  }, [authUser]);

  const formatDate = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString("es-CL");
    } catch {
      return iso;
    }
  };

  // ✅ Teléfono obligatorio: mínimo 8 dígitos
  const canSave = useMemo(() => {
    if (!form.name.trim()) return false;

    const pn = String(form.phone_number || "").trim();
    if (!pn) return false;
    if (normalizePhone(pn).length < 8) return false;

    return true;
  }, [form.name, form.phone_number]);

  const onSave = async (e) => {
    e.preventDefault();
    if (!canSave || saving) return;

    setSaving(true);
    setMsg("");

    try {
      const payload = {
        name: form.name.trim(),
        phone_country_code: form.phone_country_code,
        phone_number: normalizePhone(form.phone_number),
        address: form.address.trim(),
        region: form.region.trim(),
        comuna: form.comuna.trim(),
        avatar_url: form.avatar_url.trim(),
      };

      const res = await api.put("/users/me", payload);

      const updatedUser = res.data?.user || res.data;

      const token = localStorage.getItem("token") || "";
      if (token && updatedUser) login({ token, user: updatedUser });

      setMsg("Perfil actualizado ✅");
    } catch (err) {
      console.error(err);
      setMsg(err?.response?.data?.message || "No se pudo guardar el perfil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4" style={{ maxWidth: 820 }}>
        <div className="alert alert-info">Cargando perfil...</div>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: 820 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="fw-bold mb-0">Mi perfil</h2>
          <div className="text-muted small">Actualiza tus datos de contacto y envío</div>
        </div>

        {form.avatar_url ? (
          <img
            src={form.avatar_url}
            alt="avatar"
            style={{ width: 56, height: 56, borderRadius: 14, objectFit: "cover" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#111",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
            }}
          >
            {String(form.name || "U").slice(0, 1).toUpperCase()}
          </div>
        )}
      </div>

      <form className="card p-4" onSubmit={onSave}>
        {msg && (
          <div className={`alert ${msg.includes("✅") ? "alert-success" : "alert-danger"}`}>
            {msg}
          </div>
        )}

        {/* Nombre + Email */}
        <div className="row g-2">
          <div className="col-12 col-md-6">
            <label className="form-label">Nombre</label>
            <input
              className="form-control mb-3"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              required
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">Email (no editable)</label>
            <input className="form-control mb-3" value={form.email} disabled />
          </div>
        </div>

        {/* RUT + avatar */}
        <div className="row g-2">
          <div className="col-12 col-md-6">
            <label className="form-label">RUT (no editable)</label>
            <input className="form-control mb-2" value={form.rut} disabled />
            <div className="text-muted small mb-3">
              Si necesitas corregir tu RUT, contáctanos. Por seguridad, no se cambia desde el perfil.
            </div>
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">Avatar URL (opcional)</label>
            <input
              className="form-control mb-3"
              value={form.avatar_url}
              onChange={(e) => setField("avatar_url", e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Teléfono (obligatorio) */}
        <label className="form-label">Teléfono (obligatorio)</label>
        <div className="input-group mb-2">
          <select
            className="form-select"
            style={{ maxWidth: 190 }}
            value={form.phone_country_code}
            onChange={(e) => setField("phone_country_code", e.target.value)}
          >
            {countryCodes.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>

          <input
            className="form-control"
            value={form.phone_number}
            onChange={(e) => setField("phone_number", normalizePhone(e.target.value))}
            placeholder="9XXXXXXXX"
            inputMode="numeric"
            required
          />
        </div>
        <div className="text-muted small mb-3">Mínimo 8 dígitos (sin espacios).</div>

        {/* Dirección */}
        <label className="form-label">Dirección</label>
        <input
          className="form-control mb-3"
          value={form.address}
          onChange={(e) => setField("address", e.target.value)}
          placeholder="Calle, número, depto, etc."
        />

        {/* Región / Comuna */}
        <div className="row g-2">
          <div className="col-12 col-md-6">
            <label className="form-label">Región</label>
            <input
              className="form-control mb-3"
              value={form.region}
              onChange={(e) => setField("region", e.target.value)}
              placeholder="Ej: Región Metropolitana"
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label">Comuna</label>
            <input
              className="form-control mb-3"
              value={form.comuna}
              onChange={(e) => setField("comuna", e.target.value)}
              placeholder="Ej: Maipú"
            />
          </div>
        </div>

        {/* Info no editable */}
        <div className="row g-2">
          <div className="col-12 col-md-6">
            <label className="form-label">Rol</label>
            <input className="form-control mb-3" value={form.role || "user"} disabled />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label">Creado</label>
            <input className="form-control mb-3" value={formatDate(form.created_at)} disabled />
          </div>
        </div>

        <button className="btn btn-dark w-100" type="submit" disabled={!canSave || saving}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>

        {!canSave && (
          <div className="text-muted small mt-2">
            Revisa: nombre obligatorio y teléfono obligatorio (mínimo 8 dígitos).
          </div>
        )}
      </form>
    </div>
  );
}
