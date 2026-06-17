import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Loader2, Lock, Mail, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { BRAND } from "@/lib/brand";

export default function AdminLogin() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/admin/leads";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect.
  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Ingresá email y contraseña.");
      return;
    }
    setLoading(true);
    const res = await login(email.trim().toLowerCase(), password);
    setLoading(false);
    if (res.ok) {
      navigate(from, { replace: true });
    } else {
      setError(res.error || "No pudimos iniciar sesión.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="px-6 py-5 border-b border-slate-200 bg-white">
        <Link
          to="/"
          data-testid="admin-login-back-home"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al sitio
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <img
              src={BRAND.logoIcon}
              alt="Recorrido 360"
              className="h-14 w-14 object-contain mb-4"
            />
            <h1 className="font-heading text-3xl font-extrabold text-slate-900 tracking-tight">
              Panel admin
            </h1>
            <p className="text-slate-600 mt-2 text-sm">
              Acceso restringido al equipo de Recorrido 360.
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            data-testid="admin-login-form"
            className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-8 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.18)] space-y-5"
            noValidate
          >
            <div>
              <label
                htmlFor="admin-email"
                className="block text-sm font-semibold text-slate-800 mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="admin-input-email"
                  placeholder="hola@recorrido360.net"
                  className="w-full rounded-xl bg-white border border-slate-200 pl-10 pr-4 py-3 text-slate-900 text-[15px] outline-none transition focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-sm font-semibold text-slate-800 mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="admin-input-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-white border border-slate-200 pl-10 pr-4 py-3 text-slate-900 text-[15px] outline-none transition focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>
            </div>

            {error && (
              <div
                data-testid="admin-login-error"
                className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid="admin-login-submit"
              className="btn-primary w-full justify-center !py-3.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando…
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
