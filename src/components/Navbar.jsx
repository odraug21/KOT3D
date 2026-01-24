import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export default function AppNavbar() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <NavLink className="navbar-brand fw-bold" to="/">
          KOT3D
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#kot3dNav"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="kot3dNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {!token ? (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/">
                    Home
                  </NavLink>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/store">
                    Tienda
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/create">
                    Publicar
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/favorites">
                    Favoritos
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex gap-2 align-items-center">
            {!token ? (
              <>
                <NavLink className="btn btn-outline-light btn-sm" to="/login">
                  Iniciar sesión
                </NavLink>
                <NavLink className="btn btn-warning btn-sm" to="/register">
                  Registrarme
                </NavLink>
              </>
            ) : (
              <>
                <span className="text-light small">
                  Hola, <b>{user?.name || "Usuario"}</b>
                </span>
                <NavLink className="btn btn-outline-light btn-sm" to="/profile">
                  Mi perfil
                </NavLink>
                <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                  Salir
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
