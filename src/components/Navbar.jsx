import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { useCart } from "../context/CartContext";

export default function AppNavbar() {
  const { token, user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdmin = user?.role === "admin";
  const cartCount = (items || []).reduce((acc, it) => acc + (Number(it.qty) || 0), 0);

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
          aria-controls="kot3dNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="kot3dNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {/* Público */}
            {!token && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/">
                  Home
                </NavLink>
              </li>
            )}

            {/* Logeado: usuario normal */}
            {token && !isAdmin && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/store">
                    Tienda
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link d-flex align-items-center gap-2" to="/cart">
                    <span>Carrito</span>
                    {cartCount > 0 && <span className="badge bg-warning text-dark">{cartCount}</span>}
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link" to="/favorites">
                    Favoritos
                  </NavLink>
                </li>
              </>
            )}

            {/* Logeado: admin */}
            {token && isAdmin && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/store">
                    Tienda
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link d-flex align-items-center gap-2" to="/cart">
                    <span>Carrito</span>
                    {cartCount > 0 && <span className="badge bg-warning text-dark">{cartCount}</span>}
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link" to="/favorites">
                    Favoritos
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link" to="/my-posts">
                    Mis publicaciones
                  </NavLink>
                </li>

                {/* ✅ Dropdown Admin (FIX: button en vez de <a href="#">) */}
                <li className="nav-item dropdown">
                  <button
                    className="nav-link dropdown-toggle btn btn-link p-0"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ textuhin: "inherit" }}
                  >
                    Admin
                  </button>

                  <ul className="dropdown-menu dropdown-menu-dark">
                    <li>
                      <NavLink className="dropdown-item" to="/admin/users">
                        Usuarios
                      </NavLink>
                    </li>
                  </ul>
                </li>
              </>
            )}
          </ul>

          {/* Acciones derecha */}
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
                <span className="text-light small d-none d-md-inline">
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
