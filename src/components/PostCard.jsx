import { useState } from "react";
import api from "../services/api";

export default function PostCard({ post, onView }) {
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
      // Si ya está en favoritos, backend responde 409
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

  return (
    <div className="card h-100">
      <img
        src={post.cover_url}
        className="card-img-top"
        alt={post.title}
        style={{ objectFit: "cover", height: 180 }}
      />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{post.title}</h5>
        <div className="text-muted small mb-2">{post.category}</div>
        <div className="fw-bold mb-3">${post.price}</div>

        <div className="mt-auto d-flex gap-2">
          <button className="btn btn-dark btn-sm w-100" onClick={() => onView(post.id)}>
            Ver
          </button>

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
