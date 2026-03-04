import React, { useState } from "react";
import { X, Check, Loader2, User } from "lucide-react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function AddBillingModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim()) {
      setError("Company name is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await axios.post(
        `${API_URL}/api/companies`,
        {
          name: form.name.trim(),
          address: form.address.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const saved = res.data?.data || res.data;

      onSaved({
        id: saved._id,
        name: saved.name,
        address: saved.address || "",
        phone: saved.phone || "",
        email: saved.email || "",
      });

      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save company.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <User className="w-4 h-4 text-orange-600" />
            </div>
            <h2 className="font-bold text-slate-800">Add Billing Company</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          {error && (
            <div className="text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <input
            className="input-field"
            placeholder="Company Name *"
            value={form.name}
            onChange={update("name")}
          />
          <textarea
            className="input-field resize-none"
            rows="2"
            placeholder="Address"
            value={form.address}
            onChange={update("address")}
          />
          <input
            className="input-field"
            placeholder="Phone"
            value={form.phone}
            onChange={update("phone")}
          />
          <input
            className="input-field"
            placeholder="Email"
            value={form.email}
            onChange={update("email")}
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t bg-slate-50 flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-3 rounded-xl text-sm font-semibold border"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
