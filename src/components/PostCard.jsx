import { useState } from "react";
import api from "../services/api";

export default function PostCard({ post, onView, onAddToCart }) {
  const [fav, setFav] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleFav = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (!fav) {
        await api.post("/favorites", { post_id: post.id });
        setFav(true);
      } else {
        await api.delete(`/favorites/${post.id}`);
        setFav(false);
      }
    } catch (err) {
      if (err?.response?.status === 409) {
        setFav(true);
      } else {
        console.error(err);
        alert(err?.response?.data?.message || "Error con favoritos");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCLP = (n) =>
    (Number(n) || 0).toLocaleString("es-CL", { style: "currency", currency: "CLP" });

  return (
    <div className="card h-100">
      {post.cover_url ? (
        <img
          src={post.cover_url}
          className="card-img-top"
          alt={post.title}
          style={{ objectFit: "cover", height: 180 }}
        />
      ) : (
        <div style={{ height: 180, background: "#eee" }} />
      )}

      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{post.title}</h5>
        <div className="text-muted small mb-2">{post.category}</div>
        <div className="fw-bold mb-3">{formatCLP(post.price)}</div>

        <div className="mt-auto d-flex gap-2">
          <button className="btn btn-dark btn-sm w-100" onClick={() => onView(post.id)}>
            Ver
          </button>

          {/* ✅ NUEVO: Agregar al carrito */}
          <button
            className="btn btn-success btn-sm w-100"
            onClick={() => onAddToCart?.(post)}
            disabled={!onAddToCart}
            title="Agregar al carrito"
          >
            Agregar
          </button>

          {/* Favoritos */}
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={toggleFav}
            disabled={loading}
            title={fav ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            {fav ? "❤️" : "🤍"}
          </button>
        </div>
      </div>
    </div>
  );
}
