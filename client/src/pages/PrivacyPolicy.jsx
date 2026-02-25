import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-20">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-10">
        <h1 className="text-3xl font-black text-slate-900 mb-6">
          Privacy Policy
        </h1>

        <p className="text-slate-600 mb-6">
          This Privacy Policy explains how Wimwa Tech General Supplies Limited
          collects, uses, and protects your information when using the Quotation
          Maker and Delivery Note Generator.
        </p>

        <h2 className="font-bold text-slate-900 mt-8 mb-3">
          1. Information We Collect
        </h2>
        <p className="text-slate-600 mb-4">
          We collect quotation details such as client name, items, prices,
          totals, and contact details entered into the system.
        </p>

        <h2 className="font-bold text-slate-900 mt-8 mb-3">
          2. How We Use Information
        </h2>
        <p className="text-slate-600 mb-4">
          The data is used solely to generate, store, and retrieve quotations
          and delivery notes within the system.
        </p>

        <h2 className="font-bold text-slate-900 mt-8 mb-3">3. Data Storage</h2>
        <p className="text-slate-600 mb-4">
          Quotations saved are stored securely in our MongoDB database and are
          not shared with third parties.
        </p>

        <h2 className="font-bold text-slate-900 mt-8 mb-3">4. Contact</h2>
        <p className="text-slate-600">
          For privacy-related inquiries, contact:
          <br />
          wimwatech@gmail.com
        </p>
      </div>
    </div>
  );
}
