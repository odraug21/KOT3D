import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function CreatePost() {
  const navigate = useNavigate();

  // form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // categories
  const [categories, setCategories] = useState([]);
  const [catMsg, setCatMsg] = useState("");

  // images: trabajamos con URLs porque tu backend guarda image_url
  const [imageUrl, setImageUrl] = useState(""); // input para pegar URL
  const [images, setImages] = useState([]); // array de urls

  // upload (opcional si tienes endpoint)
  const [uploading, setUploading] = useState(false);

  // UI
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Cargar categorías
  useEffect(() => {
    let alive = true;

    async function loadCategories() {
      setCatMsg("");
      try {
        const res = await api.get("/categories");
        if (!alive) return;
        setCategories(res.data || []);
        // auto seleccionar primera si viene
        if ((res.data || []).length && !categoryId) {
          setCategoryId(String(res.data[0].id));
        }
      } catch (err) {
        if (!alive) return;
        setCatMsg("No se pudieron cargar categorías");
      }
    }

    loadCategories();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCLP = (n) =>
    (Number(n) || 0).toLocaleString("es-CL", { style: "currency", currency: "CLP" });

  const canSubmit = useMemo(() => {
    return (
      title.trim().length > 0 &&
      categoryId &&
      price !== "" &&
      Number(price) >= 0
    );
  }, [title, categoryId, price]);

  const addImageUrl = () => {
    const url = imageUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      setMsg("La URL de imagen debe comenzar con http:// o https://");
      return;
    }
    if (images.includes(url)) {
      setMsg("Esa imagen ya fue agregada.");
      return;
    }
    setImages((prev) => [...prev, url]);
    setImageUrl("");
    setMsg("");
  };

  const removeImage = (url) => {
    setImages((prev) => prev.filter((x) => x !== url));
  };

  // ✅ OPCIONAL: subir archivo real si tienes endpoint /uploads
  // Backend debería devolver: { url: "https://..." } o { url: "/uploads/archivo.jpg" }
  const onUploadFiles = async (files) => {
    if (!files || files.length === 0) return;

    // Si no tienes endpoint /uploads, comenta esta función y usa solo URL.
    try {
      setUploading(true);
      setMsg("");

      for (const file of files) {
        const form = new FormData();
        form.append("file", file);

        // ✅ Necesitas tener /uploads en backend
        const res = await api.post("/uploads", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const url = res?.data?.url;
        if (url && !images.includes(url)) {
          setImages((prev) => [...prev, url]);
        }
      }
    } catch (err) {
      console.error(err);
      setMsg(err?.response?.data?.message || "No se pudo subir la imagen. Usa URL por ahora.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || loading) return;

    setLoading(true);
    setMsg("");

    try {
      const payload = {
        title: title.trim(),
        description: description?.trim() || "",
        price: Number(price),
        category_id: Number(categoryId),
        images, // array de urls
      };

      const res = await api.post("/posts", payload);

      // ✅ ir a mis publicaciones o a detalle del post creado
      // res.data = { id: postId }
      const newId = res?.data?.id;
      if (newId) navigate(`/posts/${newId}`);
      else navigate("/my-posts");
    } catch (err) {
      console.error(err);
      setMsg(err?.response?.data?.message || "No se pudo crear la publicación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 820 }}>
      <h2 className="fw-bold mb-3">Crear publicación</h2>

      <form className="card p-4" onSubmit={handleSubmit}>
        {/* Título */}
        <label className="form-label">Título</label>
        <input
          className="form-control mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* Categoría */}
        <label className="form-label">Categoría</label>
        <select
          className="form-select mb-3"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {catMsg && <div className="text-danger small mb-3">{catMsg}</div>}

        {/* Descripción */}
        <label className="form-label">Descripción</label>
        <textarea
          className="form-control mb-3"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe el producto (material, tamaño, colores, tiempos, etc.)"
        />

        {/* Precio */}
        <label className="form-label">Precio (CLP)</label>
        <input
          className="form-control mb-1"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
          min="0"
          required
        />
        <div className="text-muted small mb-3">
          Vista: <b>{formatCLP(price)}</b>
        </div>

        <hr />

        {/* ✅ Imágenes - Opción A: URL */}
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="m-0">Imágenes</h5>
          <span className="text-muted small">
            (puedes usar URL o subir archivos si tienes /uploads)
          </span>
        </div>

        <div className="input-group mt-2">
          <input
            className="form-control"
            placeholder="Pega URL de la imagen (https://...)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <button type="button" className="btn btn-outline-dark" onClick={addImageUrl}>
            Agregar
          </button>
        </div>

        {/* ✅ Imágenes - Opción B: Subir archivo (si backend lo soporta) */}
        <div className="mt-3">
          <label className="form-label">Subir imágenes (opcional)</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={(e) => onUploadFiles(e.target.files)}
          />
          {uploading && <div className="text-muted small mt-2">Subiendo...</div>}
          <div className="text-muted small mt-1">
            Si tu backend aún no tiene <b>/uploads</b>, usa URLs por ahora.
          </div>
        </div>

        {/* Preview */}
        {images.length > 0 && (
          <div className="mt-3">
            <div className="row g-2">
              {images.map((url) => (
                <div className="col-6 col-md-4 col-lg-3" key={url}>
                  <div className="card">
                    <img
                      src={url}
                      alt="preview"
                      style={{ width: "100%", height: 140, objectFit: "cover" }}
                      onError={(e) => {
                        e.currentTarget.style.opacity = 0.4;
                      }}
                    />
                    <div className="p-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger w-100"
                        onClick={() => removeImage(url)}
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {msg && <div className="alert alert-danger mt-3">{msg}</div>}

        <button className="btn btn-dark mt-3" type="submit" disabled={!canSubmit || loading}>
          {loading ? "Publicando..." : "Publicar"}
        </button>
      </form>
    </div>
  );
}
