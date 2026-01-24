import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../state/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Demo sin backend: registramos y dejamos logueado
    login({
      token: "demo-token",
      user: { id: 2, name, email },
    });

    navigate("/store");
  };

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <h2 className="fw-bold mb-3">Registro</h2>

      <form className="card p-4" onSubmit={handleSubmit}>
        <label className="form-label">Nombre</label>
        <input
          className="form-control mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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
          minLength={6}
          required
        />

        <button className="btn btn-warning w-100" type="submit">
          Crear cuenta
        </button>

        <div className="text-center mt-3">
          <span className="text-muted">¿Ya tienes cuenta?</span>{" "}
          <NavLink to="/login">Inicia sesión</NavLink>
        </div>
      </form>
    </div>
  );
}
