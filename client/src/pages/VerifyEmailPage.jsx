import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setStatus("error");
      return;
    }
    axios
      .get(`${API_URL}/api/auth/verify-email?token=${token}`)
      .then(() => {
        setStatus("success");
        setTimeout(() => navigate("/login?verified=1"), 2500);
      })
      .catch(() => setStatus("error"));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="bg-slate-900 border border-white/10 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
        {status === "loading" && (
          <>
            <div className="w-12 h-12 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
            <h2 className="text-xl font-bold text-white mb-2">
              Verifying your email…
            </h2>
            <p className="text-slate-400 text-sm">Please wait a moment.</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-white mb-2">
              Email Verified!
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Your account is now active. Redirecting to sign in…
            </p>
            <Link
              to="/login"
              className="block w-full py-3 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold text-sm no-underline"
            >
              Sign In →
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-white mb-2">
              Link Invalid
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              This verification link is invalid or has expired. Please register
              again or request a new link.
            </p>
            <Link
              to="/register"
              className="block w-full py-3 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold text-sm no-underline"
            >
              Back to Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
