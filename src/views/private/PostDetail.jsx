import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import { useCart } from "../../context/CartContext";

export default function PostDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [post, setPost] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setMsg("");
      try {
        const res = await api.get(`/posts/${id}`);
        if (!alive) return;
        setPost(res.data);
      } catch (err) {
        if (!alive) return;
        setMsg(err?.response?.data?.message || "Error al cargar publicación");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [id]);

  const formatCLP = (n) =>
    (Number(n) || 0).toLocaleString("es-CL", { style: "currency", currency: "CLP" });

  if (loading) {
    return (
      <div className="container py-4">
        <p>Cargando...</p>
      </div>
    );
  }

  if (msg) {
    return (
      <div className="container py-4">
        <h2 className="fw-bold">Detalle publicación</h2>
        <p className="text-danger">{msg}</p>
        <Link to="/store">Volver</Link>
      </div>
    );
  }

  const cover = post?.images?.[0] || post?.cover_url || "";

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-start gap-2">
        <div>
          <h2 className="fw-bold mb-1">{post.title}</h2>
          <div className="text-muted small">ID: {post.id}</div>
        </div>

        <Link className="btn btn-outline-secondary btn-sm" to="/store">
          Volver
        </Link>
      </div>

      <div className="row g-3 mt-2">
        <div className="col-12 col-md-6">
          <div className="card">
            {cover ? (
              <img
                src={cover}
                alt={post.title}
                style={{ width: "100%", height: 320, objectFit: "cover", borderRadius: 6 }}
              />
            ) : (
              <div style={{ height: 320, background: "#eee" }} />
            )}

            {/* mini galería si hay varias */}
            {Array.isArray(post.images) && post.images.length > 1 && (
              <div className="d-flex gap-2 p-2 flex-wrap">
                {post.images.slice(0, 6).map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`img-${idx}`}
                    style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6 }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card p-4">
            <p className="mb-2">
              <b>Precio:</b> {formatCLP(post.price)}
            </p>

            {/* ✅ backend devuelve "category" */}
            {post.category && (
              <p className="mb-2">
                <b>Categoría:</b> {post.category}
              </p>
            )}

            {/* ✅ backend devuelve seller.name */}
            {post.seller?.name && (
              <p className="mb-2">
                <b>Publicado por:</b> {post.seller.name}
              </p>
            )}

            <hr />

            {post.description ? (
              <p className="mb-3">{post.description}</p>
            ) : (
              <p className="mb-3 text-muted">Sin descripción</p>
            )}

            <div className="d-flex gap-2">
              <button
                className="btn btn-success w-100"
                onClick={() =>
                  addToCart(
                    {
                      id: post.id,
                      title: post.title,
                      price: post.price,
                      cover_url: cover,
                    },
                    1
                  )
                }
              >
                Agregar al carrito
              </button>

              <Link className="btn btn-primary w-100" to="/cart">
                Ir al carrito
              </Link>
            </div>

            <div className="text-muted small mt-2">
              * Para pagar por transferencia debes iniciar sesión.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
