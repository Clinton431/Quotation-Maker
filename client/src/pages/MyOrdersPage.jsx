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

// ── SVG ICONS ─────────────────────────────────────────────────────────────────
const Icon = {
  ArrowLeft: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  ),
  Clock: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Gear: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  Send: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  CheckCircle: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  XCircle: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  Check: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  MessageSquare: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
  Package: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.89 1.45l8 4A2 2 0 0122 7.24v9.53a2 2 0 01-1.11 1.79l-8 4a2 2 0 01-1.78 0l-8-4A2 2 0 012 16.76V7.24a2 2 0 011.11-1.79l8-4a2 2 0 011.78 0z" />
      <polyline points="2.32 6.16 12 11 21.68 6.16" /><line x1="12" y1="22.76" x2="12" y2="11" />
    </svg>
  ),
  FileText: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  ),
  Search: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
    </svg>
  ),
  AlertTriangle: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  RefreshCw: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  ),
  ShoppingBag: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  ),
  Phone: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.22 1.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.56-.56a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
      <path d="M14.05 2a9 9 0 018 7.94M14.05 6A5 5 0 0118 10" />
    </svg>
  ),
  ChevronDown: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  ChevronUp: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  ),
  Info: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  // WhatsApp-style message bubble with phone
  Whatsapp: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.553 4.118 1.522 5.855L.057 23.886a.5.5 0 00.606.63l6.258-1.634A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.9 9.9 0 01-5.031-1.371l-.362-.214-3.718.971.993-3.614-.234-.373A9.858 9.858 0 012.1 12C2.1 6.534 6.534 2.1 12 2.1S21.9 6.534 21.9 12 17.466 21.9 12 21.9z" />
    </svg>
  ),
};

// ── STATUS CONFIG (icons now use SVG components, no emojis) ───────────────────
const STATUS_CONFIG = {
  pending: {
    label: "Pending Review",
    IconComp: Icon.Clock,
    iconClass: "text-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
    bar: "bg-amber-400",
    step: 1,
    message: "We've received your quotation request and will review it shortly.",
  },
  processing: {
    label: "Processing",
    IconComp: Icon.Gear,
    iconClass: "text-sky-500",
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
    IconComp: Icon.Send,
    iconClass: "text-violet-500",
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
    IconComp: Icon.CheckCircle,
    iconClass: "text-emerald-500",
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
    IconComp: Icon.XCircle,
    iconClass: "text-rose-500",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-500",
    bar: "bg-rose-400",
    step: 0,
    message: "This quotation was declined. Please contact us for more information.",
  },
};

const STEPS = ["pending", "processing", "sent", "approved"];

// ── STATUS BADGE ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const { IconComp } = s;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
      <IconComp className={`w-3 h-3 ${s.iconClass}`} />
      {s.label}
    </span>
  );
}

// ── PROGRESS BAR ──────────────────────────────────────────────────────────────
function ProgressBar({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  if (status === "rejected") {
    return (
      <div className="flex items-center gap-2 mt-3">
        <div className="flex-1 h-1.5 bg-rose-100 rounded-full overflow-hidden">
          <div className="h-full bg-rose-400 rounded-full w-full" />
        </div>
        <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
          <Icon.XCircle className="w-3 h-3" /> Declined
        </span>
      </div>
    );
  }

  const pct = (cfg.step / STEPS.length) * 100;

  return (
    <div className="mt-3">
      <div className="flex justify-between items-start mb-2">
        {STEPS.map((step, i) => {
          const sc   = STATUS_CONFIG[step];
          const done = cfg.step > i + 1;
          const active = cfg.step === i + 1;
          const { IconComp: StepIcon } = sc;
          return (
            <div key={step} className="flex flex-col items-center gap-1.5" style={{ flex: 1 }}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                done   ? "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]"
                : active ? `${cfg.dot} shadow-[0_0_0_3px_rgba(0,0,0,0.08)]`
                : "bg-slate-100"
              }`}>
                {done
                  ? <Icon.Check className="w-3 h-3 text-white" />
                  : <StepIcon className={`w-3 h-3 ${active ? "text-white" : "text-slate-400"}`} />
                }
              </div>
              <span className={`text-[8px] font-semibold text-center leading-tight ${active ? cfg.text : done ? "text-emerald-600" : "text-slate-400"}`}>
                {sc.label.split(" ")[0]}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mx-3">
        <div className={`h-full ${cfg.bar} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── QUOTATION CARD ────────────────────────────────────────────────────────────
function QuotationCard({ quotation, index }) {
  const [expanded, setExpanded] = useState(false);
  const cfg  = STATUS_CONFIG[quotation.status] || STATUS_CONFIG.pending;
  const date = new Date(quotation.createdAt);
  const { IconComp: StatusIcon } = cfg;

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md ${cfg.border}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Top accent bar */}
      <div className={`h-1 w-full ${cfg.bar}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                #{quotation.quoteNumber || quotation._id?.slice(-6).toUpperCase()}
              </span>
              <span className="text-[10px] text-slate-200">·</span>
              <span className="text-[10px] text-slate-400">
                {date.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
            <p className="font-bold text-slate-900 text-sm">
              {quotation.items?.length} item{quotation.items?.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <StatusBadge status={quotation.status} />
            <p className="text-lg font-black text-orange-500 tracking-tight">
              Ksh {quotation.total?.toLocaleString("en-KE")}
            </p>
          </div>
        </div>

        {/* Progress tracker */}
        <ProgressBar status={quotation.status} />

        {/* Status message banner */}
        <div className={`mt-3 px-3.5 py-2.5 rounded-xl text-xs ${cfg.bg} ${cfg.text} flex items-start gap-2.5`}>
          <StatusIcon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${cfg.iconClass}`} />
          <p className="leading-relaxed">{cfg.message}</p>
        </div>

        {/* Admin notes */}
        {quotation.adminNotes && (
          <div className="mt-2 px-3.5 py-2.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 flex items-start gap-2.5">
            <Icon.MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-400" />
            <div>
              <p className="font-bold mb-0.5">Note from our team:</p>
              <p className="leading-relaxed">{quotation.adminNotes}</p>
            </div>
          </div>
        )}

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 py-2 rounded-xl hover:bg-slate-50 transition-colors group"
        >
          {expanded
            ? <><Icon.ChevronUp className="w-3.5 h-3.5 group-hover:text-slate-600 transition-colors" /> Hide items</>
            : <><Icon.ChevronDown className="w-3.5 h-3.5 group-hover:text-slate-600 transition-colors" /> View items</>
          }
        </button>

        {/* Expanded items list */}
        {expanded && (
          <div className="mt-3 space-y-2 pt-3 border-t border-slate-50">
            {quotation.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    : <Icon.Package className="w-4.5 h-4.5 text-slate-300" style={{ width: 18, height: 18 }} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Qty: {item.qty} × Ksh {item.price?.toLocaleString("en-KE")}
                  </p>
                </div>
                <p className="text-xs font-bold text-orange-500 shrink-0">
                  Ksh {item.subtotal?.toLocaleString("en-KE")}
                </p>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2.5 border-t border-slate-100">
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

// ── SKELETON CARD ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
      <div className="h-1 w-full bg-slate-100" />
      <div className="p-5">
        <div className="flex justify-between mb-4">
          <div className="space-y-2">
            <div className="h-2.5 bg-slate-100 rounded w-28" />
            <div className="h-3 bg-slate-100 rounded w-16" />
          </div>
          <div className="space-y-2 items-end flex flex-col">
            <div className="h-5 bg-slate-100 rounded-full w-24" />
            <div className="h-5 bg-slate-100 rounded w-20" />
          </div>
        </div>
        <div className="flex justify-between mb-2 mt-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
              <div className="w-6 h-6 bg-slate-100 rounded-full" />
              <div className="h-1.5 bg-slate-100 rounded w-8" />
            </div>
          ))}
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full mx-3 mb-3 mt-1" />
        <div className="h-10 bg-slate-50 rounded-xl" />
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [quotations,  setQuotations]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [filter,      setFilter]      = useState("all");
  const [refreshing,  setRefreshing]  = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login?redirect=/my-orders"); return; }
    fetchQuotations();
  }, [user, authLoading]); // eslint-disable-line

  const fetchQuotations = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const res  = await authAxios().get("/api/quotations/my");
      const data = res.data?.quotations || res.data?.data || res.data || [];
      setQuotations(Array.isArray(data) ? data : []);
    } catch {
      setError("Could not load your orders. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filtered = filter === "all"
    ? quotations
    : quotations.filter((q) => q.status === filter);

  const counts = Object.fromEntries(
    Object.keys(STATUS_CONFIG).map((k) => [k, quotations.filter((q) => q.status === k).length])
  );

  // Auth loading — spinner only, no flash/redirect
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <div className="w-8 h-8 border-orange-400 border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc]">

      {/* ── HEADER ── */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link to="/" className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors no-underline shrink-0">
            <Icon.ArrowLeft className="w-4 h-4 text-slate-700" />
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-[0_4px_12px_rgba(249,115,22,0.3)] shrink-0">
              <span className="text-white font-black text-sm">W</span>
            </div>
            <div>
              <h1 className="font-black text-slate-900 text-sm leading-none">My Orders</h1>
              <p className="text-slate-400 text-[10px] mt-0.5">Track your quotation requests</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            {/* Refresh button */}
            <button
              onClick={() => fetchQuotations(true)}
              disabled={refreshing || loading}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
              title="Refresh orders"
            >
              <Icon.RefreshCw className={`w-4 h-4 text-slate-600 ${refreshing ? "animate-spin" : ""}`} />
            </button>

            {/* User avatar */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shrink-0">
                <span className="text-white font-black text-[11px]">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-none">{user?.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">

        {/* ── STAT CARDS (only when data loaded) ── */}
        {!loading && quotations.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { key: "pending",    label: "Pending",    IconComp: Icon.Clock        },
              { key: "processing", label: "Processing", IconComp: Icon.Gear         },
              { key: "approved",   label: "Approved",   IconComp: Icon.CheckCircle  },
              { key: "rejected",   label: "Declined",   IconComp: Icon.XCircle      },
            ].map(({ key, label, IconComp }) => {
              const cfg    = STATUS_CONFIG[key];
              const active = filter === key;
              return (
                <button key={key} onClick={() => setFilter(active ? "all" : key)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${active ? `${cfg.bg} ${cfg.border} shadow-sm ring-1 ${cfg.border}` : "bg-white border-slate-100 hover:shadow-sm hover:border-slate-200"}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className={`text-xl font-black ${active ? cfg.text : "text-slate-900"}`}>{counts[key] || 0}</p>
                    <IconComp className={`w-4 h-4 ${active ? cfg.iconClass : "text-slate-300"}`} />
                  </div>
                  <p className={`text-[10px] font-bold ${active ? cfg.text : "text-slate-500"}`}>{label}</p>
                </button>
              );
            })}
          </div>
        )}

        {/* ── FILTER TABS ── */}
        {!loading && quotations.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-5">
            <button onClick={() => setFilter("all")}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer ${filter === "all" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}>
              All ({quotations.length})
            </button>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) =>
              counts[key] > 0 && (
                <button key={key} onClick={() => setFilter(key)}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer ${filter === key ? `${cfg.bg} ${cfg.text} ${cfg.border}` : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                  {cfg.label} ({counts[key]})
                </button>
              )
            )}
          </div>
        )}

        {/* ── RESULT COUNT (when filtered) ── */}
        {!loading && filter !== "all" && quotations.length > 0 && (
          <p className="text-xs text-slate-400 font-medium mb-4 -mt-2">
            Showing {filtered.length} of {quotations.length} order{quotations.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* ── CONTENT ── */}
        {loading ? (
          <div className="space-y-4">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
              <Icon.AlertTriangle className="w-7 h-7 text-rose-400" />
            </div>
            <div className="text-center">
              <p className="text-slate-700 font-bold text-sm">Something went wrong</p>
              <p className="text-slate-400 text-xs mt-1">{error}</p>
            </div>
            <button onClick={() => fetchQuotations()}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-colors cursor-pointer">
              <Icon.RefreshCw className="w-3.5 h-3.5" /> Try Again
            </button>
          </div>
        ) : quotations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-20 h-20 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center">
              <Icon.FileText className="w-9 h-9 text-orange-300" />
            </div>
            <div>
              <p className="font-black text-slate-900 text-lg">No orders yet</p>
              <p className="text-slate-400 text-sm mt-1">Your quotation requests will appear here</p>
            </div>
            <Link to="/" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm rounded-xl shadow-[0_4px_14px_rgba(249,115,22,0.3)] hover:opacity-95 transition-all no-underline">
              <Icon.ShoppingBag className="w-4 h-4" /> Browse Products
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Icon.Search className="w-6 h-6 text-slate-300" />
            </div>
            <div>
              <p className="text-slate-600 font-bold text-sm">No matching orders</p>
              <p className="text-slate-400 text-xs mt-1">No {STATUS_CONFIG[filter]?.label.toLowerCase()} orders found</p>
            </div>
            <button onClick={() => setFilter("all")} className="text-orange-500 text-xs font-bold hover:underline cursor-pointer">
              Show all orders
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((q, i) => <QuotationCard key={q._id} quotation={q} index={i} />)
            }
          </div>
        )}

        {/* ── CONTACT CTA ── */}
        {!loading && quotations.length > 0 && (
          <div className="mt-8 bg-slate-900 rounded-2xl p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Icon.Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Need help with your order?</p>
                <p className="text-slate-400 text-xs mt-0.5">Our team is available Mon–Sat, 8AM–6PM</p>
              </div>
            </div>
            <a href="https://wa.me/254712953780" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-colors no-underline whitespace-nowrap shrink-0">
              <Icon.Whatsapp className="w-4 h-4" /> WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}