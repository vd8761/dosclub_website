"use client";

import Image from "next/image";
import { nav, socials, site } from "@/data/site";
import { scrollToSection } from "./SmoothScroll";

export default function Footer() {
  const muted = "var(--color-on-deep-muted)";

  return (
    <footer className="relative bg-deep text-[color:var(--color-on-deep)]">
      <div className="container-x py-8">
        {/* Single row: identity | nav | contact */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <button
            onClick={() => scrollToSection("#top")}
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
          </button>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {nav.map((n) => (
              <button
                key={n.href}
                onClick={() => scrollToSection(n.href)}
                className="transition-colors hover:text-[color:var(--color-on-deep)]"
                style={{ color: muted }}
              >
                {n.label}
              </button>
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
        <p
          className="mt-6 border-t pt-4 text-center text-xs md:text-left"
          style={{ borderColor: "rgba(255,255,255,0.1)", color: muted }}
        >
          (c) {new Date().getFullYear()} {site.name}. Built in the open.
        </p>
      </div>
    </footer>
  );
}
