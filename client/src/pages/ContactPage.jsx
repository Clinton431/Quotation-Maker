import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function ContactPage() {
  const [copied, setCopied] = useState(null);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const contactItems = [
    {
      key: "address",
      icon: "📍",
      label: "Address",
      value: "P.O Box 273-00206, Kiserian, Kajiado County",
      action: null,
    },
    {
      key: "phone",
      icon: "📞",
      label: "Phone",
      value: "+254 712 953 780",
      action: "tel:+254712953780",
      copyValue: "+254712953780",
    },
    {
      key: "email",
      icon: "✉️",
      label: "Email",
      value: "wimwatech@gmail.com",
      action: "mailto:wimwatech@gmail.com",
      copyValue: "wimwatech@gmail.com",
    },
    {
      key: "hours",
      icon: "🕐",
      label: "Business Hours",
      value: "Monday – Saturday: 8:00 AM – 6:00 PM",
      action: null,
    },
    {
      key: "pvt",
      icon: "🏢",
      label: "Registration No.",
      value: "PVT-Y2U9QXGP",
      action: null,
    },
  ];

  const channels = [
    {
      icon: "💬",
      label: "WhatsApp",
      desc: "Chat with us directly",
      href: "https://wa.me/254712953780",
      color: "from-green-400 to-green-600",
      shadow: "rgba(22,163,74,0.35)",
    },
    {
      icon: "📞",
      label: "Call Us",
      desc: "Speak to our team",
      href: "tel:+254712953780",
      color: "from-blue-400 to-blue-600",
      shadow: "rgba(37,99,235,0.35)",
    },
    {
      icon: "✉️",
      label: "Email Us",
      desc: "Send us a message",
      href: "mailto:wimwatech@gmail.com",
      color: "from-orange-400 to-orange-600",
      shadow: "rgba(249,115,22,0.35)",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-[0_4px_12px_rgba(249,115,22,0.3)]">
              <span className="text-white font-black text-sm">W</span>
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-sm leading-tight">
                Wimwa Tech
              </p>
              <p className="text-[10px] text-slate-400 leading-tight">
                General Supplies
              </p>
            </div>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors no-underline"
          >
            <svg
              width="16"
              height="16"
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
          </Link>
        </div>
      </nav>

      {/* ── Hero band ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0f172a 100%)",
          borderBottom: "1px solid rgba(249,115,22,0.2)",
        }}
      >
        {/* dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(rgba(249,115,22,.25) 1px,transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* glow */}
        <div
          className="absolute -top-20 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle,rgba(249,115,22,.12) 0%,transparent 65%)",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-6 py-14 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border border-orange-500/25 bg-orange-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-orange-400 tracking-widest uppercase">
              We're here to help
            </span>
          </div>
          <h1
            className="text-4xl sm:text-5xl font-black text-white mb-4"
            style={{ letterSpacing: "-0.03em" }}
          >
            Get in Touch
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            Have a question or need a quotation? Reach out — we respond quickly.
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Quick-action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {channels.map((ch) => (
            <a
              key={ch.label}
              href={ch.href}
              target={ch.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="group flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-200 no-underline"
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${ch.color} flex items-center justify-center text-2xl shadow-lg transition-transform duration-200 group-hover:scale-110`}
                style={{ boxShadow: `0 6px 20px ${ch.shadow}` }}
              >
                {ch.icon}
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-900 text-sm">{ch.label}</p>
                <p className="text-slate-400 text-xs mt-0.5">{ch.desc}</p>
              </div>
              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest group-hover:underline">
                Open →
              </span>
            </a>
          ))}
        </div>

        {/* Contact details card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden mb-10">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-xl">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f97316"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Contact Details
              </h2>
              <p className="text-xs text-slate-400">
                Wimwa Tech General Supplies Limited
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            {contactItems.map((item) => (
              <div
                key={item.key}
                className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors group"
              >
                <span className="text-xl mt-0.5 flex-shrink-0">
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                    {item.label}
                  </p>
                  {item.action ? (
                    <a
                      href={item.action}
                      className="text-sm font-semibold text-slate-800 hover:text-orange-500 transition-colors no-underline break-all"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                      {item.value}
                    </p>
                  )}
                </div>
                {item.copyValue && (
                  <button
                    onClick={() => copy(item.copyValue, item.key)}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-orange-500 px-2.5 py-1.5 rounded-lg hover:bg-orange-50"
                  >
                    {copied === item.key ? (
                      <>
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect
                            x="9"
                            y="9"
                            width="13"
                            height="13"
                            rx="2"
                            ry="2"
                          />
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Map placeholder / location note */}
        <div
          className="relative rounded-2xl overflow-hidden border border-slate-200"
          style={{
            height: "220px",
            background: "linear-gradient(135deg,#f1f5f9 0%,#e2e8f0 100%)",
          }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400">
            <span className="text-5xl">🗺️</span>
            <div className="text-center">
              <p className="font-bold text-slate-600 text-sm">
                Kiserian, Kajiado County
              </p>
              <p className="text-xs text-slate-400 mt-1">P.O Box 273-00206</p>
            </div>
            <a
              href="https://maps.google.com/?q=Kiserian,Kajiado,Kenya"
              target="_blank"
              rel="noreferrer"
              className="mt-1 text-xs font-bold text-orange-500 hover:text-orange-700 no-underline border border-orange-200 px-4 py-1.5 rounded-full bg-white hover:bg-orange-50 transition-colors"
            >
              Open in Google Maps →
            </a>
          </div>
        </div>
      </div>

      {/* ── Footer strip ── */}
      <div className="border-t border-slate-100 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} Wimwa Tech General Supplies Limited
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-600 font-medium">
              Available Mon–Sat, 8AM–6PM
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
