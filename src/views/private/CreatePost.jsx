import { useState } from "react";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Publicación creada (demo): ${title} - $${price}`);
    setTitle("");
    setPrice("");
  };

  return (
    <div className="container py-4" style={{ maxWidth: 720 }}>
      <h2 className="fw-bold mb-3">Crear publicación</h2>

      <form className="card p-4" onSubmit={handleSubmit}>
        <label className="form-label">Título</label>
        <input className="form-control mb-3" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label className="form-label">Precio</label>
        <input className="form-control mb-3" value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="0" required />

        <button className="btn btn-dark" type="submit">
          Publicar (demo)
        </button>
      </form>
    </div>
  );
}
