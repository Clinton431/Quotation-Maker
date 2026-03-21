import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

// ── SVG ICON LIBRARY ──────────────────────────────────────────────────────────
const Icon = {
  Grid: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  FileText: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  ),
  Package: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.89 1.45l8 4A2 2 0 0122 7.24v9.53a2 2 0 01-1.11 1.79l-8 4a2 2 0 01-1.78 0l-8-4A2 2 0 012 16.76V7.24a2 2 0 011.11-1.79l8-4a2 2 0 011.78 0z" />
      <polyline points="2.32 6.16 12 11 21.68 6.16" />
      <line x1="12" y1="22.76" x2="12" y2="11" />
    </svg>
  ),
  Users: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  Settings: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  Truck: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1" y="3" width="15" height="13" rx="1.5" />
      <path d="M16 8h4l3 5v3h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  RefreshCw: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  ),
  ChevronRight: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  ),
  X: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Plus: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Edit: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Trash: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  ),
  Search: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  ),
  Shield: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  TrendingUp: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Clock: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  CheckCircle: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  AlertTriangle: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  LogOut: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Home: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Image: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  Check: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Info: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Menu: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="3" y1="7" x2="21" y2="7" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="17" x2="21" y2="17" />
    </svg>
  ),
  SortAsc: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18M6 12h12M9 18h6" />
    </svg>
  ),
  // ── FIX 3: added Wrench icon for additional charges section ──────────────
  Wrench: (p) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  ),
};

// ── TOAST STACK ───────────────────────────────────────────────────────────────
function ToastStack({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      <style>{`
        @keyframes wt-toast-in {
          from { transform: translateX(calc(100% + 24px)); opacity: 0; }
          to   { transform: translateX(0);                 opacity: 1; }
        }
        .wt-toast { animation: wt-toast-in 0.28s cubic-bezier(.22,1,.36,1) forwards; }
        @keyframes wt-toast-progress { from { width: 100%; } to { width: 0%; } }
      `}</style>
      {toasts.map((t) => (
        <div
          key={t.id}
          className="wt-toast flex items-stretch rounded-xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.10)] border border-slate-200/80 bg-white min-w-[280px] max-w-[340px]"
        >
          <div
            className={`w-1 shrink-0 ${
              t.type === "success"
                ? "bg-emerald-500"
                : t.type === "warning"
                ? "bg-amber-500"
                : "bg-rose-500"
            }`}
          />
          <div className="flex flex-col justify-center px-4 py-3.5 flex-1 min-w-0">
            <p
              className={`text-[11px] font-extrabold uppercase tracking-widest mb-0.5 ${
                t.type === "success"
                  ? "text-emerald-600"
                  : t.type === "warning"
                  ? "text-amber-600"
                  : "text-rose-500"
              }`}
            >
              {t.type === "success"
                ? "Success"
                : t.type === "warning"
                ? "Warning"
                : "Error"}
            </p>
            <p className="text-sm font-medium text-slate-700 leading-snug">
              {t.msg}
            </p>
          </div>
          <div className="absolute bottom-0 left-1 right-0 h-[2px] bg-slate-100 rounded-b-xl overflow-hidden">
            <div
              className={`h-full ${
                t.type === "success"
                  ? "bg-emerald-400"
                  : t.type === "warning"
                  ? "bg-amber-400"
                  : "bg-rose-400"
              }`}
              style={{ animation: "wt-toast-progress 3.5s linear forwards" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
function authAxios() {
  const token = localStorage.getItem("wt_token");
  return axios.create({
    baseURL: API_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

// ── CONFIRM DIALOG ────────────────────────────────────────────────────────────
function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  confirmStyle = "danger",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;
  const isRed = confirmStyle === "danger";
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm p-7 shadow-2xl dialog-in">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
            isRed ? "bg-rose-50" : "bg-orange-50"
          }`}
        >
          <Icon.AlertTriangle
            className={`w-5 h-5 ${isRed ? "text-rose-500" : "text-orange-500"}`}
          />
        </div>
        <h3 className="font-extrabold text-slate-900 text-base mb-1.5">
          {title}
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">{message}</p>
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 font-semibold text-sm cursor-pointer hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white font-bold text-sm cursor-pointer transition-opacity hover:opacity-90 ${
              isRed
                ? "bg-gradient-to-r from-rose-500 to-rose-600"
                : "bg-gradient-to-r from-orange-500 to-orange-600"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
      <style>{`@keyframes dialog-in { from { transform: scale(.88); opacity: 0; } to { transform: scale(1); opacity: 1; } } .dialog-in { animation: dialog-in .2s cubic-bezier(.34,1.56,.64,1); }`}</style>
    </div>
  );
}

function useConfirm() {
  const [state, setState] = useState({
    open: false,
    resolve: null,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    confirmStyle: "danger",
  });
  const confirm = ({
    title,
    message,
    confirmLabel = "Confirm",
    confirmStyle = "danger",
  }) =>
    new Promise((resolve) =>
      setState({
        open: true,
        resolve,
        title,
        message,
        confirmLabel,
        confirmStyle,
      })
    );
  const handleConfirm = () => {
    state.resolve(true);
    setState((s) => ({ ...s, open: false }));
  };
  const handleCancel = () => {
    state.resolve(false);
    setState((s) => ({ ...s, open: false }));
  };
  const Dialog = () => (
    <ConfirmDialog
      open={state.open}
      title={state.title}
      message={state.message}
      confirmLabel={state.confirmLabel}
      confirmStyle={state.confirmStyle}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
  return { confirm, Dialog };
}

// ── STATUS CONFIG ─────────────────────────────────────────────────────────────
const QUOTATION_STATUSES = [
  {
    value: "pending",
    label: "Pending",
    dot: "bg-amber-400",
    pill: "bg-amber-50 border-amber-200 text-amber-700",
    activeBorder: "border-amber-300",
    activeBg: "bg-amber-50",
    activeText: "text-amber-700",
    bar: "bg-amber-400",
  },
  {
    value: "processing",
    label: "Processing",
    dot: "bg-blue-400",
    pill: "bg-blue-50 border-blue-200 text-blue-700",
    activeBorder: "border-blue-300",
    activeBg: "bg-blue-50",
    activeText: "text-blue-700",
    bar: "bg-blue-400",
  },
  {
    value: "sent",
    label: "Sent",
    dot: "bg-violet-400",
    pill: "bg-violet-50 border-violet-200 text-violet-700",
    activeBorder: "border-violet-300",
    activeBg: "bg-violet-50",
    activeText: "text-violet-700",
    bar: "bg-violet-400",
  },
  {
    value: "approved",
    label: "Approved",
    dot: "bg-emerald-400",
    pill: "bg-emerald-50 border-emerald-200 text-emerald-700",
    activeBorder: "border-emerald-300",
    activeBg: "bg-emerald-50",
    activeText: "text-emerald-700",
    bar: "bg-emerald-400",
  },
  {
    value: "rejected",
    label: "Declined",
    dot: "bg-rose-400",
    pill: "bg-rose-50 border-rose-200 text-rose-700",
    activeBorder: "border-rose-300",
    activeBg: "bg-rose-50",
    activeText: "text-rose-700",
    bar: "bg-rose-400",
  },
];

function StatusPill({ status }) {
  const s =
    QUOTATION_STATUSES.find((x) => x.value === status) || QUOTATION_STATUSES[0];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${s.pill}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function StockPill({ status }) {
  const map = {
    "In Stock": "bg-emerald-50 border-emerald-200 text-emerald-700",
    "Low Stock": "bg-amber-50 border-amber-200 text-amber-700",
    "Out of Stock": "bg-rose-50 border-rose-200 text-rose-700",
  };
  const dot = {
    "In Stock": "bg-emerald-400",
    "Low Stock": "bg-amber-400",
    "Out of Stock": "bg-rose-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${
        map[status] || map["In Stock"]
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${dot[status] || dot["In Stock"]}`}
      />
      {status || "In Stock"}
    </span>
  );
}

// ── STAT CARD ─────────────────────────────────────────────────────────────────
function StatCard({
  icon: IconComp,
  label,
  value,
  sub,
  iconBg,
  iconColor,
  blobColor,
}) {
  return (
    <div className="relative bg-white rounded-2xl border border-slate-100 p-6 overflow-hidden group hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 cursor-default">
      <div
        className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity ${blobColor}`}
      />
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${iconBg}`}
      >
        <IconComp className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="text-3xl font-black text-slate-900 leading-none tracking-tight">
        {value}
      </div>
      <div className={`text-sm font-bold mt-1.5 ${iconColor}`}>{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

// ── IMAGE UPLOAD ──────────────────────────────────────────────────────────────
function ImageUploader({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(value || "");
  const fileRef = useRef();
  useEffect(() => {
    setPreview(value || "");
  }, [value]);

  const uploadFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const token = localStorage.getItem("wt_token");
      const formData = new FormData();
      formData.append("image", file);
      const res = await axios.post(
        `${API_URL}/api/products/upload-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const url = res.data?.url || res.data?.imageUrl || res.data?.secure_url;
      if (url) {
        setPreview(url);
        onChange(url);
      }
    } catch {
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
        Product Image
      </label>
      {preview ? (
        <div className="relative group w-full h-40 rounded-2xl overflow-hidden border-2 border-orange-200 bg-slate-50">
          <img
            src={preview}
            alt="Product"
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="px-3 py-1.5 bg-white text-slate-800 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => {
                setPreview("");
                onChange("");
              }}
              className="px-3 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600 transition-colors cursor-pointer"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f) uploadFile(f);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileRef.current?.click()}
          className={`w-full h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
            dragOver
              ? "border-orange-400 bg-orange-50"
              : "border-slate-200 bg-slate-50 hover:border-orange-300 hover:bg-orange-50/50"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-400">Uploading…</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center mb-2.5">
                <Icon.Image className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-sm font-semibold text-slate-500">
                Drop image or <span className="text-orange-500">browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                JPG, PNG, WebP · Max 5MB
              </p>
            </>
          )}
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) uploadFile(f);
          e.target.value = "";
        }}
      />
      <div className="flex items-center gap-2 my-3">
        <div className="flex-1 h-px bg-slate-100" />
        <span className="text-xs text-slate-400">or paste URL</span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>
      <input
        type="url"
        value={preview}
        onChange={(e) => {
          setPreview(e.target.value);
          onChange(e.target.value);
        }}
        placeholder="https://example.com/image.jpg"
        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-orange-300 bg-white placeholder-slate-300 transition-colors"
      />
    </div>
  );
}

// ── QUOTATION MODAL ───────────────────────────────────────────────────────────
function QuotationModal({
  quotation,
  onClose,
  onStatusUpdate,
  onDelete,
  navigate,
  onToast,
}) {
  const [status, setStatus] = useState(quotation.status);
  const [adminNotes, setAdminNotes] = useState(quotation.adminNotes || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { confirm, Dialog } = useConfirm();

  const handleSave = async () => {
    setSaving(true);
    try {
      await authAxios().patch(`/api/quotations/${quotation._id}`, {
        status,
        adminNotes,
      });
      onStatusUpdate(quotation._id, status, adminNotes);
      onClose();
      onToast("Quotation updated successfully!", "success");
    } catch {
      onClose();
      onToast("Failed to update quotation.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Delete Quotation",
      message: `Permanently delete quotation ${
        quotation.quoteNumber || "#" + quotation._id?.slice(-6).toUpperCase()
      }?`,
      confirmLabel: "Delete",
      confirmStyle: "danger",
    });
    if (!ok) return;
    setDeleting(true);
    try {
      await authAxios().delete(`/api/quotations/${quotation._id}`);
      onDelete(quotation._id);
      onClose();
      onToast("Quotation deleted.", "success");
    } catch {
      onClose();
      onToast("Failed to delete quotation.", "error");
    } finally {
      setDeleting(false);
    }
  };

  // ── FIX 1: compute totals for display ────────────────────────────────────
  const itemsSubtotal =
    quotation.itemsSubtotal ??
    quotation.items?.reduce((s, i) => s + (i.subtotal || 0), 0) ??
    0;
  const additionalTotal =
    quotation.additionalTotal ??
    quotation.additionalCharges?.reduce((s, c) => s + (c.total || 0), 0) ??
    0;
  const hasAdditionalCharges = quotation.additionalCharges?.length > 0;

  return (
    <>
      <Dialog />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-sm">
        <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto">
          <div className="sticky top-0 bg-white/95 backdrop-blur px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10 rounded-t-3xl sm:rounded-t-3xl">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                Quotation Request
              </p>
              {/* ── FIX 2: show quoteNumber prominently ── */}
              <h2 className="font-black text-slate-900 text-xl tracking-tight">
                {quotation.quoteNumber ||
                  `#${quotation._id?.slice(-6).toUpperCase()}`}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs font-bold px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Icon.X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-5">
            {/* Customer info */}
            <div className="bg-slate-50 rounded-2xl p-5 grid grid-cols-2 gap-4">
              {[
                {
                  label: "Company",
                  value: quotation.customer?.companyName,
                  cls: "text-sm font-extrabold text-slate-900",
                },
                {
                  label: "Contact",
                  value: quotation.customer?.contactName,
                  cls: "text-sm font-medium text-slate-700",
                },
                {
                  label: "Email",
                  value: quotation.customer?.email,
                  cls: "text-sm font-semibold text-orange-500",
                },
                {
                  label: "Phone",
                  value: quotation.customer?.phone || "—",
                  cls: "text-sm text-slate-700",
                },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {f.label}
                  </p>
                  <p className={f.cls}>{f.value}</p>
                </div>
              ))}
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Delivery Address
                </p>
                <p className="text-sm text-slate-700">
                  {quotation.customer?.deliveryAddress}
                  {quotation.customer?.city
                    ? `, ${quotation.customer.city}`
                    : ""}
                </p>
              </div>
            </div>

            {/* Order items */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Order Items
              </p>
              <div className="flex flex-col gap-2">
                {quotation.items?.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Icon.Package className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {item.qty} {item.unit || "pcs"} × Ksh{" "}
                        {item.price?.toLocaleString("en-KE")}
                      </p>
                    </div>
                    <p className="text-sm font-extrabold text-orange-500 shrink-0">
                      Ksh {item.subtotal?.toLocaleString("en-KE")}
                    </p>
                  </div>
                ))}
              </div>

              {/* ── FIX 1: Additional charges section ── */}
              {hasAdditionalCharges && (
                <div className="mt-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Icon.Wrench className="w-3.5 h-3.5" /> Additional Charges
                  </p>
                  <div className="flex flex-col gap-2">
                    {quotation.additionalCharges.map((charge, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100"
                      >
                        <div className="w-12 h-12 rounded-xl bg-white border border-amber-200 flex items-center justify-center shrink-0">
                          <Icon.Wrench className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wide leading-none mb-0.5">
                            {charge.category}
                          </p>
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {charge.description || `${charge.category} charges`}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {charge.quantity} × Ksh{" "}
                            {Number(charge.price).toLocaleString("en-KE")}
                          </p>
                        </div>
                        <p className="text-sm font-extrabold text-amber-600 shrink-0">
                          Ksh {(charge.total || 0).toLocaleString("en-KE")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── FIX 1: Totals breakdown — shows subtotals when additional charges exist ── */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                {hasAdditionalCharges && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500 font-medium">
                        Items Subtotal
                      </span>
                      <span className="text-sm font-bold text-slate-700">
                        Ksh {itemsSubtotal.toLocaleString("en-KE")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-amber-600 font-medium">
                        Additional Charges
                      </span>
                      <span className="text-sm font-bold text-amber-600">
                        Ksh {additionalTotal.toLocaleString("en-KE")}
                      </span>
                    </div>
                    <div className="border-t border-slate-100 pt-2" />
                  </>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-slate-900">
                    Grand Total
                  </span>
                  <span className="text-2xl font-black text-orange-500 tracking-tight">
                    Ksh {quotation.total?.toLocaleString("en-KE")}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer notes */}
            {quotation.notes && (
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">
                  Customer Notes
                </p>
                <p className="text-sm text-blue-800 leading-relaxed">
                  {quotation.notes}
                </p>
              </div>
            )}

            {/* Documents */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Documents
              </p>
              <div className="flex gap-2.5">
                <button
                  onClick={() => {
                    onClose();
                    navigate("/quotation", { state: { quotation } });
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <Icon.FileText className="w-4 h-4" /> Quotation PDF
                </button>
                <button
                  onClick={() => {
                    onClose();
                    navigate("/delivery-note", { state: { quotation } });
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Icon.Truck className="w-4 h-4" /> Delivery Note
                </button>
              </div>
            </div>

            {/* Status update */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Update Status
              </p>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {QUOTATION_STATUSES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStatus(s.value)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border transition-all cursor-pointer ${
                      status === s.value
                        ? `${s.activeBg} ${s.activeBorder} ${s.activeText}`
                        : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                    <span className="text-[10px] font-bold">{s.label}</span>
                  </button>
                ))}
              </div>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={2}
                placeholder="Internal notes…"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-orange-300 placeholder-slate-300 resize-none transition-colors"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-500 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── PRODUCT MODAL ─────────────────────────────────────────────────────────────
function ProductModal({ product, onClose, onSave }) {
  const isEdit = !!product?._id;
  const [form, setForm] = useState({
    name: product?.name || "",
    category: product?.category || "",
    price: product?.price || "",
    originalPrice: product?.originalPrice || "",
    unit: product?.unit || "piece",
    description: product?.description || "",
    imageUrl: product?.imageUrl || "",
    stockStatus: product?.stockStatus || "In Stock",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.price) {
      setError("Name and price are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice
          ? Number(form.originalPrice)
          : undefined,
      };
      if (isEdit)
        await authAxios().put(`/api/products/${product._id}`, payload);
      else await authAxios().post(`/api/products`, payload);
      onSave(
        isEdit
          ? `"${form.name}" updated successfully!`
          : `"${form.name}" added to products!`,
        "success"
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save product.");
      setSaving(false);
    }
  };

  const inputCls =
    "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-orange-300 bg-slate-50 focus:bg-white transition-all";
  const labelCls =
    "block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider";
  const stockOptions = [
    {
      val: "In Stock",
      active: "bg-emerald-50 border-emerald-300 text-emerald-700",
    },
    { val: "Low Stock", active: "bg-amber-50 border-amber-300 text-amber-700" },
    { val: "Out of Stock", active: "bg-rose-50 border-rose-300 text-rose-700" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white/95 backdrop-blur px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10 rounded-t-3xl sm:rounded-t-3xl">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
              {isEdit ? "Editing Product" : "New Product"}
            </p>
            <h2 className="font-black text-slate-900 text-xl">
              {isEdit ? product.name : "Add Product"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Icon.X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-5">
          <ImageUploader
            value={form.imageUrl}
            onChange={(url) => set("imageUrl", url)}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Product Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. HP LaserJet Pro M404n"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                placeholder="e.g. Printers"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Unit</label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => set("unit", e.target.value)}
                placeholder="piece"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Price (Ksh) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="28500"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Original Price</label>
              <input
                type="number"
                value={form.originalPrice}
                onChange={(e) => set("originalPrice", e.target.value)}
                placeholder="32000"
                className={inputCls}
              />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Stock Status</label>
              <div className="grid grid-cols-3 gap-2">
                {stockOptions.map(({ val, active }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => set("stockStatus", val)}
                    className={`py-2.5 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                      form.stockStatus === val
                        ? active
                        : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                placeholder="Brief product description…"
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 border border-rose-100 rounded-xl">
              <Icon.AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="text-sm text-rose-600">{error}</span>
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-500 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {isEdit ? "Saving…" : "Adding…"}
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Add Product"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function unwrapList(data, ...keys) {
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.data?.[key])) return data.data[key];
  }
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

const TABS = [
  { id: "overview", label: "Overview", TabIcon: Icon.Grid },
  { id: "quotations", label: "Quotations", TabIcon: Icon.FileText },
  { id: "products", label: "Products", TabIcon: Icon.Package },
  { id: "customers", label: "Customers", TabIcon: Icon.Users },
  { id: "settings", label: "Settings", TabIcon: Icon.Settings },
];

const DEFAULT_STORE_SETTINGS = {
  businessName: "Wimwa Tech General Supplies",
  contactEmail: "wimwatech@gmail.com",
  phoneNumber: "+254 712 953 780",
  businessAddress: "P.O Box 273-00206, Kiserian",
};
const DEFAULT_QUOTATION_SETTINGS = {
  quoteValidity: "14",
  replyToEmail: "wimwatech@gmail.com",
  quotePrefix: "WTQ",
};

// ── ADMIN DASHBOARD ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { confirm, Dialog: ConfirmGlobal } = useConfirm();

  const [activeTab, setActiveTab] = useState("overview");
  const [quotations, setQuotations] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [quotationSort, setQuotationSort] = useState("newest");
  const [searchQ, setSearchQ] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [customerSearch, setCustomerSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [storeSettings, setStoreSettings] = useState(DEFAULT_STORE_SETTINGS);
  const [quotationSettings, setQuotationSettings] = useState(
    DEFAULT_QUOTATION_SETTINGS
  );
  // ── FIX 3: session expiry warning state ──────────────────────────────────
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  const expiryWarningTimerRef = useRef(null);
  const expiryTimerRef = useRef(null);

  const addToast = (msg, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  };

  const hasFetched = useRef(false);

  // ── FIX 3: session expiry warning setup ──────────────────────────────────
  // Reads wt_session_expiry from localStorage and schedules:
  //   - a warning toast + banner at 10 minutes before expiry
  //   - listens for the 'wt:session-expired' event from AuthContext
  useEffect(() => {
    const scheduleExpiryWarning = () => {
      const expiry = parseInt(
        localStorage.getItem("wt_session_expiry") || "0",
        10
      );
      if (!expiry) return;

      const now = Date.now();
      const msUntilExpiry = expiry - now;
      const WARN_BEFORE_MS = 10 * 60 * 1000; // 10 minutes

      // Clear any existing timers
      if (expiryWarningTimerRef.current)
        clearTimeout(expiryWarningTimerRef.current);
      if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);

      if (msUntilExpiry <= 0) {
        // Already expired — AuthContext will handle the actual logout
        return;
      }

      if (msUntilExpiry <= WARN_BEFORE_MS) {
        // Less than 10 min left right now — show warning immediately
        setShowExpiryWarning(true);
        addToast(
          "Your session expires in less than 10 minutes. Save your work.",
          "warning"
        );
      } else {
        // Schedule the warning for 10 min before expiry
        expiryWarningTimerRef.current = setTimeout(() => {
          setShowExpiryWarning(true);
          addToast(
            "Your session expires in 10 minutes. Save your work.",
            "warning"
          );
        }, msUntilExpiry - WARN_BEFORE_MS);
      }

      // Also schedule hiding the banner once session actually expires
      expiryTimerRef.current = setTimeout(() => {
        setShowExpiryWarning(false);
      }, msUntilExpiry);
    };

    scheduleExpiryWarning();

    // Listen for the session-expired event fired by AuthContext
    const handleExpired = () => {
      setShowExpiryWarning(false);
      addToast("Your session has expired. Please sign in again.", "error");
      setTimeout(() => navigate("/login"), 2000);
    };
    window.addEventListener("wt:session-expired", handleExpired);

    return () => {
      window.removeEventListener("wt:session-expired", handleExpired);
      if (expiryWarningTimerRef.current)
        clearTimeout(expiryWarningTimerRef.current);
      if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    };
  }, [navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (authLoading) return;
    if (user?.role !== "admin") {
      navigate("/");
      return;
    }
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchAll();
    }
  }, [authLoading, user]); // eslint-disable-line

  const fetchAll = async () => {
    setLoading(true);
    setFetchError("");
    try {
      const api = authAxios();
      const [qRes, pRes, cRes] = await Promise.all([
        api.get("/api/quotations").catch((e) => {
          console.error(e.message);
          return { data: [] };
        }),
        api.get("/api/products").catch((e) => {
          console.error(e.message);
          return { data: [] };
        }),
        api.get("/api/users").catch((e) => {
          console.error(e.message);
          return { data: [] };
        }),
      ]);
      setQuotations(unwrapList(qRes.data, "quotations"));
      setProducts(unwrapList(pRes.data, "products"));
      setCustomers(unwrapList(cRes.data, "users", "customers"));
      setLastRefreshed(new Date());
    } catch (err) {
      setFetchError(err.response?.data?.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (id, status, adminNotes) =>
    setQuotations((p) =>
      p.map((q) => (q._id === id ? { ...q, status, adminNotes } : q))
    );
  const handleQuotationDelete = (id) =>
    setQuotations((p) => p.filter((q) => q._id !== id));

  const handleDeleteProduct = async (prod) => {
    const ok = await confirm({
      title: "Delete Product",
      message: `Delete "${prod.name}"? This cannot be undone.`,
      confirmLabel: "Delete Product",
      confirmStyle: "danger",
    });
    if (!ok) return;
    try {
      await authAxios().delete(`/api/products/${prod._id}`);
      setProducts((prev) => prev.filter((x) => x._id !== prod._id));
      addToast(`"${prod.name}" deleted.`);
    } catch {
      addToast("Failed to delete product.", "error");
    }
  };

  const handleChangeRole = async (cust) => {
    const newRole = cust.role === "admin" ? "user" : "admin";
    const ok = await confirm({
      title: "Change Role",
      message: `Change ${cust.name}'s role to "${newRole}"?`,
      confirmLabel: "Change Role",
      confirmStyle: "orange",
    });
    if (!ok) return;
    try {
      await authAxios().patch(`/api/users/${cust._id}/role`, { role: newRole });
      setCustomers((p) =>
        p.map((x) => (x._id === cust._id ? { ...x, role: newRole } : x))
      );
      addToast(`${cust.name} is now ${newRole}.`);
    } catch {
      addToast("Failed to update role.", "error");
    }
  };

  const handleDeleteCustomer = async (cust) => {
    const ok = await confirm({
      title: "Delete Customer",
      message: `Permanently delete "${cust.name}" (${cust.email})?`,
      confirmLabel: "Delete Customer",
      confirmStyle: "danger",
    });
    if (!ok) return;
    try {
      await authAxios().delete(`/api/users/${cust._id}`);
      setCustomers((p) => p.filter((x) => x._id !== cust._id));
      addToast(`${cust.name} deleted.`);
    } catch {
      addToast("Failed to delete customer.", "error");
    }
  };

  const stats = {
    total: quotations.length,
    pending: quotations.filter((q) => q.status === "pending").length,
    approved: quotations.filter((q) => q.status === "approved").length,
    revenue: quotations
      .filter((q) => q.status === "approved")
      .reduce((s, q) => s + (q.total || 0), 0),
    products: products.length,
    outOfStock: products.filter((p) => p.stockStatus === "Out of Stock").length,
    lowStock: products.filter((p) => p.stockStatus === "Low Stock").length,
  };

  const filteredQuotations = quotations
    .filter((q) => {
      const ms = statusFilter === "all" || q.status === statusFilter;
      const mq =
        !searchQ ||
        q.customer?.companyName
          ?.toLowerCase()
          .includes(searchQ.toLowerCase()) ||
        q.customer?.email?.toLowerCase().includes(searchQ.toLowerCase()) ||
        q.customer?.contactName?.toLowerCase().includes(searchQ.toLowerCase());
      return ms && mq;
    })
    .sort((a, b) => {
      if (quotationSort === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (quotationSort === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (quotationSort === "highest") return (b.total || 0) - (a.total || 0);
      if (quotationSort === "lowest") return (a.total || 0) - (b.total || 0);
      return 0;
    });

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      !productSearch ||
      p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category?.toLowerCase().includes(productSearch.toLowerCase());
    const matchStock =
      stockFilter === "all" || (p.stockStatus || "In Stock") === stockFilter;
    return matchSearch && matchStock;
  });

  const filteredCustomers = customers.filter(
    (c) =>
      !customerSearch ||
      c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const quoteCountByEmail = quotations.reduce((acc, q) => {
    const email = q.customer?.email;
    if (email) acc[email] = (acc[email] || 0) + 1;
    return acc;
  }, {});

  const recentQuotations = [...quotations]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  if (authLoading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  const activeTabData = TABS.find((t) => t.id === activeTab);

  const SORT_OPTIONS = [
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
    { value: "highest", label: "Highest value" },
    { value: "lowest", label: "Lowest value" },
  ];

  const STOCK_FILTER_OPTIONS = [
    {
      value: "all",
      label: "All",
      cls: "bg-slate-100 text-slate-700 border-slate-300",
      ring: "ring-slate-400",
    },
    {
      value: "In Stock",
      label: "In Stock",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-300",
      ring: "ring-emerald-400",
    },
    {
      value: "Low Stock",
      label: "Low Stock",
      cls: "bg-amber-50 text-amber-700 border-amber-300",
      ring: "ring-amber-400",
    },
    {
      value: "Out of Stock",
      label: "Out of Stock",
      cls: "bg-rose-50 text-rose-700 border-rose-300",
      ring: "ring-rose-400",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <ToastStack toasts={toasts} />
      <ConfirmGlobal />

      {/* ── FIX 3: Session expiry warning banner ── */}
      {showExpiryWarning && (
        <div className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between gap-4 px-5 py-3 bg-amber-500 text-white shadow-lg">
          <div className="flex items-center gap-2.5">
            <Icon.Clock className="w-4 h-4 shrink-0" />
            <p className="text-sm font-semibold">
              Your session expires soon. Any unsaved work may be lost.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="text-xs font-bold px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors whitespace-nowrap"
            >
              Sign In Again
            </button>
            <button
              onClick={() => setShowExpiryWarning(false)}
              className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"
            >
              <Icon.X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {selectedQuotation && (
        <QuotationModal
          quotation={selectedQuotation}
          onClose={() => setSelectedQuotation(null)}
          onStatusUpdate={handleStatusUpdate}
          onDelete={handleQuotationDelete}
          navigate={navigate}
          onToast={(msg, type) => {
            setSelectedQuotation(null);
            setTimeout(() => addToast(msg, type), 50);
          }}
        />
      )}
      {showProductModal && (
        <ProductModal
          product={selectedProduct}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
          onSave={(msg, type) => {
            setShowProductModal(false);
            setSelectedProduct(null);
            fetchAll();
            setTimeout(() => addToast(msg, type), 50);
          }}
        />
      )}

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`fixed top-0 left-0 h-full bg-[#0c111d] z-20 flex flex-col transition-all duration-300 lg:static lg:w-64 lg:shrink-0 ${
          sidebarOpen ? "w-64" : "w-0 overflow-hidden"
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-6 border-b border-white/[0.06] shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-[0_4px_14px_rgba(249,115,22,.4)] shrink-0">
            <span className="text-white font-black text-base">W</span>
          </div>
          <div>
            <p className="text-white font-extrabold text-sm leading-none tracking-tight">
              Wimwa Tech
            </p>
            <p className="text-slate-500 text-xs mt-0.5">Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 overflow-y-auto flex flex-col gap-1">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all cursor-pointer border ${
                  active
                    ? "bg-orange-500/15 border-orange-500/20 text-orange-400"
                    : "border-transparent text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]"
                }`}
              >
                <tab.TabIcon
                  className={`w-[18px] h-[18px] shrink-0 ${
                    active ? "text-orange-400" : "text-slate-500"
                  }`}
                />
                <span className="text-sm font-semibold flex-1">
                  {tab.label}
                </span>
                {tab.id === "quotations" && stats.pending > 0 && (
                  <span className="text-[9px] font-extrabold bg-orange-500 text-white w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                    {stats.pending}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-3 mt-2 border-t border-white/[0.06]">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-2">
              Documents
            </p>
            {[
              {
                label: "Quotation Maker",
                DocIcon: Icon.FileText,
                path: "/quotation",
              },
              {
                label: "Delivery Note",
                DocIcon: Icon.Truck,
                path: "/delivery-note",
              },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-all cursor-pointer"
              >
                <item.DocIcon className="w-[18px] h-[18px] shrink-0" />
                <span className="text-sm font-semibold">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
        <div className="px-3 pb-4 pt-3 border-t border-white/[0.06] shrink-0 flex flex-col gap-0.5">
          <div className="flex items-center gap-3 px-3 py-3 mb-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0">
              <span className="text-white font-black text-sm">
                {user?.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-bold truncate">
                {user?.name}
              </p>
              <p className="text-slate-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-white/[0.05] transition-all no-underline"
          >
            <Icon.Home className="w-[17px] h-[17px] shrink-0" />
            <span className="text-sm font-semibold">View Shop</span>
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/[0.08] transition-all cursor-pointer w-full"
          >
            <Icon.LogOut className="w-[17px] h-[17px] shrink-0" />
            <span className="text-sm font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── FIX 3: push content down when warning banner is showing ── */}
        <header
          className={`bg-white border-b border-slate-100 px-5 sm:px-6 h-16 flex items-center gap-4 sticky z-10 shadow-sm ${
            showExpiryWarning ? "top-[52px]" : "top-0"
          }`}
        >
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="lg:hidden w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <Icon.Menu className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-3 shrink-0">
            {activeTabData && (
              <activeTabData.TabIcon className="w-5 h-5 text-orange-500" />
            )}
            <div>
              <h1 className="font-extrabold text-slate-900 text-base leading-none tracking-tight">
                {activeTabData?.label}
              </h1>
              <p className="text-slate-400 text-xs mt-0.5">
                Welcome back, {user?.name?.split(" ")[0]}
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {lastRefreshed && (
              <span className="hidden md:flex items-center gap-1 text-xs text-slate-400 font-medium">
                <Icon.Clock className="w-3.5 h-3.5" />
                Updated{" "}
                {lastRefreshed.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
            {stats.pending > 0 && (
              <button
                onClick={() => setActiveTab("quotations")}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs font-bold cursor-pointer hover:bg-amber-100 transition-colors"
              >
                <span className="relative flex w-2 h-2">
                  <span className="animate-ping absolute inset-0 rounded-full bg-amber-400 opacity-75" />
                  <span className="relative rounded-full w-2 h-2 bg-amber-500" />
                </span>
                {stats.pending} pending
              </button>
            )}
            <button
              onClick={() => navigate("/quotation")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-100 transition-colors cursor-pointer"
            >
              <Icon.FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Quotation</span>
            </button>
            <button
              onClick={() => navigate("/delivery-note")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <Icon.Truck className="w-4 h-4" />
              <span className="hidden sm:inline">Delivery Note</span>
            </button>
            <button
              onClick={() => {
                hasFetched.current = false;
                fetchAll();
              }}
              className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              title="Refresh data"
            >
              <Icon.RefreshCw className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-7 overflow-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-80 gap-4">
              <div className="w-10 h-10 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-slate-400 font-medium">
                Loading dashboard…
              </span>
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center h-80 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center">
                <Icon.AlertTriangle className="w-7 h-7 text-rose-500" />
              </div>
              <p className="text-sm text-slate-600 font-semibold">
                {fetchError}
              </p>
              <button
                onClick={fetchAll}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* ── OVERVIEW ── */}
              {activeTab === "overview" && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <StatCard
                      icon={Icon.FileText}
                      label="Total Quotations"
                      value={stats.total}
                      sub="All time"
                      iconBg="bg-orange-100"
                      iconColor="text-orange-500"
                      blobColor="bg-orange-500"
                    />
                    <StatCard
                      icon={Icon.Clock}
                      label="Awaiting Review"
                      value={stats.pending}
                      sub="Needs attention"
                      iconBg="bg-blue-100"
                      iconColor="text-blue-500"
                      blobColor="bg-blue-500"
                    />
                    <StatCard
                      icon={Icon.CheckCircle}
                      label="Approved"
                      value={stats.approved}
                      sub="Successfully closed"
                      iconBg="bg-emerald-100"
                      iconColor="text-emerald-500"
                      blobColor="bg-emerald-500"
                    />
                    <StatCard
                      icon={Icon.TrendingUp}
                      label="Revenue"
                      value={`Ksh ${(stats.revenue / 1000).toFixed(0)}K`}
                      sub="From approved orders"
                      iconBg="bg-violet-100"
                      iconColor="text-violet-500"
                      blobColor="bg-violet-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <StatCard
                      icon={Icon.Package}
                      label="Total Products"
                      value={stats.products}
                      iconBg="bg-orange-100"
                      iconColor="text-orange-500"
                      blobColor="bg-orange-500"
                    />
                    <StatCard
                      icon={Icon.AlertTriangle}
                      label="Low Stock"
                      value={stats.lowStock}
                      iconBg="bg-amber-100"
                      iconColor="text-amber-500"
                      blobColor="bg-amber-500"
                    />
                    <StatCard
                      icon={Icon.Package}
                      label="Out of Stock"
                      value={stats.outOfStock}
                      iconBg="bg-rose-100"
                      iconColor="text-rose-500"
                      blobColor="bg-rose-500"
                    />
                    <StatCard
                      icon={Icon.Users}
                      label="Customers"
                      value={customers.length}
                      iconBg="bg-violet-100"
                      iconColor="text-violet-500"
                      blobColor="bg-violet-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                      <h3 className="font-extrabold text-slate-900 text-base mb-5">
                        Status Breakdown
                      </h3>
                      <div className="flex flex-col gap-2.5">
                        {QUOTATION_STATUSES.map((s) => {
                          const count = quotations.filter(
                            (q) => q.status === s.value
                          ).length;
                          const pct = stats.total
                            ? Math.round((count / stats.total) * 100)
                            : 0;
                          return (
                            <button
                              key={s.value}
                              onClick={() => {
                                setActiveTab("quotations");
                                setStatusFilter(s.value);
                              }}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer w-full text-left"
                            >
                              <span
                                className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`}
                              />
                              <span className="text-sm font-semibold text-slate-600 flex-1">
                                {s.label}
                              </span>
                              <span className="text-sm font-extrabold text-slate-900 w-6 text-right">
                                {count}
                              </span>
                              <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden shrink-0">
                                <div
                                  className={`h-full rounded-full ${s.bar}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                      <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="font-extrabold text-slate-900 text-base">
                          Recent Quotations
                        </h3>
                        <button
                          onClick={() => setActiveTab("quotations")}
                          className="text-sm text-orange-500 font-bold hover:text-orange-600 cursor-pointer"
                        >
                          View all →
                        </button>
                      </div>
                      {recentQuotations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-2.5">
                          <Icon.FileText className="w-8 h-8 text-slate-200" />
                          <span className="text-sm text-slate-400">
                            No quotations yet
                          </span>
                        </div>
                      ) : (
                        recentQuotations.map((q) => (
                          <div
                            key={q._id}
                            onClick={() => setSelectedQuotation(q)}
                            className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0 group"
                          >
                            {/* ── FIX 2: show quoteNumber in overview recent list ── */}
                            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                              <span className="text-[9px] font-extrabold text-orange-500 text-center leading-tight px-0.5">
                                {q.quoteNumber ||
                                  `#${q._id?.slice(-3).toUpperCase()}`}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">
                                {q.customer?.companyName}
                              </p>
                              <p className="text-xs text-slate-400 truncate mt-0.5">
                                {q.customer?.email}
                              </p>
                            </div>
                            <p className="text-sm font-extrabold text-orange-500 hidden sm:block shrink-0">
                              Ksh {q.total?.toLocaleString("en-KE")}
                            </p>
                            <StatusPill status={q.status} />
                            <Icon.ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors shrink-0" />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── QUOTATIONS ── */}
              {activeTab === "quotations" && (
                <div className="flex flex-col gap-5">
                  <div className="flex gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                      <Icon.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        value={searchQ}
                        onChange={(e) => setSearchQ(e.target.value)}
                        placeholder="Search company, contact or email…"
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-300 transition-colors"
                      />
                    </div>
                    <div className="relative">
                      <Icon.SortAsc className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select
                        value={quotationSort}
                        onChange={(e) => setQuotationSort(e.target.value)}
                        className="pl-9 pr-8 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:border-orange-300 transition-colors appearance-none cursor-pointer"
                      >
                        {SORT_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {["all", ...QUOTATION_STATUSES.map((s) => s.value)].map(
                      (s) => {
                        const conf = QUOTATION_STATUSES.find(
                          (x) => x.value === s
                        );
                        const count =
                          s === "all"
                            ? quotations.length
                            : quotations.filter((q) => q.status === s).length;
                        const active = statusFilter === s;
                        return (
                          <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`text-xs font-bold px-4 py-2 rounded-full border transition-all cursor-pointer ${
                              active
                                ? s === "all"
                                  ? "bg-slate-900 text-white border-slate-900"
                                  : `${conf?.activeBg} ${conf?.activeBorder} ${conf?.activeText}`
                                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                            }`}
                          >
                            {s === "all" ? "All" : conf?.label} ({count})
                          </button>
                        );
                      }
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-medium -mt-2">
                    Showing {filteredQuotations.length} of {quotations.length}{" "}
                    quotation{quotations.length !== 1 ? "s" : ""}
                  </p>
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    {filteredQuotations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <Icon.Search className="w-10 h-10 text-slate-200" />
                        <span className="text-sm text-slate-400 font-medium">
                          No quotations found
                        </span>
                      </div>
                    ) : (
                      filteredQuotations.map((q, i) => (
                        <div
                          key={q._id}
                          onClick={() => setSelectedQuotation(q)}
                          className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors group ${
                            i < filteredQuotations.length - 1
                              ? "border-b border-slate-50"
                              : ""
                          }`}
                        >
                          {/* ── FIX 2: show quoteNumber in the quotations list ── */}
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 flex items-center justify-center shrink-0">
                            <span className="text-[9px] font-black text-orange-500 text-center leading-tight px-0.5">
                              {q.quoteNumber ||
                                `#${q._id?.slice(-4).toUpperCase()}`}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">
                              {q.customer?.companyName}
                            </p>
                            <p className="text-xs text-slate-400 truncate mt-0.5">
                              {q.customer?.contactName} · {q.customer?.email}
                            </p>
                            <p className="text-xs text-slate-300 mt-0.5">
                              {q.items?.length} items ·{" "}
                              {new Date(q.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <p className="text-sm font-extrabold text-orange-500 hidden sm:block shrink-0">
                            Ksh {q.total?.toLocaleString("en-KE")}
                          </p>
                          <StatusPill status={q.status} />
                          <Icon.ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-slate-400 transition-colors shrink-0" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ── PRODUCTS ── */}
              {activeTab === "products" && (
                <div className="flex flex-col gap-5">
                  <div className="flex gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                      <Icon.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search products…"
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-300 transition-colors"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProduct(null);
                        setShowProductModal(true);
                      }}
                      className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold rounded-xl shadow-[0_4px_14px_rgba(249,115,22,0.3)] hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
                    >
                      <Icon.Plus className="w-4 h-4" /> Add Product
                    </button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {STOCK_FILTER_OPTIONS.map(({ value, label, cls, ring }) => {
                      const count =
                        value === "all"
                          ? products.length
                          : products.filter(
                              (p) => (p.stockStatus || "In Stock") === value
                            ).length;
                      const active = stockFilter === value;
                      return (
                        <button
                          key={value}
                          onClick={() => setStockFilter(value)}
                          className={`text-xs font-bold px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${cls} ${
                            active
                              ? `ring-2 ${ring}`
                              : "opacity-70 hover:opacity-100"
                          }`}
                        >
                          {label}: {count}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-400 font-medium -mt-2">
                    Showing {filteredProducts.length} of {products.length}{" "}
                    product{products.length !== 1 ? "s" : ""}
                  </p>
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    {filteredProducts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <Icon.Package className="w-10 h-10 text-slate-200" />
                        <span className="text-sm text-slate-400 font-medium">
                          {productSearch || stockFilter !== "all"
                            ? "No products match your filters"
                            : "No products yet"}
                        </span>
                        {!productSearch && stockFilter === "all" && (
                          <button
                            onClick={() => {
                              setSelectedProduct(null);
                              setShowProductModal(true);
                            }}
                            className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                          >
                            Add First Product
                          </button>
                        )}
                      </div>
                    ) : (
                      filteredProducts.map((prod, i) => (
                        <div
                          key={prod._id}
                          className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group ${
                            i < filteredProducts.length - 1
                              ? "border-b border-slate-50"
                              : ""
                          }`}
                        >
                          <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                            {prod.imageUrl ? (
                              <img
                                src={prod.imageUrl}
                                alt={prod.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Icon.Package className="w-6 h-6 text-slate-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">
                              {prod.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {prod.category && (
                                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-medium">
                                  {prod.category}
                                </span>
                              )}
                              <span className="text-sm font-extrabold text-orange-500">
                                Ksh {prod.price?.toLocaleString("en-KE")}
                              </span>
                              {prod.originalPrice && (
                                <span className="text-xs text-slate-300 line-through">
                                  Ksh{" "}
                                  {prod.originalPrice?.toLocaleString("en-KE")}
                                </span>
                              )}
                              {prod.unit && (
                                <span className="text-xs text-slate-400">
                                  / {prod.unit}
                                </span>
                              )}
                            </div>
                          </div>
                          <StockPill status={prod.stockStatus || "In Stock"} />
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setSelectedProduct(prod);
                                setShowProductModal(true);
                              }}
                              className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 hover:bg-blue-100 transition-colors cursor-pointer"
                            >
                              <Icon.Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod)}
                              className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-400 hover:bg-rose-100 transition-colors cursor-pointer"
                            >
                              <Icon.Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ── CUSTOMERS ── */}
              {activeTab === "customers" && (
                <div className="flex flex-col gap-5">
                  <div className="flex gap-3 flex-wrap items-center">
                    <div className="relative flex-1 min-w-[200px]">
                      <Icon.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        placeholder="Search by name or email…"
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-300 transition-colors"
                      />
                    </div>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 border border-violet-200 rounded-full text-xs font-bold text-violet-700 whitespace-nowrap">
                      <Icon.Users className="w-3.5 h-3.5" />
                      {customers.filter((c) => c.role === "admin").length}{" "}
                      admins
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium -mt-2">
                    Showing {filteredCustomers.length} of {customers.length}{" "}
                    customer{customers.length !== 1 ? "s" : ""}
                  </p>
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    {filteredCustomers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <Icon.Users className="w-10 h-10 text-slate-200" />
                        <span className="text-sm text-slate-400">
                          {customerSearch
                            ? "No customers match your search"
                            : "No customers yet"}
                        </span>
                      </div>
                    ) : (
                      filteredCustomers.map((cust, i) => {
                        const custQuoteCount =
                          quoteCountByEmail[cust.email] || 0;
                        return (
                          <div
                            key={cust._id}
                            className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group ${
                              i < filteredCustomers.length - 1
                                ? "border-b border-slate-50"
                                : ""
                            }`}
                          >
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-100 to-amber-50 border border-orange-100 flex items-center justify-center shrink-0">
                              <span className="font-extrabold text-orange-500 text-base">
                                {cust.name?.[0]?.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">
                                {cust.name}
                              </p>
                              <p className="text-xs text-slate-400 truncate mt-0.5">
                                {cust.email}
                              </p>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 mr-2">
                              {custQuoteCount > 0 && (
                                <button
                                  onClick={() => {
                                    setSearchQ(cust.email);
                                    setStatusFilter("all");
                                    setActiveTab("quotations");
                                  }}
                                  className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-100 transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  {custQuoteCount} quote
                                  {custQuoteCount !== 1 ? "s" : ""}
                                </button>
                              )}
                              <span
                                className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                                  cust.role === "admin"
                                    ? "bg-violet-50 text-violet-600 border-violet-200"
                                    : "bg-slate-50 text-slate-500 border-slate-200"
                                }`}
                              >
                                {cust.role === "admin" ? "Admin" : "Customer"}
                              </span>
                              {cust.createdAt && (
                                <span className="text-xs text-slate-300">
                                  {new Date(
                                    cust.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            {cust._id !== user?._id && (
                              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleChangeRole(cust)}
                                  className="text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-600 transition-colors whitespace-nowrap cursor-pointer"
                                >
                                  {cust.role === "admin"
                                    ? "Demote"
                                    : "Make Admin"}
                                </button>
                                <button
                                  onClick={() => handleDeleteCustomer(cust)}
                                  className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-400 hover:bg-rose-100 transition-colors cursor-pointer"
                                >
                                  <Icon.Trash className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* ── SETTINGS ── */}
              {activeTab === "settings" && (
                <div className="flex flex-col gap-5 max-w-3xl">
                  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-100">
                        <Icon.Home className="w-5 h-5 text-orange-500" />
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-base">
                        Store Information
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { key: "businessName", label: "Business Name" },
                        { key: "contactEmail", label: "Contact Email" },
                        { key: "phoneNumber", label: "Phone Number" },
                        { key: "businessAddress", label: "Business Address" },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                            {label}
                          </label>
                          <input
                            value={storeSettings[key]}
                            onChange={(e) =>
                              setStoreSettings((p) => ({
                                ...p,
                                [key]: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-orange-300 bg-slate-50 focus:bg-white transition-all"
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => addToast("Store information saved!")}
                      className="mt-5 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-100">
                        <Icon.FileText className="w-5 h-5 text-orange-500" />
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-base">
                        Quotation Settings
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        {
                          key: "quoteValidity",
                          label: "Quote Validity (days)",
                        },
                        { key: "replyToEmail", label: "Reply-to Email" },
                        { key: "quotePrefix", label: "Quote Number Prefix" },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                            {label}
                          </label>
                          <input
                            value={quotationSettings[key]}
                            onChange={(e) =>
                              setQuotationSettings((p) => ({
                                ...p,
                                [key]: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-orange-300 bg-slate-50 focus:bg-white transition-all"
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => addToast("Quotation settings saved!")}
                      className="mt-5 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                        <Icon.Shield className="w-5 h-5 text-violet-500" />
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-base">
                        Session
                      </h3>
                    </div>
                    <div className="flex flex-col divide-y divide-slate-50">
                      {[
                        {
                          label: "Logged in as",
                          value: `${user?.name} (${user?.email})`,
                        },
                        { label: "Role", value: user?.role, violet: true },
                        { label: "Expires", value: "2 hours from login" },
                      ].map((row) => (
                        <div
                          key={row.label}
                          className="flex justify-between items-center py-3"
                        >
                          <span className="text-sm text-slate-400 font-medium">
                            {row.label}
                          </span>
                          <span
                            className={`text-sm font-bold ${
                              row.violet
                                ? "text-violet-600 capitalize"
                                : "text-slate-700"
                            }`}
                          >
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={logout}
                      className="mt-5 flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Icon.LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                        <Icon.AlertTriangle className="w-5 h-5 text-rose-500" />
                      </div>
                      <h3 className="font-extrabold text-rose-600 text-base">
                        Danger Zone
                      </h3>
                    </div>
                    <p className="text-sm text-slate-400 mb-5 leading-relaxed">
                      These actions are irreversible. Please proceed with
                      extreme caution.
                    </p>
                    <button
                      onClick={async () => {
                        const ok = await confirm({
                          title: "Clear All Quotations",
                          message:
                            "Permanently delete ALL quotations? This cannot be undone.",
                          confirmLabel: "Delete All",
                          confirmStyle: "danger",
                        });
                        if (!ok) return;
                        try {
                          await Promise.all(
                            quotations.map((q) =>
                              authAxios().delete(`/api/quotations/${q._id}`)
                            )
                          );
                          setQuotations([]);
                          addToast("All quotations deleted.");
                        } catch {
                          addToast(
                            "Some quotations could not be deleted.",
                            "error"
                          );
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 border border-rose-200 rounded-xl bg-rose-50 text-rose-500 text-sm font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      <Icon.Trash className="w-4 h-4" /> Clear All Quotations
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
