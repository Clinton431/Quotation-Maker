import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * AuthPromptModal
 * Shows when a guest tries to request a quotation.
 * On success, calls onAuthSuccess() so the parent can proceed with checkout.
 */
export default function AuthPromptModal({ onClose, onAuthSuccess, cartTotal }) {
  const { login, register, loginWithGoogle } = useAuth(); // ← added loginWithGoogle
  const navigate = useNavigate();
  const [mode, setMode] = useState("choice"); // "choice" | "login" | "register"
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      onAuthSuccess();
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      onAuthSuccess();
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Google sign-in — same as LoginPage, redirects to Google OAuth ─────────
  const handleGoogle = () => {
    loginWithGoogle(); // redirects away; no loading state needed
  };

  // ── Shared Google button — rendered in choice, login, and register modes ──
  const GoogleButton = () => (
    <button
      type="button"
      onClick={handleGoogle}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all disabled:opacity-50"
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
  );

  // ── Divider ───────────────────────────────────────────────────────────────
  const Divider = ({ label = "or" }) => (
    <div className="relative flex items-center gap-3">
      <div className="flex-1 h-px bg-slate-100" />
      <span className="text-[10px] text-slate-400 font-medium">{label}</span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 px-6 pt-6 pb-8">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-600/8 rounded-full blur-2xl pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-[0_4px_14px_rgba(249,115,22,0.4)]">
              <span className="text-white font-black text-sm">W</span>
            </div>
            <div>
              <p className="text-white font-black text-sm">Wimwa Tech</p>
              <p className="text-slate-400 text-[10px]">Quotation Request</p>
            </div>
          </div>

          <h2 className="text-white font-black text-xl leading-tight">
            Sign in to continue
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            We need your account to track your quotation and notify you of
            updates.
          </p>

          {cartTotal > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/25 px-3 py-1.5 rounded-xl">
              <span className="text-orange-400 text-[10px] font-bold">
                Cart total:
              </span>
              <span className="text-orange-300 font-black text-sm">
                Ksh {cartTotal?.toLocaleString("en-KE")}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* ── Choice screen ── */}
          {mode === "choice" && (
            <div className="space-y-3">
              {/* Google — top of choice screen */}
              <GoogleButton />

              <Divider label="or sign in with email" />

              <button
                onClick={() => setMode("login")}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm rounded-2xl shadow-[0_4px_16px_rgba(249,115,22,0.3)] hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                Sign In with Email
              </button>
              <button
                onClick={() => setMode("register")}
                className="w-full py-3.5 border-2 border-slate-200 text-slate-700 font-bold text-sm rounded-2xl hover:border-orange-300 hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
              >
                Create Free Account
              </button>

              <Divider />

              <button
                onClick={() => {
                  onClose();
                  navigate("/request-quotation", {
                    state: { guestMode: true },
                  });
                }}
                className="w-full py-3 border border-slate-200 text-slate-500 font-semibold text-xs rounded-2xl hover:bg-slate-50 transition-all"
              >
                Continue as guest (no order tracking)
              </button>
              <p className="text-center text-[10px] text-slate-400 mt-2">
                Signing in lets you track quotation status from your account.
              </p>
            </div>
          )}

          {/* ── Login screen ── */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  setMode("choice");
                  setError("");
                }}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 mb-1 transition-colors"
              >
                ← Back
              </button>
              <h3 className="font-black text-slate-900">Sign in</h3>

              {error && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-500 text-xs px-3 py-2.5 rounded-xl">
                  ⚠️ {error}
                </div>
              )}

              {/* Google on login screen too */}
              <GoogleButton />
              <Divider label="or use email" />

              {[
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
                  placeholder: "••••••••",
                },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-widest">
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={form[f.name]}
                    onChange={(e) => set(f.name, e.target.value)}
                    placeholder={f.placeholder}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-300 focus:bg-white transition-all"
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm rounded-xl disabled:opacity-60 flex items-center justify-center gap-2 hover:opacity-95 transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign In & Continue →"
                )}
              </button>

              <p className="text-center text-xs text-slate-400">
                No account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className="text-orange-500 font-bold hover:text-orange-600 transition-colors"
                >
                  Create one free
                </button>
              </p>
            </form>
          )}

          {/* ── Register screen ── */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setMode("choice");
                  setError("");
                }}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 mb-1 transition-colors"
              >
                ← Back
              </button>
              <h3 className="font-black text-slate-900">Create account</h3>

              {error && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-500 text-xs px-3 py-2.5 rounded-xl">
                  ⚠️ {error}
                </div>
              )}

              {/* Google on register screen too */}
              <GoogleButton />
              <Divider label="or register with email" />

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
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-widest">
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={form[f.name]}
                    onChange={(e) => set(f.name, e.target.value)}
                    placeholder={f.placeholder}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-300 focus:bg-white transition-all"
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm rounded-xl disabled:opacity-60 flex items-center justify-center gap-2 hover:opacity-95 transition-all mt-1"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating account…
                  </>
                ) : (
                  "Create Account & Continue →"
                )}
              </button>

              <p className="text-center text-xs text-slate-400">
                Have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="text-orange-500 font-bold hover:text-orange-600 transition-colors"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
