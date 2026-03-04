import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
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

// ── STATUS CONFIG ─────────────────────────────────────────────────────────────
const QUOTATION_STATUSES = [
  {
    value: "pending",
    label: "Pending",
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
    glow: "shadow-amber-100",
  },
  {
    value: "processing",
    label: "Processing",
    bg: "bg-sky-100",
    text: "text-sky-700",
    border: "border-sky-200",
    dot: "bg-sky-500",
    glow: "shadow-sky-100",
  },
  {
    value: "sent",
    label: "Sent",
    bg: "bg-violet-100",
    text: "text-violet-700",
    border: "border-violet-200",
    dot: "bg-violet-500",
    glow: "shadow-violet-100",
  },
  {
    value: "approved",
    label: "Approved",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    glow: "shadow-emerald-100",
  },
  {
    value: "rejected",
    label: "Declined",
    bg: "bg-rose-100",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-500",
    glow: "shadow-rose-100",
  },
];

function StatusBadge({ status }) {
  const s =
    QUOTATION_STATUSES.find((x) => x.value === status) || QUOTATION_STATUSES[0];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function StockBadge({ status }) {
  const map = {
    "In Stock": {
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
    },
    "Low Stock": {
      bg: "bg-amber-100",
      text: "text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-500",
    },
    "Out of Stock": {
      bg: "bg-rose-100",
      text: "text-rose-700",
      border: "border-rose-200",
      dot: "bg-rose-500",
    },
  };
  const s = map[status] || map["In Stock"];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status || "In Stock"}
    </span>
  );
}

// ── STAT CARD ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent = "orange" }) {
  const accents = {
    orange: {
      bg: "from-orange-500 to-amber-500",
      light: "bg-orange-50",
      text: "text-orange-600",
      border: "border-orange-100",
    },
    blue: {
      bg: "from-sky-500 to-blue-600",
      light: "bg-sky-50",
      text: "text-sky-600",
      border: "border-sky-100",
    },
    emerald: {
      bg: "from-emerald-500 to-teal-500",
      light: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
    },
    violet: {
      bg: "from-violet-500 to-purple-600",
      light: "bg-violet-50",
      text: "text-violet-600",
      border: "border-violet-100",
    },
    rose: {
      bg: "from-rose-500 to-pink-600",
      light: "bg-rose-50",
      text: "text-rose-600",
      border: "border-rose-100",
    },
  };
  const a = accents[accent] || accents.orange;
  return (
    <div
      className={`relative bg-white rounded-2xl border ${a.border} p-5 overflow-hidden group hover:shadow-lg transition-all duration-300`}
    >
      <div
        className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${a.bg} opacity-10 group-hover:opacity-20 transition-opacity`}
      />
      <div
        className={`w-10 h-10 rounded-xl ${a.light} flex items-center justify-center mb-3 text-lg`}
      >
        {icon}
      </div>
      <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
      <p className={`text-xs font-bold ${a.text} mt-1`}>{label}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── IMAGE UPLOAD COMPONENT ────────────────────────────────────────────────────
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
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-700 mb-1.5">
        Product Image
      </label>
      {preview ? (
        <div className="relative group w-full h-40 rounded-2xl overflow-hidden border-2 border-orange-200 bg-slate-50">
          <img
            src={preview}
            alt="Product"
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="px-3 py-1.5 bg-white text-slate-800 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => {
                setPreview("");
                onChange("");
              }}
              className="px-3 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
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
              <p className="text-xs text-slate-400">Uploading…</p>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center mb-2">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-slate-500">
                Drop image here or{" "}
                <span className="text-orange-500">browse</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
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
      <div className="flex items-center gap-2 mt-1">
        <div className="flex-1 h-px bg-slate-100" />
        <span className="text-[10px] text-slate-400">or paste URL</span>
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
        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-orange-300 bg-white placeholder-slate-300"
      />
    </div>
  );
}

// ── QUOTATION DETAIL MODAL ────────────────────────────────────────────────────
function QuotationModal({
  quotation,
  onClose,
  onStatusUpdate,
  onDelete,
  navigate,
}) {
  const [status, setStatus] = useState(quotation.status);
  const [adminNotes, setAdminNotes] = useState(quotation.adminNotes || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await authAxios().patch(`/api/quotations/${quotation._id}`, {
        status,
        adminNotes,
      });
      onStatusUpdate(quotation._id, status, adminNotes);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this quotation permanently?")) return;
    setDeleting(true);
    try {
      await authAxios().delete(`/api/quotations/${quotation._id}`);
      onDelete(quotation._id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white/95 backdrop-blur px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10 rounded-t-3xl">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Quotation
            </p>
            <h2 className="font-black text-slate-900">
              #{quotation.quoteNumber || quotation._id?.slice(-6).toUpperCase()}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs font-bold text-rose-400 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 border border-rose-100 transition-colors disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl">
            {[
              {
                label: "Company",
                value: quotation.customer?.companyName,
                bold: true,
              },
              { label: "Contact", value: quotation.customer?.contactName },
              {
                label: "Email",
                value: quotation.customer?.email,
                orange: true,
              },
              { label: "Phone", value: quotation.customer?.phone || "—" },
            ].map((f) => (
              <div key={f.label}>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                  {f.label}
                </p>
                <p
                  className={`text-xs ${
                    f.bold
                      ? "font-bold text-slate-900"
                      : f.orange
                      ? "text-orange-500 font-medium"
                      : "text-slate-700"
                  }`}
                >
                  {f.value}
                </p>
              </div>
            ))}
            <div className="col-span-2">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                Delivery Address
              </p>
              <p className="text-xs text-slate-700">
                {quotation.customer?.deliveryAddress}
                {quotation.customer?.city ? `, ${quotation.customer.city}` : ""}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Order Items
            </p>
            <div className="space-y-2">
              {quotation.items?.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 overflow-hidden flex-shrink-0">
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
                      Qty: {item.qty} × Ksh{" "}
                      {item.price?.toLocaleString("en-KE")}
                    </p>
                  </div>
                  <p className="text-xs font-bold text-orange-500 shrink-0">
                    Ksh {item.subtotal?.toLocaleString("en-KE")}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
              <p className="text-sm font-bold text-slate-900">Total</p>
              <p className="text-xl font-black text-orange-500">
                Ksh {quotation.total?.toLocaleString("en-KE")}
              </p>
            </div>
          </div>

          {quotation.notes && (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1">
                Customer Notes
              </p>
              <p className="text-xs text-blue-800">{quotation.notes}</p>
            </div>
          )}

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Documents
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onClose();
                  navigate("/quotation", { state: { quotation } });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-colors"
              >
                📄 Quotation PDF
              </button>
              <button
                onClick={() => {
                  onClose();
                  navigate("/delivery-note", { state: { quotation } });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900 transition-colors"
              >
                🚚 Delivery Note
              </button>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Update Status
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
              {QUOTATION_STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStatus(s.value)}
                  className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border text-[10px] font-bold transition-all ${
                    status === s.value
                      ? `${s.bg} ${s.text} ${s.border} shadow-sm`
                      : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                  {s.label}
                </button>
              ))}
            </div>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={2}
              placeholder="Internal notes…"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-orange-300 placeholder-slate-300 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm rounded-xl hover:opacity-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
  );
}

// ── PRODUCT FORM MODAL ────────────────────────────────────────────────────────
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
      onSave();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white/95 backdrop-blur px-6 py-4 border-b border-slate-100 flex items-center justify-between rounded-t-3xl">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {isEdit ? "Editing" : "New Product"}
            </p>
            <h2 className="font-black text-slate-900">
              {isEdit ? product.name : "Add Product"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <ImageUploader
            value={form.imageUrl}
            onChange={(url) => set("imageUrl", url)}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. HP LaserJet Pro M404n"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-orange-300 bg-slate-50 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                placeholder="e.g. Printers"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-300 bg-slate-50 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Unit
              </label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => set("unit", e.target.value)}
                placeholder="piece"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-300 bg-slate-50 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Price (Ksh) *
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="28500"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-300 bg-slate-50 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Original Price
              </label>
              <input
                type="number"
                value={form.originalPrice}
                onChange={(e) => set("originalPrice", e.target.value)}
                placeholder="32000"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-300 bg-slate-50 focus:bg-white transition-all"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Stock Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["In Stock", "Low Stock", "Out of Stock"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("stockStatus", s)}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                      form.stockStatus === s
                        ? s === "In Stock"
                          ? "bg-emerald-100 border-emerald-200 text-emerald-700"
                          : s === "Low Stock"
                          ? "bg-amber-100 border-amber-200 text-amber-700"
                          : "bg-rose-100 border-rose-200 text-rose-700"
                        : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                placeholder="Brief product description…"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-300 bg-slate-50 focus:bg-white transition-all resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-500 text-xs px-3 py-2.5 rounded-xl">
              ⚠️ {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm rounded-xl hover:opacity-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

// ── TABS ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "quotations", label: "Quotations", icon: "📋" },
  { id: "products", label: "Products", icon: "📦" },
  { id: "customers", label: "Customers", icon: "👥" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

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
  const [searchQ, setSearchQ] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const hasFetched = useRef(false);

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
        api.get("/api/quotations").catch((err) => {
          console.error("[Admin] /api/quotations failed:", err.message);
          return { data: [] };
        }),
        api.get("/api/products").catch((err) => {
          console.error("[Admin] /api/products failed:", err.message);
          return { data: [] };
        }),
        api.get("/api/users").catch((err) => {
          console.error(
            "[Admin] /api/users failed:",
            err.response?.status,
            err.message
          );
          return { data: [] };
        }),
      ]);
      setQuotations(unwrapList(qRes.data, "quotations"));
      setProducts(unwrapList(pRes.data, "products"));
      setCustomers(unwrapList(cRes.data, "users", "customers"));
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

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await authAxios().delete(`/api/products/${id}`);
      setProducts((p) => p.filter((x) => x._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeRole = async (c) => {
    const newRole = c.role === "admin" ? "user" : "admin";
    if (!window.confirm(`Change ${c.name}'s role to ${newRole}?`)) return;
    try {
      await authAxios().patch(`/api/users/${c._id}/role`, { role: newRole });
      setCustomers((p) =>
        p.map((x) => (x._id === c._id ? { ...x, role: newRole } : x))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCustomer = async (c) => {
    if (!window.confirm(`Delete ${c.name}? This cannot be undone.`)) return;
    try {
      await authAxios().delete(`/api/users/${c._id}`);
      setCustomers((p) => p.filter((x) => x._id !== c._id));
    } catch (err) {
      console.error(err);
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
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filteredProducts = products.filter(
    (p) =>
      !productSearch ||
      p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const recentQuotations = [...quotations]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <div
          className="w-10 h-10 border-orange-500 border-t-transparent rounded-full animate-spin"
          style={{ borderWidth: 3 }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex font-sans">
      {/* Modals */}
      {selectedQuotation && (
        <QuotationModal
          quotation={selectedQuotation}
          onClose={() => setSelectedQuotation(null)}
          onStatusUpdate={handleStatusUpdate}
          onDelete={handleQuotationDelete}
          navigate={navigate}
        />
      )}
      {showProductModal && (
        <ProductModal
          product={selectedProduct}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
          onSave={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
            fetchAll();
          }}
        />
      )}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed top-0 left-0 h-full bg-slate-950 z-20 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "w-60" : "w-0 overflow-hidden"
        } lg:static lg:w-60 lg:flex-shrink-0`}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-[0_4px_14px_rgba(249,115,22,.4)] flex-shrink-0">
            <span className="text-white font-black text-sm">W</span>
          </div>
          <div>
            <p className="text-white font-black text-sm leading-none">
              Wimwa Tech
            </p>
            <p className="text-slate-500 text-[10px] mt-0.5">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-orange-500/20 to-amber-500/10 border border-orange-500/25 text-orange-400"
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <span className="text-base w-5 text-center">{tab.icon}</span>
              <span className="text-xs font-semibold flex-1">{tab.label}</span>
              {tab.id === "quotations" && stats.pending > 0 && (
                <span className="text-[9px] font-black bg-orange-500 text-white w-5 h-5 rounded-full flex items-center justify-center">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}

          {/* ── Document shortcuts in sidebar ── */}
          <div className="pt-3 mt-3 border-t border-white/8 space-y-1">
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-2">
              Documents
            </p>
            <button
              onClick={() => {
                navigate("/quotation");
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-slate-500 hover:text-orange-400 hover:bg-orange-500/10 transition-all"
            >
              <span className="text-base w-5 text-center">📄</span>
              <span className="text-xs font-semibold flex-1">
                Quotation Maker
              </span>
            </button>
            <button
              onClick={() => {
                navigate("/delivery-note");
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all"
            >
              <span className="text-base w-5 text-center">🚚</span>
              <span className="text-xs font-semibold flex-1">
                Delivery Note
              </span>
            </button>
          </div>
        </nav>

        <div className="px-3 pb-4 pt-3 border-t border-white/8 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-[10px]">
                {user?.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">
                {user?.name}
              </p>
              <p className="text-slate-500 text-[10px] truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all no-underline"
          >
            <span className="text-sm w-5 text-center">🏠</span>
            <span className="text-xs font-semibold">View Shop</span>
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/8 transition-all"
          >
            <span className="text-sm w-5 text-center">🚪</span>
            <span className="text-xs font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── Top bar ── */}
        <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-3.5 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="lg:hidden w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="3" y1="7" x2="21" y2="7" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="17" x2="21" y2="17" />
            </svg>
          </button>

          {/* Page title */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xl">
              {TABS.find((t) => t.id === activeTab)?.icon}
            </span>
            <div>
              <h1 className="font-black text-slate-900 text-sm leading-none">
                {TABS.find((t) => t.id === activeTab)?.label}
              </h1>
              <p className="text-slate-400 text-[10px] mt-0.5">
                Welcome back, {user?.name?.split(" ")[0]}
              </p>
            </div>
          </div>

          {/* ── RIGHT SIDE of navbar ── */}
          <div className="ml-auto flex items-center gap-2">
            {/* Pending badge */}
            {stats.pending > 0 && (
              <button
                onClick={() => setActiveTab("quotations")}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-600 text-xs font-bold"
              >
                <span className="relative flex w-2 h-2">
                  <span className="animate-ping absolute inset-0 rounded-full bg-amber-400 opacity-75" />
                  <span className="relative rounded-full w-2 h-2 bg-amber-500" />
                </span>
                {stats.pending} pending
              </button>
            )}

            {/* ── Quotation Maker button ── */}
            <button
              onClick={() => navigate("/quotation")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-100 hover:border-orange-300"
              title="Open Quotation Maker"
            >
              {/* document icon */}
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span className="hidden sm:inline">Quotation</span>
            </button>

            {/* ── Delivery Note button ── */}
            <button
              onClick={() => navigate("/delivery-note")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 hover:border-slate-300"
              title="Open Delivery Note"
            >
              {/* truck icon */}
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="1" y="3" width="15" height="13" rx="1" />
                <path d="M16 8h4l3 5v3h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <span className="hidden sm:inline">Delivery Note</span>
            </button>

            {/* Refresh */}
            <button
              onClick={() => {
                hasFetched.current = false;
                fetchAll();
              }}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors flex-shrink-0"
              title="Refresh"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
            </button>
          </div>
        </header>

        {/* Content — unchanged below */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div
                className="w-10 h-10 border-orange-500 border-t-transparent rounded-full animate-spin"
                style={{ borderWidth: 3 }}
              />
              <p className="text-slate-400 text-sm">Loading dashboard…</p>
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="text-4xl">⚠️</div>
              <p className="text-slate-600 font-semibold text-sm">
                {fetchError}
              </p>
              <button
                onClick={fetchAll}
                className="px-5 py-2.5 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* ══ OVERVIEW ══ */}
              {activeTab === "overview" && (
                <div className="space-y-6 max-w-6xl">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      icon="📋"
                      label="Total Quotations"
                      value={stats.total}
                      sub="All time"
                      accent="orange"
                    />
                    <StatCard
                      icon="⏳"
                      label="Awaiting Review"
                      value={stats.pending}
                      sub="Needs attention"
                      accent="blue"
                    />
                    <StatCard
                      icon="✅"
                      label="Approved"
                      value={stats.approved}
                      sub="Successfully closed"
                      accent="emerald"
                    />
                    <StatCard
                      icon="💰"
                      label="Revenue"
                      value={`Ksh ${(stats.revenue / 1000).toFixed(0)}K`}
                      sub="From approved"
                      accent="violet"
                    />
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      icon="📦"
                      label="Products"
                      value={stats.products}
                      accent="orange"
                    />
                    <StatCard
                      icon="⚠️"
                      label="Low Stock"
                      value={stats.lowStock}
                      accent="blue"
                    />
                    <StatCard
                      icon="🚫"
                      label="Out of Stock"
                      value={stats.outOfStock}
                      accent="rose"
                    />
                    <StatCard
                      icon="👥"
                      label="Customers"
                      value={customers.length}
                      accent="violet"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
                          className={`p-4 rounded-2xl border text-left hover:shadow-md transition-all ${s.bg} ${s.border}`}
                        >
                          <p className={`text-2xl font-black ${s.text}`}>
                            {count}
                          </p>
                          <p
                            className={`text-[10px] font-bold ${s.text} opacity-80 mt-0.5`}
                          >
                            {s.label}
                          </p>
                          <div className="mt-2 h-1 bg-white/50 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${s.dot} rounded-full transition-all`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
                      <h3 className="font-black text-slate-900 text-sm">
                        Recent Quotations
                      </h3>
                      <button
                        onClick={() => setActiveTab("quotations")}
                        className="text-xs text-orange-500 font-bold hover:text-orange-600"
                      >
                        View all →
                      </button>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {recentQuotations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-2">
                          <span className="text-3xl">📭</span>
                          <p className="text-slate-400 text-sm">
                            No quotations yet
                          </p>
                        </div>
                      ) : (
                        recentQuotations.map((q) => (
                          <div
                            key={q._id}
                            onClick={() => setSelectedQuotation(q)}
                            className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-[9px] font-black text-orange-500">
                                #{q._id?.slice(-3).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {q.customer?.companyName}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {q.customer?.email}
                              </p>
                            </div>
                            <p className="text-xs font-black text-orange-500 hidden sm:block">
                              Ksh {q.total?.toLocaleString("en-KE")}
                            </p>
                            <StatusBadge status={q.status} />
                            <svg
                              className="text-slate-300 group-hover:text-slate-400 flex-shrink-0 transition-colors"
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path d="M9 18l6-6-6-6" />
                            </svg>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ══ QUOTATIONS ══ */}
              {activeTab === "quotations" && (
                <div className="space-y-4 max-w-5xl">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                      </svg>
                      <input
                        value={searchQ}
                        onChange={(e) => setSearchQ(e.target.value)}
                        placeholder="Search company, contact or email…"
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-300"
                      />
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
                        return (
                          <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all ${
                              statusFilter === s
                                ? s === "all"
                                  ? "bg-slate-900 text-white border-slate-900"
                                  : `${conf?.bg} ${conf?.text} ${conf?.border}`
                                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                            }`}
                          >
                            {s === "all" ? "All" : conf?.label} ({count})
                          </button>
                        );
                      }
                    )}
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {filteredQuotations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-2">
                        <span className="text-4xl">🔍</span>
                        <p className="text-slate-400 text-sm font-medium">
                          No quotations found
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {filteredQuotations.map((q) => (
                          <div
                            key={q._id}
                            onClick={() => setSelectedQuotation(q)}
                            className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 cursor-pointer transition-colors group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-[9px] font-black text-orange-500">
                                #{q._id?.slice(-4).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">
                                {q.customer?.companyName}
                              </p>
                              <p className="text-xs text-slate-400 truncate">
                                {q.customer?.contactName} · {q.customer?.email}
                              </p>
                              <p className="text-[10px] text-slate-300 mt-0.5">
                                {q.items?.length} items ·{" "}
                                {new Date(q.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <p className="text-sm font-black text-orange-500 hidden sm:block whitespace-nowrap">
                              Ksh {q.total?.toLocaleString("en-KE")}
                            </p>
                            <StatusBadge status={q.status} />
                            <svg
                              className="text-slate-200 group-hover:text-slate-400 transition-colors flex-shrink-0"
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path d="M9 18l6-6-6-6" />
                            </svg>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ══ PRODUCTS ══ */}
              {activeTab === "products" && (
                <div className="space-y-4 max-w-5xl">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                      </svg>
                      <input
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search products…"
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-300"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProduct(null);
                        setShowProductModal(true);
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-xl shadow-[0_4px_14px_rgba(249,115,22,0.3)] hover:opacity-95 transition-all whitespace-nowrap"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Add Product
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400 font-medium">
                      {filteredProducts.length} product
                      {filteredProducts.length !== 1 ? "s" : ""}
                    </p>
                    <div className="flex gap-2">
                      {[
                        { label: "All", status: null },
                        { label: "In Stock", status: "In Stock" },
                        { label: "Low Stock", status: "Low Stock" },
                        { label: "Out of Stock", status: "Out of Stock" },
                      ].map(({ label, status }) => {
                        const count = status
                          ? products.filter((p) => p.stockStatus === status)
                              .length
                          : products.length;
                        return (
                          <span
                            key={label}
                            className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg"
                          >
                            {label}: {count}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {filteredProducts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <span className="text-4xl">📦</span>
                        <p className="text-slate-400 text-sm">
                          {productSearch
                            ? "No products match your search"
                            : "No products yet"}
                        </p>
                        {!productSearch && (
                          <button
                            onClick={() => {
                              setSelectedProduct(null);
                              setShowProductModal(true);
                            }}
                            className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-colors"
                          >
                            Add First Product
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {filteredProducts.map((p) => (
                          <div
                            key={p._id}
                            className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                          >
                            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-100">
                              {p.imageUrl ? (
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl">
                                  📦
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">
                                {p.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {p.category && (
                                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-medium">
                                    {p.category}
                                  </span>
                                )}
                                <span className="text-xs font-bold text-orange-500">
                                  Ksh {p.price?.toLocaleString("en-KE")}
                                </span>
                                {p.originalPrice && (
                                  <span className="text-[10px] text-slate-300 line-through">
                                    Ksh{" "}
                                    {p.originalPrice?.toLocaleString("en-KE")}
                                  </span>
                                )}
                                {p.unit && (
                                  <span className="text-[10px] text-slate-400">
                                    / {p.unit}
                                  </span>
                                )}
                              </div>
                            </div>
                            <StockBadge status={p.stockStatus || "In Stock"} />
                            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setSelectedProduct(p);
                                  setShowProductModal(true);
                                }}
                                className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500 hover:bg-sky-100 transition-colors"
                              >
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p._id)}
                                className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-400 hover:bg-rose-100 transition-colors"
                              >
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6l-1 14H6L5 6" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ══ CUSTOMERS ══ */}
              {activeTab === "customers" && (
                <div className="space-y-4 max-w-4xl">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-700">
                      {customers.length} registered customer
                      {customers.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {customers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-2">
                        <span className="text-4xl">👥</span>
                        <p className="text-slate-400 text-sm">
                          No customers yet
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {customers.map((c) => (
                          <div
                            key={c._id}
                            className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-orange-500 font-black text-sm">
                                {c.name?.[0]?.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">
                                {c.name}
                              </p>
                              <p className="text-xs text-slate-400 truncate">
                                {c.email}
                              </p>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 mr-2">
                              <span
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                                  c.role === "admin"
                                    ? "bg-violet-50 text-violet-600 border-violet-200"
                                    : "bg-slate-50 text-slate-500 border-slate-200"
                                }`}
                              >
                                {c.role === "admin" ? "🔑 Admin" : "Customer"}
                              </span>
                              {c.createdAt && (
                                <span className="text-[10px] text-slate-300">
                                  {new Date(c.createdAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            {c._id !== user?._id && (
                              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleChangeRole(c)}
                                  className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-600 transition-colors whitespace-nowrap"
                                >
                                  {c.role === "admin" ? "Demote" : "Make Admin"}
                                </button>
                                <button
                                  onClick={() => handleDeleteCustomer(c)}
                                  className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-400 hover:bg-rose-100 transition-colors"
                                >
                                  <svg
                                    width="11"
                                    height="11"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6l-1 14H6L5 6" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ══ SETTINGS ══ */}
              {activeTab === "settings" && (
                <div className="space-y-5 max-w-2xl">
                  {[
                    {
                      title: "Store Information",
                      fields: [
                        {
                          label: "Business Name",
                          defaultValue: "Wimwa Tech General Supplies",
                        },
                        {
                          label: "Contact Email",
                          defaultValue: "wimwatech@gmail.com",
                        },
                        {
                          label: "Phone Number",
                          defaultValue: "+254 712 953 780",
                        },
                        {
                          label: "Business Address",
                          defaultValue: "P.O Box 273-00206, Kiserian",
                        },
                      ],
                    },
                    {
                      title: "Quotation Settings",
                      fields: [
                        { label: "Quote Validity (days)", defaultValue: "14" },
                        {
                          label: "Reply-to Email",
                          defaultValue: "wimwatech@gmail.com",
                        },
                        { label: "Quote Number Prefix", defaultValue: "WTQ" },
                      ],
                    },
                  ].map((section) => (
                    <div
                      key={section.title}
                      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
                    >
                      <h3 className="font-black text-slate-900 text-sm mb-4">
                        {section.title}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {section.fields.map((f) => (
                          <div key={f.label}>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">
                              {f.label}
                            </label>
                            <input
                              defaultValue={f.defaultValue}
                              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-orange-300 bg-slate-50 focus:bg-white transition-all"
                            />
                          </div>
                        ))}
                      </div>
                      <button className="mt-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-xl hover:opacity-95 transition-all">
                        Save Changes
                      </button>
                    </div>
                  ))}

                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="font-black text-slate-900 text-sm mb-3">
                      Session
                    </h3>
                    <div className="space-y-2.5">
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
                          className="flex justify-between text-xs py-1 border-b border-slate-50 last:border-0"
                        >
                          <span className="text-slate-400 font-medium">
                            {row.label}
                          </span>
                          <span
                            className={`font-bold ${
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
                      className="mt-4 flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
                    >
                      🚪 Sign Out
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6">
                    <h3 className="font-black text-rose-600 text-sm mb-1">
                      Danger Zone
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">
                      These actions are irreversible. Proceed with caution.
                    </p>
                    <button
                      onClick={async () => {
                        if (
                          !window.confirm("Delete ALL quotations permanently?")
                        )
                          return;
                        try {
                          await Promise.all(
                            quotations.map((q) =>
                              authAxios().delete(`/api/quotations/${q._id}`)
                            )
                          );
                          setQuotations([]);
                        } catch (err) {
                          console.error(err);
                          alert("Some quotations could not be deleted.");
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 border border-rose-200 rounded-xl text-rose-500 text-xs font-bold hover:bg-rose-50 transition-colors"
                    >
                      🗑️ Clear All Quotations
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
