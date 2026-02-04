import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../state/AuthContext";
import api from "../../services/api";

export default function Cart() {
  const { items, setQty, removeFromCart, clearCart, total } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [paying, setPaying] = useState(false);
  const [order, setOrder] = useState(null);
  const [msg, setMsg] = useState("");

  const formatCLP = (n) =>
    (Number(n) || 0).toLocaleString("es-CL", { style: "currency", currency: "CLP" });

  const handlePayTransfer = async () => {
    // ✅ Solo registrados
    if (!token) {
      navigate("/login");
      return;
    }

    if (paying) return;
    setPaying(true);
    setMsg("");

    try {
      const payload = {
        items: items.map((it) => ({
          post_id: it.id,
          qty: it.qty,
          unit_price: it.price,
        })),
        total,
        currency: "CLP",
        payment_method: "transfer",
      };

      const res = await api.post("/orders/transfer", payload);
      setOrder(res.data);
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        navigate("/login");
        return;
      }
      console.error(err);
      setMsg(err?.response?.data?.message || "No se pudo iniciar el pago por transferencia");
    } finally {
      setPaying(false);
    }
  };

  // ✅ Si ya existe la orden, mostramos instrucciones
  if (order) {
    const bank = order.bank || {};
    return (
      <div className="container py-4">
        <h2 className="fw-bold">Pago por transferencia</h2>

        <div className="alert alert-success mt-3">
          Orden creada ✅ <b>{order.order_code || order.order_id}</b>
        </div>

        <div className="card mt-3">
          <div className="card-body">
            <h5 className="fw-bold mb-3">Datos para transferir</h5>

            <div className="mb-2">
              <b>Monto:</b> {formatCLP(order.amount ?? total)}
            </div>

            <div className="mb-2">
              <b>Referencia / Comentario:</b>{" "}
              <span className="badge bg-dark">{order.order_code || order.order_id}</span>
            </div>

            <hr />

            <div className="row g-2">
              <div className="col-12 col-md-6">
                <div><b>Banco:</b> {bank.name || "—"}</div>
                <div><b>Tipo cuenta:</b> {bank.account_type || "—"}</div>
                <div><b>N° cuenta:</b> {bank.account_number || "—"}</div>
              </div>
              <div className="col-12 col-md-6">
                <div><b>RUT:</b> {bank.rut || "—"}</div>
                <div><b>Titular:</b> {bank.holder || "—"}</div>
                <div><b>Email:</b> {bank.email || "—"}</div>
              </div>
            </div>

            {order.instructions && (
              <>
                <hr />
                <div className="text-muted">{order.instructions}</div>
              </>
            )}

            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-outline-secondary" onClick={() => setOrder(null)}>
                Volver
              </button>

              <button
                className="btn btn-primary"
                onClick={() => navigate(`/orders/${order.order_id}/proof`)}
              >
                Ya transferí / Subir comprobante
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Vista normal carrito
  return (
    <div className="container py-4">
      <h2 className="fw-bold">Carrito</h2>

      {items.length === 0 ? (
        <div className="alert alert-info mt-3">Tu carrito está vacío.</div>
      ) : (
        <>
          <div className="list-group mt-3">
            {items.map((it) => (
              <div className="list-group-item d-flex gap-3 align-items-center" key={it.id}>
                {it.cover_url ? (
                  <img
                    src={it.cover_url}
                    alt={it.title}
                    style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8 }}
                  />
                ) : (
                  <div style={{ width: 72, height: 72, background: "#eee", borderRadius: 8 }} />
                )}

                <div className="flex-grow-1">
                  <div className="fw-semibold">{it.title}</div>
                  <div className="text-muted">{formatCLP(it.price)}</div>
                </div>

                <input
                  type="number"
                  min={1}
                  className="form-control"
                  style={{ width: 90 }}
                  value={it.qty}
                  onChange={(e) => setQty(it.id, e.target.value)}
                />

                <div className="fw-semibold" style={{ width: 140, textAlign: "right" }}>
                  {formatCLP(it.price * it.qty)}
                </div>

                <button className="btn btn-outline-danger" onClick={() => removeFromCart(it.id)}>
                  Quitar
                </button>
              </div>
            ))}
          </div>

          {msg && <div className="alert alert-danger mt-3">{msg}</div>}

          <div className="d-flex justify-content-between align-items-center mt-3">
            <button className="btn btn-outline-secondary" onClick={clearCart}>
              Vaciar carrito
            </button>

            <div className="fs-5 fw-bold">Total: {formatCLP(total)}</div>

            <button className="btn btn-primary" onClick={handlePayTransfer} disabled={paying}>
              {paying ? "Generando orden..." : "Pagar"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
