import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../state/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setMsg("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      const { token, user } = res.data;
      login({ token, user });

      navigate("/store");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container py-5"
      style={{ minHeight: "calc(100vh - 56px)" }} // 56px navbar aprox
    >
      <div className="row justify-content-center align-items-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card shadow-lg border-0">
            <div className="card-body p-4 p-md-5">
              {/* Header */}
              <div className="text-center mb-4">
                <div
                  className="mx-auto mb-2 d-flex align-items-center justify-content-center"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    background: "#111",
                    color: "#fff",
                    fontWeight: 800,
                    letterSpacing: 1,
                  }}
                >
                  KOT3D
                </div>
                <h2 className="fw-bold mb-1">Iniciar sesión</h2>
                <div className="text-muted small">
                  Accede para comprar, pagar y gestionar tu cuenta
                </div>
              </div>

              {/* Error */}
              {msg && <div className="alert alert-danger">{msg}</div>}

              {/* Form */}
              <form onSubmit={handleLogin}>
                <label className="form-label">Email</label>
                <input
                  className="form-control mb-3"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="tuemail@correo.com"
                  autoComplete="email"
                  required
                />

                <label className="form-label">Contraseña</label>
                <div className="input-group mb-3">
                  <input
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPwd((v) => !v)}
                    title={showPwd ? "Ocultar" : "Mostrar"}
                  >
                    {showPwd ? "🙈" : "👁️"}
                  </button>
                </div>

                <button
                  type="submit"
                  className="btn btn-dark w-100"
                  disabled={loading}
                >
                  {loading ? "Entrando..." : "Entrar"}
                </button>
              </form>

              {/* Footer */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted small">
                  ¿No tienes cuenta?
                  <NavLink className="ms-1" to="/register">
                    Regístrate
                  </NavLink>
                </div>

                <NavLink className="small" to="/store">
                  Ir a la tienda
                </NavLink>
              </div>

              <hr className="my-4" />

              {/* Nota */}
              <div className="text-muted small">
                * Para pagar por transferencia y subir comprobante necesitas iniciar sesión.
              </div>
            </div>
          </div>

          <div className="text-center text-muted small mt-3">
            © {new Date().getFullYear()} KOT3D
          </div>
        </div>
      </div>
    </div>
  );
}
