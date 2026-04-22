import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import AuthPromptModal from "../components/AuthPromptModal";
import { Icon } from "../components/icons";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ── CART HOOK ─────────────────────────────────────────────────────────────────
const CART_KEY = "wt_cart";

function useCart() {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* ignore quota errors */
    }
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      if (existing)
        return prev.map((i) =>
          i._id === product._id ? { ...i, qty: i.qty + 1 } : i
        );
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const addWithQty = (product) => {
    const qty = product.qty || 1;
    setCart((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      if (existing)
        return prev.map((i) =>
          i._id === product._id ? { ...i, qty: i.qty + qty } : i
        );
      return [...prev, { ...product, qty }];
    });
  };

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((i) => i._id !== id));

  const updateQty = (id, qty) => {
    if (qty < 1) {
      removeFromCart(id);
      return;
    }
    setCart((prev) => prev.map((i) => (i._id === id ? { ...i, qty } : i)));
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem(CART_KEY);
    } catch {
      /* ignore */
    }
  };

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  return {
    cart,
    addToCart,
    addWithQty,
    removeFromCart,
    updateQty,
    clearCart,
    total,
    count,
  };
}

// ── HELPER: safely unwrap any API list response ───────────────────────────────
function unwrapList(responseData, ...keys) {
  if (Array.isArray(responseData)) return responseData;
  for (const key of keys) {
    if (Array.isArray(responseData?.[key])) return responseData[key];
    if (Array.isArray(responseData?.data?.[key])) return responseData.data[key];
  }
  if (Array.isArray(responseData?.data)) return responseData.data;
  console.warn("[HomePage] Unexpected API shape for products:", responseData);
  return [];
}

// ── VERTICAL MARQUEE STRIP ────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  { emoji: "🖨️", label: "HP LaserJet M404n", price: "Ksh 28,500" },
  { emoji: "🔋", label: "APC UPS 1500VA", price: "Ksh 14,200" },
  { emoji: "🌐", label: "D-Link 24-Port Switch", price: "Ksh 18,500" },
  { emoji: "📷", label: "CCTV 8-Channel HD", price: "Ksh 42,000" },
  { emoji: "🖥️", label: 'Dell 24" P2422H', price: "Ksh 32,000" },
  { emoji: "🏗️", label: "Portland Cement 50kg", price: "Ksh 820" },
  { emoji: "⌨️", label: "Logitech MX Keys", price: "Ksh 9,600" },
  { emoji: "🔌", label: "CAT6 Cable 305m", price: "Ksh 4,800" },
];

function VerticalMarquee() {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div
      className="relative overflow-hidden"
      style={{
        height: "100%",
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
      }}
    >
      <style>{`
        @keyframes marquee-up {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .marquee-track { animation: marquee-up 22s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>
      <div className="marquee-track flex flex-col gap-2">
        {doubled.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              minWidth: 0,
            }}
          >
            <span className="text-lg shrink-0">{item.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-white/80 truncate leading-tight">
                {item.label}
              </p>
              <p className="text-[10px] font-black text-orange-400 leading-tight">
                {item.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── STAT COUNTER ──────────────────────────────────────────────────────────────
function StatCounter({ end, suffix = "", duration = 1800 }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!started) return;
    const steps = 40;
    const step = end / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += step;
      if (current >= end) {
        setCount(end);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [started, end, duration]);

  return (
    <>
      {count.toLocaleString()}
      {suffix}
    </>
  );
}

// ── CAPABILITY CARD ───────────────────────────────────────────────────────────
const CAPABILITIES = [
  {
    icon: "🖨️",
    title: "Technology",
    items: [
      "Printers & Scanners",
      "Monitors & Displays",
      // "Peripherals & Cables",
    ],
    accent: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.18)",
  },
  {
    icon: "🌐",
    title: "Networking & Security",
    items: [
      "Switches & Routers",
      "CCTV & Access Control",
      // "UPS & Power Backup",
    ],
    accent: "#06b6d4",
    bg: "rgba(6,182,212,0.08)",
    border: "rgba(6,182,212,0.18)",
  },
  {
    icon: "🏗️",
    title: "Construction",
    items: ["Cement & Aggregates", "Steel & Hardware"],
    accent: "#f97316",
    bg: "rgba(249,115,22,0.08)",
    border: "rgba(249,115,22,0.18)",
  },
];

function CapabilityCard({ cap, delay, visible }) {
  return (
    <div
      style={{
        background: cap.bg,
        border: `1px solid ${cap.border}`,
        borderRadius: "16px",
        padding: "14px 16px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s cubic-bezier(.22,1,.36,1) ${delay}ms`,
      }}
    >
      <div className="flex items-center gap-2.5 mb-2.5">
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
          style={{ background: `${cap.accent}18` }}
        >
          {cap.icon}
        </span>
        <p className="text-[12px] font-bold text-white/90">{cap.title}</p>
      </div>
      <div className="space-y-1">
        {cap.items.map((item) => (
          <div key={item} className="flex items-center gap-2">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <circle cx="5" cy="5" r="2" fill={cap.accent} opacity="0.7" />
            </svg>
            <span className="text-[10px] text-white/50">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── RIGHT PANEL ───────────────────────────────────────────────────────────────
function HeroRightPanel() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition:
          "opacity 0.7s cubic-bezier(.22,1,.36,1) 0.1s, transform 0.7s cubic-bezier(.22,1,.36,1) 0.1s",
      }}
      className="w-full"
    >
      {/* Outer card */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, rgba(17,24,39,0.98) 0%, rgba(9,14,26,1) 100%)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: "24px",
          boxShadow:
            "0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(249,115,22,0.07)",
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 70% 20%, rgba(249,115,22,0.12) 0%, transparent 60%)",
          }}
        />

        {/* Header */}
        <div
          className="relative px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              {["#ff5f56", "#ffbd2e", "#27c93f"].map((c) => (
                <div
                  key={c}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: c }}
                />
              ))}
            </div>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg ml-1"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <svg
                className="w-2 h-2 text-emerald-400"
                viewBox="0 0 8 8"
                fill="currentColor"
              >
                <circle cx="4" cy="4" r="4" />
              </svg>
              <span className="text-[9px] font-mono text-white/30 tracking-tight">
                wimwatech.co.ke
              </span>
            </div>
          </div>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(16,185,129,0.09)",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <span className="relative flex w-1.5 h-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-emerald-400" />
            </span>
            <span className="text-[9px] font-bold text-emerald-400 tracking-wider">
              OPEN
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="relative p-5">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {[
              { label: "Products", end: 500, suffix: "+", color: "#fb923c" },
              { label: "Businesses", end: 500, suffix: "+", color: "#34d399" },
              { label: "Counties", end: 47, suffix: "", color: "#60a5fa" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center py-3 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <span
                  className="text-[18px] font-black font-mono leading-tight"
                  style={{ color: s.color }}
                >
                  <StatCounter end={s.end} suffix={s.suffix} />
                </span>
                <span className="text-[9px] text-white/35 mt-0.5 uppercase tracking-wider">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Capability cards + marquee */}
          <div className="flex gap-3" style={{ minHeight: "220px" }}>
            {/* Left: capability cards */}
            <div className="flex flex-col gap-2 flex-1">
              {CAPABILITIES.map((cap, i) => (
                <CapabilityCard
                  key={cap.title}
                  cap={cap}
                  delay={300 + i * 100}
                  visible={visible}
                />
              ))}
            </div>
            {/* Right: marquee strip */}
            <div
              className="shrink-0 rounded-2xl overflow-hidden p-2"
              style={{
                width: "128px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                height: "270px",
              }}
            >
              <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-2 text-center">
                Live Catalog
              </p>
              <VerticalMarquee />
            </div>
          </div>

          {/* Quotation CTA */}
          <div
            className="mt-4 flex items-center justify-between px-4 py-3 rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.1) 100%)",
              border: "1px solid rgba(249,115,22,0.25)",
            }}
          >
            <div>
              <p className="text-[11px] font-bold text-white/80">
                Same-day PDF Quotation
              </p>
              <p className="text-[9px] text-white/35 mt-0.5">
                Add items → Request → Receive in 2 hrs
              </p>
            </div>
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{
                background: "linear-gradient(135deg, #fb923c, #ea580c)",
                boxShadow: "0 4px 16px rgba(249,115,22,0.4)",
              }}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              >
                <path d="M14 2H6a2 2 0 00-2 2v16l3-2 2 2 2-2 2 2 2-2 3 2V4a2 2 0 00-2-2z" />
                <line x1="9" y1="9" x2="15" y2="9" />
                <line x1="9" y1="13" x2="15" y2="13" />
              </svg>
              <span className="text-[10px] font-black text-white">Quote</span>
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          className="h-0.5 w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(249,115,22,0.6) 40%, rgba(251,146,60,0.3) 70%, transparent 100%)",
          }}
        />
      </div>

      {/* Reflection shadow */}
      <div
        className="mx-10 h-4 rounded-b-2xl blur-md opacity-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(249,115,22,0.4), transparent)",
        }}
      />
    </div>
  );
}

// ── STOCK BADGE ───────────────────────────────────────────────────────────────
function StockBadge({ status }) {
  const map = {
    "In Stock": {
      bg: "bg-emerald-500/10",
      text: "text-emerald-600",
      dot: "bg-emerald-500",
      border: "border-emerald-200",
    },
    "Low Stock": {
      bg: "bg-amber-500/10",
      text: "text-amber-600",
      dot: "bg-amber-500",
      border: "border-amber-200",
    },
    "Out of Stock": {
      bg: "bg-red-500/10",
      text: "text-red-500",
      dot: "bg-red-500",
      border: "border-red-200",
    },
  };
  const s = map[status] || map["In Stock"];
  return (
    <span
      className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

// ── RATING STARS ──────────────────────────────────────────────────────────────
function RatingStars({ rating = 4.5, reviews = 0 }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const full = rating >= star;
          const half = !full && rating >= star - 0.5;
          const color = full || half ? "#f59e0b" : "#e2e8f0";
          return (
            <svg
              key={star}
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill={color}
              stroke="none"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          );
        })}
      </div>
      {reviews > 0 && (
        <span className="text-[9px] text-slate-400">({reviews})</span>
      )}
    </div>
  );
}

// ── PRODUCT CARD ──────────────────────────────────────────────────────────────
function ProductCard({ product, onAdd, added }) {
  const navigate = useNavigate();
  const outOfStock = product.stockStatus === "Out of Stock";
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100
        )
      : null;

  return (
    <div
      onClick={() => navigate(`/products/${product._id}`)}
      className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100/80 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      <div
        className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100"
        style={{ height: "160px" }}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-slate-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <StockBadge status={product.stockStatus || "In Stock"} />
          {discount && (
            <span className="inline-flex text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-500 text-white shadow-sm">
              -{discount}%
            </span>
          )}
        </div>
        {product.category && (
          <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded-lg border border-white/60 uppercase tracking-wide shadow-sm">
            {product.category}
          </div>
        )}
        {!outOfStock && (
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-all duration-300 flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd(product);
              }}
              className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 bg-white text-slate-900 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/80 flex items-center gap-1.5"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Quick Add
            </button>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-[9px] font-bold text-orange-500 uppercase tracking-widest mb-0.5 truncate">
          {product.category || "General"}
        </p>
        <h3 className="font-bold text-slate-900 text-xs leading-snug mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors duration-200">
          {product.name}
        </h3>
        <div className="mb-1.5">
          <RatingStars
            rating={product.rating || 4.5}
            reviews={product.reviewCount || 0}
          />
        </div>
        {product.description && (
          <p className="text-slate-400 text-[10px] leading-relaxed mb-2 line-clamp-1">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between gap-1.5 mt-2 pt-2 border-t border-slate-50">
          <div>
            <p className="text-sm font-black text-slate-900">
              Ksh {product.price?.toLocaleString("en-KE")}
            </p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-[9px] text-slate-400 line-through">
                Ksh {product.originalPrice.toLocaleString("en-KE")}
              </p>
            )}
            {product.unit && (
              <p className="text-[9px] text-slate-400">per {product.unit}</p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!outOfStock) onAdd(product);
            }}
            disabled={outOfStock}
            className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition-all duration-200 shrink-0 ${
              outOfStock
                ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                : added
                ? "bg-emerald-500 text-white shadow-[0_3px_10px_rgba(16,185,129,0.35)]"
                : "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-[0_3px_10px_rgba(249,115,22,0.3)] hover:shadow-[0_5px_16px_rgba(249,115,22,0.45)] active:scale-95"
            }`}
          >
            {added ? (
              <>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Added
              </>
            ) : (
              <>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CART DRAWER ───────────────────────────────────────────────────────────────
function CartDrawer({
  open,
  onClose,
  cart,
  onRemove,
  onUpdateQty,
  onClear,
  total,
  onRequestQuotation,
}) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Your Cart</h2>
            <p className="text-slate-400 text-xs">
              {cart.length} item{cart.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs font-semibold text-red-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors border border-red-100 flex items-center gap-1.5"
              >
                <Icon.Trash className="w-3 h-3" />
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <Icon.X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                >
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <p className="font-semibold text-slate-400">Your cart is empty</p>
              <p className="text-slate-300 text-sm mt-1">
                Add some items to get started
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item._id}
                className="flex gap-3 p-3 bg-slate-50 rounded-xl"
              >
                <div className="w-14 h-14 rounded-lg bg-white border border-slate-100 overflow-hidden flex-shrink-0">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100">
                      <Icon.Package className="w-6 h-6 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">
                    {item.name}
                  </p>
                  <p className="text-orange-500 text-sm font-bold">
                    Ksh {(item.price * item.qty).toLocaleString("en-KE")}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={() => onUpdateQty(item._id, item.qty - 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 text-xs font-bold"
                    >
                      −
                    </button>
                    <span className="text-sm font-bold text-slate-900 w-5 text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => onUpdateQty(item._id, item.qty + 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 text-xs font-bold"
                    >
                      +
                    </button>
                    <button
                      onClick={() => onRemove(item._id)}
                      className="ml-auto text-red-400 hover:text-red-600 transition-colors"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="px-6 py-5 border-t border-slate-100 bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 font-medium">Total</span>
              <span className="text-2xl font-black text-slate-900">
                Ksh {total.toLocaleString("en-KE")}
              </span>
            </div>
            <button
              onClick={onRequestQuotation}
              className="w-full py-3.5 bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold rounded-xl shadow-[0_6px_24px_rgba(249,115,22,0.35)] hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Icon.FileText className="w-4 h-4" />
              Request Quotation →
            </button>
            <p className="text-center text-xs text-slate-400 mt-2">
              We'll prepare a formal quotation for you
            </p>
          </div>
        )}
      </div>
    </>
  );
}

// ── NAVBAR ────────────────────────────────────────────────────────────────────
function Navbar({ cartCount, onCartOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const btnGhost =
    "flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer";
  const btnAdmin =
    "flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 hover:border-violet-300 transition-all cursor-pointer shadow-sm";
  const btnDanger =
    "flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border border-rose-100 bg-rose-50 text-rose-500 hover:bg-rose-100 hover:border-rose-200 transition-all cursor-pointer";
  const btnPrimary =
    "flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-[0_3px_10px_rgba(249,115,22,0.3)] hover:opacity-90 hover:shadow-[0_4px_14px_rgba(249,115,22,0.4)] transition-all cursor-pointer";
  const btnActive =
    "flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border border-orange-200 bg-orange-50 text-orange-600 transition-all cursor-pointer";

  return (
    <nav
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled
          ? "bg-white/96 backdrop-blur-md shadow-sm border-b border-slate-100"
          : "bg-white/90 backdrop-blur-sm border-b border-slate-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2.5 no-underline shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-[0_4px_12px_rgba(249,115,22,0.3)]">
            <span className="text-white font-black text-sm">W</span>
          </div>
          <div>
            <p className="font-extrabold text-slate-900 text-sm leading-tight">
              Wimwa Tech
            </p>
            <p className="text-[10px] text-slate-400 leading-tight">
              General Supplies
            </p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          {user?.role === "admin" && (
            <button onClick={() => navigate("/admin")} className={btnAdmin}>
              <Icon.Gear className="w-3.5 h-3.5" />
              Admin Panel
            </button>
          )}
          {user ? (
            <>
              <Link
                to="/my-orders"
                className={`${
                  isActive("/my-orders") ? btnActive : btnGhost
                } no-underline`}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 00-2 2v16l3-2 2 2 2-2 2 2 2-2 3 2V4a2 2 0 00-2-2z" />
                  <line x1="9" y1="9" x2="15" y2="9" />
                  <line x1="9" y1="13" x2="15" y2="13" />
                  <line x1="9" y1="17" x2="13" y2="17" />
                </svg>
                My Orders
              </Link>
              <span className="text-xs text-slate-400 font-medium px-1">
                Hi, {user.name?.split(" ")[0]}
              </span>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className={btnDanger}
              >
                <Icon.LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className={isActive("/login") ? btnActive : btnGhost}
              >
                Sign in
              </button>
              <button
                onClick={() => navigate("/register")}
                className={btnPrimary}
              >
                Register
              </button>
            </>
          )}
          <button
            onClick={onCartOpen}
            className="relative w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-orange-50 hover:border-orange-200 flex items-center justify-center transition-all shadow-sm cursor-pointer"
          >
            <Icon.ShoppingBag className="w-[18px] h-[18px] text-slate-600" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-black flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={onCartOpen}
            className="relative w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center shadow-sm cursor-pointer"
          >
            <Icon.ShoppingBag className="w-[18px] h-[18px] text-slate-600" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-black flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span
              className={`block w-5 h-0.5 bg-slate-700 rounded transition-all duration-300 ${
                menuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-slate-700 rounded transition-all duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-slate-700 rounded transition-all duration-300 ${
                menuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/98 backdrop-blur-sm px-4 py-3 flex flex-col gap-1.5 shadow-lg">
          {user?.role === "admin" && (
            <button
              onClick={() => {
                navigate("/admin");
                setMenuOpen(false);
              }}
              className="flex items-center gap-2.5 text-sm font-bold text-violet-700 py-2.5 px-3.5 rounded-xl bg-violet-50 border border-violet-100 hover:bg-violet-100 transition-colors text-left cursor-pointer"
            >
              <Icon.Gear className="w-4 h-4 shrink-0" />
              Admin Panel
            </button>
          )}
          {user ? (
            <>
              <button
                onClick={() => {
                  navigate("/my-orders");
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 py-2.5 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 00-2 2v16l3-2 2 2 2-2 2 2 2-2 3 2V4a2 2 0 00-2-2z" />
                  <line x1="9" y1="9" x2="15" y2="9" />
                  <line x1="9" y1="13" x2="15" y2="13" />
                  <line x1="9" y1="17" x2="13" y2="17" />
                </svg>
                My Orders
              </button>
              <div className="flex items-center gap-2.5 px-3.5 py-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0">
                  <span className="text-white font-black text-[10px]">
                    {user.name?.[0]?.toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Signed in as{" "}
                  <span className="text-slate-700 font-semibold">
                    {user.name}
                  </span>
                </span>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2.5 text-sm font-semibold text-rose-500 py-2.5 px-3.5 rounded-xl border border-rose-100 bg-rose-50 hover:bg-rose-100 transition-colors text-left cursor-pointer"
              >
                <Icon.LogOut className="w-4 h-4 shrink-0" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  navigate("/login");
                  setMenuOpen(false);
                }}
                className="text-sm font-semibold text-slate-700 py-2.5 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                Sign in
              </button>
              <button
                onClick={() => {
                  navigate("/register");
                  setMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 text-sm font-bold text-white py-2.5 px-3.5 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-[0_3px_10px_rgba(249,115,22,0.3)] cursor-pointer"
              >
                Register
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

// ── HERO ──────────────────────────────────────────────────────────────────────
function Hero({ onShopNow }) {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
  }, []);

  return (
    <section className="relative overflow-hidden" style={{ minHeight: "92vh" }}>
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(155deg, rgba(6,13,26,1) 0%, rgba(11,20,34,0.97) 45%, rgba(8,15,28,0.95) 100%)",
        }}
      />

      <style>{`
        @keyframes wt-scan { 0%{top:-2px;opacity:.2}90%{opacity:.2}100%{top:100%;opacity:0} }
        @keyframes wt-shimmer { 0%{background-position:-260% center}100%{background-position:260% center} }
        @keyframes wt-slideLeft { from{opacity:0;transform:translateX(-26px)}to{opacity:1;transform:translateX(0)} }
        @keyframes wt-fadeUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        @keyframes wt-badgeDrop { from{opacity:0;transform:translateY(-10px) scale(.94)}to{opacity:1;transform:translateY(0) scale(1)} }
        .wt-scan::before{content:'';position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(249,115,22,.25),transparent);animation:wt-scan 9s ease-in-out infinite;pointer-events:none;z-index:1}
        .wt-shimmer{background:linear-gradient(90deg,#fde68a 0%,#f97316 22%,#fb923c 50%,#f97316 78%,#fde68a 100%);background-size:260% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:wt-shimmer 3.8s linear infinite}
        .wt-a-badge{animation:wt-badgeDrop .55s cubic-bezier(.22,1,.36,1) both .04s}
        .wt-a-h1{animation:wt-slideLeft .65s cubic-bezier(.22,1,.36,1) both .16s}
        .wt-a-sub{animation:wt-fadeUp .55s cubic-bezier(.22,1,.36,1) both .28s}
        .wt-a-ctas{animation:wt-fadeUp .55s cubic-bezier(.22,1,.36,1) both .40s}
        .wt-a-badge,.wt-a-h1,.wt-a-sub,.wt-a-ctas{opacity:0;animation-fill-mode:forwards}
        @keyframes wt-diagonal { 0%,100%{opacity:.04} 50%{opacity:.08} }
        .wt-grid-pulse { animation: wt-diagonal 8s ease-in-out infinite; }
        @keyframes marquee-up {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .marquee-track { animation: marquee-up 22s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>

      {/* Dot-grid */}
      <div
        className="wt-grid-pulse absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(249,115,22,.25) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      {/* Top orange line */}
      <div
        className="absolute top-0 inset-x-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(249,115,22,.9) 30%, rgba(251,146,60,.5) 65%, transparent 100%)",
        }}
      />

      {/* Ambient glow */}
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{
          width: "min(600px, 100vw)",
          height: "min(600px, 100vw)",
          background:
            "radial-gradient(circle, rgba(249,115,22,.1) 0%, transparent 65%)",
        }}
      />

      {/* Content */}
      <div
        className="wt-scan relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ minHeight: "92vh", display: "flex", alignItems: "center" }}
      >
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-14 py-20 lg:py-0">
          {/* LEFT: Copy */}
          <div className="flex flex-col items-start">
            <div
              className={`${
                mounted ? "wt-a-badge" : ""
              } flex items-center gap-2.5 mb-6`}
            >
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-55" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-400" />
              </span>
              <span
                className="text-[11px] font-semibold tracking-[0.13em] uppercase"
                style={{ color: "rgba(251,146,60,.65)" }}
              >
                Wimwa Tech General Supplies
              </span>
              <span className="hidden sm:inline-block w-px h-3.5 bg-white/12" />
              <span className="hidden sm:inline text-[10px] text-white/22 tracking-wide">
                Kiserian, Kenya
              </span>
            </div>

            <h1
              className={`${mounted ? "wt-a-h1" : ""} mb-6`}
              style={{ lineHeight: 1.02, letterSpacing: "-0.03em" }}
            >
              <span className="block text-white/25 text-[11px] font-bold tracking-[0.22em] uppercase mb-4">
                Tech &amp; General Supplies
              </span>
              <span
                className="block text-white font-black"
                style={{ fontSize: "clamp(2.4rem,5vw,4rem)" }}
              >
                Everything
              </span>
              <span
                className="block font-black wt-shimmer"
                style={{ fontSize: "clamp(2.4rem,5vw,4rem)" }}
              >
                Your Business
              </span>
              <span
                className="block text-white font-black"
                style={{ fontSize: "clamp(2.4rem,5vw,4rem)" }}
              >
                Needs.
              </span>
              <span
                className="block font-semibold mt-3"
                style={{
                  fontSize: "clamp(1rem,2.2vw,1.35rem)",
                  letterSpacing: "-0.01em",
                  color: "rgba(148,163,184,.65)",
                }}
              >
                Printers · Networking · Security · Construction
              </span>
            </h1>

            <p
              className={`${
                mounted ? "wt-a-sub" : ""
              } mb-8 w-full sm:max-w-[420px]`}
              style={{
                color: "rgba(148,163,184,.85)",
                fontSize: "15px",
                lineHeight: 1.8,
              }}
            >
              Shop online, get instant pricing, and receive a branded PDF
              quotation — delivered to you in minutes.
            </p>

            <div
              className={`${
                mounted ? "wt-a-ctas" : ""
              } flex flex-col sm:flex-row gap-3`}
            >
              <button
                onClick={onShopNow}
                className="group relative overflow-hidden flex items-center justify-center gap-2.5 font-bold text-white text-[15px] px-5 sm:px-8 py-4 rounded-2xl border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg,#fb923c 0%,#ea580c 100%)",
                  boxShadow:
                    "0 8px 32px rgba(249,115,22,.44),inset 0 1px 0 rgba(255,255,255,.18)",
                }}
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none" />
                <Icon.ShoppingBag className="w-4 h-4" />
                Browse Products
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="flex items-center justify-center gap-2 font-semibold text-slate-300 text-[15px] px-5 sm:px-8 py-4 rounded-2xl cursor-pointer transition-all duration-200 hover:text-white hover:-translate-y-0.5 border-none"
                style={{
                  background: "rgba(255,255,255,.04)",
                  border: "1px solid rgba(255,255,255,.11)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,.06)",
                }}
              >
                <Icon.Phone className="w-4 h-4" /> Contact us
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-8 pt-7 border-t border-white/8 w-full overflow-hidden">
              {[
                "🖨️ Printers",
                "🔋 UPS & Power",
                "🌐 Networking",
                "🖥️ Monitors",
                "📷 CCTV",
                "🏗️ Construction",
                "⌨️ Peripherals",
                "🔌 Cables",
              ].map((cat) => (
                <span
                  key={cat}
                  onClick={onShopNow}
                  className="inline-flex items-center text-[11px] font-semibold text-white/40 px-3 py-1.5 rounded-full cursor-pointer hover:text-white/70 transition-colors"
                  style={{
                    background: "rgba(255,255,255,.04)",
                    border: "1px solid rgba(255,255,255,.07)",
                  }}
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT: Capability panel */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full" style={{ maxWidth: "min(480px, 100%)" }}>
              <HeroRightPanel />
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div
        className="absolute bottom-0 inset-x-0 pointer-events-none overflow-hidden"
        style={{ lineHeight: 0 }}
      >
        <svg
          viewBox="0 0 1440 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ display: "block", width: "100%", height: "52px" }}
        >
          <path
            d="M0 52L80 44.3C160 37 320 21 480 18.3C640 16 800 26 960 32C1120 38 1280 40 1360 41L1440 42V52H0Z"
            fill="#f8fafc"
          />
        </svg>
      </div>
    </section>
  );
}

// ── TRUST STRIP ───────────────────────────────────────────────────────────────
function TrustStrip() {
  const stats = [
    {
      IconComp: Icon.Users,
      label: "300+ Businesses Served",
      sub: "Across Kenya",
      color: "text-violet-500",
      bg: "bg-violet-50",
    },
    {
      IconComp: Icon.Clock,
      label: "Same-Day Quotations",
      sub: "Within 2 hours",
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      IconComp: Icon.Truck,
      label: "Nationwide Delivery",
      sub: "All 47 counties",
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      IconComp: Icon.Shield,
      label: "Genuine Products",
      sub: "Warranted & certified",
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
  ];
  return (
    <div className="bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}
              >
                <s.IconComp
                  className={`w-4.5 h-4.5 ${s.color}`}
                  style={{ width: 18, height: 18 }}
                />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{s.label}</p>
                <p className="text-[10px] text-slate-400">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── FEATURED CATEGORIES ───────────────────────────────────────────────────────
function findRealCategory(dbCategories, keyword) {
  const kw = keyword.toLowerCase();
  return (
    dbCategories.find((c) => c.toLowerCase() === kw) ||
    dbCategories.find((c) => c.toLowerCase().includes(kw)) ||
    dbCategories.find((c) => kw.includes(c.toLowerCase())) ||
    null
  );
}

function FeaturedCategories({ onSelect, categories }) {
  const tiles = [
    {
      keyword: "printer",
      label: "Printers",
      emoji: "🖨️",
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.08)",
      border: "rgba(59,130,246,0.2)",
      desc: "LaserJet, Inkjet & Scanners",
    },
    {
      keyword: "network",
      label: "Networking",
      emoji: "🌐",
      color: "#06b6d4",
      bg: "rgba(6,182,212,0.08)",
      border: "rgba(6,182,212,0.2)",
      desc: "Switches, Routers & Cables",
    },
    {
      keyword: "security",
      label: "Security",
      emoji: "📷",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.08)",
      border: "rgba(239,68,68,0.2)",
      desc: "CCTV Kits & Access Control",
    },
    {
      keyword: "power",
      label: "Power",
      emoji: "🔋",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.08)",
      border: "rgba(245,158,11,0.2)",
      desc: "UPS, Inverters & Stabilizers",
    },
    {
      keyword: "display",
      label: "Displays",
      emoji: "🖥️",
      color: "#8b5cf6",
      bg: "rgba(139,92,246,0.08)",
      border: "rgba(139,92,246,0.2)",
      desc: "Monitors & Projectors",
    },
    {
      keyword: "construction",
      label: "Construction",
      emoji: "🏗️",
      color: "#f97316",
      bg: "rgba(249,115,22,0.08)",
      border: "rgba(249,115,22,0.2)",
      desc: "Cement, Steel & Hardware",
    },
    {
      keyword: "peripheral",
      label: "Peripherals",
      emoji: "⌨️",
      color: "#ec4899",
      bg: "rgba(236,72,153,0.08)",
      border: "rgba(236,72,153,0.2)",
      desc: "Keyboards, Mice & Headsets",
    },
    {
      keyword: "cable",
      label: "Cables",
      emoji: "🔌",
      color: "#10b981",
      bg: "rgba(16,185,129,0.08)",
      border: "rgba(16,185,129,0.2)",
      desc: "HDMI, USB & Patch Cables",
    },
  ];
  const dbCats = categories.filter((c) => c !== "All");
  const cats = tiles
    .map((t) => ({ ...t, realCategory: findRealCategory(dbCats, t.keyword) }))
    .filter((t) => t.realCategory !== null);
  return (
    <section className="bg-white py-14 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[11px] font-bold text-orange-500 uppercase tracking-widest mb-1">
              Browse by Category
            </p>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              What are you looking for?
            </h2>
          </div>
          <button
            onClick={() => onSelect("All")}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-orange-500 transition-colors"
          >
            View all products
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {cats.map((cat) => (
            <button
              key={cat.label}
              onClick={() => onSelect(cat.realCategory)}
              className="group flex flex-col items-center gap-2.5 p-4 rounded-2xl text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg border"
              style={{ background: cat.bg, borderColor: cat.border }}
            >
              <span
                className="text-2xl w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                style={{ background: `${cat.color}15` }}
              >
                {cat.emoji}
              </span>
              <div>
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {cat.label}
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5 leading-tight hidden sm:block">
                  {cat.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── HOW IT WORKS ──────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      icon: (
        <Icon.Search
          style={{ width: 22, height: 22, stroke: "currentColor" }}
        />
      ),
      title: "Browse & Select",
      desc: "Search our catalog of 500+ products across tech, networking, security, and construction supplies.",
      color: "#3b82f6",
    },
    {
      icon: (
        <Icon.ShoppingBag
          style={{ width: 22, height: 22, stroke: "currentColor" }}
        />
      ),
      title: "Add to Cart",
      desc: "Add items to your cart with exact quantities. Mix products from different categories freely.",
      color: "#f97316",
    },
    {
      icon: (
        <Icon.FileText
          style={{ width: 22, height: 22, stroke: "currentColor" }}
        />
      ),
      title: "Request Quotation",
      desc: "Submit your cart and receive a formal branded PDF quotation within 2 hours during business hours.",
      color: "#10b981",
    },
    {
      icon: (
        <Icon.Phone style={{ width: 22, height: 22, stroke: "currentColor" }} />
      ),
      title: "Confirm & Deliver",
      desc: "Approval of the quotation, make payment, and we'll arrange delivery anywhere in Kenya.",
      color: "#8b5cf6",
    },
  ];
  return (
    <section className="bg-slate-50 py-16 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold text-orange-500 uppercase tracking-widest mb-2">
            Simple Process
          </p>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            How It Works
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
            From browsing to delivery — fast and transparent for businesses of
            all sizes.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <div
            className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, #e2e8f0 0%, #fed7aa 50%, #e2e8f0 100%)",
            }}
          />
          {steps.map((s, i) => (
            <div
              key={i}
              className="relative flex flex-col items-center text-center"
            >
              <div
                className="relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-md"
                style={{
                  background: `${s.color}12`,
                  border: `1.5px solid ${s.color}25`,
                }}
              >
                <div style={{ color: s.color }}>{s.icon}</div>
                <span
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-[10px] font-black text-white flex items-center justify-center shadow-sm"
                  style={{ background: s.color }}
                >
                  {i + 1}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">
                {s.title}
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-[200px]">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  const [addedIds, setAddedIds] = useState(new Set());
  const [cartOpen, setCartOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const catalogRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    cart,
    addToCart,
    addWithQty,
    removeFromCart,
    updateQty,
    clearCart,
    total,
    count,
  } = useCart();
  const location = useLocation();

  const cartFromNavHandled = useRef(false);
  useEffect(() => {
    if (cartFromNavHandled.current) return;
    const item = location.state?.addToCart;
    if (!item) return;
    cartFromNavHandled.current = true;
    window.history.replaceState({}, "");
    addWithQty(item);
    setCartOpen(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_URL}/api/products`, {
          timeout: 20000,
        });
        const data = unwrapList(res.data, "products");
        if (data.length === 0)
          console.warn(
            "[HomePage] Products API returned 0 items. Raw response:",
            res.data
          );
        setProducts(data);
        setCategories([
          "All",
          ...new Set(data.map((p) => p.category).filter(Boolean)),
        ]);
      } catch (err) {
        console.error(
          "[HomePage] Failed to load products:",
          err.response?.data || err.message
        );
        setError("Could not load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  const handleAdd = (product) => {
    addToCart(product);
    setAddedIds((prev) => new Set([...prev, product._id]));
    setTimeout(
      () =>
        setAddedIds((prev) => {
          const n = new Set(prev);
          n.delete(product._id);
          return n;
        }),
      1500
    );
  };

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    catalogRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleRequestQuotation = () => {
    setCartOpen(false);
    if (!user) {
      setShowAuthModal(true);
    } else {
      navigate("/request-quotation", { state: { cartItems: cart, total } });
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    navigate("/request-quotation", { state: { cartItems: cart, total } });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar cartCount={count} onCartOpen={() => setCartOpen(true)} />
      <div className="overflow-x-hidden">
        {showAuthModal && (
          <AuthPromptModal
            onClose={() => setShowAuthModal(false)}
            onAuthSuccess={handleAuthSuccess}
            cartTotal={total}
          />
        )}
        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          cart={cart}
          onRemove={removeFromCart}
          onUpdateQty={updateQty}
          onClear={clearCart}
          total={total}
          onRequestQuotation={handleRequestQuotation}
        />
        <Hero
          onShopNow={() =>
            catalogRef.current?.scrollIntoView({ behavior: "smooth" })
          }
        />
        <TrustStrip />
        <FeaturedCategories
          onSelect={handleCategorySelect}
          categories={categories}
        />
        <HowItWorks />

        {/* ── CATALOG ── */}
        <section
          ref={catalogRef}
          className="max-w-7xl mx-auto px-4 sm:px-6 py-12"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Our Products
              </h2>
              <p className="text-slate-400 text-sm mt-0.5">
                {loading
                  ? "Loading…"
                  : `${filtered.length} item${
                      filtered.length !== 1 ? "s" : ""
                    } available`}
              </p>
            </div>
            <div className="relative sm:w-72">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-200"
              />
            </div>
          </div>
          {categories.length > 1 && (
            <div className="flex gap-2 flex-wrap mb-6 pb-4 border-b border-slate-100">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all ${
                    category === cat
                      ? "bg-orange-500 text-white shadow-[0_4px_14px_rgba(249,115,22,0.3)]"
                      : "bg-white text-slate-500 border border-slate-200 hover:border-orange-200 hover:text-orange-500"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100"
                >
                  <div
                    className="bg-slate-100 animate-pulse"
                    style={{ height: "160px" }}
                  />
                  <div className="p-3 space-y-2">
                    <div className="h-2.5 bg-slate-100 rounded animate-pulse w-1/2" />
                    <div className="h-3 bg-slate-100 rounded animate-pulse w-3/4" />
                    <div className="h-7 bg-slate-100 rounded animate-pulse mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Icon.AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <p className="text-slate-500 font-semibold mb-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 text-orange-500 text-sm font-semibold hover:underline"
              >
                Try again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Icon.Search className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-400 font-semibold">
                {products.length === 0
                  ? "No products have been added yet"
                  : "No products found"}
              </p>
              {products.length > 0 && (
                <button
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                  }}
                  className="mt-3 text-orange-500 text-sm font-semibold hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filtered.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  onAdd={handleAdd}
                  added={addedIds.has(p._id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── FOOTER ── */}
        <footer className="bg-slate-950 text-slate-400 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6 sm:pt-12 sm:pb-10">
            <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-[0_4px_14px_rgba(249,115,22,.35)] shrink-0">
                  <span className="text-white font-black text-xs sm:text-sm">
                    W
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-xs sm:text-sm leading-tight">
                    Wimwa Tech
                  </p>
                  <p className="text-slate-500 text-[10px] sm:text-xs truncate">
                    General Supplies Ltd · Kiserian
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {[
                  { label: "fb", href: "#", icon: "f" },
                  { label: "tw", href: "#", icon: "𝕏" },
                  {
                    label: "wa",
                    href: "https://wa.me/254712953780",
                    icon: "W",
                  },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-400 hover:text-white hover:bg-orange-500/20 hover:border-orange-500/30 transition-all no-underline"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 sm:gap-x-8 sm:gap-y-8 mb-6">
              <div>
                <p className="text-white font-bold text-[10px] sm:text-xs mb-2.5 uppercase tracking-wider">
                  Categories
                </p>
                <div className="space-y-1.5 sm:space-y-2">
                  {[
                    { label: "Printers & Scanners", keyword: "printer" },
                    { label: "Networking & Cables", keyword: "network" },
                    { label: "UPS & Power", keyword: "power" },
                    { label: "CCTV & Security", keyword: "security" },
                    { label: "Monitors", keyword: "display" },
                    { label: "Peripherals", keyword: "peripheral" },
                    { label: "Construction", keyword: "construction" },
                  ].map((c) => {
                    const real = findRealCategory(
                      categories.filter((x) => x !== "All"),
                      c.keyword
                    );
                    return (
                      <p
                        key={c.label}
                        onClick={() => real && handleCategorySelect(real)}
                        className={`text-[11px] sm:text-xs transition-colors leading-snug ${
                          real
                            ? "text-slate-500 hover:text-orange-400 cursor-pointer"
                            : "text-slate-600 opacity-40 cursor-default"
                        }`}
                      >
                        {c.label}
                      </p>
                    );
                  })}
                </div>
              </div>

              {/* Col 2: Company*/}
              <div>
                <p className="text-white font-bold text-[10px] sm:text-xs mb-2.5 uppercase tracking-wider">
                  Company
                </p>
                <div className="space-y-1.5 sm:space-y-2">
                  {[
                    { label: "About Us", to: "/about" },
                    { label: "Privacy Policy", to: "/privacy-policy" },
                    { label: "Terms of Service", to: "/terms" },
                    { label: "Sign In", to: "/login" },
                    { label: "Register", to: "/register" },
                    { label: "My Orders", to: "/my-orders" },
                  ].map((l) => (
                    <Link
                      key={l.label}
                      to={l.to}
                      className="block text-slate-500 text-[11px] sm:text-xs hover:text-orange-400 transition-colors no-underline leading-snug"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/*Col 3: Contact -- Second row on mobile, col 3 on md+ */}
              <div>
                <p className="text-white font-bold text-[10px] sm:text-xs mb-2.5 uppercase tracking-wider">
                  Contact
                </p>
                <div className="space-y-1.5 sm:space-y-2.5">
                  {[
                    { icon: "🌍", text: "P.O Box 273-00206, Kiserian" },
                    {
                      icon: (
                        <Icon.Phone className="w-3 h-3 text-slate-400 shrink-0 mt-px" />
                      ),
                      text: "+254 712 953 780",
                    },
                    { icon: "✉️", text: "wimwatech@gmail.com" },
                    { icon: "🕐", text: "Mon–Sat: 8AM–6PM" },
                  ].map((c) => (
                    <div key={c.text} className="flex items-start gap-1.5">
                      <span className="text-[11px] mt-px shrink-0">
                        {c.icon}
                      </span>
                      <p className="text-slate-500 text-[11px] sm:text-xs leading-snug">
                        {c.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-white font-bold text-[10px] sm:text-xs mb-2.5 uppercase tracking-wider">
                  Newsletter
                </p>
                <p className="text-slate-500 text-[11px] sm:text-xs mb-3 leading-snug">
                  Get price updates &amp; new arrivals.
                </p>
                <div className="flex flex-col xs:flex-row gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full min-w-0 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50 transition-all"
                  />
                  <button className="w-full xs:w-auto px-3 py-2 bg-gradient-to-br from-orange-400 to-orange-600 text-white text-[11px] font-bold rounded-lg shadow-[0_3px_10px_rgba(249,115,22,.25)] hover:opacity-90 transition-all whitespace-nowrap shrink-0">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 sm:gap-0">
              <p className="text-[10px] sm:text-xs text-slate-600 text-center sm:text-left">
                © {new Date().getFullYear()} Wimwa Tech General Supplies Ltd.
                All rights reserved.
              </p>
              <div className="flex items-center justify-center sm:justify-end gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[10px] sm:text-xs text-emerald-700">
                  Thank you for trusting our services
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
