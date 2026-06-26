"use client";

import Logo from "./Logo";
import { nav, socials, site } from "@/data/site";
import { scrollToSection } from "./SmoothScroll";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line pt-20">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-12 lg:flex-row">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-6 text-sm leading-relaxed text-muted">
              {site.tagline} A community for collaborative learning in web,
              cloud and open source.
            </p>
            <button
              onClick={() => scrollToSection("#top")}
              className="btn btn-ghost mt-8"
            >
              Back to top ↑
            </button>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p className="label mb-5">Explore</p>
              <ul className="flex flex-col gap-3 text-sm text-muted">
                {nav.map((n) => (
                  <li key={n.href}>
                    <button
                      onClick={() => scrollToSection(n.href)}
                      className="transition-colors hover:text-fg"
                    >
                      {n.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="label mb-5">Social</p>
              <ul className="flex flex-col gap-3 text-sm text-muted">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} className="transition-colors hover:text-fg">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="label mb-5">Contact</p>
              <a
                href={`mailto:${site.email}`}
                className="text-sm text-muted transition-colors hover:text-fg"
              >
                {site.email}
              </a>
            </div>
          </div>
        </div>

        {/* Giant wordmark */}
        <div className="pointer-events-none mt-20 select-none">
          <p
            className="display text-center text-[18vw] font-bold leading-none tracking-tighter text-transparent"
            style={{ WebkitTextStroke: "1px var(--color-stroke)" }}
          >
            DESCIENCE
          </p>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-line py-8 text-xs text-muted md:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p className="font-mono">Built in the open · Deployed on Vercel</p>
        </div>
      </div>
    </footer>
  );
}
