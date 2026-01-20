export default function PostCard({ post, onView }) {
  return (
    <div className="card h-100">
      <img src={post.cover_url} className="card-img-top" alt={post.title} />
      <div className="card-body">
        <h5 className="card-title">{post.title}</h5>
        <p className="card-text">${post.price}</p>
        <button className="btn btn-primary" onClick={() => onView(post.id)}>
          Ver detalle
        </button>
      </div>
    </div>
  );
}
