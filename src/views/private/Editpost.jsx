import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [images, setImages] = useState([""]);
  const [categories, setCategories] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setMsg("");

        const [postRes, catRes] = await Promise.all([
          api.get(`/posts/${id}`),
          api.get(`/categories`),
        ]);

        const p = postRes.data;

        setTitle(p.title || "");
        setDescription(p.description || "");
        setPrice(p.price ?? "");
        setCategoryId(String(p.category_id ?? ""));
        setImages(p.images && p.images.length ? p.images : [""]);

        // Esperado: [{id, name}, ...]
        setCategories(Array.isArray(catRes.data) ? catRes.data : []);
      } catch (err) {
        setMsg(err?.response?.data?.message || "No se pudo cargar el post");
      }
    })();
  }, [id]);

  const addImage = () => setImages((prev) => [...prev, ""]);
  const removeImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));
  const updateImage = (idx, value) =>
    setImages((prev) => prev.map((x, i) => (i === idx ? value : x)));

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      await api.put(`/posts/${id}`, {
        title,
        description,
        price: Number(price),
        category_id: Number(categoryId),
        images: images.map((x) => x.trim()).filter(Boolean),
      });

      navigate(`/posts/${id}`);
    } catch (err) {
      setMsg(err?.response?.data?.message || "Error al actualizar");
    }
  };

  return (
    <div className="container py-4">
      <h2 className="fw-bold">Editar publicación</h2>

      <form onSubmit={onSubmit} className="mt-3">
        <div className="mb-2">
          <label className="form-label">Título</label>
          <input
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-2">
          <label className="form-label">Descripción</label>
          <textarea
            className="form-control"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="mb-2">
          <label className="form-label">Precio</label>
          <input
            className="form-control"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Categoría</label>
          <select
            className="form-select"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">-- Selecciona --</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>

          {!categoryId && (
            <small className="text-muted">
              Selecciona una categoría antes de guardar.
            </small>
          )}
        </div>

        <div className="card p-3 mb-3">
          <div className="d-flex align-items-center justify-content-between">
            <strong>Imágenes (URLs)</strong>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={addImage}
            >
              + Agregar
            </button>
          </div>

          {images.map((url, idx) => (
            <div className="d-flex gap-2 mt-2" key={idx}>
              <input
                className="form-control"
                placeholder="https://..."
                value={url}
                onChange={(e) => updateImage(idx, e.target.value)}
              />
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => removeImage(idx)}
                disabled={images.length === 1}
                title={images.length === 1 ? "Debe quedar al menos 1 campo" : "Eliminar"}
              >
                X
              </button>
            </div>
          ))}
        </div>

        <button className="btn btn-primary" disabled={!categoryId || !title.trim()}>
          Guardar cambios
        </button>

        {msg && <p className="mt-3 text-danger">{msg}</p>}
      </form>
    </div>
  );
}
