import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PostCard from "../../components/PostCard";
import api from "../../services/api";

export default function Store() {
  const navigate = useNavigate();
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

  // ✅ Toggle favoritos: si ya existe (409) => lo elimina
  const onFav = async (id) => {
    try {
      await api.post("/favorites", { post_id: id });
      // opcional: feedback
      // alert("Agregado a favoritos ✅");
    } catch (err) {
      if (err?.response?.status === 409) {
        // ya estaba -> quitar
        try {
          await api.delete(`/favorites/${id}`);
          // alert("Quitado de favoritos ✅");
        } catch (e2) {
          console.error(e2);
          alert(e2?.response?.data?.message || "No se pudo quitar de favoritos");
        }
      } else {
        console.error(err);
        alert(err?.response?.data?.message || "No se pudo agregar a favoritos");
      }
    }
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
            <PostCard post={p} onView={onView} onFav={onFav} />
          </div>
        ))}
      </div>
    </div>
  );
}
