import axios from "axios";

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const baseURL =
  process.env.REACT_APP_API_URL ||
  (isLocalhost
    ? "http://localhost:3000"
    : "https://kot3d-production.up.railway.app"); // fallback prod

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
