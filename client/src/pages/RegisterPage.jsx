import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const result = await register(form.name, form.email, form.password);

      if (result?.verificationPending) {
        // Future-proof: if backend ever adds email verification
        setSuccess(
          result.message ||
            "Account created! Please check your email before signing in."
        );
      } else {
        // This backend returns a token immediately — go straight to the shop
        navigate(result.role === "admin" ? "/admin" : "/", { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen (email verification flow) ───────────────────────────────
  if (success)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white mb-2">
            Check your inbox
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            {success}
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold text-sm hover:opacity-95 transition-all"
          >
            Go to Sign In →
          </button>
        </div>
      </div>
    );

  // ── Registration form ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
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
            Create account
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Get started with Wimwa Tech
          </p>
        </div>

        <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
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
              or register with email
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            {[
              {
                label: "Full Name",
                name: "name",
                type: "text",
                placeholder: "Jane Mwangi",
              },
              {
                label: "Email",
                name: "email",
                type: "email",
                placeholder: "you@example.com",
              },
              {
                label: "Password",
                name: "password",
                type: "password",
                placeholder: "Min. 6 characters",
              },
              {
                label: "Confirm Password",
                name: "confirm",
                type: "password",
                placeholder: "Repeat password",
              },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  {f.label}
                </label>
                <input
                  type={f.type}
                  required
                  value={form[f.name]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [f.name]: e.target.value }))
                  }
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30 transition-all"
                  placeholder={f.placeholder}
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm bg-gradient-to-br from-orange-400 to-orange-600 shadow-[0_6px_24px_rgba(249,115,22,0.35)] hover:opacity-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create Account →"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/8 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-orange-400 font-semibold hover:text-orange-300 transition-colors"
              >
                Sign in
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
