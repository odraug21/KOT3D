import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PostCard from "../../components/PostCard";
import api from "../../services/api";
import { useCart } from "../../context/CartContext";

export default function Store() {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const loadPosts = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await api.get("/posts");
      setPosts(res.data || []);
    } catch (err) {
      setPosts([]);
      setMsg(err?.response?.data?.message || "No se pudieron cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return posts;
    return posts.filter((p) => (p.title || "").toLowerCase().includes(s));
  }, [posts, search]);

  const onView = (id) => navigate(`/posts/${id}`);

  const onAddToCart = (post) => {
    addToCart(post, 1);
    // Si quieres que al agregar lo mande al carrito:
    // navigate("/cart");
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row gap-2 align-items-md-center justify-content-between mb-3">
        <h2 className="fw-bold m-0">Tienda</h2>

        <input
          className="form-control"
          style={{ maxWidth: 360 }}
          placeholder="Buscar figura..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <div className="alert alert-info">Cargando productos...</div>}
      {!loading && msg && <div className="alert alert-danger">{msg}</div>}

      <div className="row g-3">
        {filtered.map((p) => (
          <div className="col-12 col-sm-6 col-lg-4" key={p.id}>
            <PostCard post={p} onView={onView} onAddToCart={onAddToCart} />
          </div>
        ))}
      </div>
    </div>
  );
}
