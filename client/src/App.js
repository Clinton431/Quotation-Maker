import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import QuotationPage from "./pages/QuotationPage";
import DeliveryNotePage from "./pages/DeliveryNotePage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import AdminDashboard from "./pages/AdminDashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";
import MyOrdersPage from "./pages/MyOrdersPage";
import QuotationRequestPage from "./pages/QuotationRequestPage";

// ── Spinner ────────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ── PrivateRoute: any logged-in user ───────────────────────────────────────────
// Waits for AuthContext to finish restoring the session before deciding
// whether to redirect. Without the `loading` check, a refresh causes a
// brief null-user state that immediately redirects to /login.
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ── AdminRoute: admin role only ────────────────────────────────────────────────
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;
  return children;
}

// ── Routes ─────────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public — no auth required */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<Terms />} />

      {/* Quotation request — open to all visitors */}
      <Route path="/request-quotation" element={<QuotationRequestPage />} />

      {/* Logged-in users only */}
      <Route
        path="/my-orders"
        element={
          <PrivateRoute>
            <MyOrdersPage />
          </PrivateRoute>
        }
      />

      {/* Admin only */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/quotation"
        element={
          <AdminRoute>
            <QuotationPage />
          </AdminRoute>
        }
      />
      <Route
        path="/delivery-note"
        element={
          <AdminRoute>
            <DeliveryNotePage />
          </AdminRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
