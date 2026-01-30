import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../state/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const { login } = useAuth(); // ✅ este sí existe en tu contexto

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg("");

console.log("REACT_APP_API_URL:", process.env.REACT_APP_API_URL);
console.log("AXIOS baseURL:", api.defaults.baseURL);




    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;

      // ✅ Actualiza estado global + localStorage (tu AuthContext ya lo persiste)
      login({ token, user });

      // opcional: redirigir a tienda o home
      navigate("/store"); // o "/" según tus rutas
    } catch (err) {
      setMsg(err?.response?.data?.message || "Error al iniciar sesión");
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit">Entrar</button>
      </form>

      {msg && <p>{msg}</p>}
    </div>
  );
}
