"use client";

import Image from "next/image";
import Link from "next/link";
import { nav, socials, site } from "@/data/site";

function SocialIcon({ label }: { label: string }) {
  switch (label) {
    case "Instagram":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
      );
    case "LinkedIn":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
      );
    case "Facebook":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
      );
    case "YouTube":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
      );
    case "WhatsApp":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
          <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Footer() {
  const muted = "var(--color-on-deep-muted)";

  return (
    <footer className="relative bg-deep text-[color:var(--color-on-deep)]">
      <div className="container-x py-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8 lg:gap-12">
          {/* Column 1: Identity */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col items-start gap-4">
            <Link
              href="/"
              className="inline-flex shrink-0 items-center gap-2"
              aria-label="Back to top"
            >
              <Image
                src="/dos-badge.png"
                alt=""
                width={28}
                height={28}
                className="h-7 w-7"
              />
              <span className="font-display text-sm font-semibold">
                {site.name}
              </span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: muted }}>
              {site.tagline} A community for students to learn, build, and contribute to the open-source world together.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="md:col-span-3 lg:col-span-3 lg:col-start-6">
            <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em] opacity-50">
              Explore
            </h3>
            <nav className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={`/${n.href}`}
                  className="transition-colors hover:text-[color:var(--color-on-deep)]"
                  style={{ color: muted }}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Contact & Socials */}
          <div className="md:col-span-4 lg:col-span-3">
            <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em] opacity-50">
              Connect
            </h3>
            <div className="flex flex-col gap-4 text-sm">
              <a
                href={`mailto:${site.email}`}
                className="inline-flex items-center gap-2 transition-colors hover:text-[color:var(--color-on-deep)]"
                style={{ color: muted }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                {site.email}
              </a>
              <div className="h-px w-8 bg-[color:var(--color-on-deep)] opacity-10" />
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 transition-all hover:-translate-y-0.5 hover:text-[color:var(--color-on-deep)]"
                    style={{ color: muted }}
                  >
                    <span className="opacity-80"><SocialIcon label={s.label} /></span>
                    <span className="text-xs">{s.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hairline legal strip */}
        <div
          className="mt-6 border-t pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ borderColor: "rgba(255,255,255,0.1)", color: muted }}
        >
          <p className="text-center sm:text-left">
            (c) {new Date().getFullYear()} {site.name}. Built in the open.
          </p>
          <p className="font-mono text-[10.5px] tracking-wider text-muted">
            DESCIENCE OPEN SOURCE CLUB // COMMUNITY
          </p>
        </div>
      </div>
    </footer>
  );
}
