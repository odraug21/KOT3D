import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", // o import.meta.env.VITE_API_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // mismo nombre que guardas
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
