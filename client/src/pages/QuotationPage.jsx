import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Download,
  Save,
  User,
  Wrench,
  Image,
  GitBranch,
  X,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { format } from "date-fns";
import axios from "axios";
import AddBillingModal from "../components/AddBillingModal";
import BillingSelector from "../components/BillingSelector";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CHARGE_CATEGORIES = [
  "Labour",
  "Transport",
  "Installation",
  "Consultation",
  "Delivery",
  "Other",
];

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

const blankOption = () => ({
  label: "",
  description: "",
  quantity: 1,
  unit: "pcs",
  price: 0,
  total: 0,
  imageUrl: "",
  imageFile: null,
  imagePreview: "",
});

const blankItem = () => ({
  description: "",
  quantity: 1,
  unit: "pcs",
  price: 0,
  total: 0,
  imageUrl: "",
  imageFile: null,
  imagePreview: "",
  hasOptions: false,
  options: [],
});

function ImageUploadField({ preview, onFile, onClear, size = "sm" }) {
  const fileRef = useRef(null);
  const dim = size === "xs" ? "w-12 h-12" : "w-14 h-14";
  return (
    <div className="flex-shrink-0">
      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="product"
            className={`${dim} object-cover rounded-lg border-2 border-slate-300`}
          />
          <button
            type="button"
            onClick={onClear}
            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center shadow"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={`${dim} flex flex-col items-center justify-center gap-0.5 border-2 border-dashed border-slate-300 hover:border-primary-400 hover:bg-primary-50 rounded-lg transition-colors`}
        >
          <Upload className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[9px] font-semibold text-slate-400 leading-none">
            IMG
          </span>
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files[0]) onFile(e.target.files[0]);
        }}
      />
    </div>
  );
}

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
    clientInfo: { name: "", address: "", phone: "", email: "" },
    items: [blankItem()],
    additionalCharges: [],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [billingCompanies, setBillingCompanies] = useState([]);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState(null);
  const [showAddBilling, setShowAddBilling] = useState(false);
  const quotationRef = useRef(null);

  // ── Totals ────────────────────────────────────────────────────────────────
  const getSubtotal = () =>
    formData.items.reduce((sum, item) => {
      if (item.hasOptions && item.options.length > 0)
        return sum + item.options.reduce((s, o) => s + (o.total || 0), 0);
      return sum + item.total;
    }, 0);
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

  // ── Cloudinary upload ─────────────────────────────────────────────────────
  const uploadToCloudinary = async (file) => {
    const payload = new FormData();
    payload.append("image", file);
    const token = localStorage.getItem("wt_token");
    const res = await axios.post(
      `${API_URL}/api/products/upload-image`,
      payload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );
    return res.data.url;
  };

  // ── Item image handlers ───────────────────────────────────────────────────
  const handleItemImage = (index, file) => {
    const preview = URL.createObjectURL(file);
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      imageFile: file,
      imagePreview: preview,
    };
    setFormData({ ...formData, items: newItems });
  };
  const clearItemImage = (index) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      imageFile: null,
      imagePreview: "",
      imageUrl: "",
    };
    setFormData({ ...formData, items: newItems });
  };

  // ── Option image handlers ─────────────────────────────────────────────────
  const handleOptionImage = (itemIdx, optIdx, file) => {
    const preview = URL.createObjectURL(file);
    const newItems = [...formData.items];
    const newOptions = [...newItems[itemIdx].options];
    newOptions[optIdx] = {
      ...newOptions[optIdx],
      imageFile: file,
      imagePreview: preview,
    };
    newItems[itemIdx] = { ...newItems[itemIdx], options: newOptions };
    setFormData({ ...formData, items: newItems });
  };
  const clearOptionImage = (itemIdx, optIdx) => {
    const newItems = [...formData.items];
    const newOptions = [...newItems[itemIdx].options];
    newOptions[optIdx] = {
      ...newOptions[optIdx],
      imageFile: null,
      imagePreview: "",
      imageUrl: "",
    };
    newItems[itemIdx] = { ...newItems[itemIdx], options: newOptions };
    setFormData({ ...formData, items: newItems });
  };

  // ── Items handlers ────────────────────────────────────────────────────────
  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    if (field === "quantity" || field === "price")
      newItems[index].total =
        Number(newItems[index].quantity) * Number(newItems[index].price);
    setFormData({ ...formData, items: newItems });
  };
  const setUnit = (index, unit) => {
    const newItems = [...formData.items];
    newItems[index].unit = unit;
    setFormData({ ...formData, items: newItems });
  };
  const addItem = () =>
    setFormData({ ...formData, items: [...formData.items, blankItem()] });
  const removeItem = (index) => {
    if (formData.items.length > 1)
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index),
      });
  };

  // ── Options handlers ──────────────────────────────────────────────────────
  const toggleOptions = (index) => {
    const newItems = [...formData.items];
    const item = newItems[index];
    newItems[index] = item.hasOptions
      ? { ...item, hasOptions: false, options: [] }
      : { ...item, hasOptions: true, options: [blankOption(), blankOption()] };
    setFormData({ ...formData, items: newItems });
  };
  const addOption = (itemIndex) => {
    const newItems = [...formData.items];
    newItems[itemIndex].options = [
      ...newItems[itemIndex].options,
      blankOption(),
    ];
    setFormData({ ...formData, items: newItems });
  };
  const removeOption = (itemIndex, optIndex) => {
    const newItems = [...formData.items];
    newItems[itemIndex].options = newItems[itemIndex].options.filter(
      (_, i) => i !== optIndex
    );
    setFormData({ ...formData, items: newItems });
  };
  const handleOptionChange = (itemIndex, optIndex, field, value) => {
    const newItems = [...formData.items];
    const newOptions = [...newItems[itemIndex].options];
    newOptions[optIndex][field] = value;
    if (field === "quantity" || field === "price")
      newOptions[optIndex].total =
        Number(newOptions[optIndex].quantity) *
        Number(newOptions[optIndex].price);
    newItems[itemIndex] = { ...newItems[itemIndex], options: newOptions };
    setFormData({ ...formData, items: newItems });
  };
  const setOptionUnit = (itemIndex, optIndex, unit) => {
    const newItems = [...formData.items];
    const newOptions = [...newItems[itemIndex].options];
    newOptions[optIndex].unit = unit;
    newItems[itemIndex] = { ...newItems[itemIndex], options: newOptions };
    setFormData({ ...formData, items: newItems });
  };

  // ── Additional Charges ────────────────────────────────────────────────────
  const addCharge = () =>
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
  const removeCharge = (index) =>
    setFormData({
      ...formData,
      additionalCharges: formData.additionalCharges.filter(
        (_, i) => i !== index
      ),
    });
  const handleChargeChange = (index, field, value) => {
    const updated = [...formData.additionalCharges];
    updated[index][field] = value;
    if (field === "quantity" || field === "price")
      updated[index].total =
        Number(updated[index].quantity) * Number(updated[index].price);
    setFormData({ ...formData, additionalCharges: updated });
  };

  // ── Client ────────────────────────────────────────────────────────────────
  const handleClientChange = (field, value) =>
    setFormData({
      ...formData,
      clientInfo: { ...formData.clientInfo, [field]: value },
    });
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
  const resetForm = () =>
    setFormData({
      ...initialFormState,
      quotationNumber: `Quote-${Math.floor(Math.random() * 10000)}`,
      date: format(new Date(), "dd/MM/yyyy"),
    });

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
      } catch {
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
      const hasValidItems = formData.items.some((item) =>
        item.hasOptions
          ? item.options.some((o) => o.description.trim())
          : item.description.trim()
      );
      if (!hasValidItems) {
        showNotification("Please add at least one item description", "error");
        return;
      }

      setIsSaving(true);

      const mappedItems = [];
      for (const item of formData.items) {
        if (item.hasOptions && item.options.length > 0) {
          for (const opt of item.options) {
            if (!opt.description.trim()) continue;
            let imageUrl = opt.imageUrl;
            if (opt.imageFile)
              imageUrl = await uploadToCloudinary(opt.imageFile);
            mappedItems.push({
              name: `${item.description ? item.description + " — " : ""}${
                opt.label || "Option"
              }`,
              price: Number(opt.price),
              qty: Number(opt.quantity),
              subtotal: opt.total || Number(opt.price) * Number(opt.quantity),
              imageUrl,
              unit: opt.unit || "pcs",
            });
          }
        } else {
          if (!item.description.trim()) continue;
          let imageUrl = item.imageUrl;
          if (item.imageFile)
            imageUrl = await uploadToCloudinary(item.imageFile);
          mappedItems.push({
            name: item.description,
            price: Number(item.price),
            qty: Number(item.quantity),
            subtotal: item.total || Number(item.price) * Number(item.quantity),
            imageUrl,
            unit: item.unit || "pcs",
          });
        }
      }

      const mappedCharges = formData.additionalCharges.map((c) => ({
        category: c.category || "Labour",
        description: c.description || "",
        quantity: Number(c.quantity),
        price: Number(c.price),
        total: c.total || Number(c.quantity) * Number(c.price),
      }));

      const token = localStorage.getItem("wt_token");
      await axios.post(
        `${API_URL}/api/quotations`,
        {
          customer: {
            companyName: formData.clientInfo.name,
            contactName: formData.clientInfo.name,
            email: formData.clientInfo.email.trim() || "noemail@noemail.com",
            phone: formData.clientInfo.phone || "",
            deliveryAddress: formData.clientInfo.address || "",
          },
          items: mappedItems,
          additionalCharges: mappedCharges,
          total: getGrandTotal(),
          notes: "",
        },
        {
          timeout: 10000,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      showNotification("Quotation saved successfully to database!");
      setTimeout(() => resetForm(), 1000);
    } catch (error) {
      console.error("Error saving quotation:", error);
      const msg = error.response?.data?.message || error.message;
      if (error.code === "ECONNREFUSED" || error.message.includes("timeout"))
        showNotification(
          "Cannot connect to server. Make sure MongoDB and server are running.",
          "error"
        );
      else showNotification(`Failed to save: ${msg}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── PDF generation ────────────────────────────────────────────────────────
  //
  // PAGE-BREAK STRATEGY
  // ───────────────────
  // 1. Clone the quotation into an offscreen position:fixed container at top:0.
  //    Because it's position:fixed, getBoundingClientRect().bottom for any
  //    child equals its CSS-pixel distance from the container top — no scroll
  //    offset needed.
  //
  // 2. Collect the bottom edge of every <tr> and direct block child in CSS px.
  //
  // 3. Render the full content with html2canvas at scale=2.
  //    Canvas pixels = CSS pixels × 2 — so multiply every break point by 2
  //    before comparing against canvas-space page boundaries.
  //
  // 4. Walk forward through the canvas, breaking at the last safe row bottom
  //    that fits within each A4 page height (in canvas px).
  //
  // 5. MIN_TAIL_PX = 120 mm (in canvas px): if the remaining content after
  //    the last break is less than this, absorb it into the previous page
  //    rather than creating a near-empty last page. 120 mm is large enough
  //    to cover the Terms & Conditions + Signature block (~100 mm tall).
  // ─────────────────────────────────────────────────────────────────────────
  const downloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      showNotification("Generating PDF...", "info");
      await new Promise((r) => setTimeout(r, 100));

      const SCALE = 2;
      const A4_WIDTH_PX = 794;
      const PADDING_PX = 40;

      // ── 1. Clone into offscreen fixed container ───────────────────────────
      const clone = quotationRef.current.cloneNode(true);
      const offscreen = document.createElement("div");

      offscreen.style.cssText = [
        "position:fixed",
        "top:0",
        "left:0",
        `width:${A4_WIDTH_PX}px`,
        "transform:translateX(-99999px)",
        "overflow:visible",
        "z-index:-9999",
        "background:#ffffff",
        "pointer-events:none",
        `padding:${PADDING_PX}px 48px`,
        "box-sizing:border-box",
      ].join(";");

      clone.style.cssText += ";padding:0;margin:0;width:100%;";

      clone.querySelectorAll("*").forEach((el) => {
        const cs = window.getComputedStyle(el);
        if (["hidden", "auto", "scroll"].includes(cs.overflow))
          el.style.overflow = "visible";
        if (["hidden", "auto", "scroll"].includes(cs.overflowX))
          el.style.overflowX = "visible";
        if (["hidden", "auto", "scroll"].includes(cs.overflowY))
          el.style.overflowY = "visible";
      });

      offscreen.appendChild(clone);
      document.body.appendChild(offscreen);
      await new Promise((r) => setTimeout(r, 300));

      // ── 2. Collect break points in CSS px ────────────────────────────────
      const breaksCssPx = [];
      const collect = (els) => {
        els.forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.height > 0) breaksCssPx.push(r.bottom);
        });
      };

      collect(Array.from(clone.querySelectorAll("tr")));
      collect(
        Array.from(clone.children).filter(
          (el) =>
            !["TABLE", "THEAD", "TBODY", "TR", "TD", "TH"].includes(el.tagName)
        )
      );
      breaksCssPx.sort((a, b) => a - b);

      // ── 3. Render full canvas ─────────────────────────────────────────────
      const canvas = await html2canvas(offscreen, {
        scale: SCALE,
        backgroundColor: "#ffffff",
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        width: A4_WIDTH_PX,
        windowWidth: A4_WIDTH_PX,
      });

      document.body.removeChild(offscreen);

      // ── 4. Convert CSS px → canvas px ────────────────────────────────────
      // CRITICAL: html2canvas scale=2 means 1 CSS px = 2 canvas px.
      // All page-boundary comparisons must be in the same unit (canvas px).
      const breaksCanvasPx = breaksCssPx.map((px) => Math.round(px * SCALE));

      // ── 5. A4 dimensions ──────────────────────────────────────────────────
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const PAGE_W_MM = 210;
      const PAGE_H_MM = 297;
      const pxPerMm = canvas.width / PAGE_W_MM;
      const pageHeightPx = PAGE_H_MM * pxPerMm;
      const totalHeightMm = canvas.height / pxPerMm;

      // ── 6. Single-page shortcut ───────────────────────────────────────────
      if (totalHeightMm <= PAGE_H_MM) {
        pdf.addImage(
          canvas.toDataURL("image/jpeg", 0.92),
          "JPEG",
          0,
          0,
          PAGE_W_MM,
          totalHeightMm
        );
        pdf.save(`Quotation-${formData.quotationNumber}.pdf`);
        showNotification("PDF downloaded successfully!");
        return;
      }

      // ── 7. Multi-page slicing ─────────────────────────────────────────────
      //
      // MIN_TAIL_PX: if the content remaining after a break is smaller than
      // this threshold, absorb it into the current page to avoid a near-empty
      // last page. Set to 120 mm so the Terms & Conditions + Signature footer
      // (which is ~100 mm) always gets pulled onto the previous page.
      const MIN_TAIL_MM = 120;
      const MIN_TAIL_PX = MIN_TAIL_MM * pxPerMm;

      const slices = [];
      let pageStart = 0;

      while (pageStart < canvas.height) {
        const remaining = canvas.height - pageStart;

        // Everything left fits on one page — take it all
        if (remaining <= pageHeightPx) {
          slices.push({ start: pageStart, end: canvas.height });
          break;
        }

        const pageEnd = pageStart + pageHeightPx;

        // Find the last safe break point that fits within this page
        let breakAt = pageEnd; // fallback: hard cut
        for (let i = breaksCanvasPx.length - 1; i >= 0; i--) {
          if (breaksCanvasPx[i] <= pageEnd && breaksCanvasPx[i] > pageStart) {
            breakAt = breaksCanvasPx[i];
            break;
          }
        }
        breakAt = Math.min(breakAt, canvas.height);

        // If the tail after this break is smaller than MIN_TAIL_PX,
        // absorb the whole tail into the current page now
        const tail = canvas.height - breakAt;
        if (tail > 0 && tail < MIN_TAIL_PX) {
          slices.push({ start: pageStart, end: canvas.height });
          break;
        }

        if (breakAt <= pageStart) break; // safety guard
        slices.push({ start: pageStart, end: breakAt });
        pageStart = breakAt;
      }

      // ── 8. Render each slice onto a PDF page ──────────────────────────────
      slices.forEach((slice, idx) => {
        const sliceH = slice.end - slice.start;
        if (sliceH <= 0) return;

        const tmp = document.createElement("canvas");
        tmp.width = canvas.width;
        tmp.height = sliceH;
        tmp
          .getContext("2d")
          .drawImage(
            canvas,
            0,
            slice.start,
            canvas.width,
            sliceH,
            0,
            0,
            canvas.width,
            sliceH
          );

        if (idx > 0) pdf.addPage();
        pdf.addImage(
          tmp.toDataURL("image/jpeg", 0.92),
          "JPEG",
          0,
          0,
          PAGE_W_MM,
          sliceH / pxPerMm
        );
      });

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
    for (let i = 0; i < words.length; i += wordsPerLine)
      lines.push(words.slice(i, i + wordsPerLine).join(" "));
    return lines;
  };

  // ─────────────────────────────────────────────────────────────────────────
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

      {/* ── Page header ── */}
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
            disabled={isSaving}
            className={`btn-primary flex items-center gap-2 ${
              isSaving ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" /> Save Quotation
              </>
            )}
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
        {/* ════════════════════ LEFT COLUMN — FORM ════════════════════ */}
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
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-slate-50 rounded-xl border-2 border-slate-200 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-primary-600">
                      Item {index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleOptions(index)}
                        title={
                          item.hasOptions
                            ? "Switch to single item"
                            : "Offer multiple brand options"
                        }
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          item.hasOptions
                            ? "bg-violet-100 text-violet-700 hover:bg-violet-200"
                            : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                        }`}
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                        {item.hasOptions ? "Options ON" : "Options"}
                      </button>
                      {formData.items.length > 1 && (
                        <button
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ── Single item ── */}
                  {!item.hasOptions && (
                    <>
                      <div className="flex gap-3 items-start">
                        <ImageUploadField
                          preview={item.imagePreview}
                          onFile={(file) => handleItemImage(index, file)}
                          onClear={() => clearItemImage(index)}
                        />
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Description
                          </label>
                          <textarea
                            value={item.description}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            className="input-field text-sm"
                            rows="2"
                            placeholder="Item description"
                          />
                        </div>
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
                              handleItemChange(
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
                            Unit
                          </label>
                          <div
                            className="flex rounded-lg border-2 border-slate-300 overflow-hidden w-full"
                            style={{ height: "38px" }}
                          >
                            <button
                              type="button"
                              onClick={() => setUnit(index, "pcs")}
                              className="flex-1 text-xs font-bold transition-colors focus:outline-none"
                              style={{
                                backgroundColor:
                                  item.unit === "pcs"
                                    ? "#0f172a"
                                    : "transparent",
                                color: item.unit === "pcs" ? "#fff" : "#94a3b8",
                              }}
                            >
                              pcs
                            </button>
                            <button
                              type="button"
                              onClick={() => setUnit(index, "kgs")}
                              className="flex-1 text-xs font-bold transition-colors focus:outline-none border-l-2 border-slate-300"
                              style={{
                                backgroundColor:
                                  item.unit === "kgs"
                                    ? "#b45309"
                                    : "transparent",
                                color: item.unit === "kgs" ? "#fff" : "#94a3b8",
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
                      <div className="pt-2 border-t border-slate-300 flex justify-between items-center">
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
                    </>
                  )}

                  {/* ── Multi-option item ── */}
                  {item.hasOptions && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Item Name / Category
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className="input-field text-sm"
                          placeholder="e.g. Office Standing Fan"
                        />
                      </div>
                      <p className="text-xs text-violet-600 bg-violet-50 border border-violet-200 px-3 py-2 rounded-lg">
                        Options will appear stacked under this category — the
                        client picks one.
                      </p>
                      <div className="space-y-3">
                        {item.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className="p-3 bg-white rounded-lg border-2 border-violet-200 space-y-2"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-violet-600">
                                Option {OPTION_LETTERS[optIdx] || optIdx + 1}
                              </span>
                              {item.options.length > 2 && (
                                <button
                                  onClick={() => removeOption(index, optIdx)}
                                  className="text-red-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            <div className="flex gap-2 items-start">
                              <ImageUploadField
                                size="xs"
                                preview={opt.imagePreview}
                                onFile={(file) =>
                                  handleOptionImage(index, optIdx, file)
                                }
                                onClear={() => clearOptionImage(index, optIdx)}
                              />
                              <div className="flex-1 space-y-2">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                                    Brand / Label
                                  </label>
                                  <input
                                    type="text"
                                    value={opt.label}
                                    onChange={(e) =>
                                      handleOptionChange(
                                        index,
                                        optIdx,
                                        "label",
                                        e.target.value
                                      )
                                    }
                                    className="input-field text-xs"
                                    placeholder="e.g. Nunix, Ailyons, Sanford…"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                                    Description
                                  </label>
                                  <textarea
                                    value={opt.description}
                                    onChange={(e) =>
                                      handleOptionChange(
                                        index,
                                        optIdx,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                    className="input-field text-xs"
                                    rows="2"
                                    placeholder="Specifications, model, features…"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">
                                  QTY
                                </label>
                                <input
                                  type="number"
                                  value={opt.quantity}
                                  onChange={(e) =>
                                    handleOptionChange(
                                      index,
                                      optIdx,
                                      "quantity",
                                      e.target.value
                                    )
                                  }
                                  className="input-field text-xs"
                                  min="1"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">
                                  Unit
                                </label>
                                <div
                                  className="flex rounded-lg border-2 border-slate-300 overflow-hidden"
                                  style={{ height: "34px" }}
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOptionUnit(index, optIdx, "pcs")
                                    }
                                    className="flex-1 text-xs font-bold focus:outline-none transition-colors"
                                    style={{
                                      backgroundColor:
                                        opt.unit === "pcs"
                                          ? "#0f172a"
                                          : "transparent",
                                      color:
                                        opt.unit === "pcs" ? "#fff" : "#94a3b8",
                                    }}
                                  >
                                    pcs
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOptionUnit(index, optIdx, "kgs")
                                    }
                                    className="flex-1 text-xs font-bold focus:outline-none transition-colors border-l-2 border-slate-300"
                                    style={{
                                      backgroundColor:
                                        opt.unit === "kgs"
                                          ? "#b45309"
                                          : "transparent",
                                      color:
                                        opt.unit === "kgs" ? "#fff" : "#94a3b8",
                                    }}
                                  >
                                    kgs
                                  </button>
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">
                                  PRICE (KSh)
                                </label>
                                <input
                                  type="number"
                                  value={opt.price}
                                  onChange={(e) =>
                                    handleOptionChange(
                                      index,
                                      optIdx,
                                      "price",
                                      e.target.value
                                    )
                                  }
                                  className="input-field text-xs"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                            </div>
                            <div className="pt-1.5 border-t border-violet-100 flex justify-between items-center">
                              <span className="text-xs font-semibold text-slate-500">
                                TOTAL:
                              </span>
                              <span className="text-sm font-bold text-violet-600">
                                KSh{" "}
                                {(opt.total || 0).toLocaleString("en-KE", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => addOption(index)}
                        className="w-full py-2 border-2 border-dashed border-violet-300 text-violet-600 hover:border-violet-400 hover:bg-violet-50 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Another Option
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Additional Charges */}
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
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
                        placeholder={`e.g. ${charge.category} charges`}
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
                    <div className="pt-2 border-t border-amber-200 flex justify-between items-center">
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
                ))}
              </div>
            )}
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

        {/* ════════════════════ RIGHT COLUMN — PREVIEW ════════════════════ */}
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
              style={{
                width: "100%",
                maxWidth: "794px",
                margin: "0 auto",
                backgroundColor: "#ffffff",
                padding: "40px 48px",
                boxSizing: "border-box",
                overflow: "visible",
                minHeight: "1123px",
              }}
            >
              {/* ── Header Mobile ── */}
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
                    </div>
                  </div>
                  <div className="w-full py-3 rounded-lg text-center">
                    <h2
                      className="text-xl font-bold tracking-wide"
                      style={{ color: "#000" }}
                    >
                      QUOTATION
                    </h2>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-700">
                        Quotation#
                      </span>
                      <span className="text-slate-900 font-semibold">
                        {formData.quotationNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-700">Date:</span>
                      <span className="text-slate-900 font-semibold">
                        {formData.date}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <span>🌍</span>
                      <span>{formData.companyInfo.address}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span>📞</span>
                      <span>{formData.companyInfo.phone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span>✉️</span>
                      <span>{formData.companyInfo.email}</span>
                    </div>
                    <p className="text-xs font-mono text-slate-400 ml-5">
                      {formData.companyInfo.pvt}
                    </p>
                  </div>
                </div>

                {/* ── Header Desktop ── */}
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
                          <span>🌍</span>
                          <span>{formData.companyInfo.address}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span>📞</span>
                          <span>{formData.companyInfo.phone}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span>✉️</span>
                          <span>{formData.companyInfo.email}</span>
                        </div>
                      </div>
                      <p className="text-xs font-mono text-slate-500 mt-2 ml-6">
                        {formData.companyInfo.pvt}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="inline-flex items-center justify-center px-12 py-4 rounded-lg mb-4 shadow-lg min-w-[200px]">
                      <h2
                        className="text-2xl font-bold tracking-wide"
                        style={{ color: "#000" }}
                      >
                        QUOTATION
                      </h2>
                    </div>
                    <div className="space-y-2 text-sm bg-slate-50 p-4 rounded-lg">
                      <div className="flex justify-between gap-8">
                        <span className="font-bold text-slate-700">
                          Quotation#
                        </span>
                        <span className="text-slate-900 font-semibold">
                          {formData.quotationNumber}
                        </span>
                      </div>
                      <div className="flex justify-between gap-8">
                        <span className="font-bold text-slate-700">Date:</span>
                        <span className="text-slate-900 font-semibold">
                          {formData.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Client ── */}
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
                        <span>📞</span>
                        <span>{formData.clientInfo.phone}</span>
                      </div>
                    )}
                    {formData.clientInfo.email && (
                      <div className="flex items-start gap-2">
                        <span>✉️</span>
                        <span>{formData.clientInfo.email}</span>
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
              <style>{`
                @media (max-width: 639px) {
                  .quot-table th.col-qty, .quot-table td.col-qty,
                  .quot-table th.col-price, .quot-table td.col-price { display: none !important; }
                  .quot-table td.col-total-mobile-hint .hint { display: block; }
                }
                @media (min-width: 640px) {
                  .quot-table td.col-total-mobile-hint .hint { display: none; }
                }
              `}</style>
              <div
                className="mb-4 sm:mb-6"
                style={{ overflowX: "auto", overflowY: "visible" }}
              >
                <table
                  className="quot-table w-full text-xs sm:text-sm border-collapse"
                  style={{ tableLayout: "fixed" }}
                >
                  <colgroup>
                    <col style={{ width: "5%" }} />
                    <col style={{ width: "45%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "17%" }} />
                    <col style={{ width: "18%" }} />
                  </colgroup>
                  <thead>
                    <tr className="bg-slate-800 text-white">
                      <th className="text-left p-2 sm:p-3 font-bold text-[10px] sm:text-xs uppercase">
                        #
                      </th>
                      <th className="text-left p-2 sm:p-3 font-bold text-[10px] sm:text-xs uppercase">
                        DESCRIPTION
                      </th>
                      <th className="col-qty text-center p-2 sm:p-3 font-bold text-[10px] sm:text-xs uppercase whitespace-nowrap">
                        QTY
                      </th>
                      <th className="col-price text-right p-2 sm:p-3 font-bold text-[10px] sm:text-xs uppercase whitespace-nowrap">
                        PRICE
                      </th>
                      <th className="text-right p-2 sm:p-3 font-bold text-[10px] sm:text-xs uppercase whitespace-nowrap">
                        TOTAL
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => {
                      if (!item.hasOptions || item.options.length === 0) {
                        return (
                          <tr
                            key={index}
                            className="border-b border-slate-200 hover:bg-slate-50"
                          >
                            <td className="p-2 sm:p-3 font-medium text-slate-700 text-[10px] sm:text-xs align-middle">
                              {index + 1}
                            </td>
                            <td className="p-2 sm:p-3 align-middle">
                              <div className="flex items-start gap-3">
                                {item.imagePreview ? (
                                  <img
                                    src={item.imagePreview}
                                    alt="product"
                                    crossOrigin="anonymous"
                                    className="w-12 h-12 object-cover rounded-md border border-slate-200 flex-shrink-0"
                                  />
                                ) : (
                                  <div className="hidden sm:flex w-12 h-12 flex-shrink-0 bg-slate-100 rounded-md border border-slate-200 items-center justify-center">
                                    <Image className="w-4 h-4 text-slate-300" />
                                  </div>
                                )}
                                <p className="font-medium text-slate-900 text-xs sm:text-sm leading-relaxed">
                                  {item.description || "Item description"}
                                </p>
                              </div>
                            </td>
                            <td className="col-qty p-2 sm:p-3 text-center font-semibold text-slate-800 text-xs sm:text-sm align-middle whitespace-nowrap">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="col-price p-2 sm:p-3 text-right text-slate-800 text-xs sm:text-sm align-middle whitespace-nowrap">
                              Ksh{" "}
                              {item.price.toLocaleString("en-KE", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="col-total-mobile-hint p-2 sm:p-3 text-right align-middle whitespace-nowrap">
                              <span className="hint text-[10px] text-slate-400 font-normal mb-0.5 block">
                                {item.quantity} {item.unit} × Ksh{" "}
                                {item.price.toLocaleString("en-KE", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                              <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                                Ksh{" "}
                                {item.total.toLocaleString("en-KE", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <React.Fragment key={index}>
                          <tr className="bg-slate-100 border-t-2 border-slate-300">
                            <td className="p-2 sm:p-3 font-medium text-slate-600 text-[10px] sm:text-xs align-middle">
                              {index + 1}
                            </td>
                            <td colSpan={4} className="p-2 sm:p-3 align-middle">
                              <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                                  {item.description || "Item"}
                                </span>
                                <div className="flex-1 h-px bg-slate-300" />
                                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                  {item.options.length} options — select one
                                </span>
                              </div>
                            </td>
                          </tr>
                          {item.options.map((opt, optIdx) => (
                            <tr
                              key={optIdx}
                              className={`border-b border-slate-100 ${
                                optIdx === item.options.length - 1
                                  ? "border-b-2 border-slate-200"
                                  : ""
                              }`}
                              style={{
                                backgroundColor:
                                  optIdx % 2 === 0 ? "#f5f3ff" : "#ffffff",
                              }}
                            >
                              <td className="p-2 sm:p-3 align-middle">
                                <div className="w-6 h-6 rounded bg-violet-700 flex items-center justify-center mx-auto">
                                  <span className="text-white font-black text-[10px] uppercase leading-none">
                                    {OPTION_LETTERS[optIdx] || optIdx + 1}
                                  </span>
                                </div>
                              </td>
                              <td className="p-2 sm:p-3 align-middle">
                                <div className="flex items-center gap-2">
                                  {opt.imagePreview && (
                                    <img
                                      src={opt.imagePreview}
                                      alt={opt.label || `option ${optIdx + 1}`}
                                      crossOrigin="anonymous"
                                      className="flex-shrink-0 object-contain rounded border border-violet-100 bg-white"
                                      style={{ width: "44px", height: "44px" }}
                                    />
                                  )}
                                  <div className="min-w-0">
                                    {opt.label && (
                                      <p className="text-[10px] font-extrabold text-violet-700 uppercase tracking-wide leading-none mb-0.5">
                                        {opt.label}
                                      </p>
                                    )}
                                    <p className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">
                                      {opt.description ||
                                        `${item.description || "Item"} — ${
                                          opt.label ||
                                          `Option ${
                                            OPTION_LETTERS[optIdx] || optIdx + 1
                                          }`
                                        }`}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="col-qty p-2 sm:p-3 text-center font-semibold text-slate-800 text-xs sm:text-sm align-middle whitespace-nowrap">
                                {opt.quantity} {opt.unit}
                              </td>
                              <td className="col-price p-2 sm:p-3 text-right text-slate-800 text-xs sm:text-sm align-middle whitespace-nowrap">
                                Ksh{" "}
                                {Number(opt.price).toLocaleString("en-KE", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                              <td className="col-total-mobile-hint p-2 sm:p-3 text-right align-middle whitespace-nowrap">
                                <span className="hint text-[10px] text-slate-400 font-normal mb-0.5 block">
                                  {opt.quantity} {opt.unit} × Ksh{" "}
                                  {Number(opt.price).toLocaleString("en-KE", {
                                    minimumFractionDigits: 2,
                                  })}
                                </span>
                                <span className="font-semibold text-violet-700 text-xs sm:text-sm">
                                  Ksh{" "}
                                  {(opt.total || 0).toLocaleString("en-KE", {
                                    minimumFractionDigits: 2,
                                  })}
                                </span>
                              </td>
                            </tr>
                          ))}
                          <tr>
                            <td colSpan={5} className="px-3 pb-2 pt-0.5">
                              <p className="text-[10px] text-slate-400 italic">
                                * Please select one of the options above
                              </p>
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Items subtotal */}
              {formData.additionalCharges.length > 0 && (
                <div className="flex justify-end mb-3">
                  <div className="flex items-center gap-8 text-sm text-slate-600">
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

              {/* Additional Charges Table */}
              {formData.additionalCharges.length > 0 && (
                <div
                  className="mb-6 sm:mb-8"
                  style={{ overflowX: "auto", overflowY: "visible" }}
                >
                  <table
                    className="w-full text-xs sm:text-sm border-collapse"
                    style={{ tableLayout: "fixed" }}
                  >
                    <colgroup>
                      <col style={{ width: "5%" }} />
                      <col style={{ width: "33%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "21%" }} />
                      <col style={{ width: "21%" }} />
                    </colgroup>
                    <thead>
                      <tr className="bg-amber-700 text-white border-b-2 border-amber-900">
                        <th className="text-left p-2 sm:p-3 font-bold text-[10px] sm:text-xs uppercase">
                          #
                        </th>
                        <th
                          className="text-left p-2 sm:p-3 font-bold text-[10px] sm:text-xs uppercase"
                          colSpan={2}
                        >
                          ADDITIONAL CHARGES
                        </th>
                        <th className="text-center p-2 sm:p-3 font-bold text-[10px] sm:text-xs uppercase">
                          QTY
                        </th>
                        <th className="text-right p-2 sm:p-3 font-bold text-[10px] sm:text-xs uppercase">
                          RATE
                        </th>
                        <th className="text-right p-2 sm:p-3 font-bold text-[10px] sm:text-xs uppercase">
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
                          <td className="p-2 sm:p-3 font-medium text-slate-700 text-[10px] sm:text-xs align-middle">
                            {index + 1}
                          </td>
                          <td className="p-2 sm:p-3 align-middle" colSpan={2}>
                            <p className="font-semibold text-amber-800 text-[10px] sm:text-xs uppercase tracking-wide mb-0.5">
                              {charge.category}
                            </p>
                            <p className="font-medium text-slate-900 text-xs sm:text-sm leading-relaxed">
                              {charge.description ||
                                `${charge.category} charges`}
                            </p>
                          </td>
                          <td className="p-2 sm:p-3 text-center font-semibold text-slate-800 text-xs sm:text-sm align-middle whitespace-nowrap">
                            {charge.quantity}
                          </td>
                          <td className="p-2 sm:p-3 text-right text-slate-800 text-xs sm:text-sm align-middle whitespace-nowrap">
                            Ksh{" "}
                            {Number(charge.price).toLocaleString("en-KE", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="p-2 sm:p-3 text-right font-semibold text-slate-900 text-xs sm:text-sm align-middle whitespace-nowrap">
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
              )}

              {/* Grand Total */}
              <div className="flex justify-end mb-6 sm:mb-8">
                <div className="bg-slate-100 px-6 sm:px-8 py-3 sm:py-4 rounded-lg border-2 border-slate-300 w-full sm:w-auto space-y-2">
                  {formData.additionalCharges.length > 0 && (
                    <>
                      <div className="flex items-center justify-between gap-8 text-sm text-slate-600">
                        <span className="font-semibold">Items Subtotal:</span>
                        <span className="font-bold text-slate-800">
                          Ksh{" "}
                          {getSubtotal().toLocaleString("en-KE", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-8 text-sm text-amber-700">
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
                  <div className="flex items-center justify-between gap-8">
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
                    <span className="font-bold">•</span> 2. Pricing &amp; Taxes:
                    All prices are exclusive of applicable taxes unless stated
                    otherwise. The buyer is responsible for any taxes, duties,
                    or additional charges.
                  </p>
                  <p>
                    <span className="font-bold">•</span> 3. Returns &amp;
                    Claims: Claims for defective or incorrect items must be
                    reported within 48 hours of receipt. Returns are subject to
                    approval as per our return policy.
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
