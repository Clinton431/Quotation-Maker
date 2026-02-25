import React, { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { format } from "date-fns";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

/* ── Built-in companies ── */
const BUILTIN_COMPANIES = [
  {
    id: "wimwa",
    name: "Wimwa Tech General Supplies Limited",
    shortName: "Wimwa Tech",
    address: "P.O Box 273 -00206, Kiserian",
    phone: "+254 712953780",
    email: "wimwatech@gmail.com",
    pvt: "PVT-Y2U9QXGP",
    logoInitials: "WT",
    logoColor: "from-orange-400 to-orange-600",
  },
];

/* ── Company Logo — identical to QuotationPage ── */
function CompanyLogo({ company, size = "md" }) {
  const dims = { sm: "w-12 h-12", md: "w-16 h-16", lg: "w-20 h-20" };
  const font = { sm: "text-[10px]", md: "text-xs", lg: "text-sm" };
  const isWimwa = company.id === "wimwa";
  const lines = isWimwa
    ? ["Wimwa", "Tech"]
    : company.name.split(" ").slice(0, 2);

  return (
    <div
      className={`flex-shrink-0 bg-gradient-to-br ${company.logoColor} rounded-xl flex items-center justify-center shadow-lg ${dims[size]}`}
    >
      <div className="text-center px-1">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`text-white font-bold leading-tight ${font[size]}`}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Company Selector Dropdown ── */
function CompanySelector({ companies, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-orange-300 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-6 h-6 rounded-md bg-gradient-to-br ${selected.logoColor} flex-shrink-0`}
          />
          <span className="truncate">{selected.name}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          {companies.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onSelect(c);
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-orange-50 transition-colors"
            >
              <div
                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.logoColor} flex-shrink-0 flex items-center justify-center`}
              >
                <span className="text-white font-bold text-[10px]">
                  {c.logoInitials}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {c.name}
                </p>
                <p className="text-xs text-slate-400 truncate">{c.phone}</p>
              </div>
              {selected.id === c.id && (
                <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
function DeliveryNotePage() {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState(BUILTIN_COMPANIES);
  const [selectedCompany, setSelectedCompany] = useState(BUILTIN_COMPANIES[0]);

  const initialFormState = {
    deliveryNoteNumber: `DN-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`,
    date: format(new Date(), "dd/MM/yyyy"),
    clientInfo: { name: "", address: "", phone: "", email: "" },
    shipTo: "",
    items: [{ description: "", quantity: 1, unit: "pcs", remarks: "" }],
    notes: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const deliveryNoteRef = useRef(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/companies`, { timeout: 3000 })
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map((c) => ({
            id: c._id,
            name: c.name,
            shortName: c.name.split(" ").slice(0, 2).join(" "),
            address: c.address || "",
            phone: c.phone || "",
            email: c.email || "",
            pvt: c.pvt || "",
            logoInitials: c.name
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join(""),
            logoColor: "from-slate-600 to-slate-800",
          }));
          setCompanies([...BUILTIN_COMPANIES, ...mapped]);
        }
      })
      .catch(() => {});
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000
    );
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const setUnit = (index, unit) => {
    const newItems = [...formData.items];
    newItems[index].unit = unit;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () =>
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { description: "", quantity: 1, unit: "pcs", remarks: "" },
      ],
    });
  const removeItem = (index) => {
    if (formData.items.length > 1)
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index),
      });
  };
  const handleClientChange = (field, value) =>
    setFormData({
      ...formData,
      clientInfo: { ...formData.clientInfo, [field]: value },
    });

  const resetForm = () =>
    setFormData({
      ...initialFormState,
      deliveryNoteNumber: `DN-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`,
      date: format(new Date(), "dd/MM/yyyy"),
    });

  const saveDeliveryNote = async () => {
    if (!formData.clientInfo.name.trim()) {
      showNotification("Please enter client name", "error");
      return;
    }
    if (!formData.items.some((i) => i.description.trim())) {
      showNotification("Please add at least one item description", "error");
      return;
    }
    try {
      await axios.post(
        `${API_URL}/api/delivery-notes`,
        { ...formData, company: selectedCompany, createdAt: new Date() },
        { timeout: 5000 }
      );
      showNotification("Delivery note saved successfully!");
      setTimeout(() => resetForm(), 1000);
    } catch (error) {
      showNotification(
        error.code === "ECONNREFUSED" || error.message?.includes("timeout")
          ? "Cannot connect to server. Make sure MongoDB and server are running."
          : "Failed to save. Check console for details.",
        "error"
      );
    }
  };

  const downloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      showNotification("Generating PDF...", "info");
      await new Promise((r) => setTimeout(r, 100));
      const clone = deliveryNoteRef.current.cloneNode(true);
      const A4_WIDTH_PX = 794;
      const offscreen = document.createElement("div");
      offscreen.style.cssText = [
        "position:fixed",
        "top:0",
        "left:0",
        `width:${A4_WIDTH_PX}px`,
        "transform:translateX(-99999px)",
        "overflow:visible",
        "z-index:-9999",
        "background:#fff",
        "pointer-events:none",
      ].join(";");
      offscreen.appendChild(clone);
      document.body.appendChild(offscreen);
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
        width: A4_WIDTH_PX,
        windowWidth: A4_WIDTH_PX,
      });
      document.body.removeChild(offscreen);
      const imgData = canvas.toDataURL("image/jpeg", 0.7);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = 210,
        pageHeight = 297;
      const imgRatio = canvas.width / canvas.height;
      let imgWidth = pageWidth - 2,
        imgHeight = imgWidth / imgRatio;
      if (imgHeight > pageHeight - 2) {
        imgHeight = pageHeight - 2;
        imgWidth = imgHeight * imgRatio;
      }
      pdf.addImage(
        imgData,
        "JPEG",
        (pageWidth - imgWidth) / 2,
        (pageHeight - imgHeight) / 2,
        imgWidth,
        imgHeight
      );
      pdf.save(`DeliveryNote-${formData.deliveryNoteNumber}.pdf`);
      showNotification("PDF downloaded successfully!");
    } catch (error) {
      showNotification("Failed to generate PDF. Please try again.", "error");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-0 sm:px-6 lg:px-8">
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl animate-slide-up ${
            notification.type === "error"
              ? "bg-red-500 text-white"
              : notification.type === "info"
              ? "bg-blue-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          <p className="font-semibold">{notification.message}</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
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
            Back to Home
          </button>
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 bg-gradient-to-br ${selectedCompany.logoColor} rounded-lg flex items-center justify-center`}
            >
              <span className="text-white font-bold text-xs">
                {selectedCompany.logoInitials}
              </span>
            </div>
            <span className="text-sm font-semibold text-slate-700">
              {selectedCompany.shortName}
            </span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-800 mb-2">
            Delivery Note
          </h1>
          <p className="text-slate-600 font-medium">
            Create professional delivery notes in minutes
          </p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <button
            onClick={saveDeliveryNote}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Delivery Note
          </button>
          <button
            onClick={downloadPDF}
            disabled={isGeneratingPDF}
            className={`btn-secondary flex items-center gap-2 ${
              isGeneratingPDF ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isGeneratingPDF ? (
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
      </div>

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-0 sm:gap-8">
        {/* ════ LEFT FORM ════ */}
        <div className="lg:col-span-1 space-y-6 animate-slide-up">
          {/* Company */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Building2 className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-display font-bold text-slate-800">
                Company
              </h2>
            </div>
            <CompanySelector
              companies={companies}
              selected={selectedCompany}
              onSelect={setSelectedCompany}
            />
            <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-500 space-y-0.5">
              <p>{selectedCompany.address}</p>
              <p>{selectedCompany.phone}</p>
              <p>{selectedCompany.email}</p>
            </div>
          </div>

          {/* Bill To */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-100 rounded-lg">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-display font-bold text-slate-800">
                Bill To
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  value={formData.clientInfo.name}
                  onChange={(e) => handleClientChange("name", e.target.value)}
                  className="input-field"
                  placeholder="Enter client name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Billing Address
                </label>
                <textarea
                  value={formData.clientInfo.address}
                  onChange={(e) =>
                    handleClientChange("address", e.target.value)
                  }
                  className="input-field resize-none"
                  rows="2"
                  placeholder="Enter billing address"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.clientInfo.phone}
                  onChange={(e) => handleClientChange("phone", e.target.value)}
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
                  value={formData.clientInfo.email}
                  onChange={(e) => handleClientChange("email", e.target.value)}
                  className="input-field"
                  placeholder="client@example.com"
                />
              </div>
            </div>
          </div>

          {/* Ship To */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-display font-bold text-slate-800">
                Ship To
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Leave blank to use billing address
            </p>
            <textarea
              value={formData.shipTo}
              onChange={(e) =>
                setFormData({ ...formData, shipTo: e.target.value })
              }
              className="input-field resize-none"
              rows="3"
              placeholder="Delivery / shipping address (if different)"
            />
          </div>

          {/* Items */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FileText className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-display font-bold text-slate-800">
                  Items
                </h2>
              </div>
              <button
                onClick={addItem}
                className="p-2 bg-primary-100 hover:bg-primary-200 text-primary-600 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-slate-50 rounded-xl border-2 border-slate-200 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold text-primary-600">
                      Item {index + 1}
                    </span>
                    {formData.items.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
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
                        handleItemChange(index, "description", e.target.value)
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
                          handleItemChange(index, "quantity", e.target.value)
                        }
                        className="input-field text-sm"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Unit
                      </label>
                      <div
                        className="flex rounded-lg border-2 border-slate-300 overflow-hidden w-full"
                        style={{ height: "38px" }}
                      >
                        <button
                          type="button"
                          onClick={() => setUnit(index, "pcs")}
                          className="flex-1 text-xs font-bold transition-colors duration-150 focus:outline-none"
                          style={{
                            backgroundColor:
                              item.unit === "pcs" ? "#0f172a" : "transparent",
                            color: item.unit === "pcs" ? "#ffffff" : "#94a3b8",
                          }}
                        >
                          pcs
                        </button>
                        <button
                          type="button"
                          onClick={() => setUnit(index, "kgs")}
                          className="flex-1 text-xs font-bold transition-colors duration-150 focus:outline-none border-l-2 border-slate-300"
                          style={{
                            backgroundColor:
                              item.unit === "kgs" ? "#b45309" : "transparent",
                            color: item.unit === "kgs" ? "#ffffff" : "#94a3b8",
                          }}
                        >
                          kgs
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Remarks (optional)
                    </label>
                    <input
                      type="text"
                      value={item.remarks}
                      onChange={(e) =>
                        handleItemChange(index, "remarks", e.target.value)
                      }
                      className="input-field text-sm"
                      placeholder="e.g. Fragile, Handle with care"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <h2 className="text-xl font-display font-bold text-slate-800 mb-4">
              Additional Notes
            </h2>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="input-field resize-none"
              rows="3"
              placeholder="Any special delivery instructions..."
            />
          </div>
        </div>

        {/* ════ RIGHT PREVIEW ════ */}
        <div className="lg:col-span-2 animate-scale-in">
          <div className="p-0 sm:card sm:p-6 sticky top-8">
            <div className="mb-6">
              <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">
                Preview
              </h2>
              <p className="text-sm text-slate-600">
                This is how your delivery note will look
              </p>
            </div>

            <div
              ref={deliveryNoteRef}
              className="bg-white rounded-lg"
              style={{
                width: "100%",
                maxWidth: "100%",
                minHeight: "1123px",
                margin: "0 auto",
                overflow: "visible",
                backgroundColor: "#f8fafc",
              }}
            >
              <div className="p-0 sm:p-6 md:p-10">
                {/* ── HEADER ── */}
                <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b-2 border-slate-300">
                  {/* Mobile */}
                  <div className="sm:hidden space-y-4">
                    <div className="flex items-start gap-3">
                      <CompanyLogo company={selectedCompany} size="md" />
                      <div className="flex-1 min-w-0">
                        <h1 className="text-sm font-bold text-slate-900 leading-tight">
                          {selectedCompany.name}
                        </h1>
                        <p className="text-xs text-slate-500">
                          {selectedCompany.shortName}
                        </p>
                      </div>
                    </div>
                    <div className="w-full py-3 text-center">
                      <h2 className="text-xl font-bold tracking-wide text-slate-900">
                        DELIVERY NOTE
                      </h2>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-700">
                          Delivery#
                        </span>
                        <span className="font-semibold text-slate-900">
                          {formData.deliveryNoteNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-700">Date:</span>
                        <span className="font-semibold text-slate-900">
                          {formData.date}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">📍</span>
                        <span>{selectedCompany.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">📞</span>
                        <span>{selectedCompany.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">✉️</span>
                        <span>{selectedCompany.email}</span>
                      </div>
                      {selectedCompany.pvt && (
                        <p className="text-xs font-mono text-slate-400 ml-5">
                          {selectedCompany.pvt}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Desktop — mirrors QuotationPage exactly */}
                  <div className="hidden sm:flex justify-between items-start gap-6">
                    <div className="flex items-start gap-4">
                      <CompanyLogo company={selectedCompany} size="lg" />
                      <div className="flex-1">
                        <h1 className="text-lg font-bold text-slate-900 mb-1 leading-tight">
                          {selectedCompany.name}
                        </h1>
                        <p className="text-sm text-slate-600 mb-3">
                          {selectedCompany.shortName}
                        </p>
                        <div className="space-y-1.5 text-sm text-slate-700">
                          <div className="flex items-center gap-2">
                            <span className="flex-shrink-0 text-slate-500">
                              📍
                            </span>
                            <span className="leading-none">
                              {selectedCompany.address}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="flex-shrink-0 text-slate-500">
                              📞
                            </span>
                            <span className="break-words leading-relaxed">
                              {selectedCompany.phone}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="flex-shrink-0 text-slate-500">
                              ✉️
                            </span>
                            <span className="break-words leading-relaxed">
                              {selectedCompany.email}
                            </span>
                          </div>
                        </div>
                        {selectedCompany.pvt && (
                          <p className="text-xs font-mono text-slate-500 mt-2 ml-6">
                            {selectedCompany.pvt}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="inline-flex items-center justify-center px-12 py-4 rounded-lg mb-4 shadow-lg min-w-[200px]">
                        <h2 className="text-2xl font-bold tracking-wide text-slate-900">
                          DELIVERY NOTE
                        </h2>
                      </div>
                      <div className="space-y-2 text-sm bg-slate-50 p-4 rounded-lg">
                        <div className="flex justify-between gap-8 items-center">
                          <span className="font-bold text-slate-700">
                            Delivery#
                          </span>
                          <span className="font-semibold text-slate-900">
                            {formData.deliveryNoteNumber}
                          </span>
                        </div>
                        <div className="flex justify-between gap-8 items-center">
                          <span className="font-bold text-slate-700">
                            Date:
                          </span>
                          <span className="font-semibold text-slate-900">
                            {formData.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── BILL TO / SHIP TO side by side ── */}
                <div className="mb-4 sm:mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 sm:p-4 rounded-lg">
                      <p className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                        Bill To
                      </p>
                      <p className="font-bold text-slate-900 text-sm sm:text-base mb-1">
                        {formData.clientInfo.name || "Client Name"}
                      </p>
                      {formData.clientInfo.address && (
                        <p className="text-slate-700 text-xs sm:text-sm leading-relaxed mb-2">
                          {formData.clientInfo.address}
                        </p>
                      )}
                      <div className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                        {formData.clientInfo.phone && (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">📞</span>
                            <span>{formData.clientInfo.phone}</span>
                          </div>
                        )}
                        {formData.clientInfo.email && (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">✉️</span>
                            <span>{formData.clientInfo.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 sm:p-4 rounded-lg">
                      <p className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                        Ship To
                      </p>
                      <p className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                        {formData.shipTo ||
                          formData.clientInfo.address ||
                          "Delivery address"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ── ITEMS TABLE ── */}
                <div
                  className="mb-6 sm:mb-8 sm:-mx-4"
                  style={{ overflowX: "auto", overflowY: "visible" }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      minWidth: "100%",
                      verticalAlign: "middle",
                      overflow: "visible",
                    }}
                  >
                    <table
                      className="min-w-full text-xs sm:text-sm border-collapse"
                      style={{ tableLayout: "auto" }}
                    >
                      <thead>
                        <tr className="bg-slate-800 text-white border-b-2 border-slate-900">
                          <th className="text-left p-2 sm:p-3 font-bold text-[10px] sm:text-xs uppercase whitespace-nowrap">
                            #
                          </th>
                          <th className="text-left p-2 sm:p-3 font-bold text-[10px] sm:text-xs uppercase min-w-[140px]">
                            DESCRIPTION
                          </th>
                          <th
                            className="text-center p-2 sm:p-3 font-bold text-[10px] sm:text-xs uppercase whitespace-nowrap"
                            style={{ minWidth: "100px" }}
                          >
                            QTY
                          </th>
                          <th className="text-left p-2 sm:p-3 font-bold text-[10px] sm:text-xs uppercase whitespace-nowrap">
                            REMARKS
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.items.map((item, index) => (
                          <tr
                            key={index}
                            className={`border-b border-slate-200 hover:bg-slate-50 ${
                              index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                            }`}
                          >
                            <td className="p-2 sm:p-3 font-medium text-slate-700 text-[10px] sm:text-xs">
                              {index + 1}
                            </td>
                            <td className="p-2 sm:p-3">
                              <p className="font-medium text-slate-900 text-xs sm:text-sm leading-relaxed">
                                {item.description || "Item description"}
                              </p>
                            </td>
                            <td className="p-2 sm:p-3 text-center font-semibold text-slate-900 whitespace-nowrap">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="p-2 sm:p-3 text-slate-600 text-xs sm:text-sm">
                              {item.remarks || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ── Notes ── */}
                {formData.notes && (
                  <div className="mb-6 sm:mb-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-xs font-bold text-amber-800 mb-1 uppercase tracking-wide">
                      Note
                    </p>
                    <p className="text-xs sm:text-sm text-amber-900">
                      {formData.notes}
                    </p>
                  </div>
                )}

                {/* ── TERMS & CONDITIONS ── */}
                <div className="border-t-2 border-slate-300 pt-4 sm:pt-6 mb-4 sm:mb-6">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2 sm:mb-3">
                    Terms & Conditions:
                  </h3>
                  <div className="text-[10px] sm:text-xs text-slate-700 space-y-1.5 sm:space-y-2 leading-relaxed">
                    <p>
                      <span className="font-bold">•</span> 1. Payment Terms:
                      Payment must be made in full within the agreed-upon period
                      stated on the invoice. Late payments may incur additional
                      charges.
                    </p>
                    <p>
                      <span className="font-bold">•</span> 2. Pricing & Taxes:
                      All prices are exclusive of applicable taxes unless stated
                      otherwise. The buyer is responsible for any taxes, duties,
                      or additional charges.
                    </p>
                    <p>
                      <span className="font-bold">•</span> 3. Returns & Claims:
                      Claims for defective or incorrect items must be reported
                      within 48 hours of receipt. Returns are subject to
                      approval as per our return policy.
                    </p>
                    <p className="pt-1 sm:pt-2">
                      By making a purchase, the buyer agrees to these terms. For
                      inquiries, contact {selectedCompany.email}.
                    </p>
                  </div>
                </div>

                {/* ── SIGNATURE BLOCK — matches DN-23 sample ── */}
                <div className="border-t-2 border-slate-300 pt-4 sm:pt-6">
                  <div className="grid grid-cols-2 gap-8 sm:gap-16">
                    {/* Received By */}
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 mb-5">
                        Received By:
                      </p>
                      <div className="space-y-5">
                        <div>
                          <p className="text-xs text-slate-600 mb-2">
                            Name:{" "}
                            <span className="inline-block w-32 border-b border-slate-400" />
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 mb-2">
                            Date:{" "}
                            <span className="inline-block w-32 border-b border-slate-400 ml-1" />
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 mb-2">
                            Signature:{" "}
                            <span className="inline-block w-28 border-b border-slate-400 ml-1" />
                          </p>
                        </div>
                      </div>
                    </div>
                    {/*-- Authorized Signature --*/}
                    <div className="text-right">
                      <p className="text-xs sm:text-sm font-bold text-slate-800 mb-2">
                        For, {selectedCompany.name.toUpperCase()}
                      </p>
                      <div className="h-16" />
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        Authorized Signature
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeliveryNotePage;
