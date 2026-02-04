import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import api from "../../services/api";

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setMsg("");
    setLoading(true);
    try {
      const res = await api.get("/posts/mine");
      setPosts(res.data || []);
    } catch (err) {
      setMsg(err?.response?.data?.message || "No se pudieron cargar tus publicaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta publicación?")) return;

    try {
      await api.delete(`/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || "No se pudo eliminar");
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <h2 className="fw-bold">Mis publicaciones</h2>
        <p className="text-muted">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between">
        <h2 className="fw-bold m-0">Mis publicaciones</h2>
        <NavLink className="btn btn-primary" to="/create">
          + Nueva publicación
        </NavLink>
      </div>

      {msg && <p className="mt-3 text-danger">{msg}</p>}

      {!posts.length ? (
        <div className="mt-4 alert alert-secondary">
          Aún no tienes publicaciones. Crea una desde “Publicar”.
        </div>
      ) : (
        <div className="row mt-3 g-3">
          {posts.map((p) => (
            <div className="col-12 col-md-6 col-lg-4" key={p.id}>
              <div className="card h-100">
                {p.cover_url ? (
                  <img
                    src={p.cover_url}
                    alt={p.title}
                    className="card-img-top"
                    style={{ height: 180, objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="bg-light d-flex align-items-center justify-content-center"
                    style={{ height: 180 }}
                  >
                    <span className="text-muted">Sin imagen</span>
                  </div>
                )}

                <div className="card-body">
                  <h5 className="card-title">{p.title}</h5>
                  <p className="card-text m-0">
                    <b>${Number(p.price).toLocaleString("es-CL")}</b>
                  </p>
                  <small className="text-muted">{p.category}</small>
                </div>

                <div className="card-footer d-flex gap-2">
                  <NavLink className="btn btn-outline-secondary btn-sm" to={`/posts/${p.id}`}>
                    Ver
                  </NavLink>

                  <NavLink className="btn btn-outline-primary btn-sm" to={`/posts/${p.id}/edit`}>
                    Editar
                  </NavLink>

                  <button
                    className="btn btn-outline-danger btn-sm ms-auto"
                    onClick={() => handleDelete(p.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
