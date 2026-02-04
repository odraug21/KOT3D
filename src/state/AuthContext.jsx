import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const login = ({ token: t, user: u }) => {
    setToken(t || "");
    setUser(u ? { ...u, role: u.role || "user" } : null);
  };

  // ✅ NUEVO: actualiza solo user, NO toca token
  const updateUser = (patchOrUser) => {
    if (!patchOrUser) return;
    // si viene un objeto completo, lo usamos; si viene un patch, lo mezclamos
    setUser((prev) => {
      const next = patchOrUser?.id ? patchOrUser : { ...(prev || {}), ...(patchOrUser || {}) };
      return next ? { ...next, role: next.role || "user" } : null;
    });
  };

  const logout = () => {
    setToken("");
    setUser(null);
  };

  const value = useMemo(() => {
    const isLoggedIn = !!token;
    const isAdmin = user?.role === "admin";

    return { token, user, login, updateUser, logout, isLoggedIn, isAdmin };
  }, [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
