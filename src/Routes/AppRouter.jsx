import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../views/public/Home";
import Login from "../views/public/Login";
import Register from "../views/public/Register";

import Store from "../views/private/Store";
import PostDetail from "../views/private/PostDetail";

import CreatePost from "../views/private/CreatePost";
import Profile from "../views/private/Profile";
import Favorites from "../views/private/Favorites";
import MyPosts from "../views/private/MyPosts";
import EditPost from "../views/private/Editpost";

import AdminImagenes from "../pages/AdminImagenes";
import AdminUsers from "../pages/Admin/AdminUsers";

import CartPage from "../pages/Cart/Cart";
import UploadProof from "../pages/Orders/UploadProof";

import ProtectedRoute from "./ProtectedRoute";

export default function AppRouter() {
  return (
    <Routes>
      {/* ✅ Rutas Públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ✅ E-commerce público */}
      <Route path="/store" element={<Store />} />
      <Route path="/posts/:id" element={<PostDetail />} />
      <Route path="/cart" element={<CartPage />} />

      {/* ✅ Rutas Privadas (solo usuarios registrados) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/create" element={<CreatePost />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/my-posts" element={<MyPosts />} />
        <Route path="/posts/:id/edit" element={<EditPost />} />

        {/* ✅ Admin (por ahora: solo logeado; lo hacemos solo-admin si quieres) */}
        <Route path="/admin/imagenes" element={<AdminImagenes />} />
        <Route path="/admin/users" element={<AdminUsers />} />

        {/* ✅ Subir comprobante (solo logeado) */}
        <Route path="/orders/:id/proof" element={<UploadProof />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
