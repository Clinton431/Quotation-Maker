import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Download,
  Save,
  User,
  Wrench,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { format } from "date-fns";
import axios from "axios";
import AddBillingModal from "../components/AddBillingModal";
import BillingSelector from "../components/BillingSelector";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ── Default charge categories ─────────────────────────────────────────────────
const CHARGE_CATEGORIES = [
  "Labour",
  "Transport",
  "Installation",
  "Consultation",
  "Delivery",
  "Other",
];

function QuotationPage() {
  const navigate = useNavigate();

  const initialFormState = {
    quotationNumber: `Quote-${Math.floor(Math.random() * 10000)}`,
    date: format(new Date(), "dd/MM/yyyy"),
    companyInfo: {
      name: "Wimwa Tech General Supplies Limited",
      address: "P.O Box 273 -00206, Kiserian",
      phone: "+254 712953780",
      email: "wimwatech@gmail.com",
      pvt: "PVT-Y2U9QXGP",
    },
    clientInfo: {
      name: "",
      address: "",
      phone: "",
      email: "",
    },
    items: [{ description: "", quantity: 1, unit: "pcs", price: 0, total: 0 }],
    // ── NEW: additional charges (labour, transport, etc.) ──────────────────
    additionalCharges: [],
  };

  const [formData, setFormData] = useState(initialFormState);

  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [billingCompanies, setBillingCompanies] = useState([]);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState(null);
  const [showAddBilling, setShowAddBilling] = useState(false);
  const quotationRef = useRef(null);

  // ── Totals ────────────────────────────────────────────────────────────────
  const calculateTotal = (quantity, price) => quantity * price;
  const getSubtotal = () =>
    formData.items.reduce((sum, item) => sum + item.total, 0);
  const getAdditionalTotal = () =>
    formData.additionalCharges.reduce((sum, c) => sum + (c.total || 0), 0);
  const getGrandTotal = () => getSubtotal() + getAdditionalTotal();

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000
    );
  };

  // ── Items handlers ────────────────────────────────────────────────────────
  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    if (field === "quantity" || field === "price") {
      newItems[index].total = calculateTotal(
        Number(newItems[index].quantity),
        Number(newItems[index].price)
      );
    }
    setFormData({ ...formData, items: newItems });
  };

  const setUnit = (index, unit) => {
    const newItems = [...formData.items];
    newItems[index].unit = unit;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { description: "", quantity: 1, unit: "pcs", price: 0, total: 0 },
      ],
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  // ── Additional Charges handlers ───────────────────────────────────────────
  const addCharge = () => {
    setFormData({
      ...formData,
      additionalCharges: [
        ...formData.additionalCharges,
        {
          category: "Labour",
          description: "",
          quantity: 1,
          price: 0,
          total: 0,
        },
      ],
    });
  };

  const removeCharge = (index) => {
    const updated = formData.additionalCharges.filter((_, i) => i !== index);
    setFormData({ ...formData, additionalCharges: updated });
  };

  const handleChargeChange = (index, field, value) => {
    const updated = [...formData.additionalCharges];
    updated[index][field] = value;
    if (field === "quantity" || field === "price") {
      updated[index].total =
        Number(updated[index].quantity) * Number(updated[index].price);
    }
    setFormData({ ...formData, additionalCharges: updated });
  };

  // ── Client handlers ───────────────────────────────────────────────────────
  const handleClientChange = (field, value) => {
    setFormData({
      ...formData,
      clientInfo: { ...formData.clientInfo, [field]: value },
    });
  };

  const applyBillingCompany = (company) => {
    setSelectedBilling(company);
    setFormData((prev) => ({
      ...prev,
      clientInfo: {
        name: company.name,
        address: company.address,
        phone: company.phone,
        email: company.email,
      },
    }));
  };

  const resetForm = () => {
    setFormData({
      ...initialFormState,
      quotationNumber: `Quote-${Math.floor(Math.random() * 10000)}`,
      date: format(new Date(), "dd/MM/yyyy"),
    });
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setBillingLoading(true);
        const res = await axios.get(`${API_URL}/api/companies`);
        setBillingCompanies(
          res.data.map((c) => ({
            id: c._id,
            name: c.name,
            address: c.address || "",
            phone: c.phone || "",
            email: c.email || "",
          }))
        );
      } catch (err) {
        setBillingError("Failed to load saved companies");
      } finally {
        setBillingLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  // ── Save ──────────────────────────────────────────────────────────────────
  const saveQuotation = async () => {
    try {
      if (!formData.clientInfo.name.trim()) {
        showNotification("Please enter client name", "error");
        return;
      }
      const hasValidItems = formData.items.some(
        (item) => item.description.trim() !== ""
      );
      if (!hasValidItems) {
        showNotification("Please add at least one item description", "error");
        return;
      }
      await axios.post(
        `${API_URL}/api/quotations`,
        {
          ...formData,
          subtotal: getSubtotal(),
          additionalTotal: getAdditionalTotal(),
          grandTotal: getGrandTotal(),
          createdAt: new Date(),
        },
        { timeout: 5000 }
      );
      showNotification("Quotation saved successfully to database!");
      setTimeout(() => resetForm(), 1000);
    } catch (error) {
      console.error("Error saving quotation:", error);
      if (error.code === "ECONNREFUSED" || error.message.includes("timeout")) {
        showNotification(
          "Cannot connect to server. Make sure MongoDB and server are running.",
          "error"
        );
      } else {
        showNotification(
          "Failed to save to database. Check console for details.",
          "error"
        );
      }
    }
  };

  // ── PDF ───────────────────────────────────────────────────────────────────
  const downloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      showNotification("Generating PDF...", "info");

      await new Promise((resolve) => setTimeout(resolve, 100));

      const element = quotationRef.current;
      const clone = element.cloneNode(true);

      const offscreen = document.createElement("div");
      const A4_WIDTH_PX = 794;
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

      await new Promise((resolve) => setTimeout(resolve, 200));

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

      const pageWidth = 210;
      const pageHeight = 297;
      const imgRatio = canvas.width / canvas.height;

      let imgWidth = pageWidth - 2;
      let imgHeight = imgWidth / imgRatio;

      if (imgHeight > pageHeight - 2) {
        imgHeight = pageHeight - 2;
        imgWidth = imgHeight * imgRatio;
      }

      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;

      pdf.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);
      pdf.save(`Quotation-${formData.quotationNumber}.pdf`);

      showNotification("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      showNotification("Failed to generate PDF. Please try again.", "error");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const formatAddressLines = (address, wordsPerLine = 3) => {
    if (!address) return [];
    const words = address.split(" ");
    const lines = [];
    for (let i = 0; i < words.length; i += wordsPerLine) {
      lines.push(words.slice(i, i + wordsPerLine).join(" "));
    }
    return lines;
  };

  return (
    <div className="min-h-screen py-8 px-0 sm:px-6 lg:px-8">
      {showAddBilling && (
        <AddBillingModal
          onClose={() => setShowAddBilling(false)}
          onSaved={(company) => {
            setBillingCompanies((prev) => [...prev, company]);
            applyBillingCompany(company);
          }}
        />
      )}
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
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">W</span>
            </div>
            <span className="text-sm font-semibold text-slate-700">
              Wimwa Tech
            </span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-800 mb-2">
            Quotation Maker
          </h1>
          <p className="text-slate-600 font-medium">
            Create professional quotations in minutes
          </p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <button
            onClick={saveQuotation}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Quotation
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
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
        {/* ── Left Column: Form ── */}
        <div className="lg:col-span-1 space-y-6 animate-slide-up">
          {/* Client Info */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-100 rounded-lg">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-display font-bold text-slate-800">
                Client Information
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Client Name *
                </label>
                {billingCompanies.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Select Saved Company
                    </label>
                    <BillingSelector
                      contacts={billingCompanies}
                      selected={selectedBilling}
                      onSelect={applyBillingCompany}
                      onAddNew={() => setShowAddBilling(true)}
                    />
                    {billingLoading && (
                      <p className="text-xs text-slate-500 mt-1">
                        Loading companies…
                      </p>
                    )}
                    {billingError && (
                      <p className="text-xs text-red-500 mt-1">
                        {billingError}
                      </p>
                    )}
                  </div>
                )}
                <input
                  type="text"
                  value={formData.clientInfo.name}
                  onChange={(e) => handleClientChange("name", e.target.value)}
                  className="input-field"
                  placeholder="Enter client name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.clientInfo.address}
                  onChange={(e) =>
                    handleClientChange("address", e.target.value)
                  }
                  className="input-field resize-none"
                  rows="2"
                  placeholder="Enter address"
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
                title="Add Item"
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
                        title="Remove Item"
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
                      Price (KSh)
                    </label>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) =>
                        handleItemChange(index, "price", e.target.value)
                      }
                      className="input-field text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-300">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-600">
                        Total:
                      </span>
                      <span className="text-lg font-bold text-primary-600">
                        KSh{" "}
                        {item.total.toLocaleString("en-KE", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Additional Charges (Labour, Transport, etc.) ── */}
          <div className="card border-2 border-amber-200 bg-amber-50/30">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Wrench className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-slate-800">
                    Additional Charges
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Labour, transport, installation & more
                  </p>
                </div>
              </div>
              <button
                onClick={addCharge}
                className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-colors"
                title="Add Charge"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {formData.additionalCharges.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Wrench className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No additional charges yet.</p>
                <button
                  onClick={addCharge}
                  className="mt-3 text-xs font-semibold text-amber-600 hover:text-amber-800 underline"
                >
                  + Add Labour / Transport / Other
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {formData.additionalCharges.map((charge, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white rounded-xl border-2 border-amber-200 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold text-amber-600">
                        Charge {index + 1}
                      </span>
                      <button
                        onClick={() => removeCharge(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Remove Charge"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Category
                      </label>
                      <select
                        value={
                          CHARGE_CATEGORIES.includes(charge.category)
                            ? charge.category
                            : "Other"
                        }
                        onChange={(e) => {
                          // If they pick a real category, set it directly.
                          // If they pick "Other", clear to empty so the input is blank.
                          const val = e.target.value;
                          handleChargeChange(
                            index,
                            "category",
                            val === "Other" ? "" : val
                          );
                        }}
                        className="input-field text-sm"
                      >
                        {CHARGE_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      {/* Show custom input when "Other" is active (not a preset category) */}
                      {!CHARGE_CATEGORIES.filter((c) => c !== "Other").includes(
                        charge.category
                      ) && (
                        <input
                          type="text"
                          value={charge.category}
                          onChange={(e) =>
                            handleChargeChange(
                              index,
                              "category",
                              e.target.value
                            )
                          }
                          className="input-field text-sm mt-2"
                          placeholder="Enter custom charge type…"
                          autoFocus
                        />
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Description
                      </label>
                      <textarea
                        value={charge.description}
                        onChange={(e) =>
                          handleChargeChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        className="input-field text-sm"
                        rows="2"
                        placeholder={`e.g. ${charge.category} charges for installation`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={charge.quantity}
                          onChange={(e) =>
                            handleChargeChange(
                              index,
                              "quantity",
                              e.target.value
                            )
                          }
                          className="input-field text-sm"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Rate (KSh)
                        </label>
                        <input
                          type="number"
                          value={charge.price}
                          onChange={(e) =>
                            handleChargeChange(index, "price", e.target.value)
                          }
                          className="input-field text-sm"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-amber-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-600">
                          Total:
                        </span>
                        <span className="text-lg font-bold text-amber-600">
                          KSh{" "}
                          {(charge.total || 0).toLocaleString("en-KE", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Additional charges subtotal */}
            {formData.additionalCharges.length > 0 && (
              <div className="mt-4 pt-3 border-t-2 border-amber-200 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-700">
                  Additional Charges Total:
                </span>
                <span className="text-base font-bold text-amber-700">
                  KSh{" "}
                  {getAdditionalTotal().toLocaleString("en-KE", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Preview ── */}
        <div className="lg:col-span-2 animate-scale-in">
          <div className="p-0 sm:card sm:p-6 sticky top-8">
            <div className="mb-6">
              <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">
                Preview
              </h2>
              <p className="text-sm text-slate-600">
                This is how your quotation will look
              </p>
            </div>
            <div
              ref={quotationRef}
              className="bg-white p-0 sm:p-6 md:p-10 rounded-lg"
              style={{
                width: "100%",
                maxWidth: "100%",
                minHeight: "1123px",
                margin: "0 auto",
                overflow: "visible",
                backgroundColor: "#f8fafc",
              }}
            >
              {/* Header — Mobile */}
              <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b-2 border-slate-300">
                <div className="sm:hidden space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                      <div className="text-center">
                        <div className="text-white font-bold text-xs leading-tight">
                          Wimwa
                        </div>
                        <div className="text-white font-bold text-xs leading-tight">
                          Tech
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-sm font-bold text-slate-900 mb-0.5 leading-tight">
                        {formData.companyInfo.name}
                      </h1>
                      <p className="text-xs text-slate-600 mb-1">Wimwa Tech</p>
                    </div>
                  </div>
                  <div
                    className="w-full py-3 rounded-lg shadow-lg text-center"
                    style={{ color: "#000" }}
                  >
                    <h2
                      className="text-xl font-bold tracking-wide"
                      style={{ color: "#000" }}
                    >
                      QUOTATION
                    </h2>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-700">
                        Quotation#
                      </span>
                      <span className="text-slate-900 font-semibold">
                        {formData.quotationNumber}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-700">Date:</span>
                      <span className="text-slate-900 font-semibold">
                        {formData.date}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="flex-shrink-0 text-slate-500">📍</span>
                      <span className="leading-none">
                        {formData.companyInfo.address}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 text-slate-500">📞</span>
                      <span className="text-slate-700 break-words leading-relaxed">
                        {formData.companyInfo.phone}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 text-slate-500">✉️</span>
                      <span className="text-slate-700 break-words leading-relaxed">
                        {formData.companyInfo.email}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-400 mt-1 ml-5">
                      {formData.companyInfo.pvt}
                    </p>
                  </div>
                </div>

                {/* Header — Desktop */}
                <div className="hidden sm:flex justify-between items-start gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 flex-shrink-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <div className="text-center">
                        <div className="text-white font-bold text-sm leading-tight">
                          Wimwa
                        </div>
                        <div className="text-white font-bold text-sm leading-tight">
                          Tech
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h1 className="text-lg font-bold text-slate-900 mb-1 leading-tight">
                        {formData.companyInfo.name}
                      </h1>
                      <p className="text-sm text-slate-600 mb-3">Wimwa Tech</p>
                      <div className="space-y-1.5 text-sm text-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="flex-shrink-0 text-slate-500">
                            📍
                          </span>
                          <span className="leading-none">
                            {formData.companyInfo.address}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-slate-500">
                            📞
                          </span>
                          <span className="text-slate-700 break-words leading-relaxed">
                            {formData.companyInfo.phone}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-slate-500">
                            ✉️
                          </span>
                          <span className="text-slate-700 break-words leading-relaxed">
                            {formData.companyInfo.email}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs font-mono text-slate-500 mt-2 ml-6">
                        {formData.companyInfo.pvt}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div
                      className="inline-flex items-center justify-center px-12 py-4 rounded-lg mb-4 shadow-lg min-w-[200px]"
                      style={{ color: "#000" }}
                    >
                      <h2
                        className="text-2xl font-bold tracking-wide"
                        style={{ color: "#000" }}
                      >
                        QUOTATION
                      </h2>
                    </div>
                    <div className="space-y-2 text-sm bg-slate-50 p-4 rounded-lg">
                      <div className="flex justify-between gap-8 items-center">
                        <span className="font-bold text-slate-700">
                          Quotation#
                        </span>
                        <span className="text-slate-900 font-semibold">
                          {formData.quotationNumber}
                        </span>
                      </div>
                      <div className="flex justify-between gap-8 items-center">
                        <span className="font-bold text-slate-700">Date:</span>
                        <span className="text-slate-900 font-semibold">
                          {formData.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Section */}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 mb-2 sm:mb-3">
                  To,
                </h3>
                <div className="text-xs sm:text-sm bg-slate-50 p-3 sm:p-4 rounded-lg">
                  <p className="font-bold text-slate-900 text-sm sm:text-base mb-1">
                    {formData.clientInfo.name || "Client Name"}
                  </p>
                  {formData.clientInfo.address && (
                    <div className="text-slate-700 text-xs sm:text-sm leading-relaxed mb-2 space-y-0.5">
                      {formatAddressLines(formData.clientInfo.address, 3).map(
                        (line, idx) => (
                          <p key={idx}>{line}</p>
                        )
                      )}
                    </div>
                  )}
                  <div className="space-y-2 text-xs sm:text-sm text-slate-700">
                    {formData.clientInfo.phone && (
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0 text-slate-500">📞</span>
                        <span className="break-words leading-relaxed">
                          {formData.clientInfo.phone}
                        </span>
                      </div>
                    )}
                    {formData.clientInfo.email && (
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0 text-slate-500">✉️</span>
                        <span className="break-words leading-relaxed">
                          {formData.clientInfo.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-800 mb-1 sm:mb-2 font-medium">
                Dear Sir/Madam,
              </p>
              <p className="text-xs sm:text-sm text-slate-700 mb-4 sm:mb-6">
                Thank you for your valuable inquiry. We are pleased to quote as
                below:
              </p>

              {/* ── Items Table ── */}
              <div
                className="mb-4 sm:mb-6 sm:-mx-4"
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
                        <th className="text-left p-2 sm:p-3 font-bold text-[10px] sm:text-xs uppercase min-w-[120px] sm:min-w-0">
                          DESCRIPTION
                        </th>
                        <th
                          className="text-center font-bold text-[10px] sm:text-xs uppercase"
                          style={{ minWidth: "100px", padding: "8px 16px" }}
                        >
                          QTY
                        </th>
                        <th className="text-right p-2 sm:p-3 font-bold text-[10px] sm:text-xs uppercase whitespace-nowrap">
                          PRICE
                        </th>
                        <th className="text-right p-2 sm:p-3 font-bold text-[10px] sm:text-xs uppercase whitespace-nowrap">
                          TOTAL
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b border-slate-200 hover:bg-slate-50"
                        >
                          <td className="p-2 sm:p-3 font-medium text-slate-700 text-[10px] sm:text-xs">
                            {index + 1}
                          </td>
                          <td className="p-2 sm:p-3">
                            <p className="font-medium text-slate-900 text-xs sm:text-sm leading-relaxed">
                              {item.description || "Item description"}
                            </p>
                          </td>
                          <td
                            style={{
                              padding: "10px 16px",
                              textAlign: "center",
                              verticalAlign: "middle",
                              whiteSpace: "nowrap",
                              fontWeight: 600,
                              color: "#1e293b",
                              fontSize: "0.95rem",
                            }}
                          >
                            {item.quantity} {item.unit}
                          </td>
                          <td className="p-2 sm:p-3 text-right text-slate-800 text-xs sm:text-sm whitespace-nowrap">
                            Ksh{" "}
                            {item.price.toLocaleString("en-KE", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="p-2 sm:p-3 text-right font-semibold text-slate-900 text-xs sm:text-sm whitespace-nowrap">
                            Ksh{" "}
                            {item.total.toLocaleString("en-KE", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Items subtotal row (only shown when there are additional charges) */}
              {formData.additionalCharges.length > 0 && (
                <div className="flex justify-end mb-3">
                  <div className="flex items-center gap-8 text-sm text-slate-600 pr-1">
                    <span className="font-semibold">Items Subtotal:</span>
                    <span className="font-bold text-slate-800 min-w-[120px] text-right">
                      Ksh{" "}
                      {getSubtotal().toLocaleString("en-KE", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              )}

              {/* ── Additional Charges Table (only rendered when charges exist) ── */}
              {formData.additionalCharges.length > 0 && (
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
                        <tr className="bg-amber-700 text-white border-b-2 border-amber-900">
                          <th className="text-left p-2 sm:p-3 font-bold text-[10px] sm:text-xs uppercase whitespace-nowrap">
                            #
                          </th>
                          <th
                            className="text-left p-2 sm:p-3 font-bold text-[10px] sm:text-xs uppercase"
                            colSpan={2}
                          >
                            ADDITIONAL CHARGES
                          </th>
                          <th
                            className="text-center font-bold text-[10px] sm:text-xs uppercase"
                            style={{ minWidth: "80px", padding: "8px 12px" }}
                          >
                            QTY
                          </th>
                          <th className="text-right p-2 sm:p-3 font-bold text-[10px] sm:text-xs uppercase whitespace-nowrap">
                            RATE
                          </th>
                          <th className="text-right p-2 sm:p-3 font-bold text-[10px] sm:text-xs uppercase whitespace-nowrap">
                            TOTAL
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.additionalCharges.map((charge, index) => (
                          <tr
                            key={index}
                            className="border-b border-amber-100 hover:bg-amber-50/40"
                          >
                            <td className="p-2 sm:p-3 font-medium text-slate-700 text-[10px] sm:text-xs">
                              {index + 1}
                            </td>
                            <td className="p-2 sm:p-3" colSpan={2}>
                              <p className="font-semibold text-amber-800 text-[10px] sm:text-xs uppercase tracking-wide mb-0.5">
                                {charge.category}
                              </p>
                              <p className="font-medium text-slate-900 text-xs sm:text-sm leading-relaxed">
                                {charge.description ||
                                  `${charge.category} charges`}
                              </p>
                            </td>
                            <td
                              style={{
                                padding: "10px 12px",
                                textAlign: "center",
                                verticalAlign: "middle",
                                whiteSpace: "nowrap",
                                fontWeight: 600,
                                color: "#1e293b",
                                fontSize: "0.9rem",
                              }}
                            >
                              {charge.quantity}
                            </td>
                            <td className="p-2 sm:p-3 text-right text-slate-800 text-xs sm:text-sm whitespace-nowrap">
                              Ksh{" "}
                              {Number(charge.price).toLocaleString("en-KE", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="p-2 sm:p-3 text-right font-semibold text-slate-900 text-xs sm:text-sm whitespace-nowrap">
                              Ksh{" "}
                              {(charge.total || 0).toLocaleString("en-KE", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── Grand Total Section ── */}
              <div className="flex justify-end mb-6 sm:mb-8">
                <div className="bg-slate-100 px-4 sm:px-8 py-3 sm:py-4 rounded-lg border-2 border-slate-300 w-full sm:w-auto space-y-2">
                  {formData.additionalCharges.length > 0 && (
                    <>
                      <div className="flex items-center justify-between sm:gap-6 text-sm text-slate-600">
                        <span className="font-semibold">Items Subtotal:</span>
                        <span className="font-bold text-slate-800">
                          Ksh{" "}
                          {getSubtotal().toLocaleString("en-KE", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between sm:gap-6 text-sm text-amber-700">
                        <span className="font-semibold">
                          Additional Charges:
                        </span>
                        <span className="font-bold">
                          Ksh{" "}
                          {getAdditionalTotal().toLocaleString("en-KE", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="border-t border-slate-300 pt-2" />
                    </>
                  )}
                  <div className="flex items-center justify-between sm:gap-6">
                    <span className="text-sm sm:text-base font-bold text-slate-800">
                      Grand Total:
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-slate-900">
                      Ksh{" "}
                      {getGrandTotal().toLocaleString("en-KE", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 mb-6 sm:mb-8">
                We hope you find our offer to be in line with your requirement.
              </p>

              {/* Terms & Conditions */}
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
                    <span className="font-bold">•</span> 2. Pricing & Taxes: All
                    prices are exclusive of applicable taxes unless stated
                    otherwise. The buyer is responsible for any taxes, duties,
                    or additional charges.
                  </p>
                  <p>
                    <span className="font-bold">•</span> 3. Returns & Claims:
                    Claims for defective or incorrect items must be reported
                    within 48 hours of receipt. Returns are subject to approval
                    as per our return policy.
                  </p>
                  <p className="pt-1 sm:pt-2">
                    By making a purchase, the buyer agrees to these terms. For
                    inquiries, contact wimwatech@gmail.com.
                  </p>
                </div>
              </div>

              {/* Signature */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t-2 border-slate-300">
                <p className="text-sm sm:text-base font-bold text-slate-900 text-center">
                  For, WIMWA TECH GENERAL SUPPLIES LIMITED
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuotationPage;
