import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, TOKEN_KEY, formatApiError } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // user states:
  //   undefined → initial check in progress
  //   null      → not authenticated
  //   object    → authenticated user
  const [user, setUser] = useState(undefined);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const { data } = await api.get("/api/auth/me");
      setUser(data);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      localStorage.setItem(TOKEN_KEY, data.access_token);
      setUser(data.user);
      return { ok: true };
    } catch (err) {
      const msg = formatApiError(err?.response?.data?.detail) || err.message;
      return { ok: false, error: msg };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, refresh: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
