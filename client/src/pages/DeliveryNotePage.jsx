import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  FileText,
  Plus,
  Trash2,
  Download,
  Save,
  User,
  Building2,
  ChevronDown,
  Check,
  X,
  Upload,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { format } from "date-fns";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const WIMWA = {
  name: "Wimwa Tech General Supplies Limited",
  shortName: "Wimwa Tech",
  address: "P.O Box 273 -00206, Kiserian",
  phone: "+254 712953780",
  email: "wimwatech@gmail.com",
  pvt: "PVT-Y2U9QXGP",
};

const MAX_RETRIES = 4;
const BASE_DELAY = 1500;

/* ─── NAV LOGO ─── */
function NavLogo({ logoUrl }) {
  if (logoUrl)
    return (
      <img
        src={logoUrl}
        alt=""
        className="w-8 h-8 rounded-lg object-contain border border-slate-100 bg-white p-0.5 flex-shrink-0 shadow-sm"
        crossOrigin="anonymous"
      />
    );
  return (
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex-shrink-0 flex items-center justify-center shadow-sm">
      <span className="text-white font-bold text-[9px] leading-none">WT</span>
    </div>
  );
}

/* ─── LOGO UPLOAD WIDGET ─── */
function LogoUpload({ logoUrl, onLogoChange }) {
  const fileRef = useRef(null);

  const pickFile = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    const allowed = ["image/jpeg", "image/png", "image/svg+xml", "image/webp"];
    if (!allowed.includes(file.type)) return;
    onLogoChange(URL.createObjectURL(file));
  };

  return (
    <div className="mt-3">
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        Company Logo{" "}
        <span className="text-slate-400 font-normal">(optional)</span>
      </label>
      <div
        onClick={() => fileRef.current?.click()}
        className="flex items-center gap-3 p-3 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-orange-300 hover:bg-orange-50/30 active:bg-orange-50/50 transition-all"
      >
        {logoUrl ? (
          <>
            <img
              src={logoUrl}
              alt=""
              className="w-12 h-12 rounded-lg object-contain border border-slate-100 bg-white p-0.5 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700">
                Logo uploaded
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLogoChange("");
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="text-xs text-red-500 hover:text-red-700 font-semibold"
              >
                Remove
              </button>
            </div>
            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Upload className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">
                Upload logo
              </p>
              <p className="text-xs text-slate-400">
                PNG, JPG, SVG, WebP · max 5 MB
              </p>
            </div>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/svg+xml,image/webp"
          className="hidden"
          onChange={(e) => pickFile(e.target.files[0])}
        />
      </div>
    </div>
  );
}

/* ─── ADD BILLING CONTACT MODAL ─── saves to DB ─── */
function AddBillingModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim()) {
      setError("Name is required");
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
        { headers: { "Content-Type": "application/json" }, timeout: 15000 }
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
      setError(
        err.response?.data?.message ||
          (err.code === "ECONNABORTED"
            ? "Request timed out — please retry."
            : "Failed to save contact.")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md flex flex-col max-h-[92vh]">
        {/* drag handle on mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
              <User className="w-4 h-4 text-orange-500" />
            </div>
            <h2 className="font-bold text-slate-900 text-base sm:text-lg">
              Add Billing Contact
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <X className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={f("name")}
              className="input-field"
              placeholder="e.g. Burn Kenya"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Address
            </label>
            <textarea
              value={form.address}
              onChange={f("address")}
              className="input-field resize-none"
              rows="2"
              placeholder="Full address"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={f("phone")}
                className="input-field"
                placeholder="+254 XXX"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={f("email")}
                className="input-field"
                placeholder="info@co.com"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-orange-400 to-orange-600 hover:opacity-90 shadow-[0_4px_14px_rgba(249,115,22,0.3)] flex items-center justify-center gap-2 disabled:opacity-60"
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

/* ─── BILLING DROPDOWN ─── */
function BillingSelector({ contacts, selected, onSelect, onAddNew }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => {
    if (open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left, width: r.width });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (
        !triggerRef.current?.contains(e.target) &&
        !dropRef.current?.contains(e.target)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const s = (e) => {
      if (!dropRef.current?.contains(e.target)) setOpen(false);
    };
    window.addEventListener("scroll", s, true);
    window.addEventListener("resize", () => setOpen(false));
    return () => window.removeEventListener("scroll", s, true);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-orange-300 active:border-orange-400 transition-colors"
      >
        <span className="truncate">
          {selected ? selected.name : "Quick fill from saved…"}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open &&
        createPortal(
          <div
            ref={dropRef}
            className="fixed z-[99999] bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            <div className="max-h-[195px] overflow-y-auto">
              {contacts.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    onSelect(c);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 border-b border-slate-50 text-left transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {c.name}
                    </p>
                    {c.phone && (
                      <p className="text-xs text-slate-400 truncate">
                        {c.phone}
                      </p>
                    )}
                  </div>
                  {selected?.id === c.id && (
                    <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
            <div className="border-t-2 border-slate-100 p-1.5">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onAddNew();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-orange-600 hover:bg-orange-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg border-2 border-dashed border-orange-400 flex items-center justify-center flex-shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
                Save New Contact
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function DeliveryNotePage() {
  const navigate = useNavigate();

  const [logoUrl, setLogoUrl] = useState("");
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showAddBilling, setShowAddBilling] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [contactsError, setContactsError] = useState(null);
  const [fetchAttempt, setFetchAttempt] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const freshDN = () =>
    `DN-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`;

  const blankForm = () => ({
    deliveryNoteNumber: freshDN(),
    date: format(new Date(), "dd/MM/yyyy"),
    clientInfo: { name: "", address: "", phone: "", email: "" },
    shipTo: "",
    items: [{ description: "", quantity: 1, unit: "pcs", remarks: "" }],
    notes: "",
  });

  const [form, setForm] = useState(blankForm);
  const [notif, setNotif] = useState({ show: false, message: "", type: "" });
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [saving, setSaving] = useState(false);
  const previewRef = useRef(null);

  const fetchContacts = useCallback(async (retry = 0) => {
    setContactsLoading(true);
    setContactsError(null);
    try {
      const res = await axios.get(`${API_URL}/api/companies`, {
        timeout: retry === 0 ? 20000 : 10000,
      });
      if (Array.isArray(res.data) && res.data.length)
        setContacts(
          res.data.map((c) => ({
            id: c._id,
            name: c.name,
            address: c.address || "",
            phone: c.phone || "",
            email: c.email || "",
          }))
        );
      setContactsLoading(false);
      setFetchAttempt(0);
    } catch {
      if (retry < MAX_RETRIES) {
        setFetchAttempt(retry + 1);
        setTimeout(
          () => fetchContacts(retry + 1),
          BASE_DELAY * Math.pow(2, retry)
        );
      } else {
        setContactsError("Could not load saved contacts.");
        setContactsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchContacts(0);
  }, [fetchContacts]);

  const selectContact = (c) => {
    setSelectedContact(c);
    setForm((p) => ({
      ...p,
      clientInfo: {
        name: c.name,
        address: c.address,
        phone: c.phone,
        email: c.email,
      },
    }));
  };

  const showNotif = (message, type = "success") => {
    setNotif({ show: true, message, type });
    setTimeout(() => setNotif({ show: false, message: "", type: "" }), 3500);
  };

  const setItem = (idx, field, val) => {
    const items = [...form.items];
    items[idx][field] = val;
    setForm({ ...form, items });
  };
  const setUnit = (idx, unit) => {
    const items = [...form.items];
    items[idx].unit = unit;
    setForm({ ...form, items });
  };
  const addItem = () =>
    setForm({
      ...form,
      items: [
        ...form.items,
        { description: "", quantity: 1, unit: "pcs", remarks: "" },
      ],
    });
  const removeItem = (idx) => {
    if (form.items.length > 1)
      setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };
  const setClient = (field, val) =>
    setForm({ ...form, clientInfo: { ...form.clientInfo, [field]: val } });
  const reset = () => {
    setForm(blankForm());
    setSelectedContact(null);
  };

  const saveNote = async () => {
    if (!form.clientInfo.name.trim()) {
      showNotif("Please enter client name", "error");
      return;
    }
    if (!form.items.some((i) => i.description.trim())) {
      showNotif("Please add at least one item", "error");
      return;
    }
    setSaving(true);
    showNotif("Saving…", "info");
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        await axios.post(
          `${API_URL}/api/delivery-notes`,
          { ...form, company: WIMWA },
          { timeout: attempt === 0 ? 20000 : 10000 }
        );
        showNotif("Delivery note saved!");
        setTimeout(reset, 1000);
        setSaving(false);
        return;
      } catch (err) {
        if (attempt === 1) {
          showNotif(
            err.code === "ECONNABORTED" ||
              err.message?.includes("timeout") ||
              err.code === "ERR_NETWORK"
              ? "Server waking up — please retry in a moment."
              : "Failed to save. Check connection.",
            "error"
          );
        } else await new Promise((r) => setTimeout(r, 3000));
      }
    }
    setSaving(false);
  };

  const downloadPDF = async () => {
    try {
      setGeneratingPDF(true);
      showNotif("Generating PDF…", "info");
      await new Promise((r) => setTimeout(r, 100));
      const clone = previewRef.current.cloneNode(true);
      const W = 794;
      const off = document.createElement("div");
      off.style.cssText = `position:fixed;top:0;left:0;width:${W}px;transform:translateX(-99999px);overflow:visible;z-index:-9999;background:#fff;pointer-events:none`;
      off.appendChild(clone);
      document.body.appendChild(off);
      clone.querySelectorAll("*").forEach((el) => {
        const cs = window.getComputedStyle(el);
        if (["hidden", "auto", "scroll"].includes(cs.overflow))
          el.style.overflow = "visible";
        if (["hidden", "auto", "scroll"].includes(cs.overflowX))
          el.style.overflowX = "visible";
        if (["hidden", "auto", "scroll"].includes(cs.overflowY))
          el.style.overflowY = "visible";
      });
      await new Promise((r) => setTimeout(r, 200));
      const canvas = await html2canvas(clone, {
        scale: 1.8,
        backgroundColor: "#ffffff",
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        width: W,
        windowWidth: W,
      });
      document.body.removeChild(off);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pw = 210,
        ph = 297,
        ratio = canvas.width / canvas.height;
      let iw = pw - 2,
        ih = iw / ratio;
      if (ih > ph - 2) {
        ih = ph - 2;
        iw = ih * ratio;
      }
      pdf.addImage(
        canvas.toDataURL("image/jpeg", 0.85),
        "JPEG",
        (pw - iw) / 2,
        (ph - ih) / 2,
        iw,
        ih
      );
      pdf.save(`DeliveryNote-${form.deliveryNoteNumber}.pdf`);
      showNotif("PDF downloaded!");
    } catch {
      showNotif("Failed to generate PDF.", "error");
    } finally {
      setGeneratingPDF(false);
    }
  };

  const shipTo = form.shipTo || form.clientInfo.address || "";

  return (
    <div className="min-h-screen bg-slate-50">
      {showAddBilling && (
        <AddBillingModal
          onClose={() => setShowAddBilling(false)}
          onSaved={(c) => {
            setContacts((p) => [...p, c]);
            selectContact(c);
            showNotif(`"${c.name}" saved to contacts!`);
          }}
        />
      )}

      {/* Toast notification */}
      {notif.show && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 z-50 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-semibold text-white w-[calc(100%-2rem)] sm:w-auto text-center sm:text-left ${
            notif.type === "error"
              ? "bg-red-500"
              : notif.type === "info"
              ? "bg-blue-500"
              : "bg-emerald-500"
          }`}
        >
          {notif.message}
        </div>
      )}

      {/* ── TOP NAV ── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <NavLogo logoUrl={logoUrl} />
            <span className="text-sm font-semibold text-slate-700 hidden xs:inline">
              Wimwa Tech
            </span>
          </div>

          {/* Mobile preview toggle */}
          <button
            onClick={() => setShowPreview((v) => !v)}
            className="lg:hidden flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                Form
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                Preview
              </>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ── PAGE TITLE ── */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-slate-800 mb-2">
            Delivery Note
          </h1>
          <p className="text-slate-500 text-sm sm:text-base font-medium">
            Create professional delivery notes in minutes
          </p>
        </div>

        {/* ── ACTION BUTTONS — desktop inline, mobile fixed bottom bar ── */}
        {/* Desktop buttons */}
        <div className="hidden sm:flex flex-wrap gap-4 justify-center mb-8">
          <button
            onClick={saveNote}
            disabled={saving}
            className={`btn-primary flex items-center gap-2 ${
              saving ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Delivery Note
              </>
            )}
          </button>
          <button
            onClick={downloadPDF}
            disabled={generatingPDF}
            className={`btn-secondary flex items-center gap-2 ${
              generatingPDF ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {generatingPDF ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download PDF
              </>
            )}
          </button>
        </div>

        {/* Mobile fixed bottom action bar */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-4 py-3 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <button
            onClick={saveNote}
            disabled={saving}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-orange-400 to-orange-600 shadow-[0_4px_14px_rgba(249,115,22,0.3)] ${
              saving ? "opacity-60" : ""
            }`}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </button>
          <button
            onClick={downloadPDF}
            disabled={generatingPDF}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-slate-700 to-slate-900 ${
              generatingPDF ? "opacity-50" : ""
            }`}
          >
            {generatingPDF ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                PDF
              </>
            )}
          </button>
        </div>

        {/* ── TWO-COLUMN LAYOUT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 pb-24 sm:pb-0">
          {/* ══ LEFT FORM — hidden on mobile when preview is open ══ */}
          <div
            className={`lg:col-span-1 space-y-5 ${
              showPreview ? "hidden lg:block" : "block"
            }`}
          >
            {/* Company */}
            <div className="card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-lg sm:text-xl font-display font-bold text-slate-800">
                  Company
                </h2>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <p className="font-bold text-slate-900 text-sm">{WIMWA.name}</p>
                <p className="text-xs text-slate-500">{WIMWA.address}</p>
                <p className="text-xs text-slate-500 break-all">
                  {WIMWA.phone} · {WIMWA.email}
                </p>
              </div>
              <LogoUpload logoUrl={logoUrl} onLogoChange={setLogoUrl} />
            </div>

            {/* Bill To */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-lg sm:text-xl font-display font-bold text-slate-800">
                  Bill To
                </h2>
              </div>

              {contactsLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400 flex-shrink-0" />
                  <span>
                    {fetchAttempt === 0
                      ? "Loading saved contacts…"
                      : `Retrying (${fetchAttempt}/4)…`}
                  </span>
                </div>
              )}
              {!contactsLoading && contactsError && (
                <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <div>
                    {contactsError}{" "}
                    <button
                      onClick={() => fetchContacts(0)}
                      className="underline font-semibold"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {contacts.length > 0 && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Quick fill
                  </label>
                  <BillingSelector
                    contacts={contacts}
                    selected={selectedContact}
                    onSelect={selectContact}
                    onAddNew={() => setShowAddBilling(true)}
                  />
                </div>
              )}
              {contacts.length === 0 && !contactsLoading && (
                <button
                  onClick={() => setShowAddBilling(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-700 mb-4 py-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Save contact for reuse
                </button>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={form.clientInfo.name}
                    onChange={(e) => setClient("name", e.target.value)}
                    className="input-field"
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Billing Address
                  </label>
                  <textarea
                    value={form.clientInfo.address}
                    onChange={(e) => setClient("address", e.target.value)}
                    className="input-field resize-none"
                    rows="3"
                    placeholder="Full billing address"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={form.clientInfo.phone}
                      onChange={(e) => setClient("phone", e.target.value)}
                      className="input-field"
                      placeholder="+254 XXX XXX XXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.clientInfo.email}
                      onChange={(e) => setClient("email", e.target.value)}
                      className="input-field"
                      placeholder="client@example.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ship To */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FileText className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-lg sm:text-xl font-display font-bold text-slate-800">
                  Ship To
                </h2>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Leave blank to use billing address
              </p>
              <textarea
                value={form.shipTo}
                onChange={(e) => setForm({ ...form, shipTo: e.target.value })}
                className="input-field resize-none"
                rows="3"
                placeholder="Delivery address (if different)"
              />
            </div>

            {/* Items */}
            <div className="card">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <FileText className="w-5 h-5 text-primary-600" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-display font-bold text-slate-800">
                    Items
                  </h2>
                </div>
                <button
                  onClick={addItem}
                  className="flex items-center gap-1.5 text-xs font-bold text-primary-600 bg-primary-100 hover:bg-primary-200 px-3 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>
              <div className="space-y-4">
                {form.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 rounded-xl border-2 border-slate-200 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-primary-600">
                        Item {idx + 1}
                      </span>
                      {form.items.length > 1 && (
                        <button
                          onClick={() => removeItem(idx)}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-semibold py-1 px-2 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Description
                      </label>
                      <textarea
                        value={item.description}
                        onChange={(e) =>
                          setItem(idx, "description", e.target.value)
                        }
                        className="input-field text-sm"
                        rows="2"
                        placeholder="Item description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            setItem(idx, "quantity", e.target.value)
                          }
                          className="input-field text-sm"
                          min="1"
                          inputMode="numeric"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Unit
                        </label>
                        <div className="flex rounded-lg border-2 border-slate-300 overflow-hidden h-[42px]">
                          <button
                            type="button"
                            onClick={() => setUnit(idx, "pcs")}
                            className={`flex-1 text-xs font-bold focus:outline-none transition-colors ${
                              item.unit === "pcs"
                                ? "bg-slate-900 text-white"
                                : "text-slate-400 hover:bg-slate-100"
                            }`}
                          >
                            pcs
                          </button>
                          <button
                            type="button"
                            onClick={() => setUnit(idx, "kgs")}
                            className={`flex-1 text-xs font-bold focus:outline-none border-l-2 border-slate-300 transition-colors ${
                              item.unit === "kgs"
                                ? "bg-amber-700 text-white"
                                : "text-slate-400 hover:bg-slate-100"
                            }`}
                          >
                            kgs
                          </button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Remarks
                      </label>
                      <input
                        type="text"
                        value={item.remarks}
                        onChange={(e) =>
                          setItem(idx, "remarks", e.target.value)
                        }
                        className="input-field text-sm"
                        placeholder="e.g. Fragile"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="card">
              <h2 className="text-lg sm:text-xl font-display font-bold text-slate-800 mb-4">
                Additional Notes
              </h2>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="input-field resize-none"
                rows="3"
                placeholder="Special delivery instructions…"
              />
            </div>
          </div>

          {/* ══ RIGHT PREVIEW — hidden on mobile when form is showing ══ */}
          <div
            className={`lg:col-span-2 ${
              showPreview ? "block" : "hidden lg:block"
            }`}
          >
            <div className="lg:sticky lg:top-24">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-800">
                    Preview
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    This is how your delivery note will look
                  </p>
                </div>
                {/* Mobile: show form button */}
                <button
                  onClick={() => setShowPreview(false)}
                  className="lg:hidden text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200"
                >
                  ← Edit Form
                </button>
              </div>

              {/* Scrollable preview wrapper on mobile */}
              <div className="overflow-x-auto rounded-xl shadow-sm border border-slate-200 bg-white">
                {/* ════════════════════════════════════════
                    PRINTABLE AREA — fixed width for PDF fidelity,
                    scrollable on small screens
                ════════════════════════════════════════ */}
                <div
                  ref={previewRef}
                  className="bg-white font-sans text-slate-800"
                  style={{ minWidth: "600px", padding: "32px" }}
                >
                  {/* ── HEADER ── */}
                  <div className="flex items-center pb-4 mb-0 border-b-2 border-slate-300">
                    {/* Logo */}
                    <div className="flex-shrink-0 w-[72px] h-[72px] mr-4">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt="Logo"
                          className="w-[72px] h-[72px] object-contain"
                          crossOrigin="anonymous"
                        />
                      ) : (
                        <div className="w-[72px] h-[72px] bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                          <div className="text-center leading-tight">
                            <div className="text-white font-bold text-[10px]">
                              Wimwa
                            </div>
                            <div className="text-white font-bold text-[10px]">
                              Tech
                            </div>
                            <div className="text-white font-bold text-[9px]">
                              General
                            </div>
                            <div className="text-white font-bold text-[9px]">
                              Supplies
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Company details — centered */}
                    <div className="flex-1 text-center">
                      <p className="font-black text-[15px] text-slate-900 leading-snug">
                        {WIMWA.name}
                      </p>
                      <p className="text-xs text-slate-800 mt-0.5">
                        {WIMWA.shortName}
                      </p>
                      <p className="text-xs text-slate-900 mt-0.5">
                        {WIMWA.address}
                      </p>
                      <p className="text-xs text-slate-900 mt-0.5">
                        📞 {WIMWA.phone} &nbsp; ✉️ {WIMWA.email}
                      </p>
                      <p className="font-mono text-[10px] text-slate-900 mt-0.5">
                        {WIMWA.pvt}
                      </p>
                    </div>
                    {/* DELIVERY NOTE title */}
                    <div className="flex-shrink-0 ml-4 text-right">
                      <p className="font-black text-[18px] leading-tight text-slate-900 uppercase tracking-wide">
                        DELIVERY
                      </p>
                      <p className="font-black text-[18px] leading-tight text-slate-900 uppercase tracking-wide">
                        NOTE
                      </p>
                    </div>
                  </div>

                  {/* ── BILL TO / SHIP TO / DELIVERY# ── */}
                  <div className="grid grid-cols-3 gap-4 py-4 border-b border-slate-200">
                    <div>
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1">
                        BILL TO
                      </p>
                      <p className="font-bold text-[13px] text-slate-900 mb-0.5">
                        {form.clientInfo.name || "Client Name"}
                      </p>
                      {form.clientInfo.address && (
                        <p className="text-xs text-slate-900 leading-relaxed mb-1 whitespace-pre-wrap break-words">
                          {form.clientInfo.address}
                        </p>
                      )}
                      {form.clientInfo.phone && (
                        <p className="text-xs text-slate-900 mb-0.5">
                          📞 {form.clientInfo.phone}
                        </p>
                      )}
                      {form.clientInfo.email && (
                        <p className="text-xs text-slate-900 break-all">
                          ✉️ {form.clientInfo.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1">
                        SHIP TO
                      </p>
                      <p className="text-xs text-slate-900 leading-relaxed whitespace-pre-wrap break-words">
                        {shipTo || "—"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-start gap-1">
                      <div className="flex gap-3">
                        <span className="font-bold text-sm text-slate-900">
                          Delivery#
                        </span>
                        <span className="font-semibold text-sm text-slate-900">
                          {form.deliveryNoteNumber}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <span className="font-bold text-sm text-slate-900">
                          Date:
                        </span>
                        <span className="font-semibold text-sm text-slate-900">
                          {form.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── ITEMS TABLE ── */}
                  <div className="mb-5 mt-4">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-800 text-white">
                          <th className="text-left p-3 font-bold text-xs uppercase w-[5%]">
                            #
                          </th>
                          <th className="text-left p-3 font-bold text-xs uppercase">
                            DESCRIPTION
                          </th>
                          <th className="text-center p-3 font-bold text-xs uppercase w-[13%]">
                            QTY
                          </th>
                          <th className="text-left p-3 font-bold text-xs uppercase w-[22%]">
                            REMARKS
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.items.map((item, idx) => (
                          <tr
                            key={idx}
                            className={`border-b border-slate-200 ${
                              idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                            }`}
                          >
                            <td className="p-3 text-xs text-slate-500">
                              {idx + 1}
                            </td>
                            <td className="p-3">
                              <p className="font-semibold text-slate-900 text-sm">
                                {item.description || "Item description"}
                              </p>
                            </td>
                            <td className="p-3 text-center">
                              <p className="font-bold text-slate-900">
                                {item.quantity}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {item.unit}
                              </p>
                            </td>
                            <td className="p-3 text-xs text-slate-500">
                              {item.remarks || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ── OPTIONAL NOTES ── */}
                  {form.notes && (
                    <div className="mb-5 bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wide mb-1">
                        Note
                      </p>
                      <p className="text-xs text-amber-900">{form.notes}</p>
                    </div>
                  )}

                  {/* ── TERMS ── */}
                  <div className="pt-4 mb-6 border-t-2 border-slate-200">
                    <p className="font-bold text-[13px] text-slate-900 mb-3">
                      Terms &amp; Conditions:
                    </p>
                    <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                      <p>
                        • 1. Payment Terms: Payment must be made in full within
                        the agreed-upon period stated on the invoice. Late
                        payments may incur additional charges.
                      </p>
                      <p>
                        • 2. Pricing &amp; Taxes: All prices are exclusive of
                        applicable taxes unless stated otherwise. The buyer is
                        responsible for any taxes, duties, or additional
                        charges.
                      </p>
                      <p>
                        • 3. Returns &amp; Claims: Claims for defective or
                        incorrect items must be reported within 48 hours of
                        receipt. Returns are subject to approval as per our
                        return policy.
                      </p>
                      <p className="mt-2">
                        By making a purchase, the buyer agrees to these terms.
                        For inquiries, contact {WIMWA.email}.
                      </p>
                    </div>
                  </div>

                  {/* ── SIGNATURE ── */}
                  <div className="pt-5 border-t-2 border-slate-200 grid grid-cols-2 gap-10">
                    <div>
                      <p className="font-bold text-[13px] text-slate-900 mb-4">
                        Received By:
                      </p>
                      <div className="text-xs text-slate-600 space-y-5">
                        <div className="flex items-end gap-2">
                          <span className="flex-shrink-0">Name:</span>
                          <span className="flex-1 border-b border-slate-400" />
                        </div>
                        <div className="flex items-end gap-2">
                          <span className="flex-shrink-0">Date:</span>
                          <span className="flex-1 border-b border-slate-400" />
                        </div>
                        <div className="flex items-end gap-2">
                          <span className="flex-shrink-0">Signature:</span>
                          <span className="flex-1 border-b border-slate-400" />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[13px] text-slate-900 mb-2">
                        For, {WIMWA.name.toUpperCase()}
                      </p>
                      <div className="flex justify-end mb-1">
                        <svg
                          width="90"
                          height="50"
                          viewBox="0 0 90 50"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5 40 C12 22, 22 8, 32 18 C40 26, 37 40, 46 30 C53 22, 58 12, 66 20 C73 27, 70 40, 80 33"
                            stroke="#1e293b"
                            strokeWidth="1.7"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M18 44 C28 39, 40 43, 52 41 C60 40, 68 41, 76 38"
                            stroke="#1e293b"
                            strokeWidth="1.2"
                            fill="none"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                        AUTHORIZED SIGNATURE
                      </p>
                    </div>
                  </div>
                </div>
                {/* end printable area */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
