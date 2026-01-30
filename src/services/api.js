import axios from "axios";

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000",
});

export function setAuthToken(token) {
  api.defaults.headers.common.Authorization = token ? `Bearer ${token}` : "";
}


export default api;
