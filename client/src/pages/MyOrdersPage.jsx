import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function authAxios() {
  const token = localStorage.getItem("wt_token");
  return axios.create({
    baseURL: API_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending Review",
    icon: "⏳",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
    bar: "bg-amber-400",
    step: 1,
    message:
      "We've received your quotation request and will review it shortly.",
  },
  processing: {
    label: "Processing",
    icon: "⚙️",
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    dot: "bg-sky-500",
    bar: "bg-sky-400",
    step: 2,
    message: "Our team is preparing your formal quotation document.",
  },
  sent: {
    label: "Quotation Sent",
    icon: "📨",
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    dot: "bg-violet-500",
    bar: "bg-violet-400",
    step: 3,
    message: "Your quotation has been sent. Please check your email.",
  },
  approved: {
    label: "Approved",
    icon: "✅",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    bar: "bg-emerald-400",
    step: 4,
    message: "Your order has been confirmed. We'll be in touch about delivery.",
  },
  rejected: {
    label: "Declined",
    icon: "❌",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-500",
    bar: "bg-rose-400",
    step: 0,
    message:
      "This quotation was declined. Please contact us for more information.",
  },
};

const STEPS = ["pending", "processing", "sent", "approved"];

function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function ProgressBar({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  if (status === "rejected") {
    return (
      <div className="flex items-center gap-2 mt-3">
        <div className="flex-1 h-1.5 bg-rose-100 rounded-full overflow-hidden">
          <div className="h-full bg-rose-400 rounded-full w-full" />
        </div>
        <span className="text-[10px] font-bold text-rose-500">Declined</span>
      </div>
    );
  }
  const pct = (cfg.step / STEPS.length) * 100;
  return (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-1.5">
        {STEPS.map((step, i) => {
          const sc = STATUS_CONFIG[step];
          const done = cfg.step > i + 1;
          const active = cfg.step === i + 1;
          return (
            <div
              key={step}
              className="flex flex-col items-center gap-1"
              style={{ flex: 1 }}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black transition-all ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                    ? `${cfg.dot} text-white`
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {done ? "✓" : i + 1}
              </div>
              <span
                className={`text-[8px] font-semibold text-center leading-tight ${
                  active ? cfg.text : "text-slate-400"
                }`}
              >
                {sc.label.split(" ")[0]}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mx-2.5">
        <div
          className={`h-full ${cfg.bar} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function QuotationCard({ quotation }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[quotation.status] || STATUS_CONFIG.pending;
  const date = new Date(quotation.createdAt);

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 ${cfg.border}`}
    >
      {/* Top accent bar */}
      <div className={`h-1 w-full ${cfg.bar}`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                #
                {quotation.quoteNumber ||
                  quotation._id?.slice(-6).toUpperCase()}
              </span>
              <span className="text-[10px] text-slate-300">·</span>
              <span className="text-[10px] text-slate-400">
                {date.toLocaleDateString("en-KE", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <p className="font-bold text-slate-900 text-sm">
              {quotation.items?.length} item
              {quotation.items?.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={quotation.status} />
            <p className="text-lg font-black text-orange-500">
              Ksh {quotation.total?.toLocaleString("en-KE")}
            </p>
          </div>
        </div>

        {/* Progress tracker */}
        <ProgressBar status={quotation.status} />

        {/* Status message */}
        <div
          className={`mt-3 px-3 py-2.5 rounded-xl text-xs ${cfg.bg} ${cfg.text} flex items-start gap-2`}
        >
          <span className="flex-shrink-0 mt-0.5">{cfg.icon}</span>
          <p>{cfg.message}</p>
        </div>

        {/* Admin notes */}
        {quotation.adminNotes && (
          <div className="mt-2 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 flex items-start gap-2">
            <span className="flex-shrink-0 mt-0.5">💬</span>
            <div>
              <p className="font-bold mb-0.5">Note from our team:</p>
              <p>{quotation.adminNotes}</p>
            </div>
          </div>
        )}

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
        >
          {expanded ? "Hide items ▲" : "View items ▼"}
        </button>

        {expanded && (
          <div className="mt-3 space-y-2 pt-3 border-t border-slate-50">
            {quotation.items?.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl"
              >
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 overflow-hidden flex-shrink-0">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg">
                      📦
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Qty: {item.qty} × Ksh {item.price?.toLocaleString("en-KE")}
                  </p>
                </div>
                <p className="text-xs font-bold text-orange-500">
                  Ksh {item.subtotal?.toLocaleString("en-KE")}
                </p>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700">Total</span>
              <span className="text-sm font-black text-orange-500">
                Ksh {quotation.total?.toLocaleString("en-KE")}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyOrdersPage() {
  // ── IMPORTANT: use `authLoading` (not `loading`) to avoid name collision ──
  // On refresh, `user` is briefly null while AuthContext reads localStorage.
  // Without the authLoading guard, the useEffect fires immediately, sees
  // user=null, and navigates to /login before the session is restored.
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (authLoading) return; // session restore still in progress — wait
    if (!user) {
      navigate("/login?redirect=/my-orders");
      return;
    }
    fetchQuotations();
  }, [user, authLoading]); // eslint-disable-line

  const fetchQuotations = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authAxios().get("/api/quotations/my");
      const data = res.data?.quotations || res.data?.data || res.data || [];
      setQuotations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Could not load your orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filtered =
    filter === "all"
      ? quotations
      : quotations.filter((q) => q.status === filter);

  const counts = Object.fromEntries(
    Object.keys(STATUS_CONFIG).map((k) => [
      k,
      quotations.filter((q) => q.status === k).length,
    ])
  );

  // Show a spinner while session is being restored — prevents flash/redirect
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <div
          className="w-8 h-8 border-orange-400 border-t-transparent rounded-full animate-spin"
          style={{ borderWidth: 3 }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link
            to="/"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors no-underline"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-[0_4px_12px_rgba(249,115,22,0.3)]">
              <span className="text-white font-black text-sm">W</span>
            </div>
            <div>
              <h1 className="font-black text-slate-900 text-sm leading-none">
                My Orders
              </h1>
              <p className="text-slate-400 text-[10px] mt-0.5">
                Track your quotation requests
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
              <span className="text-white font-black text-[11px]">
                {user?.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-none">
                {user?.name}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats row */}
        {!loading && quotations.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { key: "pending", label: "Pending", icon: "⏳" },
              { key: "processing", label: "Processing", icon: "⚙️" },
              { key: "approved", label: "Approved", icon: "✅" },
              { key: "rejected", label: "Declined", icon: "❌" },
            ].map(({ key, label, icon }) => {
              const cfg = STATUS_CONFIG[key];
              return (
                <button
                  key={key}
                  onClick={() => setFilter(filter === key ? "all" : key)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    filter === key
                      ? `${cfg.bg} ${cfg.border} shadow-sm`
                      : "bg-white border-slate-100 hover:shadow-sm"
                  }`}
                >
                  <p
                    className={`text-xl font-black ${
                      filter === key ? cfg.text : "text-slate-900"
                    }`}
                  >
                    {counts[key] || 0}
                  </p>
                  <p
                    className={`text-[10px] font-bold mt-0.5 ${
                      filter === key ? cfg.text : "text-slate-500"
                    }`}
                  >
                    {icon} {label}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {/* Filter tabs */}
        {!loading && quotations.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            <button
              onClick={() => setFilter("all")}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                filter === "all"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              All ({quotations.length})
            </button>
            {Object.entries(STATUS_CONFIG).map(
              ([key, cfg]) =>
                counts[key] > 0 && (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                      filter === key
                        ? `${cfg.bg} ${cfg.text} ${cfg.border}`
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {cfg.label} ({counts[key]})
                  </button>
                )
            )}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse"
              >
                <div className="h-3 bg-slate-100 rounded w-1/3 mb-3" />
                <div className="h-2 bg-slate-100 rounded w-full mb-2" />
                <div className="h-2 bg-slate-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <span className="text-4xl">⚠️</span>
            <p className="text-slate-600 font-semibold text-sm">{error}</p>
            <button
              onClick={fetchQuotations}
              className="px-5 py-2.5 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : quotations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-20 h-20 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-3xl">
              📋
            </div>
            <div>
              <p className="font-black text-slate-900 text-lg">No orders yet</p>
              <p className="text-slate-400 text-sm mt-1">
                Your quotation requests will appear here
              </p>
            </div>
            <Link
              to="/"
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm rounded-xl shadow-[0_4px_14px_rgba(249,115,22,0.3)] hover:opacity-95 transition-all no-underline"
            >
              Browse Products →
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <span className="text-3xl">🔍</span>
            <p className="text-slate-400 font-semibold text-sm">
              No {STATUS_CONFIG[filter]?.label.toLowerCase()} orders
            </p>
            <button
              onClick={() => setFilter("all")}
              className="text-orange-500 text-xs font-bold hover:underline"
            >
              Show all orders
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((q) => (
                <QuotationCard key={q._id} quotation={q} />
              ))}
          </div>
        )}

        {/* Contact CTA */}
        {!loading && quotations.length > 0 && (
          <div className="mt-8 bg-slate-900 rounded-2xl p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-white font-bold text-sm">
                Need help with your order?
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                Our team is available Mon–Sat, 8AM–6PM
              </p>
            </div>
            <a
              href="https://wa.me/254712953780"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-colors no-underline whitespace-nowrap"
            >
              💬 WhatsApp Us
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
