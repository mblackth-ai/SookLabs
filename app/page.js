"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function LogoMark({ size = 32, priority = false }) {
  return (
    <Image
      src="/sooklabs-glyph.png"
      alt="SookLabs"
      width={size}
      height={size}
      className="rounded-lg"
      priority={priority}
    />
  );
}

function BuildAreaIcon({ type }) {
  const icons = {
    chat: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M7 8.5h10M7 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 5.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3v-3.5A2 2 0 0 1 5 14.5v-7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    seo: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 18V6.5A1.5 1.5 0 0 1 5.5 5H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 16l3-3 2.5 2.5L18 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 5h3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    workflow: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="17" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="17" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9.2 8.8 10.8 15M14.8 8.8 13.2 15M9.5 7h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    data: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M6 7h12M6 12h12M6 17h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  };

  return (
    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-600">
      {icons[type]}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. HEADER
// ─────────────────────────────────────────────────────────────────────────────
function Header() {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { label: "Sookly", href: "#sookly" },
    { label: "Clinic SEO Snapshot", href: "#snapshot" },
    { label: "What We Build", href: "#builds" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <LogoMark size={32} priority />
          <span className="font-semibold text-slate-950 text-lg tracking-tight">
            SookLabs
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm text-slate-500 hover:text-slate-950 transition-colors font-medium"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://sookly.co"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-sky-100"
          >
            Explore Sookly
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="md:hidden p-3 -mr-2 text-slate-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {open ? (
              <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            ) : (
              <>
                <path d="M3 6H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3 10H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3 14H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div id="mobile-nav" className="md:hidden border-t border-slate-100 bg-white px-6 py-5 flex flex-col gap-2">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm text-slate-700 font-medium py-3 min-h-[44px] flex items-center"
            >
              {l.label}
            </a>
          ))}
          <a
            href="https://sookly.co"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 px-4 py-3 min-h-[44px] bg-sky-500 text-white text-sm font-semibold rounded-xl text-center flex items-center justify-center"
          >
            Explore Sookly
          </a>
        </div>
      )}
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCKUP CARDS (used inside hero and feature sections)
// ─────────────────────────────────────────────────────────────────────────────

function SooklyMockup() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-sky-400" />
        <span className="text-xs font-semibold text-slate-700">Sookly Chat Ops</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {["LINE", "Facebook", "WhatsApp", "Website"].map((ch) => (
          <span
            key={ch}
            className="text-[10px] font-medium px-2 py-0.5 bg-sky-50 text-sky-700 rounded-full border border-sky-100"
          >
            {ch}
          </span>
        ))}
      </div>
      <div className="space-y-1.5">
        {[
          { label: "New enquiry", status: "Incoming", dot: "bg-sky-400" },
          { label: "Staff handoff", status: "Assigned", dot: "bg-amber-400" },
          { label: "Booked", status: "Confirmed", dot: "bg-emerald-400" },
        ].map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between px-2 py-1.5 bg-slate-50 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${r.dot}`} />
              <span className="text-[11px] text-slate-700">{r.label}</span>
            </div>
            <span className="text-[10px] text-slate-400">{r.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeoMockup() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-xs font-semibold text-slate-700">Clinic SEO Snapshot</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Organic Clicks", value: "1,240", delta: "+12%", c: "text-emerald-500" },
          { label: "Impressions", value: "18.4k", delta: "+8%", c: "text-emerald-500" },
          { label: "Tech Health", value: "84/100", delta: "Good", c: "text-sky-500" },
          { label: "Top Opportunity", value: "3 pages", delta: "Fix now", c: "text-amber-500" },
        ].map((m) => (
          <div key={m.label} className="bg-slate-50 rounded-xl p-2.5">
            <div className="text-[9px] text-slate-400 mb-0.5 uppercase tracking-wide">{m.label}</div>
            <div className="text-sm font-bold text-slate-900">{m.value}</div>
            <div className={`text-[10px] font-medium ${m.c}`}>{m.delta}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkflowMockup() {
  const steps = ["Capture", "Qualify", "Route", "Follow up"];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-violet-400" />
        <span className="text-xs font-semibold text-slate-700">Workflow Automation</span>
      </div>
      <div className="flex items-center gap-1 mb-3">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-1">
            <div className="flex-1 py-1.5 bg-sky-50 border border-sky-100 rounded-lg text-center text-[9px] font-semibold text-sky-700">
              {s}
            </div>
            {i < steps.length - 1 && (
              <svg width="8" height="8" viewBox="0 0 8 8" className="text-slate-300 flex-shrink-0">
                <path d="M1 4H7M4 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            )}
          </div>
        ))}
      </div>
      <div className="bg-slate-50 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] text-slate-500">3 enquiries routed today — 0 dropped</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. HERO SECTION
// ─────────────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Radial glow behind hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-50"
        style={{ background: "radial-gradient(ellipse at center, #e0f2fe 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto relative">
        {/* Eyebrow */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-100 text-sky-700 text-xs font-semibold px-4 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            SookLabs — Product Lab
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-center text-4xl sm:text-5xl md:text-[64px] font-bold text-slate-950 tracking-tight leading-[1.08] max-w-3xl mx-auto mb-6">
          Practical AI, SEO, and workflow tools for service businesses
        </h1>

        {/* Subheading */}
        <p className="text-center text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto mb-10">
          SookLabs builds focused systems that help small service teams capture demand, understand missed opportunities, and manage follow-up with less chaos. Our first commercial product is{" "}
          <a
            href="https://sookly.co"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-600 font-semibold hover:underline"
          >
            Sookly
          </a>
          , a chat operations platform for clinics.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <a
            href="https://sookly.co"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-7 py-3 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-sky-200"
          >
            Explore Sookly
          </a>
          <a
            href="mailto:sookly.app@gmail.com?subject=Clinic%20SEO%20Snapshot%20Request"
            className="w-full sm:w-auto px-7 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
          >
            Request a Clinic SEO Snapshot
          </a>
        </div>

        {/* Hero visual — 3 mockup cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <SooklyMockup />
          <SeoMockup />
          <WorkflowMockup />
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. CAPABILITY STRIP
// ─────────────────────────────────────────────────────────────────────────────
function CapabilityStrip() {
  const badges = [
    "Google Search Console",
    "PageSpeed Insights",
    "Google Sheets",
    "Apps Script",
    "LINE",
    "Facebook Messenger",
    "WhatsApp",
    "Website Chat",
  ];

  return (
    <section className="py-12 border-y border-slate-100 bg-slate-50/60">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-6">
          Built around practical tools for clinics, service businesses, and small teams
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {badges.map((b) => (
            <span
              key={b}
              className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-full text-sm text-slate-600 font-medium shadow-sm"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. FEATURED PRODUCT — SOOKLY
// ─────────────────────────────────────────────────────────────────────────────
function SooklyProductSection() {
  return (
    <section id="sookly" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* Left — copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-100 text-sky-600 text-xs font-semibold px-3 py-1 rounded-full mb-5">
              Featured Product
            </div>
            <h2 className="text-4xl font-bold text-slate-950 tracking-tight mb-4">
              Sookly — chat operations for clinics
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed mb-8">
              Bring clinic enquiries from LINE, Facebook, WhatsApp, and website chat into one unified workflow. No more missed messages scattered across apps.
            </p>

            <ul className="space-y-3 mb-10">
              {[
                "Unified inbox across all chat channels",
                "Lead capture and staff handoff workflows",
                "Appointment booking status tracking",
                "Built for clinic reception teams",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 flex-shrink-0 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                  </div>
                  <span className="text-sm text-slate-600">{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-4">
              <a
                href="https://sookly.co"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Visit Sookly.co →
              </a>
              <span className="text-xs text-slate-400">sookly.co</span>
            </div>
          </div>

          {/* Right — expanded inbox mockup */}
          <div className="bg-gradient-to-br from-sky-50 to-white rounded-3xl border border-sky-100 p-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

              {/* Inbox header */}
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">Sookly Inbox</span>
                <div className="flex gap-1.5">
                  {["LINE", "FB", "WA", "Web"].map((ch) => (
                    <span
                      key={ch}
                      className="text-[10px] px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full font-semibold"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </div>

              {/* Enquiry rows */}
              <div className="divide-y divide-slate-50">
                {[
                  { channel: "LINE", name: "Naphat K.", msg: "What times are available this week?", time: "2m", status: "New" },
                  { channel: "FB", name: "Sunisa T.", msg: "Is Dr. Aom available on Monday?", time: "14m", status: "Assigned" },
                  { channel: "WA", name: "Maria L.", msg: "I'd like to book a check-up please", time: "1h", status: "Booked" },
                  { channel: "Web", name: "James W.", msg: "First-time patient, need information", time: "3h", status: "New" },
                ].map((r) => {
                  const statusStyle =
                    r.status === "New"
                      ? "bg-sky-50 text-sky-600"
                      : r.status === "Assigned"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-emerald-50 text-emerald-600";
                  const dot =
                    r.status === "New"
                      ? "bg-sky-400"
                      : r.status === "Assigned"
                      ? "bg-amber-400"
                      : "bg-emerald-400";
                  return (
                    <div key={r.name} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50/60">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-slate-800">{r.name}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                            {r.channel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{r.msg}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-[10px] text-slate-400">{r.time}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${statusStyle}`}>
                          {r.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. TOOL SHOWCASE — CLINIC SEO SNAPSHOT
// ─────────────────────────────────────────────────────────────────────────────
function SeoSnapshotSection() {
  return (
    <section id="snapshot" className="py-24 px-6 bg-slate-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* Left — SEO dashboard mockup */}
          <div className="bg-gradient-to-br from-white to-sky-50/40 rounded-3xl border border-slate-200 p-6 order-2 lg:order-1">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">Clinic SEO Snapshot</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                  Connected
                </span>
              </div>

              {/* Metrics grid */}
              <div className="p-4 grid grid-cols-2 gap-2.5">
                {[
                  { label: "Organic Clicks", value: "1,240", delta: "+12% MoM", c: "text-emerald-500" },
                  { label: "Impressions", value: "18,400", delta: "+8% MoM", c: "text-emerald-500" },
                  { label: "Technical Health", value: "84/100", delta: "Good", c: "text-sky-500" },
                  { label: "Top Opportunity", value: "3 pages", delta: "High priority", c: "text-amber-500" },
                ].map((m) => (
                  <div key={m.label} className="bg-slate-50 rounded-xl p-3">
                    <div className="text-[10px] text-slate-400 mb-1 uppercase tracking-wide">{m.label}</div>
                    <div className="text-xl font-bold text-slate-900 mb-0.5">{m.value}</div>
                    <div className={`text-[10px] font-semibold ${m.c}`}>{m.delta}</div>
                  </div>
                ))}
              </div>

              {/* Action items */}
              <div className="px-4 pb-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Action Items
                </div>
                {[
                  { item: "Missing meta descriptions", priority: "Critical", s: "bg-red-50 text-red-600" },
                  { item: "Core Web Vitals — LCP", priority: "High", s: "bg-amber-50 text-amber-600" },
                  { item: "Internal linking gaps", priority: "Medium", s: "bg-sky-50 text-sky-600" },
                ].map((a) => (
                  <div key={a.item} className="flex items-center justify-between py-1.5">
                    <span className="text-xs text-slate-600">{a.item}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${a.s}`}>
                      {a.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — copy */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-semibold px-3 py-1 rounded-full mb-5">
              Tool Showcase
            </div>
            <h2 className="text-4xl font-bold text-slate-950 tracking-tight mb-4">
              Clinic SEO Snapshot
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed mb-8">
              A one-click visibility audit built with Google Sheets, Apps Script, Search Console, and PageSpeed Insights. No paid reporting add-ons required.
            </p>

            <div className="space-y-3 mb-10">
              {[
                {
                  title: "One-click audit flow",
                  desc: "Connect search and performance data into a client-ready snapshot.",
                },
                {
                  title: "No Supermetrics required",
                  desc: "Built entirely with Google's free data stack — Sheets, Apps Script, APIs.",
                },
                {
                  title: "Actionable output",
                  desc: "Priority list your team can actually act on, not a wall of metrics.",
                },
              ].map((c) => (
                <div
                  key={c.title}
                  className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors"
                >
                  <div className="text-sm font-semibold text-slate-800 mb-1">{c.title}</div>
                  <div className="text-xs text-slate-500">{c.desc}</div>
                </div>
              ))}
            </div>

            <a
              href="mailto:sookly.app@gmail.com?subject=Clinic%20SEO%20Snapshot%20Request"
              className="inline-flex px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Request a Snapshot →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. WHAT SOOKLABS BUILDS
// ─────────────────────────────────────────────────────────────────────────────
function WhatWeBuildsSection() {
  const areas = [
    {
      icon: "chat",
      title: "Chat operations",
      desc: "Unified inbox workflows for clinics managing enquiries across multiple chat channels. Capture first, route second, follow up always.",
      tag: "Sookly",
    },
    {
      icon: "seo",
      title: "SEO and data tools",
      desc: "Lightweight audit and reporting systems built on Google's free data stack. Visibility insights without the enterprise price tag.",
      tag: "SEO Snapshot",
    },
    {
      icon: "workflow",
      title: "Workflow automation",
      desc: "Small automation systems that reduce repetitive admin while keeping humans in control of important handoffs.",
      tag: "Custom builds",
    },
    {
      icon: "data",
      title: "Data-backed action lists",
      desc: "Turn scattered data into simple next steps your team can actually act on. Prioritised, clear, and tied to outcomes.",
      tag: "Reporting",
    },
  ];

  return (
    <section id="builds" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            What SookLabs Builds
          </div>
          <h2 className="text-4xl font-bold text-slate-950 tracking-tight mb-4">
            Focused tools, built around real operating problems
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Small teams don&apos;t need more bloated software. They need focused systems that make work easier to manage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {areas.map((a) => (
            <div
              key={a.title}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-sm hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <BuildAreaIcon type={a.icon} />
                <span className="text-xs bg-sky-50 text-sky-600 border border-sky-100 px-2.5 py-0.5 rounded-full font-semibold">
                  {a.tag}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{a.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. PROOF OF WORK
// ─────────────────────────────────────────────────────────────────────────────
function ProofOfWorkSection() {
  return (
    <section className="py-24 px-6 bg-slate-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            Proof of Work
          </div>
          <h2 className="text-4xl font-bold text-slate-950 tracking-tight mb-3">
            Systems that exist, not promises that might
          </h2>
          <p className="text-slate-500 text-lg">
            Real outputs. No filler metrics.
          </p>
        </div>

        {/* Proof cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            {
              badge: "Built",
              badgeStyle: "bg-emerald-50 border-emerald-100 text-emerald-700",
              title: "Working SEO audit pipeline",
              desc: "Google Sheet button → Apps Script → Search Console API → PageSpeed API → dashboard output.",
            },
            {
              badge: "In progress",
              badgeStyle: "bg-sky-50 border-sky-100 text-sky-700",
              title: "Sookly product direction",
              desc: "Unified inbox and clinic chat operations designed around lead capture and follow-up.",
            },
            {
              badge: "Principle",
              badgeStyle: "bg-slate-100 border-slate-200 text-slate-600",
              title: "Practical systems philosophy",
              desc: "Small teams do not need more bloated software. They need focused systems that make work easier to manage.",
            },
          ].map((p) => (
            <div key={p.title} className="bg-white border border-slate-200 rounded-2xl p-6">
              <span
                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border mb-4 ${p.badgeStyle}`}
              >
                {p.badge}
              </span>
              <h3 className="text-base font-semibold text-slate-900 mb-2">{p.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Honest stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { metric: "3 systems", sub: "Sookly, SEO Snapshot, workflow automation", label: "In progress" },
            { metric: "2 data sources", sub: "Search Console and PageSpeed Insights", label: "Core integrations" },
            { metric: "1 clear goal", sub: "Capture demand before it is lost", label: "Mission" },
          ].map((s) => (
            <div
              key={s.metric}
              className="bg-white border border-slate-200 rounded-2xl p-6 text-center"
            >
              <div className="text-3xl font-bold text-slate-950 mb-1">{s.metric}</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {s.label}
              </div>
              <div className="text-sm text-slate-500">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. FOUNDER NOTE
// ─────────────────────────────────────────────────────────────────────────────
function FounderNote() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-sky-50 to-white border border-sky-100 rounded-3xl p-10 md:p-14">
          <div className="text-[11px] font-bold text-sky-500 uppercase tracking-widest mb-7">
            A note from the founder
          </div>

          <blockquote className="text-xl md:text-2xl font-medium text-slate-800 leading-relaxed mb-8">
            &ldquo;SookLabs started because I kept seeing the same problem: small service businesses
            losing enquiries to chaos — wrong channels, no follow-up, no visibility. The goal
            isn&apos;t to build more software. It&apos;s to build the right systems.&rdquo;
          </blockquote>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-sky-100 border-2 border-sky-200 flex items-center justify-center flex-shrink-0" aria-hidden>
              <span className="text-sky-600 font-bold text-sm">SL</span>
            </div>
            <div>
              <div className="font-semibold text-slate-900">Founder</div>
              <div className="text-sm text-slate-400">SookLabs</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. FAQ
// ─────────────────────────────────────────────────────────────────────────────
function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "What is SookLabs?",
      a: "SookLabs is the product lab behind practical AI, SEO, and workflow tools for service businesses. It acts as the parent proof hub for tools like Sookly and Clinic SEO Snapshot.",
    },
    {
      q: "What is Sookly?",
      a: "Sookly is a unified inbox and chat operations platform built for clinics. It brings enquiries from LINE, Facebook, WhatsApp, and website chat into one managed workflow.",
    },
    {
      q: "What is Clinic SEO Snapshot?",
      a: "A lightweight visibility audit tool that connects Google Sheets, Apps Script, Google Search Console, and PageSpeed Insights to produce a clear SEO report for clinic websites.",
    },
    {
      q: "Is SookLabs an agency?",
      a: "Not exactly. SookLabs builds focused tools and workflows. Some tools may lead to setup or consulting work, but the goal is practical productized systems — not open-ended retainers.",
    },
    {
      q: "Do I need technical knowledge to request a snapshot?",
      a: "No. You only need a website and access to your Google Search Console property if you want live data. We handle the technical side of the audit.",
    },
    {
      q: "Is SookLabs replacing Sookly?",
      a: "No. Sookly is the main commercial product. SookLabs is the parent proof hub — the lab that builds and validates the tools behind it.",
    },
  ];

  return (
    <section id="faq" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-950 tracking-tight mb-3">
            Frequently asked questions
          </h2>
          <p className="text-slate-500">Got questions? Here are the most common ones.</p>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, i) => {
            const panelId = `faq-panel-${i}`;
            const buttonId = `faq-button-${i}`;
            const isOpen = openIndex === i;

            return (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
            >
              <button
                id={buttonId}
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full text-left px-6 py-4 min-h-[44px] flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                <span className="text-sm font-semibold text-slate-900">{faq.q}</span>
                <span
                  className={`text-slate-400 text-lg leading-none flex-shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-45" : ""
                  }`}
                  aria-hidden
                >
                  +
                </span>
              </button>
              {isOpen && (
                <div id={panelId} role="region" aria-labelledby={buttonId} className="px-6 pb-5">
                  <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. FINAL CTA
// ─────────────────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="py-24 px-6 bg-slate-50/50">
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-gradient-to-br from-sky-500 to-sky-600 rounded-3xl p-12 md:p-16 text-center overflow-hidden">
          {/* Decorative circles */}
          <div
            aria-hidden
            className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10"
          />
          <div
            aria-hidden
            className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-white/10"
          />

          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              Ready to see where demand is being missed?
            </h2>
            <p className="text-sky-100 text-lg max-w-xl mx-auto mb-10">
              Explore Sookly if your clinic is losing enquiries across chat channels.
              Request a Clinic SEO Snapshot if you want a clearer view of your website
              visibility and search opportunities.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="https://sookly.co"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-3 bg-white text-sky-600 font-semibold rounded-xl hover:bg-sky-50 transition-colors text-sm"
              >
                Explore Sookly →
              </a>
              <a
                href="mailto:sookly.app@gmail.com?subject=Clinic%20SEO%20Snapshot%20Request"
                className="w-full sm:w-auto px-7 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl border border-white/30 transition-colors text-sm"
              >
                Request SEO Snapshot
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. FOOTER
// ─────────────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-slate-100 py-14 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <LogoMark size={32} />
              <span className="font-semibold text-slate-950 text-lg tracking-tight">SookLabs</span>
            </div>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
              Practical AI, SEO, and workflow tools for service businesses.
            </p>
          </div>

          {/* Product column */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Product
            </div>
            <ul className="space-y-2.5">
              <li>
                <a href="https://sookly.co" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-slate-600 hover:text-slate-950 transition-colors">
                  Sookly
                </a>
              </li>
              <li>
                <a href="mailto:sookly.app@gmail.com?subject=Clinic%20SEO%20Snapshot%20Request"
                  className="text-sm text-slate-600 hover:text-slate-950 transition-colors">
                  Clinic SEO Snapshot
                </a>
              </li>
            </ul>
          </div>

          {/* Build areas column */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Build Areas
            </div>
            <ul className="space-y-2.5">
              {["Chat operations", "SEO and data tools", "Workflow automation"].map((a) => (
                <li key={a}>
                  <span className="text-sm text-slate-600">{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-400">© 2026 SookLabs. All rights reserved.</span>
          <a
            href="mailto:sookly.app@gmail.com"
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            sookly.app@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function SookLabsPage() {
  return (
    <main id="main-content" className="bg-white text-slate-950 antialiased">
      <Header />
      <HeroSection />
      <CapabilityStrip />
      <SooklyProductSection />
      <SeoSnapshotSection />
      <WhatWeBuildsSection />
      <ProofOfWorkSection />
      <FounderNote />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
