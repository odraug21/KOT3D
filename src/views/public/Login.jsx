import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../state/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Demo sin backend (Hito 3): simulamos login OK
    login({
      token: "demo-token",
      user: { id: 1, name: "Cliente KOT3D", email },
    });

    navigate("/store");
  };

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <h2 className="fw-bold mb-3">Iniciar sesión</h2>

      <form className="card p-4" onSubmit={handleSubmit}>
        <label className="form-label">Email</label>
        <input
          className="form-control mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />

        <label className="form-label">Contraseña</label>
        <input
          className="form-control mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />

        <button className="btn btn-dark w-100" type="submit">
          Entrar
        </button>

        <div className="text-center mt-3">
          <span className="text-muted">¿No tienes cuenta?</span>{" "}
          <NavLink to="/register">Regístrate</NavLink>
        </div>
      </form>
    </div>
  );
}
