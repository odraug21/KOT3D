import { useParams } from "react-router-dom";

export default function PostDetail() {
  const { id } = useParams();

  return (
    <div className="container py-4">
      <h2 className="fw-bold">Detalle publicación</h2>
      <p className="text-muted">ID: {id}</p>

      <div className="card p-4">
        <p className="m-0">
          Aquí irá el consumo real (GET /posts/:id) en el Hito 3.
        </p>
      </div>
    </div>
  );
}
