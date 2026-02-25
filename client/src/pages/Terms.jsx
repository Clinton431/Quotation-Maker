import React from "react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-20">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-10">
        <h1 className="text-3xl font-black text-slate-900 mb-6">
          Terms of Service
        </h1>

        <p className="text-slate-600 mb-6">
          By using the Wimwa Tech Quotation Maker and Delivery Note Generator,
          you agree to the following terms:
        </p>

        <h2 className="font-bold text-slate-900 mt-8 mb-3">
          1. Use of the Tool
        </h2>
        <p className="text-slate-600 mb-4">
          This tool is provided to simplify document creation for internal and
          business use.
        </p>

        <h2 className="font-bold text-slate-900 mt-8 mb-3">2. Accuracy</h2>
        <p className="text-slate-600 mb-4">
          Users are responsible for verifying all quotation details before
          sending documents to clients.
        </p>

        <h2 className="font-bold text-slate-900 mt-8 mb-3">
          3. Limitation of Liability
        </h2>
        <p className="text-slate-600 mb-4">
          Wimwa Tech General Supplies Limited is not liable for errors entered
          by users into the system.
        </p>

        <h2 className="font-bold text-slate-900 mt-8 mb-3">
          4. Changes to Terms
        </h2>
        <p className="text-slate-600">
          We may update these terms at any time without prior notice.
        </p>
      </div>
    </div>
  );
}
