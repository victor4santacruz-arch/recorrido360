import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (user === undefined) {
    return (
      <div
        data-testid="admin-loading"
        className="min-h-screen flex items-center justify-center bg-slate-50"
      >
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }
  if (!user) {
    return (
      <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
    );
  }
  return children;
}
