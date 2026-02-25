import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/* ───────────────── DATA ───────────────── */

const faqs = [
  {
    q: "What is a quotation?",
    a: "A quotation is a formal document a seller provides to a buyer, listing goods or services at a stated price under agreed conditions — before an invoice is issued.",
  },
  {
    q: "How does the Wimwa Tech Quotation Maker work?",
    a: "Fill in your client details, add line items with quantities and prices, preview the live document on the right, then download a print-ready PDF or save it to the database — all in under two minutes.",
  },
  {
    q: "Is it free to use?",
    a: "Yes. The Quotation Maker is a free internal tool built for Wimwa Tech General Supplies Limited to speed up client communication and order processing.",
  },
  {
    q: "Can I export my quotation as a PDF?",
    a: "Absolutely. Hit 'Download PDF' and a fully formatted A4 PDF is generated instantly, ready to share via email or WhatsApp.",
  },
  {
    q: "Are my quotations saved?",
    a: "Yes. Every saved quotation is stored in a MongoDB database so you can retrieve, reference, or reuse it at any time.",
  },
  {
    q: "Can I switch between pcs and kgs?",
    a: "Yes — each line item has a unit toggle so you can mix pieces and kilograms in the same quotation.",
  },
];

const features = [
  {
    icon: "⚡",
    title: "Instant Live Preview",
    desc: "Watch your quotation render in real-time as you type — no guessing what the final document will look like.",
    accent: "orange",
  },
  {
    icon: "📄",
    title: "One-Click PDF Export",
    desc: "Download a clean, branded A4 PDF the moment you're done. Share it over email or WhatsApp instantly.",
    accent: "blue",
  },
  {
    icon: "💾",
    title: "Cloud Database Storage",
    desc: "Every quotation is saved to MongoDB so your records are always accessible — no spreadsheets required.",
    accent: "emerald",
  },
  {
    icon: "⚖️",
    title: "Flexible Units",
    desc: "Toggle between pcs and kgs per line item. Mixed orders are handled cleanly in a single document.",
    accent: "violet",
  },
  {
    icon: "🧮",
    title: "Auto-Calculate Totals",
    desc: "Quantity × price is computed automatically for every item and rolled up into a grand total instantly.",
    accent: "rose",
  },
  {
    icon: "🛡️",
    title: "Branded Secure Template",
    desc: "Every quotation carries Wimwa Tech's logo, address, and contact details — professional by default.",
    accent: "sky",
  },
];

// Tailwind-safe static class maps — no dynamic class generation
const accentMap = {
  orange: {
    bar: "from-orange-400 to-orange-300",
    iconBg: "bg-orange-50",
    iconRing: "ring-orange-100",
    text: "text-orange-500",
    hoverBorder: "hover:border-orange-200",
    hoverShadow: "hover:shadow-orange-100/60",
  },
  blue: {
    bar: "from-blue-400 to-blue-300",
    iconBg: "bg-blue-50",
    iconRing: "ring-blue-100",
    text: "text-blue-500",
    hoverBorder: "hover:border-blue-200",
    hoverShadow: "hover:shadow-blue-100/60",
  },
  emerald: {
    bar: "from-emerald-400 to-emerald-300",
    iconBg: "bg-emerald-50",
    iconRing: "ring-emerald-100",
    text: "text-emerald-500",
    hoverBorder: "hover:border-emerald-200",
    hoverShadow: "hover:shadow-emerald-100/60",
  },
  violet: {
    bar: "from-violet-400 to-violet-300",
    iconBg: "bg-violet-50",
    iconRing: "ring-violet-100",
    text: "text-violet-500",
    hoverBorder: "hover:border-violet-200",
    hoverShadow: "hover:shadow-violet-100/60",
  },
  rose: {
    bar: "from-rose-400 to-rose-300",
    iconBg: "bg-rose-50",
    iconRing: "ring-rose-100",
    text: "text-rose-500",
    hoverBorder: "hover:border-rose-200",
    hoverShadow: "hover:shadow-rose-100/60",
  },
  sky: {
    bar: "from-sky-400 to-sky-300",
    iconBg: "bg-sky-50",
    iconRing: "ring-sky-100",
    text: "text-sky-500",
    hoverBorder: "hover:border-sky-200",
    hoverShadow: "hover:shadow-sky-100/60",
  },
};

const steps = [
  {
    num: "01",
    title: "Open the Quotation Maker",
    desc: "Click 'Create Quotation' from this page to go straight to the form.",
    icon: "🚀",
  },
  {
    num: "02",
    title: "Fill in client & item details",
    desc: "Add the client name, address, and as many line items as needed.",
    icon: "✏️",
  },
  {
    num: "03",
    title: "Preview in real time",
    desc: "The right panel updates live so you can see the final document before exporting.",
    icon: "👁️",
  },
  {
    num: "04",
    title: "Download or Save",
    desc: "Export a PDF instantly or save the quotation to the database for future reference.",
    icon: "✅",
  },
];

const testimonials = [
  {
    name: "James Kariuki",
    role: "Procurement Manager",
    text: "Before this tool I was spending 20 minutes per quotation in Excel. Now it takes me under 2 minutes and looks far more professional.",
    rating: 5,
    initials: "JK",
  },
  {
    name: "Amina Odhiambo",
    role: "Small Business Owner",
    text: "My clients are always impressed by how clean and fast I send quotations. The PDF looks like it came from a big company.",
    rating: 5,
    initials: "AO",
  },
  {
    name: "Peter Mwangi",
    role: "Contractor",
    text: "The pcs/kgs unit toggle is exactly what I needed. I deal in both and every other tool forced me to pick one.",
    rating: 5,
    initials: "PM",
  },
];

/* ───────────────── REUSABLE ───────────────── */

function SectionPill({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 text-[11px] font-bold tracking-widest uppercase px-3.5 py-1 rounded-full border border-orange-200 mb-4">
      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" />
      {children}
    </span>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-2xl border transition-colors duration-200 ${
        open ? "border-orange-200 bg-orange-50" : "border-slate-200 bg-white"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-5 flex justify-between items-center text-left gap-4"
      >
        <span className="font-semibold text-slate-800">{q}</span>
        <span
          className="text-orange-500 text-xl font-bold transition-transform duration-200 shrink-0"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0)" }}
        >
          +
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 text-slate-500 text-sm leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */

export default function HomePage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ════════════════════ NAV ════════════════════ */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-[0_1px_12px_rgba(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-[0_4px_12px_rgba(249,115,22,0.35)]">
              <span className="text-white font-extrabold text-sm">W</span>
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-sm leading-tight m-0">
                Wimwa Tech
              </p>
              <p className="text-[10px] text-slate-400 leading-tight m-0">
                General Supplies Limited
              </p>
            </div>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-9 text-sm font-medium">
            {[
              ["#features", "Features"],
              ["#how-it-works", "How It Works"],
              ["#testimonials", "Testimonials"],
              ["#faq", "FAQ"],
            ].map(([href, label]) => (
              <a
                key={label}
                href={href}
                className="text-slate-500 no-underline hover:text-orange-500 transition-colors"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => navigate("/delivery-note")}
              className="border-2 border-orange-400 text-orange-500 text-[13px] font-bold px-5 py-2.5 rounded-xl bg-transparent cursor-pointer transition-all duration-150 hover:bg-orange-50 hover:-translate-y-px"
            >
              Delivery Note
            </button>
            <button
              onClick={() => navigate("/quotation")}
              className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-[13px] font-bold px-5 py-2.5 rounded-xl border-none cursor-pointer shadow-[0_4px_14px_rgba(249,115,22,0.3)] transition-all duration-150 hover:opacity-90 hover:-translate-y-px"
            >
              Create Quotation →
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-orange-50 border-none cursor-pointer gap-1.5 transition-colors duration-150"
            aria-label="Toggle menu"
          >
            <span
              className={`block w-5 h-0.5 bg-slate-700 rounded-full transition-all duration-300 origin-center ${
                menuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-slate-700 rounded-full transition-all duration-300 ${
                menuOpen ? "opacity-0 scale-x-0" : ""
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-slate-700 rounded-full transition-all duration-300 origin-center ${
                menuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>

        {/* Mobile dropdown */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            menuOpen ? "max-h-96 border-t border-slate-100" : "max-h-0"
          }`}
        >
          <div className="px-6 py-4 flex flex-col gap-1 bg-white">
            {[
              ["#features", "Features"],
              ["#how-it-works", "How It Works"],
              ["#testimonials", "Testimonials"],
              ["#faq", "FAQ"],
            ].map(([href, label]) => (
              <a
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="text-slate-600 font-medium text-[15px] no-underline px-4 py-3 rounded-xl hover:bg-orange-50 hover:text-orange-500 transition-colors duration-150"
              >
                {label}
              </a>
            ))}
            <div className="pt-2 pb-1 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/delivery-note");
                }}
                className="w-full border-2 border-orange-400 text-orange-500 font-bold text-sm py-3 rounded-xl bg-transparent cursor-pointer transition-all duration-150 hover:bg-orange-50"
              >
                Delivery Note
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/quotation");
                }}
                className="w-full bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold text-sm py-3 rounded-xl border-none cursor-pointer shadow-[0_4px_14px_rgba(249,115,22,0.3)] transition-all duration-150 hover:opacity-90"
              >
                Create Quotation →
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ════════════════════ HERO ════════════════════ */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#f97316 1px,transparent 1px),linear-gradient(90deg,#f97316 1px,transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Glow blobs */}
        <div
          className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle,rgba(249,115,22,0.18) 0%,transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-10 -left-24 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle,rgba(249,115,22,0.10) 0%,transparent 70%)",
          }}
        />

        <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-8 lg:gap-7">
          {/* LEFT: copy */}
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[11px] font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
              Wimwa Tech General Supplies Limited
            </span>

            <h1 className="text-[3.2rem] max-sm:text-[2.2rem] font-black text-white leading-[1.05] -tracking-[0.02em] mb-5">
              Create Professional
              <br />
              <span className="text-orange-400">Quotations</span>
            </h1>

            <p className="text-slate-400 text-base leading-relaxed mb-9 max-w-[460px]">
              Fill in client details, add items, preview live, and download a
              polished PDF — all in your browser.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={() => navigate("/quotation")}
                className="bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold px-7 py-3.5 rounded-2xl border-none cursor-pointer shadow-[0_10px_40px_rgba(249,115,22,0.45)] hover:-translate-y-0.5 transition-all duration-150"
              >
                Create a quotation now →
              </button>
              <a
                href="#how-it-works"
                className="flex items-center justify-center border border-white/20 text-slate-300 px-7 py-3.5 rounded-2xl no-underline hover:text-orange-400 hover:border-orange-400 transition-colors duration-150"
              >
                Preview how it works
              </a>
            </div>

            {/* Trust chips */}
            <div className="flex flex-wrap gap-2">
              {[
                "✓ Free to use",
                "✓ No sign-up",
                "✓ Instant PDF",
                "✓ Cloud saved",
              ].map((t) => (
                <span
                  key={t}
                  className="text-slate-500 text-xs font-medium bg-white/[0.05] border border-white/10 px-3 py-1 rounded-full"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT: preview card */}
          <div className="hidden lg:flex flex-1 min-w-0 items-end justify-center">
            <div className="relative w-full max-w-[400px]">
              <div className="absolute -inset-2 bg-gradient-to-br from-orange-400/20 via-transparent to-orange-600/20 blur-2xl rounded-3xl" />
              <div className="relative rounded-3xl bg-white/80 backdrop-blur-xl border border-white/30 shadow-[0_30px_80px_rgba(0,0,0,0.45)] overflow-hidden transition-all duration-500 hover:scale-[1.015]">
                {/* App header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-gradient-to-r from-white to-orange-50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-extrabold text-xs shadow-[0_6px_16px_rgba(249,115,22,0.45)]">
                      W
                    </div>
                    <span className="font-semibold text-slate-700 text-sm">
                      Quotation Preview
                    </span>
                  </div>
                  <span className="relative text-[11px] font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
                    <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                    Live
                  </span>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="h-2.5 w-28 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse mb-1.5" />
                      <div className="h-1.5 w-20 bg-slate-100 rounded-full" />
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-black tracking-[3px] text-slate-800 mb-1">
                        QUOTATION
                      </div>
                      <div className="h-1.5 w-16 bg-slate-100 rounded-full ml-auto mb-1" />
                      <div className="h-1.5 w-12 bg-slate-100 rounded-full ml-auto" />
                    </div>
                  </div>

                  <div className="bg-slate-50/80 backdrop-blur rounded-2xl p-3 border border-slate-100">
                    <div className="h-2 w-14 bg-slate-300 rounded-full mb-2" />
                    <div className="h-1.5 w-32 bg-slate-200 rounded-full mb-1.5" />
                    <div className="h-1.5 w-24 bg-slate-200 rounded-full" />
                  </div>

                  <div className="rounded-2xl overflow-hidden border border-slate-200">
                    <div className="grid grid-cols-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white text-[10px] font-semibold px-3 py-2.5 gap-2">
                      <div>Description</div>
                      <div>Qty</div>
                      <div>Unit</div>
                      <div className="text-right">Total</div>
                    </div>
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`grid grid-cols-4 px-3 py-2.5 gap-2 transition-colors hover:bg-orange-50 ${
                          i % 2 === 0 ? "bg-slate-50" : "bg-white"
                        }`}
                      >
                        <div className="h-1.5 bg-slate-200 rounded-full" />
                        <div className="h-1.5 bg-slate-100 rounded-full" />
                        <div className="h-1.5 bg-slate-100 rounded-full" />
                        <div className="h-1.5 bg-orange-200 rounded-full ml-auto w-3/4" />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <div className="bg-gradient-to-br from-orange-100 to-orange-200 border border-orange-300 rounded-2xl px-5 py-3 flex items-center gap-6 shadow-[0_10px_30px_rgba(249,115,22,0.35)]">
                      <span className="text-[10px] font-bold text-orange-900 tracking-wide">
                        GRAND TOTAL
                      </span>
                      <span className="font-black text-orange-700 text-xl">
                        Ksh 12,500
                      </span>
                    </div>
                  </div>
                </div>

                <div className="absolute top-4 right-6 bg-slate-900 text-white text-[10px] font-semibold px-3 py-1 rounded-full">
                  Auto totals
                </div>
                <div className="absolute bottom-4 left-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[10px] font-semibold px-3 py-1 rounded-full shadow-[0_6px_16px_rgba(249,115,22,0.45)]">
                  PDF ready ✓
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════ STATS ════════════════════ */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-9 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { val: "2 min", label: "Avg. time to create a quote" },
            { val: "PDF", label: "Instant export, print-ready" },
            { val: "100%", label: "Free — no subscription" },
            { val: "∞", label: "Quotations saved to cloud" },
          ].map((s) => (
            <div key={s.label} className="py-3">
              <p className="text-[2rem] font-black text-orange-500 m-0 mb-1.5 leading-none">
                {s.val}
              </p>
              <p className="text-slate-500 text-[13px] m-0">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════ FEATURES ════════════════════ */}
      <section
        id="features"
        className="relative py-28 px-6 max-w-6xl mx-auto overflow-hidden"
      >
        {/* Background glows */}
        <div className="absolute -top-24 left-1/3 w-[500px] h-[500px] bg-orange-400/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-400/5 blur-3xl rounded-full pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 text-center mb-16">
          <SectionPill>Features</SectionPill>
          <h2 className="text-4xl sm:text-[2.75rem] font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            Everything you need to{" "}
            <span className="text-orange-500">quote faster</span>
          </h2>
          <p className="text-slate-500 max-w-md mx-auto leading-relaxed text-base">
            Built specifically for Wimwa Tech's workflow — fast, clean, and
            reliable.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const a = accentMap[f.accent];
            return (
              <div
                key={f.title}
                className={`
                  group relative flex flex-col rounded-2xl p-7 bg-white overflow-hidden
                  border border-slate-100 ${a.hoverBorder}
                  shadow-sm hover:shadow-lg ${a.hoverShadow}
                  transition-all duration-300 ease-out hover:-translate-y-1.5
                  animate-[fadeUp_0.5s_ease_both]
                `}
                style={{ animationDelay: `${i * 75}ms` }}
              >
                {/* Top accent bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${a.bar} opacity-40 group-hover:opacity-100 transition-opacity duration-300`}
                />

                {/* Index number */}
                <span className="absolute top-5 right-5 text-[11px] font-bold tracking-widest text-slate-200 select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Icon */}
                <div
                  className={`
                    w-[52px] h-[52px] rounded-xl ${a.iconBg} ring-1 ${a.iconRing}
                    flex items-center justify-center text-[26px] mb-5
                    transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3
                  `}
                >
                  {f.icon}
                </div>

                {/* Text */}
                <h3 className="font-bold text-slate-900 text-[15px] tracking-tight leading-snug mb-2.5">
                  {f.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed flex-1">
                  {f.desc}
                </p>

                {/* Learn more — slides in on hover */}
                <div
                  className={`
                    flex items-center gap-1.5 mt-5 pt-4 border-t border-slate-100
                    ${a.text} text-[13px] font-semibold
                    opacity-0 -translate-x-2
                    group-hover:opacity-100 group-hover:translate-x-0
                    transition-all duration-200
                  `}
                >
                  Learn more
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </section>

      {/* ════════════════════ HOW IT WORKS ════════════════════ */}
      <section
        id="how-it-works"
        className="bg-white border-y border-slate-200 py-[90px] px-6"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <SectionPill>Process</SectionPill>
            <h2 className="text-[2.5rem] font-black text-slate-900 m-0 mb-3 -tracking-[0.02em]">
              How it works
            </h2>
            <p className="text-slate-500 text-lg">
              Four simple steps from blank page to finished quotation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div
                key={s.num}
                className="bg-gradient-to-tr from-white/80 to-slate-50/80 border border-slate-200 rounded-[20px] px-6 py-8 text-center cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white font-extrabold text-lg flex items-center justify-center mx-auto mb-5 shadow-[0_8px_24px_rgba(249,115,22,0.25)]">
                  {s.num}
                </div>
                <div className="text-[28px] mb-3 hover:scale-125 transition-transform duration-300">
                  {s.icon}
                </div>
                <h3 className="font-extrabold text-slate-900 text-base m-0 mb-2">
                  {s.title}
                </h3>
                <p className="text-slate-500 text-[14px] leading-relaxed m-0">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate("/quotation")}
              className="bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold text-[15px] px-10 py-4 rounded-xl border-none cursor-pointer shadow-[0_6px_24px_rgba(249,115,22,0.3)] transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              Try it now — it's free →
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════ ABOUT ════════════════════ */}
      <section className="py-[110px] px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-stretch">
          {/* LEFT CARD */}
          <div className="relative rounded-3xl p-10 bg-slate-900 border border-white/10 overflow-hidden shadow-[0_25px_80px_rgba(15,23,42,0.45)] h-full flex flex-col justify-between">
            <div>
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
              <span className="inline-block bg-white/5 text-orange-400 text-[10px] font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full border border-orange-400/20 mb-6">
                About the Tool
              </span>
              <h2 className="text-[1.9rem] font-extrabold text-white mb-5 leading-tight">
                Simplify your billing with the Wimwa Tech Quotation Maker
              </h2>
              <p className="text-slate-400 text-sm leading-[1.8] mb-8 max-w-lg">
                Wimwa Tech General Supplies Limited built this tool to eliminate
                slow, error-prone Excel quotations. Create polished, branded
                documents in under two minutes.
              </p>
            </div>
            <ul className="flex flex-col gap-4 mt-6">
              {[
                "Auto-calculated totals and grand total",
                "Supports pcs and kgs units",
                "Company branding built-in",
                "One-click PDF download",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500/10 border border-orange-400/30 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-orange-400 text-xs font-bold">✓</span>
                  </div>
                  <span className="text-sm text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT GRID */}
          <div className="grid grid-cols-2 gap-6 h-full">
            {[
              { icon: "⏱", val: "< 2 min", label: "Average time to complete" },
              {
                icon: "📦",
                val: "Any item",
                label: "Supplies, equipment & services",
              },
              {
                icon: "📱",
                val: "Responsive",
                label: "Desktop, tablet & mobile",
              },
              { icon: "🔐", val: "Secure", label: "Privately stored data" },
            ].map((c) => (
              <div
                key={c.label}
                className="rounded-2xl p-6 bg-white border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_50px_rgba(0,0,0,0.1)] flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-xl mb-4">
                    {c.icon}
                  </div>
                  <p className="font-extrabold text-slate-900 text-[1.35rem] mb-2">
                    {c.val}
                  </p>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed mt-4">
                  {c.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ TESTIMONIALS ════════════════════ */}
      <section
        id="testimonials"
        className="bg-gradient-to-b from-slate-50 to-white border-y border-slate-200 py-[90px] px-6"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <SectionPill>Testimonials</SectionPill>
            <h2 className="text-[2.4rem] font-black text-slate-900 m-0 mb-3 -tracking-[0.02em]">
              What our clients say
            </h2>
            <p className="text-slate-500 m-0">
              Real feedback from people using the tool daily.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white border border-slate-200 rounded-[20px] p-7 shadow-[0_2px_12px_rgba(0,0,0,0.05)] cursor-default transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.1)]"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i} className="text-orange-400 text-sm">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-slate-600 text-[15px] leading-[1.7] m-0 mb-6 italic">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3 border-t border-slate-100 pt-[18px]">
                  <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-[0_4px_10px_rgba(249,115,22,0.25)]">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm m-0">
                      {t.name}
                    </p>
                    <p className="text-slate-400 text-xs m-0 mt-0.5">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ FAQ ════════════════════ */}
      <section id="faq" className="py-[90px] px-6 max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <SectionPill>FAQ</SectionPill>
          <h2 className="text-[2.4rem] font-black text-slate-900 m-0 mb-3 -tracking-[0.02em]">
            Frequently asked questions
          </h2>
          <p className="text-slate-500 m-0">
            Everything you might want to know before getting started.
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          {faqs.map((f) => (
            <FAQItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      {/* ════════════════════ CTA ════════════════════ */}
      <section className="px-6 pb-[90px] max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[28px] px-10 py-[72px] text-center relative overflow-hidden shadow-[0_24px_80px_rgba(15,23,42,0.25)]">
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(#f97316 1px,transparent 1px),linear-gradient(90deg,#f97316 1px,transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div
            className="absolute top-0 right-0 w-[350px] h-[350px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle,rgba(249,115,22,0.2) 0%,transparent 70%)",
              transform: "translate(30%,-30%)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-[280px] h-[280px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle,rgba(249,115,22,0.12) 0%,transparent 70%)",
              transform: "translate(-30%,30%)",
            }}
          />

          <span className="inline-block bg-orange-500/15 text-orange-400 text-[11px] font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full border border-orange-500/30 mb-5">
            Ready to start?
          </span>
          <h2 className="text-[2.8rem] font-black text-white m-0 mb-4 leading-[1.15] -tracking-[0.02em]">
            Create your first quotation right now
          </h2>
          <p className="text-slate-400 mx-auto mb-8 max-w-[500px] leading-[1.65]">
            No sign-up. No subscription. Just open the app, fill in your
            details, and download a professional PDF in under 2 minutes.
          </p>
          <button
            onClick={() => navigate("/quotation")}
            className="bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold text-base px-9 py-4 rounded-2xl border-none cursor-pointer shadow-[0_8px_32px_rgba(249,115,22,0.4)] transition-all duration-150 hover:opacity-90 hover:-translate-y-0.5"
          >
            Create a Quotation — It's Free →
          </button>
        </div>
      </section>

      {/* ════════════════════ FOOTER ════════════════════ */}
      <footer className="relative bg-slate-950 text-slate-400 px-6 pt-24 pb-10 overflow-hidden">
        <div
          className="absolute top-0 left-0 w-full h-px 
          bg-[repeating-linear-gradient(to_right,rgba(255,255,255,0.2)_0px,rgba(255,255,255,0.2)_6px,transparent_6px,transparent_14px)]"
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14 pb-16">
            {/* Brand */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">W</span>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Wimwa Tech</p>
                  <p className="text-xs text-slate-500">
                    General Supplies Limited
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                Professional quotation and delivery note generator built to help
                businesses create clean, branded documents in minutes.
              </p>
            </div>

            {/* Product */}
            <div className="relative space-y-6">
              <div className="hidden lg:block absolute -left-7 top-0 h-full w-px bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.2)_0px,rgba(255,255,255,0.2)_6px,transparent_6px,transparent_14px)]" />
              <p className="text-white text-sm font-semibold tracking-wide">
                Product
              </p>
              <div className="flex flex-col gap-3 text-sm">
                <a href="#features" className="hover:text-white transition">
                  Features
                </a>
                <a href="#how-it-works" className="hover:text-white transition">
                  How It Works
                </a>
                <a href="#faq" className="hover:text-white transition">
                  FAQ
                </a>
              </div>
              <div className="mt-6 p-4 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-sm">
                <p className="text-xs text-slate-400 mb-2">
                  Ready to get started?
                </p>
                <button
                  onClick={() => navigate("/quotation")}
                  className="text-sm text-white hover:opacity-80 transition"
                >
                  Create Your First Quote →
                </button>
              </div>
            </div>

            {/* Tools */}
            <div className="relative space-y-6">
              <div className="hidden lg:block absolute -left-7 top-0 h-full w-px bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.2)_0px,rgba(255,255,255,0.2)_6px,transparent_6px,transparent_14px)]" />
              <p className="text-white text-sm font-semibold tracking-wide">
                Tools
              </p>
              <div className="flex flex-col gap-3 text-sm">
                <button
                  onClick={() => navigate("/quotation")}
                  className="text-left hover:text-white transition"
                >
                  Quotation Maker
                </button>
                <button
                  onClick={() => navigate("/delivery-note")}
                  className="text-left hover:text-white transition"
                >
                  Delivery Note Generator
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-6">
                {[
                  "Fast PDF Export",
                  "Auto Calculations",
                  "Clean Templates",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs bg-slate-900 border border-white/10 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="relative space-y-6">
              <div className="hidden lg:block absolute -left-7 top-0 h-full w-px bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.2)_0px,rgba(255,255,255,0.2)_6px,transparent_6px,transparent_14px)]" />
              <p className="text-white text-sm font-semibold tracking-wide">
                Contact
              </p>
              <div className="flex flex-col gap-3 text-sm text-slate-500">
                <span>P.O Box 273 -00206, Kiserian</span>
                <span>+254 712953780</span>
                <span>wimwatech@gmail.com</span>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-[repeating-linear-gradient(to_right,rgba(255,255,255,0.2)_0px,rgba(255,255,255,0.2)_6px,transparent_6px,transparent_14px)] mb-6" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-600">
            <div>
              © {new Date().getFullYear()} Wimwa Tech General Supplies Limited
            </div>
            <div className="flex gap-8">
              <a href="/privacy-policy" className="hover:text-white transition">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-white transition">
                Terms
              </a>
            </div>
            <div className="text-slate-500 tracking-wide">Made in Kenya</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
