import { useEffect, useState } from "react";
import api from "../../services/api";
import PostCard from "../../components/PostCard";

export default function Favorites() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    setLoading(true);
    setMsg("");

    try {
      const res = await api.get("/favorites");

      // ✅ Normaliza la respuesta del backend:
      // backend devuelve post_id, pero PostCard suele esperar id
      const normalized = (res.data || []).map((p) => ({
        ...p,
        id: p.id ?? p.post_id,
      }));

      setItems(normalized);
    } catch (err) {
      setItems([]);
      setMsg(err?.response?.data?.message || "No se pudieron cargar los favoritos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="fw-bold m-0">Favoritos</h2>
        <button className="btn btn-outline-secondary" onClick={loadFavorites} disabled={loading}>
          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {loading && <div className="alert alert-info">Cargando...</div>}

      {!loading && msg && <div className="alert alert-danger">{msg}</div>}

      {!loading && !msg && items.length === 0 && (
        <div className="card p-4">
          <p className="m-0">Aún no tienes favoritos. Ve a la tienda y marca un ❤️</p>
        </div>
      )}

      <div className="row g-3">
        {items.map((post) => (
          <div className="col-12 col-md-6 col-lg-4" key={post.id}>
            <PostCard post={post} />
          </div>
        ))}
      </div>
    </div>
  );
}
