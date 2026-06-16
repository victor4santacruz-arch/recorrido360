import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const API_BASE = `${BACKEND_URL}/api`;
export const TOKEN_KEY = "r360_admin_token";

export const api = axios.create({
  baseURL: BACKEND_URL,
});

// Attach Bearer token to every request when present.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to /admin/login on 401 for admin-protected routes.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";
    if (status === 401 && url.includes("/api/") && !url.includes("/api/auth/login")) {
      localStorage.removeItem(TOKEN_KEY);
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
        window.location.replace("/admin/login");
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Convert FastAPI error.detail (string | array of {msg} | object) into a single string.
 */
export function formatApiError(detail) {
  if (detail == null) return "Ocurrió un error. Probá de nuevo.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" · ");
  }
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}
