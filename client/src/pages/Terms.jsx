import React from "react";
import {
  FileText,
  ShieldCheck,
  AlertCircle,
  RefreshCcw,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Terms() {
  const sections = [
    {
      icon: <FileText className="w-5 h-5 text-indigo-600" />,
      title: "Use of the Tool",
      text: "This application is provided to simplify the identification of required items, quotation generation, purchasing, and delivery of requested goods to clients efficiently and without complications.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-indigo-600" />,
      title: "Accuracy of Information",
      text: "Users are responsible for reviewing and verifying all quotation and delivery note details before sending documents to clients.",
    },
    {
      icon: <AlertCircle className="w-5 h-5 text-indigo-600" />,
      title: "Limitation of Liability",
      text: "Wimwa Tech General Supplies Limited shall not be held responsible for incorrect data entered by users or any resulting business losses.",
    },
    {
      icon: <RefreshCcw className="w-5 h-5 text-indigo-600" />,
      title: "Changes to Terms",
      text: "We reserve the right to update or modify these terms at any time. Continued use of the system indicates acceptance of the updated terms.",
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
            Terms of Service
          </h1>

          <p className="text-slate-600 text-lg">
            By using the{" "}
            <span className="font-semibold text-slate-800">
              Wimwa Tech Quotation Maker & Delivery Note Generator
            </span>
            , you agree to the following terms and conditions.
          </p>

          <p className="text-sm text-slate-400 mt-2">
            Last updated: March 2026
          </p>
        </div>

        {/* Terms Container */}
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
          If you have questions about these terms, please contact Wimwa Tech
          General Supplies Limited.
        </div>

        <div className="text-center mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
