import React from "react";
import { Database, ShieldCheck, FileText, Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: <FileText className="w-5 h-5 text-indigo-600" />,
      title: "Information We Collect",
      text: "We collect quotation details such as client names, requested items, prices, totals, and contact details that are entered into the system when generating quotations and delivery notes.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-indigo-600" />,
      title: "How We Use Information",
      text: "The collected information is used solely to generate, store, and retrieve quotations and delivery notes within the Wimwa Tech system.",
    },
    {
      icon: <Database className="w-5 h-5 text-indigo-600" />,
      title: "Data Storage",
      text: "All saved quotations are securely stored in our MongoDB database and are not shared with third parties without authorization.",
    },
    {
      icon: <Mail className="w-5 h-5 text-indigo-600" />,
      title: "Contact",
      text: "For any privacy-related questions or concerns, please contact us at: wimwatech@gmail.com",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-20">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">
            Privacy Policy
          </h1>

          <p className="text-slate-600 text-lg">
            This Privacy Policy explains how{" "}
            <span className="font-semibold text-slate-800">
              Wimwa Tech General Supplies Limited
            </span>{" "}
            collects, uses, and protects your information when using the
            Quotation Maker and Delivery Note Generator.
          </p>

          <p className="text-sm text-slate-400 mt-2">
            Last updated: March 2026
          </p>
        </div>

        {/* Policy Sections */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y">
          {sections.map((section, index) => (
            <div key={index} className="p-8 flex gap-4">
              <div className="mt-1">{section.icon}</div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">
                  {index + 1}. {section.title}
                </h2>

                <p className="text-slate-600 leading-relaxed">{section.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-10 text-sm text-slate-500">
          Your privacy and data security are important to us.
        </div>
      </div>
    </div>
  );
}
