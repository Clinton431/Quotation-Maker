import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_r5togfr";
const EMAILJS_TEMPLATE_ID = "template_bmhwsen";
const EMAILJS_PUBLIC_KEY = "wcw7bHfwJzQiNFSDP";

export default function ContactPage() {
  const [copied, setCopied] = useState(null);
  const formRef = useRef();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [focused, setFocused] = useState(null);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setErrorMsg("Please fill in your name, email and message.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setErrorMsg("");
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          from_email: form.email,
          from_phone: form.phone || "Not provided",
          subject: form.subject || "General Enquiry",
          message: form.message,
          reply_to: form.email,
        },
        EMAILJS_PUBLIC_KEY
      );
      setStatus("success");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      setErrorMsg(
        "Something went wrong. Please try WhatsApp or email directly."
      );
      setStatus("error");
    }
  };

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const contactItems = [
    {
      key: "address",
      icon: "🌍",
      label: "Address",
      value: "P.O Box 273-00206, Kiserian, Kajiado County",
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
      value: "Mon – Sat · 8:00 AM – 6:00 PM",
    },
    { key: "pvt", icon: "🏢", label: "Reg. No.", value: "PVT-Y2U9QXGP" },
  ];

  const channels = [
    {
      key: "wa",
      iconEl: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      label: "WhatsApp",
      desc: "Chat instantly",
      href: "https://wa.me/254712953780",
      color: "#25D366",
      bg: "rgba(37,211,102,0.12)",
      border: "rgba(37,211,102,0.28)",
      glow: "rgba(37,211,102,0.2)",
    },
    {
      key: "call",
      iconEl: (
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
        </svg>
      ),
      label: "Call Us",
      desc: "Speak to our team",
      href: "tel:+254712953780",
      color: "#60a5fa",
      bg: "rgba(96,165,250,0.12)",
      border: "rgba(96,165,250,0.28)",
      glow: "rgba(96,165,250,0.2)",
    },
    {
      key: "mail",
      iconEl: (
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      label: "Email Us",
      desc: "Reply within 24h",
      href: "mailto:wimwatech@gmail.com",
      color: "#fb923c",
      bg: "rgba(251,146,60,0.12)",
      border: "rgba(251,146,60,0.28)",
      glow: "rgba(251,146,60,0.2)",
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,400&family=Outfit:wght@300;400;500;600;700&display=swap');

        :root {
          --brand: #c8521a;
          --brand-lt: rgba(200,82,26,0.1);
          --brand-mid: rgba(200,82,26,0.25);
          --dark: #0d0d0d;
          --surface: #f9f7f4;
          --card: #ffffff;
          --border: #e9e4dc;
          --text: #1a1a1a;
          --muted: #8a8580;
          --soft: #f4f1ec;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .cp { min-height: 100vh; background: var(--surface); font-family: 'Outfit', sans-serif; color: var(--text); }

        /* ── NAV ── */
        .cp-nav {
          position: sticky; top: 0; z-index: 50;
          background: rgba(249,247,244,0.95); backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--border);
          height: 62px; padding: 0 28px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .cp-brand { display: flex; align-items: center; gap: 11px; text-decoration: none; }
        .cp-logo {
          width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
          background: linear-gradient(140deg, #c8521a, #e87030);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Fraunces', serif; font-weight: 900; font-size: 17px; color: #fff;
          box-shadow: 0 4px 14px rgba(200,82,26,0.38);
        }
        .cp-brand-name { font-weight: 700; font-size: 14px; color: var(--dark); line-height: 1.25; }
        .cp-brand-sub { font-size: 11px; color: var(--muted); font-weight: 300; }
        .cp-back {
          display: flex; align-items: center; gap: 6px; text-decoration: none;
          font-size: 13px; font-weight: 500; color: var(--muted);
          padding: 7px 14px; border-radius: 9px;
          border: 1px solid var(--border); background: var(--card); transition: all 0.18s;
        }
        .cp-back:hover { color: var(--brand); border-color: var(--brand-mid); background: var(--brand-lt); }

        /* ── HERO ── */
        .cp-hero {
          background: var(--dark); padding: 60px 24px 52px;
          position: relative; overflow: hidden;
        }
        .cp-hero-bg {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(200,82,26,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200,82,26,0.06) 1px, transparent 1px);
          background-size: 44px 44px;
        }
        .cp-orb {
          position: absolute; border-radius: 50%; pointer-events: none;
          background: radial-gradient(circle, rgba(200,82,26,0.18) 0%, transparent 68%);
        }
        .cp-orb-1 { width: 380px; height: 380px; top: -140px; left: -80px; }
        .cp-orb-2 { width: 280px; height: 280px; bottom: -100px; right: -40px; }

        .cp-hero-inner {
          position: relative; max-width: 660px; margin: 0 auto; text-align: center;
        }
        .cp-badge {
          display: inline-flex; align-items: center; gap: 8px; margin-bottom: 22px;
          padding: 6px 16px; border-radius: 999px;
          border: 1px solid rgba(200,82,26,0.32); background: rgba(200,82,26,0.1);
          font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #e8845a;
        }
        .cp-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #e8845a; animation: blink 2s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .cp-h1 {
          font-family: 'Fraunces', serif; font-weight: 900; line-height: 1.0;
          font-size: clamp(46px, 9vw, 76px); letter-spacing: -0.03em; color: #fff; margin-bottom: 14px;
        }
        .cp-h1 em {
          font-style: italic; font-weight: 300;
          background: linear-gradient(90deg, #fb923c, #c8521a);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .cp-hero-sub {
          font-size: 16px; font-weight: 300; color: rgba(255,255,255,0.42);
          line-height: 1.7; margin-bottom: 40px; max-width: 360px; margin-left: auto; margin-right: auto;
        }

        /* ── CHANNEL CARDS ── */
        .cp-channels {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 14px; max-width: 580px; margin: 0 auto;
        }
        .cp-ch {
          display: flex; flex-direction: column; align-items: center; gap: 11px;
          padding: 22px 14px 20px; border-radius: 18px;
          border: 1px solid; text-decoration: none;
          transition: transform 0.22s, box-shadow 0.22s;
          position: relative; overflow: hidden;
        }
        .cp-ch::after {
          content: ''; position: absolute; inset: 0; border-radius: 18px;
          background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 60%);
          pointer-events: none;
        }
        .cp-ch:hover { transform: translateY(-4px); }
        .cp-ch-icon {
          width: 52px; height: 52px; border-radius: 15px;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.2s;
        }
        .cp-ch:hover .cp-ch-icon { transform: scale(1.08); }
        .cp-ch-label { font-size: 14px; font-weight: 700; color: #fff; text-align: center; }
        .cp-ch-desc { font-size: 12px; color: rgba(255,255,255,0.48); text-align: center; line-height: 1.4; }
        .cp-ch-cta {
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          padding: 6px 14px; border-radius: 999px; margin-top: 2px; transition: opacity 0.2s;
        }

        /* ── SECTION BREAK ── */
        .cp-break {
          max-width: 1060px; margin: 0 auto;
          padding: 44px 28px 0;
          display: flex; align-items: center; gap: 16px;
        }
        .cp-break-line { flex: 1; height: 1px; background: var(--border); }
        .cp-break-label {
          font-size: 11px; font-weight: 600; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--muted); white-space: nowrap;
        }

        /* ── MAIN GRID ── */
        .cp-main {
          max-width: 1060px; margin: 0 auto;
          padding: 36px 28px 52px;
          display: grid; grid-template-columns: 1fr 340px;
          gap: 28px; align-items: start;
        }

        /* ── FORM CARD ── */
        .cp-form-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 20px; overflow: hidden;
          box-shadow: 0 2px 20px rgba(0,0,0,0.05);
        }
        .cp-ch-head {
          padding: 22px 26px; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; gap: 12px;
        }
        .cp-ch-head-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: var(--brand-lt); color: var(--brand);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .cp-ch-head-title { font-size: 15px; font-weight: 700; color: var(--dark); }
        .cp-ch-head-sub { font-size: 12px; color: var(--muted); font-weight: 300; margin-top: 1px; }
        .cp-form-body { padding: 26px; }

        .cp-frow { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 18px; }
        .cp-field { margin-bottom: 18px; }
        .cp-lbl {
          display: block; font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.1em; color: var(--muted); margin-bottom: 7px; transition: color 0.18s;
        }
        .cp-lbl.active { color: var(--brand); }
        .cp-inp {
          width: 100%; padding: 13px 15px; border: 1.5px solid var(--border);
          border-radius: 11px; background: var(--soft);
          font-family: 'Outfit', sans-serif; font-size: 14px; color: var(--dark);
          outline: none; transition: all 0.18s;
        }
        .cp-inp::placeholder { color: #c4bfb8; }
        .cp-inp:focus { border-color: var(--brand); background: #fff; box-shadow: 0 0 0 4px rgba(200,82,26,0.07); }
        .cp-ta { resize: none; min-height: 132px; line-height: 1.65; }

        .cp-btn {
          width: 100%; padding: 15px; border: none; border-radius: 12px;
          font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.04em;
          color: #fff; cursor: pointer;
          background: linear-gradient(135deg, #c8521a 0%, #e06828 100%);
          display: flex; align-items: center; justify-content: center; gap: 10px;
          box-shadow: 0 4px 18px rgba(200,82,26,0.32); transition: all 0.2s;
        }
        .cp-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(200,82,26,0.42); }
        .cp-btn:active { transform: translateY(0); }
        .cp-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }

        .cp-err {
          display: flex; align-items: center; gap: 9px;
          padding: 12px 14px; background: #fff5f5; border: 1px solid #fecaca;
          border-radius: 10px; font-size: 13px; color: #dc2626; margin-bottom: 16px;
        }
        .cp-spin { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; animation: spin 0.7s linear infinite; flex-shrink: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* SUCCESS */
        .cp-ok {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; min-height: 300px; gap: 14px; text-align: center; padding: 28px;
        }
        .cp-ok-ring {
          width: 70px; height: 70px; border-radius: 50%; border: 2px solid var(--brand);
          background: var(--brand-lt); display: flex; align-items: center; justify-content: center;
          animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes popIn { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
        .cp-ok-title { font-family: 'Fraunces', serif; font-size: 26px; font-weight: 700; color: var(--dark); }
        .cp-ok-sub { font-size: 14px; color: var(--muted); max-width: 240px; line-height: 1.65; font-weight: 300; }
        .cp-ok-btn {
          margin-top: 6px; padding: 10px 22px; border-radius: 9px;
          border: 1.5px solid var(--border); background: transparent;
          font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600;
          color: var(--muted); cursor: pointer; transition: all 0.18s;
        }
        .cp-ok-btn:hover { border-color: var(--brand); color: var(--brand); background: var(--brand-lt); }

        /* ── DETAILS CARD ── */
        .cp-det-card {
          background: var(--dark); border-radius: 20px; overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.12);
          position: sticky; top: 80px;
        }
        .cp-det-head {
          padding: 22px 24px 18px; border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .cp-det-eye {
          font-size: 10px; font-weight: 600; letter-spacing: 0.2em;
          text-transform: uppercase; color: #e8845a; margin-bottom: 5px;
        }
        .cp-det-title {
          font-family: 'Fraunces', serif; font-size: 22px; font-weight: 700;
          color: #fff; letter-spacing: -0.02em;
        }
        .cp-det-item {
          display: flex; align-items: flex-start; gap: 13px;
          padding: 15px 22px; border-bottom: 1px solid rgba(255,255,255,0.05);
          position: relative; transition: background 0.15s;
        }
        .cp-det-item:last-of-type { border-bottom: none; }
        .cp-det-item:hover { background: rgba(255,255,255,0.03); }
        .cp-det-ic {
          width: 36px; height: 36px; border-radius: 9px;
          background: rgba(255,255,255,0.07);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0; margin-top: 1px;
        }
        .cp-det-lbl {
          font-size: 10px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.14em; color: rgba(255,255,255,0.32); margin-bottom: 3px;
        }
        .cp-det-val { font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.82); line-height: 1.5; }
        .cp-det-link { font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.82); text-decoration: none; transition: color 0.15s; }
        .cp-det-link:hover { color: #fb923c; }
        .cp-cp-btn {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          display: flex; align-items: center; gap: 4px;
          padding: 5px 10px; border-radius: 6px; border: none; background: transparent;
          font-family: 'Outfit', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;
          color: rgba(255,255,255,0.28); cursor: pointer; transition: all 0.15s; opacity: 0;
        }
        .cp-det-item:hover .cp-cp-btn { opacity: 1; }
        .cp-cp-btn:hover { color: #fb923c; background: rgba(200,82,26,0.12); }
        .cp-cp-btn.ok { color: #4ade80; opacity: 1; }
        .cp-det-avail {
          padding: 14px 22px; border-top: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; gap: 8px;
        }
        .cp-avail-dot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; animation: blink 2.5s ease infinite; flex-shrink: 0; }
        .cp-avail-txt { font-size: 12px; color: #4ade80; font-weight: 600; }

        /* ── MAP ── */
        .cp-map-wrap { max-width: 1060px; margin: 0 auto 52px; padding: 0 28px; }
        .cp-map {
          height: 190px; border-radius: 18px; overflow: hidden;
          background: linear-gradient(135deg, #f0ece4 0%, #e8e2d6 100%);
          border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
        }
        .cp-map-in { text-align: center; }
        .cp-map-pin { font-size: 38px; display: block; margin-bottom: 8px; animation: float 3.5s ease-in-out infinite; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        .cp-map-city { font-family: 'Fraunces', serif; font-size: 18px; font-weight: 700; color: #2a2a2a; margin-bottom: 3px; }
        .cp-map-po { font-size: 12px; color: #999; margin-bottom: 14px; }
        .cp-map-btn {
          display: inline-flex; align-items: center; gap: 6px; text-decoration: none;
          font-size: 12px; font-weight: 700; color: var(--brand);
          padding: 8px 20px; border-radius: 999px;
          border: 1.5px solid var(--brand-mid); background: #fff; transition: all 0.18s;
        }
        .cp-map-btn:hover { background: var(--brand); color: #fff; border-color: var(--brand); }

        /* ── FOOTER ── */
        .cp-foot {
          border-top: 1px solid var(--border); background: var(--card);
          padding: 18px 28px;
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
        }
        .cp-foot-copy { font-size: 12px; color: var(--muted); }
        .cp-foot-avail { display: flex; align-items: center; gap: 7px; font-size: 12px; color: #22c55e; font-weight: 600; }
        .cp-foot-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; animation: blink 2.5s ease infinite; }

        /* ── RESPONSIVE ── */
        @media (max-width: 820px) {
          .cp-main { grid-template-columns: 1fr; gap: 20px; padding: 28px 20px 44px; }
          .cp-det-card { position: static; }
          .cp-frow { grid-template-columns: 1fr; gap: 0; margin-bottom: 0; }
          .cp-frow > div { margin-bottom: 18px; }
          .cp-form-body { padding: 20px; }
          .cp-ch-head { padding: 18px 20px; }
          .cp-break { padding: 36px 20px 0; }
          .cp-map-wrap { padding: 0 20px; margin-bottom: 36px; }
          .cp-foot { padding: 16px 20px; flex-direction: column; gap: 8px; text-align: center; }
        }
        @media (max-width: 640px) {
          .cp-hero { padding: 48px 18px 44px; }
          .cp-nav { padding: 0 18px; }
          .cp-channels { max-width: 100%; gap: 10px; }
          .cp-ch { padding: 18px 10px 16px; border-radius: 16px; }
          .cp-ch-icon { width: 46px; height: 46px; border-radius: 13px; }
          .cp-ch-desc { font-size: 11px; }
          .cp-ch-cta { font-size: 10px; padding: 5px 12px; }
        }
        @media (max-width: 400px) {
          .cp-ch { padding: 14px 8px 12px; gap: 8px; border-radius: 14px; }
          .cp-ch-icon { width: 40px; height: 40px; }
          .cp-ch-label { font-size: 12px; }
          .cp-ch-desc { display: none; }
        }
      `}</style>

      <div className="cp">
        {/* NAV */}
        <nav className="cp-nav">
          <Link to="/" className="cp-brand">
            <div className="cp-logo">W</div>
            <div>
              <div className="cp-brand-name">Wimwa Tech</div>
              <div className="cp-brand-sub">General Supplies</div>
            </div>
          </Link>
          <Link to="/" className="cp-back">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back
          </Link>
        </nav>

        {/* HERO */}
        <div className="cp-hero">
          <div className="cp-hero-bg" />
          <div className="cp-orb cp-orb-1" />
          <div className="cp-orb cp-orb-2" />
          <div className="cp-hero-inner">
            <div className="cp-badge">
              <span className="cp-badge-dot" />
              We're here to help
            </div>
            <h1 className="cp-h1">
              Let's <em>Talk</em>
            </h1>
            <p className="cp-hero-sub">
              Questions, quotes, or just saying hello — we respond fast.
            </p>

            {/* CHANNEL CARDS */}
            <div className="cp-channels">
              {channels.map((ch) => (
                <a
                  key={ch.key}
                  href={ch.href}
                  target={ch.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="cp-ch"
                  style={{
                    background: ch.bg,
                    borderColor: ch.border,
                    boxShadow: `0 8px 24px ${ch.glow}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 16px 40px ${ch.glow}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 8px 24px ${ch.glow}`;
                  }}
                >
                  <div
                    className="cp-ch-icon"
                    style={{ background: `${ch.bg}`, color: ch.color }}
                  >
                    {ch.iconEl}
                  </div>
                  <div className="cp-ch-label">{ch.label}</div>
                  <div className="cp-ch-desc">{ch.desc}</div>
                  <div
                    className="cp-ch-cta"
                    style={{ color: ch.color, background: ch.bg }}
                  >
                    Open →
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* BREAK */}
        <div className="cp-break">
          <div className="cp-break-line" />
          <span className="cp-break-label">Or send a message</span>
          <div className="cp-break-line" />
        </div>

        {/* MAIN */}
        <div className="cp-main">
          {/* FORM */}
          <div className="cp-form-card">
            <div className="cp-ch-head">
              <div className="cp-ch-head-icon">
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <div className="cp-ch-head-title">Send us a Message</div>
                <div className="cp-ch-head-sub">
                  We'll reply within 24 hours
                </div>
              </div>
            </div>

            {status === "success" ? (
              <div className="cp-ok">
                <div className="cp-ok-ring">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#c8521a"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="cp-ok-title">Message Sent!</div>
                <p className="cp-ok-sub">
                  Thank you for reaching out. We'll get back to you shortly.
                </p>
                <button className="cp-ok-btn" onClick={() => setStatus("idle")}>
                  Send Another
                </button>
              </div>
            ) : (
              <div className="cp-form-body">
                <form ref={formRef} onSubmit={handleSubmit}>
                  <div className="cp-frow">
                    <div>
                      <label
                        className={`cp-lbl ${
                          focused === "name" ? "active" : ""
                        }`}
                      >
                        Full Name *
                      </label>
                      <input
                        className="cp-inp"
                        type="text"
                        value={form.name}
                        onChange={set("name")}
                        onFocus={() => setFocused("name")}
                        onBlur={() => setFocused(null)}
                        placeholder="John Kamau"
                        required
                      />
                    </div>
                    <div>
                      <label
                        className={`cp-lbl ${
                          focused === "email" ? "active" : ""
                        }`}
                      >
                        Email *
                      </label>
                      <input
                        className="cp-inp"
                        type="email"
                        value={form.email}
                        onChange={set("email")}
                        onFocus={() => setFocused("email")}
                        onBlur={() => setFocused(null)}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="cp-frow">
                    <div>
                      <label
                        className={`cp-lbl ${
                          focused === "phone" ? "active" : ""
                        }`}
                      >
                        Phone
                      </label>
                      <input
                        className="cp-inp"
                        type="tel"
                        value={form.phone}
                        onChange={set("phone")}
                        onFocus={() => setFocused("phone")}
                        onBlur={() => setFocused(null)}
                        placeholder="+254 7XX XXX XXX"
                      />
                    </div>
                    <div>
                      <label
                        className={`cp-lbl ${
                          focused === "subject" ? "active" : ""
                        }`}
                      >
                        Subject
                      </label>
                      <input
                        className="cp-inp"
                        type="text"
                        value={form.subject}
                        onChange={set("subject")}
                        onFocus={() => setFocused("subject")}
                        onBlur={() => setFocused(null)}
                        placeholder="e.g. Product Enquiry"
                      />
                    </div>
                  </div>
                  <div className="cp-field">
                    <label
                      className={`cp-lbl ${
                        focused === "message" ? "active" : ""
                      }`}
                    >
                      Message *
                    </label>
                    <textarea
                      className="cp-inp cp-ta"
                      value={form.message}
                      onChange={set("message")}
                      onFocus={() => setFocused("message")}
                      onBlur={() => setFocused(null)}
                      placeholder="Tell us what you need — products, quantities, delivery location…"
                      required
                    />
                  </div>
                  {status === "error" && (
                    <div className="cp-err">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {errorMsg}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="cp-btn"
                    disabled={status === "sending"}
                  >
                    {status === "sending" ? (
                      <>
                        <div className="cp-spin" /> Sending…
                      </>
                    ) : (
                      <>
                        Send Message
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div className="cp-det-card">
            <div className="cp-det-head">
              <div className="cp-det-eye">Contact Information</div>
              <div className="cp-det-title">Wimwa Tech</div>
            </div>
            {contactItems.map((item) => (
              <div key={item.key} className="cp-det-item">
                <div className="cp-det-ic">{item.icon}</div>
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    paddingRight: item.copyValue ? 54 : 0,
                  }}
                >
                  <div className="cp-det-lbl">{item.label}</div>
                  {item.action ? (
                    <a href={item.action} className="cp-det-link">
                      {item.value}
                    </a>
                  ) : (
                    <div className="cp-det-val">{item.value}</div>
                  )}
                </div>
                {item.copyValue && (
                  <button
                    className={`cp-cp-btn ${copied === item.key ? "ok" : ""}`}
                    onClick={() => copy(item.copyValue, item.key)}
                  >
                    {copied === item.key ? (
                      <>
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>{" "}
                        Copied
                      </>
                    ) : (
                      <>
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="9" y="9" width="13" height="13" rx="2" />
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                        </svg>{" "}
                        Copy
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
            <div className="cp-det-avail">
              <span className="cp-avail-dot" />
              <span className="cp-avail-txt">Available Mon–Sat, 8AM–6PM</span>
            </div>
          </div>
        </div>

        {/* MAP */}
        <div className="cp-map-wrap">
          <div className="cp-map">
            <div className="cp-map-in">
              <span className="cp-map-pin">🌍</span>
              <div className="cp-map-city">Kiserian, Kajiado County</div>
              <div className="cp-map-po">P.O Box 273-00206</div>
              <a
                href="https://maps.google.com/?q=Kiserian,Kajiado,Kenya"
                target="_blank"
                rel="noreferrer"
                className="cp-map-btn"
              >
                Open in Google Maps →
              </a>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="cp-foot">
          <span className="cp-foot-copy">
            © {new Date().getFullYear()} Wimwa Tech General Supplies Limited
          </span>
          <div className="cp-foot-avail">
            <span className="cp-foot-dot" />
            Available Mon–Sat, 8AM–6PM
          </div>
        </footer>
      </div>
    </>
  );
}
