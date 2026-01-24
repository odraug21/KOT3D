import { useAuth } from "../../state/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="container py-4" style={{ maxWidth: 720 }}>
      <h2 className="fw-bold mb-3">Mi perfil</h2>

      <div className="card p-4">
        <div><b>Nombre:</b> {user?.name}</div>
        <div><b>Email:</b> {user?.email}</div>
        <div className="text-muted mt-2 small">
          En Hito 3 esto se alimenta desde GET /users/me
        </div>
      </div>
    </div>
  );
}
