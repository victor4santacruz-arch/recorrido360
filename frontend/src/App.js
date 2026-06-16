import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "@/pages/Landing";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminLeads from "@/pages/admin/AdminLeads";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/leads"
              element={
                <ProtectedRoute>
                  <AdminLeads />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
