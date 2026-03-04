import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function QuotationRequestPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { cartItems = [], total = 0 } = location.state || {};

  const [form, setForm] = useState({
    companyName: user?.companyName || "",
    contactName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    deliveryAddress: "",
    city: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Redirect if no cart items
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate("/");
    }
  }, [cartItems, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (
      !form.companyName ||
      !form.contactName ||
      !form.email ||
      !form.deliveryAddress
    ) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        customer: {
          companyName: form.companyName,
          contactName: form.contactName,
          email: form.email,
          phone: form.phone,
          deliveryAddress: form.deliveryAddress,
          city: form.city,
        },
        items: cartItems.map((item) => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          qty: item.qty,
          unit: item.unit || "piece",
          imageUrl: item.imageUrl || "",
          category: item.category || "",
          subtotal: item.price * item.qty,
        })),
        total,
        notes: form.notes,
        status: "pending",
        userId: user?._id || null,
      };

      const token = localStorage.getItem("wt_token");
      await axios.post(`${API_URL}/api/quotations`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setSubmitted(true);
    } catch (err) {
      setError("Failed to submit quotation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6 border-2 border-emerald-100">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">
            Quotation Submitted!
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-2">
            Thank you,{" "}
            <span className="font-semibold text-slate-700">
              {form.companyName}
            </span>
            . Your quotation request has been received.
          </p>
          <p className="text-slate-400 text-sm mb-8">
            Our team will review your order and send a formal quotation to{" "}
            <span className="font-semibold text-orange-500">{form.email}</span>{" "}
            within 2 hours.
          </p>
          <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-left">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              Order Summary
            </p>
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-slate-400">×{item.qty}</p>
                </div>
                <p className="text-xs font-bold text-orange-500">
                  Ksh {(item.price * item.qty).toLocaleString("en-KE")}
                </p>
              </div>
            ))}
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-200">
              <p className="text-sm font-bold text-slate-900">Total</p>
              <p className="text-sm font-black text-orange-500">
                Ksh {total.toLocaleString("en-KE")}
              </p>
            </div>
          </div>
          {user ? (
            <button
              onClick={() => navigate("/my-orders")}
              className="block w-full py-3.5 bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold rounded-xl text-center shadow-[0_6px_24px_rgba(249,115,22,0.3)] hover:opacity-95 transition-all"
            >
              View My Orders →
            </button>
          ) : (
            <Link
              to="/"
              className="block w-full py-3.5 bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold rounded-xl text-center no-underline shadow-[0_6px_24px_rgba(249,115,22,0.3)] hover:opacity-95 transition-all"
            >
              Continue Shopping →
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <span className="text-white font-black text-xs">W</span>
            </div>
            <span className="font-bold text-slate-900 text-sm">Wimwa Tech</span>
          </Link>
          <span className="text-slate-300">›</span>
          <span className="text-slate-500 text-sm font-medium">
            Request Quotation
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-slate-900">
            Request a Quotation
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Your selected items are pre-filled below. Just add your delivery
            details.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* LEFT: Form */}
          <div className="space-y-6">
            {/* Contact Details */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                  <span className="text-orange-500 font-black text-sm">1</span>
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">
                    Your Details
                  </h2>
                  <p className="text-slate-400 text-xs">
                    Who is this quotation for?
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Company Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Acme Solutions Ltd"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-100 placeholder-slate-300 bg-slate-50 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Contact Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="contactName"
                    value={form.contactName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-100 placeholder-slate-300 bg-slate-50 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-100 placeholder-slate-300 bg-slate-50 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+254 7XX XXX XXX"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-100 placeholder-slate-300 bg-slate-50 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                  <span className="text-orange-500 font-black text-sm">2</span>
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">
                    Delivery Address
                  </h2>
                  <p className="text-slate-400 text-xs">
                    Where should the quotation be addressed to?
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Street / Building Address{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="deliveryAddress"
                    value={form.deliveryAddress}
                    onChange={handleChange}
                    placeholder="e.g. 3rd Floor, Kimathi House, Kimathi Street"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-100 placeholder-slate-300 bg-slate-50 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    City / Town
                  </label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="e.g. Nairobi"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-100 placeholder-slate-300 bg-slate-50 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                  <span className="text-orange-500 font-black text-sm">3</span>
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">
                    Additional Notes
                  </h2>
                  <p className="text-slate-400 text-xs">
                    Any special requirements or instructions?
                  </p>
                </div>
              </div>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                placeholder="e.g. Need delivery by end of month, specific brand preferences, installation required..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-100 placeholder-slate-300 bg-slate-50 focus:bg-white transition-all resize-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
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
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold text-base rounded-2xl shadow-[0_6px_24px_rgba(249,115,22,0.35)] hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <svg
                    className="animate-spin"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0110 10" />
                  </svg>
                  Submitting…
                </>
              ) : (
                <>
                  <svg
                    width="18"
                    height="18"
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
                  Submit Quotation Request
                </>
              )}
            </button>
          </div>

          {/* RIGHT: Order Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-24">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">
                  Order Summary
                </h3>
                <span className="text-xs text-slate-400">
                  {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="divide-y divide-slate-50 max-h-[420px] overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-3 p-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 text-xl">
                          {item.emoji || "📦"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] text-slate-400">
                          Ksh {item.price?.toLocaleString("en-KE")} × {item.qty}
                        </p>
                        <p className="text-xs font-bold text-orange-500">
                          Ksh {(item.price * item.qty).toLocaleString("en-KE")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 bg-slate-50 border-t border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-500">Subtotal</span>
                  <span className="text-xs font-semibold text-slate-700">
                    Ksh {total.toLocaleString("en-KE")}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-slate-500">Delivery</span>
                  <span className="text-xs text-emerald-600 font-semibold">
                    Quoted separately
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                  <span className="text-sm font-bold text-slate-900">
                    Estimated Total
                  </span>
                  <span className="text-lg font-black text-orange-500">
                    Ksh {total.toLocaleString("en-KE")}
                  </span>
                </div>
              </div>
              <div className="px-5 pb-4">
                <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <svg
                    className="text-blue-400 shrink-0 mt-0.5"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-[10px] text-blue-600 leading-relaxed">
                    A formal PDF quotation will be emailed within 2 hours.
                    Prices are valid for 14 days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
