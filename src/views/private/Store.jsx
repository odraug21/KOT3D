import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PostCard from "../../components/PostCard";

const MOCK_POSTS = [
  { id: 1, title: "Figura Anime 10cm", category: "Anime", price: 12990, cover_url: "https://picsum.photos/seed/kot1/600/400" },
  { id: 2, title: "Mini Me Personalizado", category: "Personalizadas", price: 59990, cover_url: "https://picsum.photos/seed/kot2/600/400" },
  { id: 3, title: "Figura Gaming", category: "Gaming", price: 14990, cover_url: "https://picsum.photos/seed/kot3/600/400" },
];

export default function Store() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // En Hito 3 esto se reemplaza por GET /posts
    setPosts(MOCK_POSTS);
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return posts;
    return posts.filter((p) => p.title.toLowerCase().includes(s));
  }, [posts, search]);

  const onView = (id) => navigate(`/posts/${id}`);
  const onFav = (id) => {
    // En Hito 3: POST /favorites
    alert(`Agregado a favoritos (demo): post ${id}`);
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
