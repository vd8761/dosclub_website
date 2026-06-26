"use client";

import Image from "next/image";
import { nav, socials, site } from "@/data/site";
import { scrollToSection } from "./SmoothScroll";

const colLabel = "font-mono text-[0.72rem] uppercase tracking-[0.24em]";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-forest pt-20 text-[#eef3e5]">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-12 lg:flex-row">
          <div className="max-w-sm">
            <span className="inline-flex items-center gap-2.5">
              <Image
                src="/dos-badge.png"
                alt=""
                width={36}
                height={36}
                className="h-9 w-9"
              />
              <span className="font-display text-[15px] font-semibold">
                Descience<span className="opacity-60"> / OS</span>
              </span>
            </span>
            <p className="mt-6 text-sm leading-relaxed text-[#9fb39a]">
              {site.tagline} A community for collaborative learning in web,
              cloud and open source.
            </p>
            <button
              onClick={() => scrollToSection("#top")}
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.08em] transition-colors hover:bg-white/10"
            >
              Back to top ^
            </button>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p
                className={colLabel}
                style={{ color: "rgba(238,243,229,0.5)" }}
              >
                Explore
              </p>
              <ul className="mt-5 flex flex-col gap-3 text-sm text-[#9fb39a]">
                {nav.map((n) => (
                  <li key={n.href}>
                    <button
                      onClick={() => scrollToSection(n.href)}
                      className="transition-colors hover:text-[#eef3e5]"
                    >
                      {n.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p
                className={colLabel}
                style={{ color: "rgba(238,243,229,0.5)" }}
              >
                Social
              </p>
              <ul className="mt-5 flex flex-col gap-3 text-sm text-[#9fb39a]">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      className="transition-colors hover:text-[#eef3e5]"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p
                className={colLabel}
                style={{ color: "rgba(238,243,229,0.5)" }}
              >
                Contact
              </p>
              <a
                href={`mailto:${site.email}`}
                className="mt-5 inline-block text-sm text-[#9fb39a] transition-colors hover:text-[#eef3e5]"
              >
                {site.email}
              </a>
            </div>
          </div>
        </div>

        {/* Giant wordmark */}
        <div className="pointer-events-none mt-20 select-none">
          <p
            className="display text-center text-6xl font-bold leading-none text-transparent sm:text-8xl md:text-[8rem] lg:text-[10rem] xl:text-[12rem]"
            style={{ WebkitTextStroke: "1px rgba(255,255,255,0.1)" }}
          >
            DESCIENCE
          </p>
        </div>

        <div
          className="flex flex-col items-center justify-between gap-3 border-t py-8 text-xs md:flex-row"
          style={{
            borderColor: "rgba(255,255,255,0.1)",
            color: "rgba(238,243,229,0.5)",
          }}
        >
          <p>
            (c) {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p className="font-mono">Built in the open | Deployed on Vercel</p>
        </div>
      </div>
    </footer>
  );
}
