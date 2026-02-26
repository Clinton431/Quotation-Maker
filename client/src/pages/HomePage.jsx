import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ═══════════════════════════════════════
   DATA
═══════════════════════════════════════ */
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
    icon: "📝",
  },
  {
    num: "02",
    title: "Fill in client & item details",
    desc: "Add the client name, address, and as many line items as needed.",
    icon: "👤",
  },
  {
    num: "03",
    title: "Preview in real time",
    desc: "The right panel updates live so you can see the final document before exporting.",
    icon: "🖥️",
  },
  {
    num: "04",
    title: "Download or Save",
    desc: "Export a PDF instantly or save the quotation to the database for future reference.",
    icon: "📥",
  },
];

const testimonials = [
  {
    name: "Ken Mwangi",
    role: "Procurement Manager",
    text: "Before this tool I was spending 20 minutes per quotation in Excel. Now it takes me under 2 minutes and looks far more professional.",
    rating: 5,
    initials: "KM",
  },
  {
    name: "Clinton Nyakoe",
    role: "Small Business Owner",
    text: "My clients are always impressed by how clean and fast I send quotations. The PDF looks like it came from a big company.",
    rating: 5,
    initials: "CN",
  },
  {
    name: "Janet Odhiambo",
    role: "Contractor",
    text: "The pcs/kgs unit toggle is exactly what I needed. I deal in both and every other tool forced me to pick one.",
    rating: 5,
    initials: "JO",
  },
];

/* ═══════════════════════════════════════
   HERO PREVIEW CARD
═══════════════════════════════════════ */
const INVOICE_ROWS = [
  { desc: "Cement (50 kg bags)", qty: "120", unit: "pcs", total: "72,000" },
  { desc: "Steel Rods 16 mm", qty: "50", unit: "kgs", total: "45,500" },
  { desc: "River Sand (tonne)", qty: "8", unit: "pcs", total: "16,000" },
  { desc: "Binding Wire rolls", qty: "24", unit: "pcs", total: "8,400" },
];

function HeroPreviewCard() {
  const [activeRow, setActiveRow] = useState(0);
  const [typed, setTyped] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  // Cycle active row every 2 s
  useEffect(() => {
    const t = setInterval(
      () => setActiveRow((r) => (r + 1) % INVOICE_ROWS.length),
      2200
    );
    return () => clearInterval(t);
  }, []);

  // Blinking cursor
  useEffect(() => {
    const t = setInterval(() => setShowCursor((c) => !c), 530);
    return () => clearInterval(t);
  }, []);

  // Typing effect when active row changes
  useEffect(() => {
    const full = INVOICE_ROWS[activeRow].desc;
    setTyped("");
    let i = 0;
    const t = setInterval(() => {
      i++;
      setTyped(full.slice(0, i));
      if (i >= full.length) clearInterval(t);
    }, 40);
    return () => clearInterval(t);
  }, [activeRow]);

  return (
    <div className="relative w-full select-none">
      {/* Outer glow halo */}
      <div
        className="absolute -inset-3 rounded-[28px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 60% 40%,rgba(249,115,22,0.22) 0%,transparent 70%)",
          filter: "blur(16px)",
        }}
      />

      {/* Glass shell */}
      <div
        className="relative rounded-[20px] overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg,rgba(36,52,80,0.98) 0%,rgba(22,34,58,0.99) 100%)",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow:
            "0 28px 70px rgba(0,0,0,0.55), 0 0 0 1px rgba(249,115,22,0.14), inset 0 1px 0 rgba(255,255,255,0.12)",
        }}
      >
        {/* ── Window chrome ── */}
        <div
          className="flex items-center justify-between px-4 pt-3.5 pb-3 border-b border-white/[0.12]"
          style={{ background: "rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-3">
            {/* macOS traffic lights */}
            <div className="flex gap-1.5">
              <div
                className="w-[11px] h-[11px] rounded-full"
                style={{ background: "#ff5f56" }}
              />
              <div
                className="w-[11px] h-[11px] rounded-full"
                style={{ background: "#ffbd2e" }}
              />
              <div
                className="w-[11px] h-[11px] rounded-full"
                style={{ background: "#27c93f" }}
              />
            </div>
            {/* Mini address bar */}
            <div
              className="hidden sm:flex items-center gap-1.5 rounded-md px-2.5 py-1"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
              }}
            >
              <svg
                className="w-2.5 h-2.5 text-emerald-400 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-[10px] font-mono text-white/30 tracking-tight">
                wimwatech.co.ke/quotation
              </span>
            </div>
          </div>
          {/* Live badge */}
          <div
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.25)",
            }}
          >
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-55" />
              <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-400" />
            </span>
            <span className="text-[10px] font-bold text-emerald-400 tracking-wider">
              LIVE
            </span>
          </div>
        </div>

        {/* ── Document body ── */}
        <div className="p-4 space-y-3">
          {/* Doc header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: "linear-gradient(135deg,#fb923c,#ea580c)",
                  boxShadow: "0 4px 14px rgba(249,115,22,0.5)",
                }}
              >
                <span className="text-white font-black text-xs">W</span>
              </div>
              <div>
                <div className="text-[11px] font-bold text-white/90 leading-tight">
                  Wimwa Tech
                </div>
                <div className="text-[9px] text-white/55 mt-0.5">
                  General Supplies Ltd
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[11px] font-black tracking-[2.5px] text-white/80 mb-0.5">
                QUOTATION
              </div>
              <div className="text-[9px] text-white/50 font-mono">
                #QT-2025-0148
              </div>
              <div className="text-[9px] text-white/50 mt-0.5">25 Feb 2026</div>
            </div>
          </div>

          {/* Bill to */}
          <div
            className="rounded-xl px-3.5 py-2.5"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div
              className="text-[8px] font-bold uppercase tracking-widest mb-1"
              style={{ color: "rgba(251,146,60,0.75)" }}
            >
              Bill To
            </div>
            <div className="text-[11px] font-semibold text-white/90">
              Nairobi Hardware Ltd
            </div>
            <div className="text-[9px] text-white/50 mt-0.5">
              Industrial Area, Nairobi · +254 700 000 123
            </div>
          </div>

          {/* Items table */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.12)" }}
          >
            {/* Head */}
            <div
              className="grid px-3 py-2 gap-2 text-[8px] font-bold uppercase tracking-wider text-white/55"
              style={{
                gridTemplateColumns: "1fr 34px 34px 56px",
                background: "rgba(255,255,255,0.07)",
                borderBottom: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <span>Description</span>
              <span className="text-center">Qty</span>
              <span className="text-center">Unit</span>
              <span className="text-right">Ksh</span>
            </div>

            {/* Rows */}
            {INVOICE_ROWS.map((row, i) => {
              const isActive = i === activeRow;
              return (
                <div
                  key={i}
                  className="grid px-3 py-2.5 gap-2 transition-colors duration-500"
                  style={{
                    gridTemplateColumns: "1fr 34px 34px 56px",
                    background: isActive
                      ? "rgba(249,115,22,0.14)"
                      : i % 2 === 0
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(255,255,255,0.07)",
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  {/* Description with typing cursor */}
                  <div
                    className={`text-[10px] font-medium truncate transition-colors duration-400 ${
                      isActive ? "text-white" : "text-white/65"
                    }`}
                  >
                    {isActive ? (
                      <>
                        {typed}
                        <span
                          className={`inline-block w-[2px] h-[10px] ml-px align-middle bg-white transition-opacity ${
                            showCursor ? "opacity-100" : "opacity-0"
                          }`}
                        />
                      </>
                    ) : (
                      row.desc
                    )}
                  </div>
                  <div
                    className={`text-[10px] font-mono font-bold text-center transition-colors duration-400 ${
                      isActive ? "text-white" : "text-white/60"
                    }`}
                  >
                    {row.qty}
                  </div>
                  <div className="flex justify-center">
                    <span
                      className={`text-[8px] font-bold px-1.5 py-0.5 rounded transition-all duration-400 ${
                        isActive ? "text-white" : "text-white/50"
                      }`}
                      style={
                        isActive
                          ? {
                              background: "rgba(249,115,22,0.3)",
                              boxShadow: "0 0 0 1px rgba(249,115,22,0.4)",
                            }
                          : { background: "rgba(255,255,255,0.08)" }
                      }
                    >
                      {row.unit}
                    </span>
                  </div>
                  <div
                    className={`text-[10px] font-mono font-bold text-right transition-colors duration-400 ${
                      isActive ? "text-white" : "text-white/60"
                    }`}
                  >
                    {row.total}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grand total */}
          <div
            className="rounded-xl px-4 py-3 flex items-center justify-between"
            style={{
              background:
                "linear-gradient(135deg,rgba(249,115,22,0.18) 0%,rgba(234,88,12,0.12) 100%)",
              border: "1px solid rgba(249,115,22,0.35)",
            }}
          >
            <div>
              <div
                className="text-[8px] font-bold uppercase tracking-widest mb-0.5"
                style={{ color: "rgba(251,146,60,0.7)" }}
              >
                Grand Total
              </div>
              <div className="text-xl font-black font-mono text-white">
                Ksh 141,900
              </div>
            </div>
            <div className="flex flex-col gap-1.5 items-end">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[9px] font-semibold text-emerald-400">
                  Auto-calculated
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span className="text-[9px] font-semibold text-sky-400">
                  PDF ready
                </span>
              </div>
            </div>
          </div>

          {/* Action bar */}
          <div className="flex gap-2 pt-0.5">
            {/* Download */}
            <div
              className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-default"
              style={{
                background: "linear-gradient(135deg,#fb923c,#ea580c)",
                boxShadow: "0 4px 18px rgba(249,115,22,0.42)",
              }}
            >
              <svg
                className="w-3.5 h-3.5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 11l5 5 5-5M12 4v12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[11px] font-bold text-white tracking-wide">
                Download PDF
              </span>
            </div>
            {/* Save */}
            <div
              className="px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-default"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <svg
                className="w-3.5 h-3.5 text-white/40"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1-4H9m0 0a2 2 0 00-2 2v4m2-6a2 2 0 012 2v4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[11px] font-semibold text-white/35">
                Save
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   SHARED COMPONENTS
═══════════════════════════════════════ */
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

/* ═══════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════ */
export default function HomePage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Trigger entrance animations after first paint
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* ══════════ GLOBAL KEYFRAMES ══════════ */}
      <style>{`
        @keyframes heroFadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes heroBadgeDrop {
          from { opacity:0; transform:translateY(-12px) scale(0.94); }
          to   { opacity:1; transform:translateY(0)     scale(1);    }
        }
        @keyframes heroSlideIn {
          from { opacity:0; transform:translateX(-26px); }
          to   { opacity:1; transform:translateX(0);     }
        }
        @keyframes heroCardRise {
          from { opacity:0; transform:translateY(36px) scale(0.96); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
        @keyframes floatY {
          0%,100% { transform:translateY(0)    rotate(0.3deg);  }
          50%      { transform:translateY(-10px) rotate(-0.3deg); }
        }
        @keyframes shimmerText {
          0%   { background-position:-200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes scanLine {
          0%   { top:-2px;   opacity:0.25; }
          90%  { opacity:0.25; }
          100% { top:100%;   opacity:0;    }
        }
        @keyframes fadeUpSection {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0);    }
        }

        /* hero staggered entrances */
        .h-badge  { animation: heroBadgeDrop 0.55s cubic-bezier(.22,1,.36,1) both 0.05s; }
        .h-h1     { animation: heroSlideIn   0.65s cubic-bezier(.22,1,.36,1) both 0.18s; }
        .h-sub    { animation: heroFadeUp    0.55s cubic-bezier(.22,1,.36,1) both 0.30s; }
        .h-ctas   { animation: heroFadeUp    0.55s cubic-bezier(.22,1,.36,1) both 0.42s; }
        .h-chips  { animation: heroFadeUp    0.55s cubic-bezier(.22,1,.36,1) both 0.54s; }
        .h-card   { animation: heroCardRise  0.75s cubic-bezier(.22,1,.36,1) both 0.22s; }
        .h-badge,.h-h1,.h-sub,.h-ctas,.h-chips,.h-card { opacity:0; animation-fill-mode:forwards; }

        /* shimmer orange text */
        .shimmer-orange {
          background: linear-gradient(90deg, #fbbf24 0%, #f97316 25%, #fb923c 50%, #f97316 75%, #fbbf24 100%);
          background-size: 250% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerText 3.8s linear infinite;
        }

        /* card float */
        .card-float { animation: floatY 7s ease-in-out infinite; }

        /* scan line overlay inside hero */
        .hero-scan::before {
          content: '';
          position: absolute; left:0; right:0; height:2px;
          background: linear-gradient(90deg,transparent,rgba(249,115,22,0.3),transparent);
          animation: scanLine 7s ease-in-out infinite;
          pointer-events: none; z-index:1;
        }

        /* section card fadeUp */
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

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

          {/* Desktop links */}
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

          {/* Desktop CTAs */}
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

        {/* Mobile menu */}
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
                className="w-full bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold text-sm py-3 rounded-xl border-none cursor-pointer shadow-[0_4px_14px_rgba(249,115,22,0.3)]"
              >
                Create Quotation →
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════
          HERO — complete redesign
      ═══════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden hero-scan"
        style={{
          background:
            "linear-gradient(155deg,#080e1a 0%,#0d1525 50%,#0a1120 100%)",
          minHeight: "93vh",
        }}
      >
        {/* ── Atmosphere layers ── */}

        {/* 1. Dot grid — fine, subtle */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(rgba(249,115,22,0.16) 1px,transparent 1px)",
            backgroundSize: "30px 30px",
            opacity: 0.4,
          }}
        />

        {/* 2. Diagonal hatch — bottom-right for asymmetry */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.022]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(130deg,#f97316 0px,#f97316 1px,transparent 0px,transparent 50%)",
            backgroundSize: "22px 22px",
            maskImage:
              "radial-gradient(ellipse 80% 80% at 80% 60%,black 0%,transparent 70%)",
          }}
        />

        {/* 3. Colour blobs */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-12%",
            right: "-6%",
            width: 560,
            height: 560,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(249,115,22,0.18) 0%,transparent 65%)",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "-18%",
            left: "-10%",
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(249,115,22,0.09) 0%,transparent 65%)",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            top: "40%",
            left: "42%",
            width: 360,
            height: 360,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(249,115,22,0.05) 0%,transparent 65%)",
          }}
        />

        {/* 4. Top edge accent */}
        <div
          className="absolute top-0 inset-x-0 h-[1px] pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg,transparent 0%,rgba(249,115,22,0.7) 35%,rgba(251,146,60,0.5) 65%,transparent 100%)",
          }}
        />

        {/* 5. Bottom left corner tag — decorative */}
        <div className="absolute bottom-8 left-6 hidden lg:flex items-center gap-2 pointer-events-none">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "rgba(249,115,22,0.4)" }}
          />
          <span className="text-[10px] font-mono text-white/15 tracking-widest uppercase">
            v2.1.0 · Kiserian, Kenya
          </span>
        </div>

        {/* ── Content ── */}
        <div
          className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8"
          style={{ minHeight: "93vh", display: "flex", alignItems: "center" }}
        >
          <div className="w-full grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-14 py-20 lg:py-0">
            {/* ════ LEFT COPY ════ */}
            <div className="flex flex-col items-start">
              {/* Pulsing badge */}
              <div
                className={`${
                  mounted ? "h-badge" : ""
                } flex items-center gap-2.5 mb-8`}
              >
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-55" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-400" />
                </span>
                <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-orange-400/65">
                  Wimwa Tech General Supplies Limited
                </span>
                <span className="hidden sm:inline-block w-px h-3.5 bg-white/12" />
                <span className="hidden sm:inline text-[10px] text-white/22 tracking-wide">
                  Kiserian, Kenya
                </span>
              </div>

              {/* Headline — stacked, very large */}
              <h1
                className={`${mounted ? "h-h1" : ""}  mb-7`}
                style={{ lineHeight: 1.0, letterSpacing: "-0.03em" }}
              >
                {/* Label line */}
                <span className="block text-white/35 text-[12px] sm:text-[13px] font-bold tracking-[0.2em] uppercase mb-4">
                  Quotations &amp; Delivery Notes
                </span>
                {/* Word 1 */}
                <span
                  className="block text-white font-black"
                  style={{ fontSize: "clamp(2.6rem,6vw,4.4rem)" }}
                >
                  Create
                </span>
                {/* Word 2 — shimmer */}
                <span
                  className="block font-black shimmer-orange"
                  style={{ fontSize: "clamp(2.6rem,6vw,4.4rem)" }}
                >
                  Professional
                </span>
                {/* Word 3 */}
                <span
                  className="block text-white font-black"
                  style={{ fontSize: "clamp(2.6rem,6vw,4.4rem)" }}
                >
                  Documents
                </span>
                {/* Tagline */}
                <span
                  className="block font-bold text-white/60 mt-3"
                  style={{
                    fontSize: "clamp(1.3rem,3vw,1.7rem)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  in under 2 minutes.
                </span>
              </h1>

              {/* Sub-text */}
              <p
                className={`${mounted ? "h-sub" : ""} mb-9 max-w-[430px]`}
                style={{ color: "#94a3b8", fontSize: "15px", lineHeight: 1.8 }}
              >
                Fill in client details, add line items, watch the live preview
                update, then export a polished A4 PDF — all in your browser,
                free, forever.
              </p>

              {/* CTA row */}
              <div
                className={`${
                  mounted ? "h-ctas" : ""
                } flex flex-col sm:flex-row gap-3 w-full sm:w-auto mb-8`}
              >
                {/* Primary — orange gradient with shine sweep */}
                <button
                  onClick={() => navigate("/quotation")}
                  className="group relative overflow-hidden flex items-center justify-center gap-2.5 font-bold text-white text-[15px] px-8 py-4 rounded-2xl border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                  style={{
                    background:
                      "linear-gradient(135deg,#fb923c 0%,#ea580c 100%)",
                    boxShadow:
                      "0 8px 32px rgba(249,115,22,0.44), inset 0 1px 0 rgba(255,255,255,0.18)",
                  }}
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none" />
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Create a Quotation — Free
                </button>

                {/* Secondary */}
                <button
                  onClick={() => navigate("/delivery-note")}
                  className="flex items-center justify-center gap-2 font-semibold text-slate-300 text-[15px] px-8 py-4 rounded-2xl cursor-pointer transition-all duration-200 hover:text-white hover:-translate-y-0.5 active:scale-[0.98]"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.11)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                >
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Delivery Note
                </button>
              </div>

              {/* Trust chips */}
              <div
                className={`${mounted ? "h-chips" : ""} flex flex-wrap gap-2`}
              >
                {[
                  { icon: "✓", t: "Free forever" },
                  { icon: "✓", t: "No sign-up needed" },
                  { icon: "✓", t: "Instant PDF export" },
                  { icon: "✓", t: "Cloud-saved records" },
                  { icon: "✓", t: "Works on mobile" },
                ].map(({ icon, t }) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 px-3 py-1.5 rounded-full transition-colors duration-150 hover:text-slate-300"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <span className="text-orange-500 font-bold text-[10px]">
                      {icon}
                    </span>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* ════ RIGHT PREVIEW ════ */}
            <div
              className={`${
                mounted ? "h-card" : ""
              } flex justify-center lg:justify-end`}
            >
              <div className="card-float w-full max-w-[390px] sm:max-w-[420px] lg:max-w-none lg:w-full">
                <HeroPreviewCard />

                {/* Reflection */}
                <div
                  className="mt-1 mx-6 h-6 rounded-b-2xl blur-sm opacity-25"
                  style={{
                    background:
                      "linear-gradient(to bottom,rgba(249,115,22,0.1),transparent)",
                  }}
                />

                {/* Caption */}
                <div className="hidden lg:flex items-center justify-center gap-2 mt-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-white/20 font-medium tracking-wide">
                    Live preview — updates as you type
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider into stats */}
        <div
          className="absolute bottom-0 inset-x-0 pointer-events-none overflow-hidden leading-none"
          style={{ lineHeight: 0 }}
        >
          <svg
            viewBox="0 0 1440 52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block", width: "100%" }}
          >
            <path
              d="M0 52L80 44.3C160 37 320 21 480 18.3C640 16 800 26 960 32C1120 38 1280 40 1360 41L1440 42V52H0Z"
              fill="#f8fafc"
            />
          </svg>
        </div>
      </section>

      {/* ════════════════════ STATS ════════════════════ */}
      <section className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
          {[
            { val: "2 min", label: "Avg. quote time" },
            { val: "PDF", label: "Instant export" },
            { val: "100%", label: "Free forever" },
            { val: "∞", label: "Cloud storage" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center py-8 px-4 text-center"
            >
              <p className="text-[2rem] font-black text-orange-500 leading-none mb-1.5">
                {s.val}
              </p>
              <p className="text-slate-400 text-[11px] font-semibold tracking-widest uppercase">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════ FEATURES ════════════════════ */}
      <section
        id="features"
        className="relative py-28 px-6 max-w-6xl mx-auto overflow-hidden"
      >
        <div className="absolute -top-24 left-1/3 w-[500px] h-[500px] bg-orange-400/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-400/5 blur-3xl rounded-full pointer-events-none" />

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

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const a = accentMap[f.accent];
            return (
              <div
                key={f.title}
                className={`group relative flex flex-col rounded-2xl p-7 bg-white overflow-hidden border border-slate-100 ${a.hoverBorder} shadow-sm hover:shadow-lg ${a.hoverShadow} transition-all duration-300 ease-out hover:-translate-y-1.5 animate-[fadeUp_0.5s_ease_both]`}
                style={{ animationDelay: `${i * 75}ms` }}
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${a.bar} opacity-40 group-hover:opacity-100 transition-opacity duration-300`}
                />
                <span className="absolute top-5 right-5 text-[11px] font-bold tracking-widest text-slate-200 select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex justify-center mb-5">
                  <div
                    className={`w-[52px] h-[52px] rounded-xl ${a.iconBg} ring-1 ${a.iconRing} flex items-center justify-center text-[26px] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}
                  >
                    {f.icon}
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 text-[15px] tracking-tight leading-snug mb-2.5 text-center">
                  {f.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed flex-1 text-center">
                  {f.desc}
                </p>
                <div
                  className={`flex items-center gap-1.5 mt-5 pt-4 border-t border-slate-100 ${a.text} text-[13px] font-semibold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200`}
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
      </section>

      {/* ════════════════════ HOW IT WORKS ════════════════════ */}
      <section
        id="how-it-works"
        className="bg-slate-50 border-y border-slate-100 py-24 px-6"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <SectionPill>Process</SectionPill>
            <h2 className="text-[2.5rem] font-black text-slate-900 m-0 mb-3 -tracking-[0.02em]">
              How it works
            </h2>
            <p className="text-slate-500 text-base max-w-sm mx-auto">
              From blank page to finished quotation in four steps.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            <div className="hidden lg:block absolute top-9 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent z-0" />
            {steps.map((s) => (
              <div
                key={s.num}
                className="group relative flex flex-col items-center text-center bg-white rounded-2xl px-6 py-8 border border-slate-100 shadow-sm hover:shadow-md hover:border-orange-100 hover:-translate-y-1 transition-all duration-300 z-10"
              >
                <div className="relative mb-5">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white font-black text-base flex items-center justify-center shadow-[0_6px_20px_rgba(249,115,22,0.3)] group-hover:shadow-[0_8px_28px_rgba(249,115,22,0.45)] transition-shadow duration-300">
                    {s.num}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-slate-100 flex items-center justify-center text-sm shadow-sm">
                    {s.icon}
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 text-[14px] leading-snug mb-2 tracking-tight">
                  {s.title}
                </h3>
                <p className="text-slate-400 text-[13px] leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button
              onClick={() => navigate("/quotation")}
              className="bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold text-[14px] px-8 py-3.5 rounded-xl border-none cursor-pointer shadow-[0_6px_24px_rgba(249,115,22,0.3)] transition-all duration-200 hover:shadow-[0_8px_32px_rgba(249,115,22,0.45)] hover:-translate-y-0.5 active:scale-95"
            >
              Try it now — it's free →
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════ ABOUT ════════════════════ */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
          <div className="relative rounded-3xl p-10 bg-slate-900 border border-white/10 overflow-hidden shadow-[0_20px_60px_rgba(15,23,42,0.35)] flex flex-col justify-between">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-orange-500/8 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 bg-white/5 text-orange-400 text-[10px] font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full border border-orange-400/20 mb-6">
                <span className="w-1 h-1 rounded-full bg-orange-400 inline-block" />
                About the Tool
              </span>
              <h2 className="text-[1.85rem] font-extrabold text-white mb-4 leading-tight tracking-tight">
                Simplify your billing with the Wimwa Tech Quotation Maker
              </h2>
              <p className="text-slate-400 text-sm leading-[1.8] mb-8 max-w-md">
                Built to eliminate slow, error-prone Excel quotations. Create
                polished, branded documents in under two minutes.
              </p>
            </div>
            <ul className="relative z-10 flex flex-col gap-3">
              {[
                "Auto-calculated totals and grand total",
                "Supports pcs and kgs units",
                "Company branding built-in",
                "One-click PDF download",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-500/15 border border-orange-400/30 flex items-center justify-center shrink-0">
                    <span className="text-orange-400 text-[10px] font-black">
                      ✓
                    </span>
                  </div>
                  <span className="text-sm text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
                className="group rounded-2xl p-6 bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-orange-100 hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-lg">
                  {c.icon}
                </div>
                <div>
                  <p className="font-black text-slate-900 text-[1.25rem] leading-none mb-1">
                    {c.val}
                  </p>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {c.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ TESTIMONIALS ════════════════════ */}
      <section
        id="testimonials"
        className="bg-white border-y border-slate-100 py-24 px-6"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <SectionPill>Testimonials</SectionPill>
            <h2 className="text-[2.4rem] font-black text-slate-900 m-0 mb-3 -tracking-[0.02em]">
              What our clients say
            </h2>
            <p className="text-slate-400 m-0 text-sm">
              Real feedback from people using the tool daily.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="group relative bg-slate-50 border border-slate-100 rounded-2xl p-7 hover:bg-white hover:border-orange-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <span className="text-[64px] leading-none text-orange-100 font-black select-none absolute top-4 right-6 group-hover:text-orange-200 transition-colors duration-300">
                  "
                </span>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i} className="text-orange-400 text-sm">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-slate-600 text-[14px] leading-[1.75] flex-1 relative z-10">
                  {t.text}
                </p>
                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm m-0 leading-tight">
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
        <div className="absolute top-0 left-0 w-full h-px bg-[repeating-linear-gradient(to_right,rgba(255,255,255,0.2)_0px,rgba(255,255,255,0.2)_6px,transparent_6px,transparent_14px)]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14 pb-16">
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
