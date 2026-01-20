import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../views/public/Home";
import Login from "../views/public/Login";
import Register from "../views/public/Register";
import Store from "../views/private/Store";
import PostDetail from "../views/private/PostDetail";
import CreatePost from "../views/private/CreatePost";
import Profile from "../views/private/Profile";
import Favorites from "../views/private/Favorites";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRouter() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rutas Privadas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/store" element={<Store />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/favorites" element={<Favorites />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
