"use client";

import Image from "next/image";
import Link from "next/link";
import { nav, socials, site } from "@/data/site";
import AsciiFooterCanvas from "./AsciiFooterCanvas";

export default function Footer() {
  const muted = "var(--color-on-deep-muted)";

  return (
    <footer className="relative bg-deep text-[color:var(--color-on-deep)]">
      <div className="container-x py-8">
        {/* Single row: identity | nav | contact */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
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

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
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

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <a
              href={`mailto:${site.email}`}
              className="transition-colors hover:text-[color:var(--color-on-deep)]"
              style={{ color: muted }}
            >
              {site.email}
            </a>
            <span className="flex flex-wrap gap-x-4 gap-y-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="transition-colors hover:text-[color:var(--color-on-deep)]"
                  style={{ color: muted }}
                >
                  {s.label}
                </a>
              ))}
            </span>
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

      {/* Full-width 3-in-a-row DOS Club Logo ASCII Art with Magnetic Circular Repulsion Effect */}
      <AsciiFooterCanvas />
    </footer>
  );
}
