import React, { useState, useRef } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Download,
  Save,
  Mail,
  Phone,
  MapPin,
  User,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { format } from "date-fns";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function App() {
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
    items: [{ description: "", quantity: 1, price: 0, total: 0 }],
  };

  const [formData, setFormData] = useState(initialFormState);

  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const quotationRef = useRef(null);

  const calculateTotal = (quantity, price) => {
    return quantity * price;
  };

  const getSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + item.total, 0);
  };

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

    if (field === "quantity" || field === "price") {
      newItems[index].total = calculateTotal(
        Number(newItems[index].quantity),
        Number(newItems[index].price)
      );
    }

    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { description: "", quantity: 1, price: 0, total: 0 },
      ],
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const handleClientChange = (field, value) => {
    setFormData({
      ...formData,
      clientInfo: { ...formData.clientInfo, [field]: value },
    });
  };

  const resetForm = () => {
    setFormData({
      ...initialFormState,
      quotationNumber: `Quote-${Math.floor(Math.random() * 10000)}`,
      date: format(new Date(), "dd/MM/yyyy"),
    });
  };

  const saveQuotation = async () => {
    try {
      // Validate that client name is provided
      if (!formData.clientInfo.name.trim()) {
        showNotification("Please enter client name", "error");
        return;
      }

      // Validate that at least one item has a description
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
          grandTotal: getSubtotal(),
          createdAt: new Date(),
        },
        {
          timeout: 5000,
        }
      );

      showNotification("Quotation saved successfully to database!");

      // Reset form after successful save
      setTimeout(() => {
        resetForm();
      }, 1000);
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

  const downloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      showNotification("Generating PDF...", "info");

      // Small delay to allow UI to update
      await new Promise((resolve) => setTimeout(resolve, 100));

      const element = quotationRef.current;

      // Force desktop-like width for capture
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        windowWidth: 1200, // 👈 important: simulate desktop width
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;

      // Scale image to fit ONE page
      const imgRatio = canvas.width / canvas.height;
      const pageRatio = pageWidth / pageHeight;

      let imgWidth, imgHeight;

      if (imgRatio > pageRatio) {
        // Image is wider — fit to width
        imgWidth = pageWidth;
        imgHeight = pageWidth / imgRatio;
      } else {
        // Image is taller — fit to height
        imgHeight = pageHeight;
        imgWidth = pageHeight * imgRatio;
      }

      // Center image on page
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;

      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

      pdf.save(`Quotation-${formData.quotationNumber}.pdf`);
      showNotification("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      showNotification("Failed to generate PDF. Please try again.", "error");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
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

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6 animate-slide-up">
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
        </div>

        <div className="lg:col-span-2 animate-scale-in">
          <div className="card sticky top-8">
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
              className="bg-white p-6 md:p-10 rounded-xl border-2 border-slate-200 shadow-inner"
              style={{
                width: "100%",
                maxWidth: "794px",
                minHeight: "1123px",
                margin: "0 auto",
              }}
            >
              {/* Header Section - RESPONSIVE: Stacks on mobile */}
              <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b-2 border-slate-300">
                {/* Mobile Layout (< 640px) - Stacked */}
                <div className="sm:hidden space-y-4">
                  {/* Logo and Company Name - Mobile */}
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

                  {/* Quotation Badge - Mobile */}
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

                  {/* Quotation Details - Mobile */}
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

                  {/* Company Contact - Mobile */}
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                      <span className="leading-none">
                        {formData.companyInfo.address}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                      <span className="leading-none">
                        {formData.companyInfo.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                      <span className="leading-none break-all">
                        {formData.companyInfo.email}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-400 mt-1 ml-5">
                      {formData.companyInfo.pvt}
                    </p>
                  </div>
                </div>

                {/* Desktop Layout (>= 640px) - Side by side */}
                <div className="hidden sm:flex justify-between items-start gap-6">
                  {/* Left side - Logo and Company Info */}
                  <div className="flex items-start gap-4">
                    {/* Company Logo */}
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

                    {/* Company Details */}
                    <div className="flex-1">
                      <h1 className="text-lg font-bold text-slate-900 mb-1 leading-tight">
                        {formData.companyInfo.name}
                      </h1>
                      <p className="text-sm text-slate-600 mb-3">Wimwa Tech</p>
                      <div className="space-y-1.5 text-sm text-slate-700">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 flex-shrink-0 text-slate-500" />
                          <span className="leading-none">
                            {formData.companyInfo.address}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 flex-shrink-0 text-slate-500" />
                          <span className="leading-none">
                            {formData.companyInfo.phone}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 flex-shrink-0 text-slate-500" />
                          <span className="leading-none">
                            {formData.companyInfo.email}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs font-mono text-slate-500 mt-2 ml-6">
                        {formData.companyInfo.pvt}
                      </p>
                    </div>
                  </div>

                  {/* Right side - Quotation Badge */}
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
                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed mb-2">
                      {formData.clientInfo.address}
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-3 text-xs sm:text-sm text-slate-700">
                    {formData.clientInfo.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                        <span className="leading-none">
                          {formData.clientInfo.phone}
                        </span>
                      </div>
                    )}
                    {formData.clientInfo.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                        <span className="leading-none break-all">
                          {formData.clientInfo.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Greeting */}
              <p className="text-xs sm:text-sm text-slate-800 mb-1 sm:mb-2 font-medium">
                Dear Sir/Mam,
              </p>

              <p className="text-xs sm:text-sm text-slate-700 mb-4 sm:mb-6">
                Thank you for your valuable inquiry. We are pleased to quote as
                below:
              </p>

              {/* Items Table */}
              <div className="overflow-x-auto mb-6 sm:mb-8 -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden">
                    <table className="min-w-full text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-800 text-white border-b-2 border-slate-900">
                          <th className="text-left p-2 sm:p-3 font-bold text-[10px] sm:text-xs uppercase whitespace-nowrap">
                            #
                          </th>
                          <th className="text-left p-2 sm:p-3 font-bold text-[10px] sm:text-xs uppercase min-w-[120px] sm:min-w-0">
                            DESCRIPTION
                          </th>
                          <th className="text-center p-2 sm:p-3 font-bold text-[10px] sm:text-xs uppercase whitespace-nowrap">
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
                            <td className="p-2 sm:p-3 text-center text-slate-800 text-xs sm:text-sm whitespace-nowrap">
                              {item.quantity}
                              <br />
                              <span className="text-slate-500 text-[10px] sm:text-xs">
                                pcs
                              </span>
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
              </div>

              {/* Total Section */}
              <div className="flex justify-end mb-6 sm:mb-8">
                <div className="bg-slate-100 px-4 sm:px-8 py-3 sm:py-4 rounded-lg border-2 border-slate-300 w-full sm:w-auto">
                  <div className="flex items-center justify-between sm:gap-6">
                    <span className="text-sm sm:text-base font-bold text-slate-800">
                      Grand Total:
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-slate-900">
                      Ksh{" "}
                      {getSubtotal().toLocaleString("en-KE", {
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

              {/* Signature Section */}
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

export default App;
