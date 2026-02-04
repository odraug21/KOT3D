// api/upload.js
import Busboy from "busboy";

export const config = {
  api: { bodyParser: false }, // necesario para multipart/form-data
};

function readFileFromRequest(req, { maxBytes = 6 * 1024 * 1024 } = {}) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: req.headers,
      limits: { fileSize: maxBytes, files: 1 },
    });

    let fileBuffer = null;
    let fileName = null;
    let mimeType = null;

    busboy.on("file", (_fieldname, file, info) => {
      fileName = info.filename || "image";
      mimeType = info.mimeType || "application/octet-stream";

      const chunks = [];
      file.on("data", (d) => chunks.push(d));
      file.on("limit", () => reject(new Error("Archivo demasiado grande")));
      file.on("end", () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    busboy.on("error", reject);
    busboy.on("finish", () => {
      if (!fileBuffer) return reject(new Error("No se recibió archivo"));
      resolve({ fileBuffer, fileName, mimeType });
    });

    req.pipe(busboy);
  });
}

function safeFileName(original) {
  // evita espacios, tildes raras y rutas
  const clean = original
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.\-_]/g, "")
    .replace(/-+/g, "-");

  // agrega timestamp para evitar colisiones
  const dot = clean.lastIndexOf(".");
  const base = dot > 0 ? clean.slice(0, dot) : clean;
  const ext = dot > 0 ? clean.slice(dot) : "";
  return `${base || "img"}-${Date.now()}${ext || ".webp"}`;
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método no permitido" });
    }

    // Seguridad simple (mínimo): una clave secreta en header
    const uploadKey = req.headers["x-upload-key"];
    if (!process.env.UPLOAD_KEY || uploadKey !== process.env.UPLOAD_KEY) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const { fileBuffer, fileName, mimeType } = await readFileFromRequest(req);

    // Permitir solo imágenes
    if (!mimeType.startsWith("image/")) {
      return res.status(400).json({ error: "Solo se permiten imágenes" });
    }

    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || "main";
    const token = process.env.GITHUB_TOKEN;

    if (!owner || !repo || !token) {
      return res.status(500).json({ error: "Faltan variables de GitHub" });
    }

    const finalName = safeFileName(fileName);
    const pathInRepo = `public/banco/${finalName}`;
    const contentBase64 = fileBuffer.toString("base64");

    const ghUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(
      pathInRepo
    )}`;

    const response = await fetch(ghUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({
        message: `Add image ${finalName}`,
        content: contentBase64,
        branch,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: "No se pudo subir a GitHub",
        details: data?.message || data,
      });
    }

    // URL pública final (cuando Vercel redeploy termine)
    const publicUrl = `/banco/${finalName}`;

    return res.status(200).json({
      ok: true,
      file: finalName,
      publicUrl,
      note: "Se verá en la web cuando termine el redeploy de Vercel.",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Error" });
  }
}
