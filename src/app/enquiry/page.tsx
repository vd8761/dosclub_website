"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { site, socials, domains } from "@/data/site";
import RevealText from "@/components/ui/RevealText";
import Footer from "@/components/Footer";

type Category = "students" | "institutions" | "trainers" | "sponsors";

const CATEGORIES: {
  id: Category;
  label: string;
  badge: string;
  desc: string;
  accent: string;
  deliverables: string[];
}[] = [
  {
    id: "students",
    label: "Students & Learners",
    badge: "Community & Skills",
    desc: "Join workshops, find mentors, build shippable open source projects, and level up your engineering career.",
    accent: "var(--color-primary)",
    deliverables: ["Weekly Workshops", "Mentorship", "Open Source Repos", "Global Network"],
  },
  {
    id: "institutions",
    label: "Institutions & Colleges",
    badge: "Academic Partnerships",
    desc: "Partner with DOS Club to set up campus chapters, host symposiums, hackathons, and accredited tech workshops.",
    accent: "var(--color-accent)",
    deliverables: ["Campus Chapters", "Hackathons", "Faculty & Student FDPs", "MoU Collaboration"],
  },
  {
    id: "trainers",
    label: "Trainers & Mentors",
    badge: "Knowledge Sharing",
    desc: "Lead domain tracks, mentor eager students, run build clinics, and share real-world engineering practices.",
    accent: "var(--color-primary-dark)",
    deliverables: ["Live Masterclasses", "Code Reviews", "Curriculum Design", "Speaker Series"],
  },
  {
    id: "sponsors",
    label: "Sponsors & Corporate",
    badge: "Industry Backing",
    desc: "Support open source hackathons, sponsor fellowships, and hire proven builders directly from our community.",
    accent: "var(--color-accent-dark)",
    deliverables: ["Talent Pipeline", "Brand Visibility", "Hackathon Sponsorship", "Tech Fellowships"],
  },
];

const EXPERIENCE = ["Just starting", "Some projects", "Comfortable shipping"];

type Status = "idle" | "sending" | "sent" | "error";

function EnquiryFormContent() {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  useEffect(() => {
    const roleParam = searchParams.get("role") || searchParams.get("type");
    if (roleParam) {
      const match = CATEGORIES.find(
        (c) => c.id === roleParam.toLowerCase() || c.label.toLowerCase().includes(roleParam.toLowerCase())
      );
      if (match) {
        setActiveCategory(match.id);
      }
    }
  }, [searchParams]);

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [copySent, setCopySent] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    message: "",
    experience: EXPERIENCE[0],
    company: "", // honeypot
  });

  const [interests, setInterests] = useState<string[]>([]);

  const toggleInterest = (title: string) =>
    setInterests((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;

    setStatus("sending");
    setError("");

    const categoryObj = CATEGORIES.find((c) => c.id === activeCategory);
    const categoryName = categoryObj ? categoryObj.label : activeCategory;

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          category: categoryName,
          interests: activeCategory === "students" ? interests : undefined,
          experience: activeCategory === "students" ? form.experience : undefined,
        }),
      });

      const body = (await res.json().catch(() => null)) as {
        error?: string;
        copySent?: boolean;
      } | null;

      if (!res.ok) {
        setError(body?.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setCopySent(body?.copySent !== false);
      setStatus("sent");
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    }
  };

  const currentRole = CATEGORIES.find((c) => c.id === activeCategory);
  const sending = status === "sending";

  return (
    <main className="min-h-screen bg-ink text-fg selection:bg-primary selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-line bg-surface/90 backdrop-blur-md">
        <div className="container-x flex h-16 items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.webp" alt="DOS Club" className="h-9 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="font-mono text-xs font-bold uppercase tracking-wider text-muted hover:text-fg transition-colors"
            >
              ← Back to Home
            </Link>
            <a
              href="http://membership.descienceosclub.com/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center bg-primary-dark px-5 py-2 font-mono text-[11px] font-bold uppercase tracking-wider !text-white hover:!text-white transition-colors hover:bg-primary rounded-full"
              style={{ color: "#ffffff" }}
            >
              Become a Member
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="py-12 md:py-16">
        <div className="container-x max-w-6xl">
          {/* Header */}
          <div className="max-w-3xl mb-12">
            <p className="label mb-3 text-primary-dark">/ Reach out & Connect</p>
            <h1 className="display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              <RevealText text="Let's collaborate &" as="span" className="block" />
              <RevealText text="build the future." as="span" className="block text-gradient" />
            </h1>
            <p className="mt-4 text-muted text-base sm:text-lg leading-relaxed">
              Select your track below to get started with tailored pathways, partnership enquiries, or membership queries.
            </p>
          </div>

          {/* STEP 1: 4-Column Track Cards */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted">
                Step 1: Select your role
              </p>
              {activeCategory && (
                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  className="font-mono text-xs font-semibold text-primary-dark hover:underline"
                >
                  Reset selection ×
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {CATEGORIES.map((c) => {
                const selected = activeCategory === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(c.id);
                      if (status === "sent") setStatus("idle");
                    }}
                    className={`group relative flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-300 ${
                      selected
                        ? "border-primary bg-surface shadow-[0_16px_40px_-16px_rgba(76,175,80,0.3)] ring-2 ring-primary -translate-y-1"
                        : "border-line bg-surface/60 hover:border-accent/50 hover:bg-surface hover:-translate-y-0.5"
                    }`}
                  >
                    <span
                      aria-hidden
                      className="absolute inset-x-6 top-0 h-1 rounded-b-full transition-opacity duration-300"
                      style={{
                        background: c.accent,
                        opacity: selected ? 1 : 0,
                      }}
                    />

                    <div>
                      <span className="inline-block rounded-full bg-ink-2 px-2.5 py-1 font-mono text-[9.5px] font-bold uppercase tracking-wider text-muted group-hover:text-fg transition-colors">
                        {c.badge}
                      </span>
                      <h3 className="display mt-3 text-lg font-bold">{c.label}</h3>
                      <p className="mt-1.5 text-xs text-muted leading-relaxed">{c.desc}</p>
                    </div>

                    <div className="mt-5 border-t border-line/60 pt-3 flex items-center justify-between">
                      <span className="font-mono text-[11px] font-semibold text-primary-dark">
                        {selected ? "Selected ✓" : "Select track →"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: The Redesigned Form Container */}
          <div>
            {!activeCategory ? (
              /* Empty selection prompt state */
              <div className="rounded-3xl border border-dashed border-line bg-surface/30 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-ink-2 text-xl font-mono text-muted">
                  +
                </div>
                <h3 className="display mt-4 text-xl font-bold text-fg">
                  Select a role above to proceed
                </h3>
                <p className="mt-2 max-w-sm text-sm text-muted">
                  Pick your track to unlock the personalized application form.
                </p>
              </div>
            ) : status === "sent" ? (
              /* Success Confirmation */
              <div className="rounded-3xl border border-line bg-surface p-10 sm:p-14 shadow-lg text-center max-w-2xl mx-auto flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary font-mono text-2xl text-white shadow-md">
                  ✓
                </div>
                <h2 className="display mt-6 text-3xl font-bold">Enquiry Received!</h2>
                <p className="mt-4 text-muted leading-relaxed">
                  {copySent ? (
                    <>
                      Thank you for contacting us regarding the{" "}
                      <span className="font-semibold text-fg">{currentRole?.label}</span> pathway.
                      We&apos;ve sent a confirmation email to{" "}
                      <span className="font-semibold text-fg">{form.email}</span>.
                    </>
                  ) : (
                    <>
                      Your message has been received by the club coordinators. Our team will review your enquiry and get in touch within 2 business days.
                    </>
                  )}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStatus("idle");
                      setActiveCategory(null);
                    }}
                    className="btn btn-primary !py-3"
                  >
                    Submit another enquiry
                  </button>
                  <Link href="/" className="btn btn-ghost !py-3">
                    Back to homepage
                  </Link>
                </div>
              </div>
            ) : (
              /* High-End Studio Form UI */
              <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl">
                {/* Form Top Banner */}
                <div className="border-b border-line bg-ink-2/60 px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 font-mono text-sm font-bold text-primary-dark border border-primary/20">
                      02
                    </span>
                    <div>
                      <h2 className="display text-xl font-bold">
                        {currentRole?.label} Application
                      </h2>
                      <p className="text-xs text-muted">
                        Please fill out the specifications below.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {currentRole?.deliverables.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-line bg-surface px-3 py-1 font-mono text-[10px] font-semibold text-muted"
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Form Inputs Grid */}
                <form onSubmit={submit} className="p-8 sm:p-10 flex flex-col gap-8">
                  {/* Personal & Contact Details Section */}
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary-dark">
                        Part A &middot; Contact & Profile
                      </span>
                      <span className="h-px flex-1 bg-line/60" />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      {/* Name */}
                      <div className="group flex flex-col gap-2">
                        <label
                          htmlFor="enquiry-name"
                          className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted group-focus-within:text-primary-dark transition-colors"
                        >
                          Full Name <span className="text-primary">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="enquiry-name"
                            name="name"
                            required
                            maxLength={100}
                            placeholder="e.g. Alex Kumar"
                            className="w-full rounded-2xl border border-line bg-ink-2/30 px-4 py-3.5 text-sm text-fg placeholder:text-muted/50 outline-none transition-all duration-200 focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/10"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="group flex flex-col gap-2">
                        <label
                          htmlFor="enquiry-email"
                          className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted group-focus-within:text-primary-dark transition-colors"
                        >
                          Email Address <span className="text-primary">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="enquiry-email"
                            name="email"
                            required
                            type="email"
                            maxLength={254}
                            placeholder="alex@example.com"
                            className="w-full rounded-2xl border border-line bg-ink-2/30 px-4 py-3.5 text-sm text-fg placeholder:text-muted/50 outline-none transition-all duration-200 focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/10"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="group flex flex-col gap-2">
                        <label
                          htmlFor="enquiry-phone"
                          className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted group-focus-within:text-primary-dark transition-colors"
                        >
                          Phone / WhatsApp Number
                        </label>
                        <input
                          id="enquiry-phone"
                          name="phone"
                          type="tel"
                          maxLength={30}
                          placeholder="+91 98765 43210"
                          className="w-full rounded-2xl border border-line bg-ink-2/30 px-4 py-3.5 text-sm text-fg placeholder:text-muted/50 outline-none transition-all duration-200 focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/10"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                      </div>

                      {/* Organization / College */}
                      <div className="group flex flex-col gap-2">
                        <label
                          htmlFor="enquiry-org"
                          className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted group-focus-within:text-primary-dark transition-colors"
                        >
                          {activeCategory === "institutions"
                            ? "Institution / College Name *"
                            : activeCategory === "sponsors"
                              ? "Company / Organization Name *"
                              : "College / Workplace"}
                        </label>
                        <input
                          id="enquiry-org"
                          name="organization"
                          required={
                            activeCategory === "institutions" || activeCategory === "sponsors"
                          }
                          maxLength={120}
                          placeholder={
                            activeCategory === "institutions"
                              ? "e.g. PERI Institute of Technology"
                              : activeCategory === "sponsors"
                                ? "e.g. Acme Technologies Pvt Ltd"
                                : "e.g. Anna University / Freelancer"
                          }
                          className="w-full rounded-2xl border border-line bg-ink-2/30 px-4 py-3.5 text-sm text-fg placeholder:text-muted/50 outline-none transition-all duration-200 focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/10"
                          value={form.organization}
                          onChange={(e) => setForm({ ...form, organization: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Honeypot field */}
                  <div aria-hidden className="hidden">
                    <input
                      name="company"
                      type="text"
                      tabIndex={-1}
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                    />
                  </div>

                  {/* Category Specific Sections */}
                  {activeCategory === "students" && (
                    <div>
                      <div className="mb-4 flex items-center gap-2">
                        <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary-dark">
                          Part B &middot; Learning Track & Experience
                        </span>
                        <span className="h-px flex-1 bg-line/60" />
                      </div>

                      <div className="flex flex-col gap-6">
                        {/* Domain selection chips */}
                        <div>
                          <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted mb-3">
                            Domains of Interest (Multi-select)
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {domains.map((d) => {
                              const on = interests.includes(d.title);
                              return (
                                <button
                                  key={d.no}
                                  type="button"
                                  onClick={() => toggleInterest(d.title)}
                                  className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all duration-200 ${
                                    on
                                      ? "border-primary bg-primary/10 text-primary-dark font-bold shadow-sm ring-1 ring-primary"
                                      : "border-line bg-ink-2/40 text-muted hover:border-accent/40 hover:text-fg"
                                  }`}
                                >
                                  {/* Custom Checkbox Box */}
                                  <span
                                    aria-hidden
                                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border text-[10px] font-bold transition-all duration-200 ${
                                      on
                                        ? "border-primary bg-primary text-white"
                                        : "border-line bg-surface text-transparent"
                                    }`}
                                  >
                                    ✓
                                  </span>
                                  <span className="text-xs">{d.title}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Experience level pills */}
                        <div>
                          <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted mb-3">
                            Current Experience Level
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {EXPERIENCE.map((x) => {
                              const on = form.experience === x;
                              return (
                                <button
                                  key={x}
                                  type="button"
                                  onClick={() => setForm({ ...form, experience: x })}
                                  className={`flex items-center justify-center rounded-2xl border p-3.5 font-mono text-xs transition-all duration-200 ${
                                    on
                                      ? "border-primary-dark bg-primary-dark text-white font-bold shadow-sm"
                                      : "border-line bg-ink-2/40 text-muted hover:border-accent hover:text-fg"
                                  }`}
                                >
                                  {x}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message & Proposal Section */}
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary-dark">
                        Part {activeCategory === "students" ? "C" : "B"} &middot; Details & Goals
                      </span>
                      <span className="h-px flex-1 bg-line/60" />
                    </div>

                    <div className="group flex flex-col gap-2">
                      <label
                        htmlFor="enquiry-message"
                        className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted group-focus-within:text-primary-dark transition-colors"
                      >
                        {activeCategory === "institutions"
                          ? "Collaboration Objectives & Requirements *"
                          : activeCategory === "trainers"
                            ? "Industry Expertise, Stack & Session Proposals *"
                            : activeCategory === "sponsors"
                              ? "Partnership, Sponsorship or Hiring Scope *"
                              : "What do you want to learn or build with us? *"}
                      </label>
                      <textarea
                        id="enquiry-message"
                        name="message"
                        required
                        rows={4}
                        maxLength={4000}
                        placeholder={
                          activeCategory === "institutions"
                            ? "Share details about your upcoming semester requirements, workshops, symposiums, or campus chapter setup..."
                            : activeCategory === "trainers"
                              ? "Share your engineering background, topics you'd love to mentor on, and preferred session formats..."
                              : activeCategory === "sponsors"
                                ? "Describe your organization's sponsorship goals, hackathon partnership, or talent requirements..."
                                : "Tell us what excites you about open source, AI engineering, and what projects you'd like to ship..."
                        }
                        className="w-full rounded-2xl border border-line bg-ink-2/30 p-4 text-sm text-fg placeholder:text-muted/50 outline-none transition-all duration-200 focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/10 resize-none"
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Error display */}
                  {status === "error" && error && (
                    <div
                      role="alert"
                      className="rounded-2xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-700 font-medium"
                    >
                      {error}
                    </div>
                  )}

                  {/* Submission Row */}
                  <div className="border-t border-line/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-full bg-primary-dark px-8 py-4 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all duration-200 hover:bg-primary hover:shadow-primary/25 disabled:opacity-60"
                    >
                      <span>{sending ? "Processing..." : "Submit Application"}</span>
                      <span>→</span>
                    </button>
                    <p className="font-mono text-xs text-muted text-center sm:text-right">
                      Direct notification dispatched to DOS Club mentors.
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default function EnquiryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <EnquiryFormContent />
    </Suspense>
  );
}
