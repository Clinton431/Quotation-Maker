import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ── STOCK CONFIG ──────────────────────────────────────────────────────────────
const STOCK_CONFIG = {
  "In Stock": {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600",
    dot: "bg-emerald-500",
    border: "border-emerald-200",
    label: "In Stock",
  },
  "Low Stock": {
    bg: "bg-amber-500/10",
    text: "text-amber-600",
    dot: "bg-amber-500",
    border: "border-amber-200",
    label: "Low Stock",
  },
  "Out of Stock": {
    bg: "bg-red-500/10",
    text: "text-red-500",
    dot: "bg-red-500",
    border: "border-red-200",
    label: "Out of Stock",
  },
};

function StockBadge({ status }) {
  const s = STOCK_CONFIG[status] || STOCK_CONFIG["In Stock"];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function RatingStars({ rating = 4.5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const full = rating >= star;
        const half = !full && rating >= star - 0.5;
        return (
          <svg
            key={star}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={full || half ? "#f59e0b" : "#e2e8f0"}
            stroke="none"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      })}
    </div>
  );
}

// ── IMAGE GALLERY ─────────────────────────────────────────────────────────────
function ImageGallery({ images, productName }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const imgRef = useRef(null);

  const allImages = images?.length ? images : [null];

  const handleMouseMove = (e) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Main image — aspect-ratio based, no fixed height */}
      <div
        ref={imgRef}
        onMouseEnter={() => allImages[active] && setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMouseMove}
        className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 cursor-zoom-in"
        style={{ aspectRatio: "4/3" }}
      >
        {allImages[active] ? (
          <img
            src={allImages[active]}
            alt={productName}
            className="w-full h-full object-contain transition-transform duration-200"
            style={
              zoomed
                ? {
                    transform: "scale(1.8)",
                    transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                  }
                : {}
            }
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <svg
              className="w-16 h-16 text-slate-200"
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
            <span className="text-slate-300 text-sm font-medium">
              No image available
            </span>
          </div>
        )}
        {zoomed && allImages[active] && (
          <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm pointer-events-none">
            🔍 Hover to zoom
          </div>
        )}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm pointer-events-none">
            {active + 1} / {allImages.length}
          </div>
        )}
        {allImages.length > 1 && (
          <>
            <button
              onClick={() =>
                setActive((p) => (p - 1 + allImages.length) % allImages.length)
              }
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 border border-slate-200 shadow flex items-center justify-center hover:bg-white transition-colors cursor-pointer backdrop-blur-sm"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => setActive((p) => (p + 1) % allImages.length)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 border border-slate-200 shadow flex items-center justify-center hover:bg-white transition-colors cursor-pointer backdrop-blur-sm"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails — only shown when >1 image */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                active === i
                  ? "border-orange-400 shadow-[0_0_0_2px_rgba(249,115,22,0.15)]"
                  : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
              }`}
            >
              {img ? (
                <img
                  src={img}
                  alt={`${productName} ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-slate-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── RELATED PRODUCT CARD ──────────────────────────────────────────────────────
function RelatedCard({ product, onClick }) {
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100
        )
      : null;
  return (
    <div
      onClick={() => onClick(product._id)}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      <div
        className="relative bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden"
        style={{ height: "140px" }}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-slate-200"
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
        {discount && (
          <span className="absolute top-2 left-2 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-500 text-white">
            -{discount}%
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-[9px] font-bold text-orange-500 uppercase tracking-widest mb-0.5 truncate">
          {product.category}
        </p>
        <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
          {product.name}
        </h4>
        <p className="text-sm font-black text-slate-900 mt-1.5">
          Ksh {product.price?.toLocaleString("en-KE")}
        </p>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMounted(false);
    setLoading(true);
    setError("");

    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/products/${id}`);
        const data = res.data?.product || res.data?.data || res.data;
        setProduct(data);

        // Fetch related products from same category
        if (data?.category) {
          const allRes = await axios.get(`${API_URL}/api/products`);
          const all = Array.isArray(allRes.data)
            ? allRes.data
            : allRes.data?.products || allRes.data?.data || [];
          setRelated(
            all
              .filter((p) => p.category === data.category && p._id !== data._id)
              .slice(0, 4)
          );
        }
        setTimeout(() => setMounted(true), 60);
      } catch (err) {
        setError("Product not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    // Navigate back to home, passing the item in location state so
    // HomePage's useCart hook can add it immediately on arrival.
    setAddedToCart(true);
    setTimeout(() => {
      navigate("/", {
        state: { addToCart: { ...product, qty } },
      });
    }, 600);
  };

  const handleRequestQuotation = () => {
    if (!product) return;
    const cartItems = [{ ...product, qty }];
    const total = product.price * qty;
    if (!user) {
      navigate("/login", { state: { from: `/products/${id}` } });
    } else {
      navigate("/request-quotation", { state: { cartItems, total } });
    }
  };

  const discount =
    product?.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100
        )
      : null;

  // Build images array: primary imageUrl + gallery images (extract .url from objects)
  const images = product
    ? [
        product.imageUrl,
        ...(product.images || []).map((img) =>
          typeof img === "string" ? img : img?.url
        ),
      ].filter(Boolean)
    : [];

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading product…</p>
        </div>
      </div>
    );

  if (error || !product)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="font-bold text-slate-900 text-lg mb-2">
            Product not found
          </p>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors cursor-pointer"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );

  const outOfStock = product.stockStatus === "Out of Stock";

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        @keyframes pd-fadeUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
        @keyframes pd-fadeIn { from{opacity:0}to{opacity:1} }
        .pd-fade-up { animation: pd-fadeUp 0.5s cubic-bezier(.22,1,.36,1) forwards; opacity: 0; }
        .pd-fade-in { animation: pd-fadeIn 0.4s ease forwards; opacity: 0; }
        .pd-delay-1 { animation-delay: 0.05s; }
        .pd-delay-2 { animation-delay: 0.12s; }
        .pd-delay-3 { animation-delay: 0.20s; }
        .pd-delay-4 { animation-delay: 0.28s; }
      `}</style>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 no-underline shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-[0_3px_10px_rgba(249,115,22,0.3)]">
              <span className="text-white font-black text-xs">W</span>
            </div>
            <span className="font-extrabold text-slate-900 text-sm hidden sm:block">
              Wimwa Tech
            </span>
          </Link>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 min-w-0 flex-1">
            <Link
              to="/"
              className="hover:text-orange-500 transition-colors no-underline shrink-0"
            >
              Shop
            </Link>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
            {product.category && (
              <>
                <Link
                  to={`/?category=${product.category}`}
                  className="hover:text-orange-500 transition-colors no-underline truncate max-w-[100px]"
                >
                  {product.category}
                </Link>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </>
            )}
            <span className="text-slate-600 font-medium truncate">
              {product.name}
            </span>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* ── Main product section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-10 lg:items-start">
          {/* Left: Image Gallery */}
          <div className={mounted ? "pd-fade-in" : "opacity-0"}>
            <ImageGallery images={images} productName={product.name} />
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col gap-3.5">
            {/* Category + Stock */}
            <div
              className={`flex items-center gap-2 flex-wrap ${
                mounted ? "pd-fade-up pd-delay-1" : "opacity-0"
              }`}
            >
              {product.category && (
                <span className="text-[10px] font-extrabold text-orange-500 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full uppercase tracking-widest">
                  {product.category}
                </span>
              )}
              <StockBadge status={product.stockStatus || "In Stock"} />
              {discount && (
                <span className="text-[10px] font-black bg-red-500 text-white px-2.5 py-1 rounded-full">
                  -{discount}% OFF
                </span>
              )}
            </div>

            {/* Name */}
            <div className={mounted ? "pd-fade-up pd-delay-1" : "opacity-0"}>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight tracking-tight">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div
              className={`flex items-center gap-2 ${
                mounted ? "pd-fade-up pd-delay-2" : "opacity-0"
              }`}
            >
              <RatingStars rating={product.rating || 4.5} />
              <span className="text-sm font-bold text-slate-900">
                {(product.rating || 4.5).toFixed(1)}
              </span>
              {product.reviewCount > 0 && (
                <span className="text-xs text-slate-400">
                  ({product.reviewCount} reviews)
                </span>
              )}
              <span className="text-slate-200">·</span>
              <span className="text-xs text-slate-400">
                {product.unit ? `Per ${product.unit}` : "Each"}
              </span>
            </div>

            {/* Price */}
            <div
              className={`flex items-baseline gap-3 ${
                mounted ? "pd-fade-up pd-delay-2" : "opacity-0"
              }`}
            >
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                Ksh {product.price?.toLocaleString("en-KE")}
              </span>
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <span className="text-base text-slate-400 line-through font-semibold">
                    Ksh {product.originalPrice.toLocaleString("en-KE")}
                  </span>
                )}
              {discount && (
                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                  Save Ksh{" "}
                  {(product.originalPrice - product.price).toLocaleString(
                    "en-KE"
                  )}
                </span>
              )}
            </div>

            {/* Short description — capped at 3 lines */}
            {product.description && (
              <p
                className={`text-slate-500 text-sm leading-relaxed line-clamp-3 ${
                  mounted ? "pd-fade-up pd-delay-3" : "opacity-0"
                }`}
              >
                {product.description}
              </p>
            )}

            <div
              className={`h-px bg-slate-100 ${
                mounted ? "pd-fade-in pd-delay-3" : "opacity-0"
              }`}
            />

            {/* Quantity + Actions */}
            <div
              className={`flex flex-col gap-3 ${
                mounted ? "pd-fade-up pd-delay-3" : "opacity-0"
              }`}
            >
              {/* Qty selector */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-700">Qty:</span>
                <div className="flex items-center gap-0 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer text-lg font-bold border-r border-slate-200"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-black text-slate-900">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer text-lg font-bold border-l border-slate-200"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-slate-400">
                  ={" "}
                  <span className="font-bold text-slate-700">
                    Ksh {(product.price * qty).toLocaleString("en-KE")}
                  </span>
                </span>
              </div>

              {/* Buttons */}
              <div className="flex gap-2.5">
                <button
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                    outOfStock
                      ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                      : addedToCart
                      ? "bg-emerald-500 text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)]"
                      : "bg-white border-2 border-slate-200 text-slate-800 hover:border-orange-300 hover:bg-orange-50 active:scale-[0.98]"
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Added
                    </>
                  ) : (
                    <>
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 01-8 0" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>
                <button
                  onClick={handleRequestQuotation}
                  disabled={outOfStock}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer active:scale-[0.98] ${
                    outOfStock
                      ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_4px_14px_rgba(249,115,22,0.35)] hover:opacity-95"
                  }`}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  Request Quotation
                </button>
              </div>
            </div>

            {/* Meta info — compact horizontal strip */}
            <div
              className={`grid grid-cols-2 gap-2 ${
                mounted ? "pd-fade-up pd-delay-4" : "opacity-0"
              }`}
            >
              {[
                {
                  icon: "⚡",
                  label: "Same-day quotation",
                  sub: "Within 2 hours",
                },
                {
                  icon: "🚚",
                  label: "Nationwide delivery",
                  sub: "All 47 counties",
                },
                {
                  icon: "🛡️",
                  label: "Genuine product",
                  sub: "Warranted & certified",
                },
                {
                  icon: "📞",
                  label: "Expert support",
                  sub: "+254 712 953 780",
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-100"
                >
                  <span className="text-base shrink-0">{m.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 leading-tight truncate">
                      {m.label}
                    </p>
                    <p className="text-[10px] text-slate-400">{m.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs: Description / Specs / Delivery ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-8 overflow-hidden">
          {/* Tab headers */}
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {[
              { id: "description", label: "Description" },
              { id: "specs", label: "Specifications" },
              { id: "delivery", label: "Delivery & Returns" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-6 py-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "border-orange-500 text-orange-600 bg-orange-50/50"
                    : "border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6 sm:p-8">
            {activeTab === "description" && (
              <div>
                {product.description ? (
                  <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed">
                    <p className="text-base text-slate-700 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">
                    No description available for this product.
                  </p>
                )}
                {product.category && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Category
                    </p>
                    <span className="inline-flex items-center text-sm font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full">
                      {product.category}
                    </span>
                  </div>
                )}
              </div>
            )}

            {activeTab === "specs" && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-100 rounded-xl overflow-hidden border border-slate-100">
                  {[
                    { label: "Product Name", value: product.name },
                    { label: "Category", value: product.category || "—" },
                    { label: "Unit", value: product.unit || "piece" },
                    {
                      label: "Price (Ksh)",
                      value: product.price?.toLocaleString("en-KE"),
                    },
                    {
                      label: "Original Price",
                      value: product.originalPrice
                        ? `Ksh ${product.originalPrice.toLocaleString("en-KE")}`
                        : "—",
                    },
                    {
                      label: "Discount",
                      value: discount ? `${discount}%` : "—",
                    },
                    {
                      label: "Stock Status",
                      value: product.stockStatus || "In Stock",
                    },
                    {
                      label: "Rating",
                      value: `${(product.rating || 4.5).toFixed(1)} / 5.0`,
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-start gap-3 px-4 py-3 bg-white"
                    >
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-32 shrink-0 pt-0.5">
                        {row.label}
                      </span>
                      <span className="text-sm font-semibold text-slate-800 flex-1">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "delivery" && (
              <div className="flex flex-col gap-5">
                {[
                  {
                    icon: "🚚",
                    title: "Nationwide Delivery",
                    desc: "We deliver to all 47 counties in Kenya. Delivery typically takes 1–3 business days depending on your location. Same-day delivery available within Nairobi for orders placed before 12PM.",
                  },
                  {
                    icon: "📦",
                    title: "Packaging",
                    desc: "All products are carefully packaged to prevent damage during transit. Fragile items receive additional protective wrapping and are clearly marked.",
                  },
                  {
                    icon: "🔄",
                    title: "Returns & Exchanges",
                    desc: "We accept returns within 7 days of delivery for items in original condition. Contact us at wimwatech@gmail.com or +254 712 953 780 to initiate a return.",
                  },
                  {
                    icon: "💳",
                    title: "Payment",
                    desc: "Payment is required upon quotation approval. We accept M-Pesa, bank transfer, and cash. A formal receipt is issued for all transactions.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <span className="text-2xl shrink-0">{item.icon}</span>
                    <div>
                      <p className="font-bold text-slate-900 text-sm mb-1">
                        {item.title}
                      </p>
                      <p className="text-slate-500 text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[11px] font-bold text-orange-500 uppercase tracking-widest mb-1">
                  More Like This
                </p>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Related Products
                </h2>
              </div>
              <Link
                to="/"
                className="text-sm font-semibold text-slate-400 hover:text-orange-500 transition-colors no-underline flex items-center gap-1"
              >
                View all
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
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {related.map((p) => (
                <RelatedCard
                  key={p._id}
                  product={p}
                  onClick={(newId) => navigate(`/products/${newId}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky bottom bar on mobile ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-100 px-4 py-3 flex items-center gap-3 sm:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-400 truncate">{product.name}</p>
          <p className="text-base font-black text-slate-900">
            Ksh {(product.price * qty).toLocaleString("en-KE")}
          </p>
        </div>
        <button
          onClick={handleRequestQuotation}
          disabled={outOfStock}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            outOfStock
              ? "bg-slate-100 text-slate-300 cursor-not-allowed"
              : "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_3px_12px_rgba(249,115,22,0.35)]"
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Get Quote
        </button>
      </div>

      {/* Bottom spacer for mobile sticky bar */}
      <div className="h-20 sm:hidden" />
    </div>
  );
}
