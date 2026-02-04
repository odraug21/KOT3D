import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

export default function UploadProof() {
  const { id } = useParams(); // order id
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!file) {
      setMsg("Debes seleccionar un archivo (imagen o PDF).");
      return;
    }

    // Validación simple (opcional)
    const maxMb = 8;
    if (file.size > maxMb * 1024 * 1024) {
      setMsg(`El archivo supera ${maxMb}MB. Intenta con uno más liviano.`);
      return;
    }

    const form = new FormData();
    form.append("proof", file);

    try {
      setSending(true);

      // ✅ endpoint backend
      await api.post(`/orders/${id}/proof`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setOk(true);
    } catch (err) {
      console.error(err);
      setMsg(err?.response?.data?.message || "No se pudo subir el comprobante.");
    } finally {
      setSending(false);
    }
  };

  if (ok) {
    return (
      <div className="container py-4" style={{ maxWidth: 720 }}>
        <h2 className="fw-bold">Comprobante enviado ✅</h2>
        <div className="alert alert-success mt-3">
          Recibimos tu comprobante. En breve validaremos el pago.
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={() => navigate("/store")}>
            Volver a la tienda
          </button>
          <button className="btn btn-outline-secondary" onClick={() => navigate("/my-orders")}>
            Ver mis compras
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: 720 }}>
      <h2 className="fw-bold">Subir comprobante</h2>

      <div className="alert alert-info mt-3">
        Orden: <b>#{id}</b> — Sube una imagen (JPG/PNG) o PDF del comprobante.
      </div>

      <form className="card mt-3" onSubmit={onSubmit}>
        <div className="card-body">
          <label className="form-label fw-semibold">Archivo</label>
          <input
            type="file"
            className="form-control"
            accept="image/*,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          {file && (
            <div className="text-muted small mt-2">
              Seleccionado: <b>{file.name}</b>
            </div>
          )}

          {msg && <div className="alert alert-danger mt-3 mb-0">{msg}</div>}

          <div className="d-flex gap-2 mt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate(-1)}
              disabled={sending}
            >
              Volver
            </button>

            <button type="submit" className="btn btn-primary" disabled={sending}>
              {sending ? "Subiendo..." : "Enviar comprobante"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
