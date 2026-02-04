import { useState } from "react";

export default function AdminImagenes() {
  const [file, setFile] = useState(null);
  const [key, setKey] = useState("");
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState("");

  const upload = async () => {
    if (!file) return setStatus("Selecciona una imagen.");
    if (!key) return setStatus("Ingresa la clave UPLOAD_KEY.");

    setStatus("Subiendo...");
    setResultUrl("");

    const fd = new FormData();
    fd.append("file", file);

    const r = await fetch("/api/upload", {
      method: "POST",
      headers: { "x-upload-key": key },
      body: fd,
    });

    const data = await r.json();

    if (!r.ok) {
      setStatus(`${data?.error || "Error"}${data?.details ? " - " + data.details : ""}`);
      return;
    }

    setStatus("Listo ✅ (espera a que termine el deploy de Vercel)");
    setResultUrl(data.publicUrl); // /banco/xxxx.webp
  };

  return (
    <div className="container" style={{ maxWidth: 650, margin: "30px auto" }}>
      <h2>Subir imágenes a /banco</h2>
      <p>
        Esto sube el archivo al repo en <code>public/banco/</code>. Luego Vercel redeploy y queda disponible
        con ruta <code>/banco/archivo.webp</code>.
      </p>

      <div style={{ marginTop: 16 }}>
        <label style={{ display: "block", marginBottom: 6 }}>Clave (UPLOAD_KEY)</label>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Escribe tu UPLOAD_KEY"
          style={{ width: "100%", padding: 10, marginBottom: 12 }}
        />

        <label style={{ display: "block", marginBottom: 6 }}>Imagen</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button onClick={upload} style={{ display: "block", marginTop: 12 }}>
          Subir
        </button>
      </div>

      {status && <p style={{ marginTop: 12 }}>{status}</p>}

      {resultUrl && (
        <div style={{ marginTop: 12 }}>
          <p>Ruta para usar en productos:</p>
          <code style={{ fontSize: 14 }}>{resultUrl}</code>
          <div style={{ marginTop: 12 }}>
            <img
              src={resultUrl}
              alt="preview"
              style={{ maxWidth: "100%", border: "1px solid #ddd" }}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <p style={{ fontSize: 12, opacity: 0.8 }}>
              Si aún no se ve, espera el redeploy de Vercel y recarga.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
