import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../state/AuthContext";

export default function AdminUsers() {
  const { isAdmin } = useAuth();

  const [q, setQ] = useState("");
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await api.get(`/admin/users?q=${encodeURIComponent(q)}&limit=80`);
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      setUsers([]);
      setMsg(err?.response?.data?.message || "No se pudieron cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const changeRole = async (id, role) => {
    if (workingId) return;
    setWorkingId(id);
    setMsg("");

    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      await load();
    } catch (err) {
      console.error(err);
      setMsg(err?.response?.data?.message || "No se pudo cambiar el rol");
    } finally {
      setWorkingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="container py-4" style={{ maxWidth: 980 }}>
        <div className="alert alert-danger mb-0">Acceso solo para administradores.</div>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: 980 }}>
      <div className="d-flex flex-column flex-md-row gap-2 align-items-md-center justify-content-between mb-3">
        <div>
          <h2 className="fw-bold m-0">Admin · Usuarios</h2>
          <div className="text-muted small">Gestiona roles (admin/user)</div>
        </div>

        <div className="d-flex gap-2">
          <input
            className="form-control"
            style={{ width: 320 }}
            placeholder="Buscar por nombre o email..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn btn-dark" onClick={load} disabled={loading}>
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>
      </div>

      {msg && <div className={`alert ${msg.includes("✅") ? "alert-success" : "alert-danger"}`}>{msg}</div>}
      {loading && <div className="alert alert-info">Cargando usuarios...</div>}

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: 70 }}>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th style={{ width: 120 }}>Rol</th>
                <th style={{ width: 280 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {!loading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-muted p-4">
                    No hay usuarios para mostrar.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isWorking = workingId === u.id;
                  const isAdminRole = u.role === "admin";

                  return (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td className="fw-semibold">{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${isAdminRole ? "bg-warning text-dark" : "bg-secondary"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="d-flex gap-2">
                        <button
                          className="btn btn-outline-success btn-sm"
                          disabled={isWorking || isAdminRole}
                          onClick={() => changeRole(u.id, "admin")}
                        >
                          {isWorking && !isAdminRole ? "..." : "Hacer admin"}
                        </button>

                        <button
                          className="btn btn-outline-danger btn-sm"
                          disabled={isWorking || !isAdminRole}
                          onClick={() => changeRole(u.id, "user")}
                        >
                          {isWorking && isAdminRole ? "..." : "Quitar admin"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-muted small mt-2">
        * El backend puede bloquear acciones si intentas quitar el último admin o al admin principal.
      </div>
    </div>
  );
}
