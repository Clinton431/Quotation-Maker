import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, handleGoogleCallback } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Query-param messages ───────────────────────────────────────────────────
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    if (p.get("verified") === "1")
      setInfo("Email verified! You can now sign in.");
    if (p.get("error") === "google_failed")
      setError("Google sign-in failed. Please try again.");
  }, [location.search]);

  // ── Consume Google OAuth redirect token ───────────────────────────────────
  useEffect(() => {
    const token = new URLSearchParams(location.search).get("token");
    if (!token) return;
    setLoading(true);
    handleGoogleCallback(token)
      .then((userData) => {
        window.history.replaceState({}, "", "/login");
        navigate(userData.role === "admin" ? "/admin" : "/", { replace: true });
      })
      .catch(() => {
        setError("Google sign-in failed. Please try again.");
        window.history.replaceState({}, "", "/login");
        setLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Email / password submit ────────────────────────────────────────────────
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const userData = await login(form.email, form.password);
      navigate(userData.role === "admin" ? "/admin" : "/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Check your credentials."
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-600/8 rounded-full blur-3xl pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(rgba(249,115,22,0.3) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.4)]">
              <span className="text-white font-black text-base">W</span>
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-sm leading-tight">
                Wimwa Tech
              </p>
              <p className="text-slate-500 text-xs">General Supplies Limited</p>
            </div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Welcome back
          </h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
          {/* Info banner */}
          {info && (
            <div className="mb-5 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm px-4 py-3 rounded-xl">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {info}
            </div>
          )}
          {/* Error banner */}
          {error && (
            <div className="mb-5 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* Google button — calls loginWithGoogle() which redirects */}
          <button
            onClick={loginWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all mb-5 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-slate-600 text-xs">
              or sign in with email
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Email / password form */}
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30 transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30 transition-all"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm bg-gradient-to-br from-orange-400 to-orange-600 shadow-[0_6px_24px_rgba(249,115,22,0.35)] hover:opacity-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/8 text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-orange-400 font-semibold hover:text-orange-300 transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          <Link to="/" className="hover:text-slate-400 transition-colors">
            ← Back to Shop
          </Link>
        </p>
      </div>
    </div>
  );
}
