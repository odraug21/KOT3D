import { NavLink } from "react-router-dom";

export default function Home() {
  return (
    <div className="container py-5">
      <div className="p-5 bg-light rounded-3 border">
        <h1 className="fw-bold">KOT3D</h1>
        <p className="mt-3">
          E-commerce de figuras y productos en <b>impresión 3D</b>. Personalizados, coleccionables y regalos.
        </p>

        <div className="d-flex gap-2 mt-4">
          <NavLink to="/login" className="btn btn-dark">
            Iniciar sesión
          </NavLink>
          <NavLink to="/register" className="btn btn-outline-dark">
            Crear cuenta
          </NavLink>
        </div>

        <hr className="my-4" />

        <div className="row g-3">
          {["Anime", "Gaming", "Deportes", "Mascotas", "Personalizadas"].map((c) => (
            <div className="col-6 col-md-4 col-lg-2" key={c}>
              <div className="card text-center">
                <div className="card-body">
                  <div className="fw-semibold">{c}</div>
                  <div className="text-muted small">Ver modelos</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
