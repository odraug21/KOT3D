export default function PostCard({ post, onView, onFav }) {
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
          <button className="btn btn-outline-danger btn-sm" onClick={() => onFav(post.id)}>
            ❤
          </button>
        </div>
      </div>
    </div>
  );
}
