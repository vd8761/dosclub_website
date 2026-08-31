"use client";

import { useEffect, useRef, useState } from "react";
import { nav } from "@/data/site";
import { scrollToSection } from "./SmoothScroll";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(-1);
  // The bar stays out of the way over the hero and drops in once the
  // landing view has been scrolled past.
  const [pastHero, setPastHero] = useState(false);
  const barRef = useRef<HTMLSpanElement>(null);

  // Scroll state + progress branch line.
  // Reading scrollHeight/innerHeight inside the scroll handler forces a
  // layout on every event; cache it and only recompute on resize. The
  // write itself is batched into one rAF so bursts of scroll events
  // collapse into a single style change per frame.
  useEffect(() => {
    let ticking = false;

    const measure = () => {
      // Intentionally calculated during update for precision
    };

    const update = () => {
      ticking = false;
      const st = window.scrollY;
      const heroEl = document.getElementById("top");
      const aboutEl = document.getElementById("about");
      const faqEl = document.getElementById("faq");

      const heroH = heroEl?.offsetHeight || window.innerHeight;
      setScrolled(st > 30);
      setPastHero(st > heroH * 0.72);

      if (barRef.current && aboutEl && faqEl) {
        const startY = aboutEl.offsetTop - 120;
        const endY = faqEl.offsetTop + faqEl.offsetHeight - window.innerHeight;
        const totalSpan = Math.max(1, endY - startY);
        const progress = Math.min(Math.max((st - startY) / totalSpan, 0), 1);
        barRef.current.style.transform = `scaleX(${progress})`;
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Active section = current "commit" on the timeline
  useEffect(() => {
    const sections = nav
      .map((n) => document.querySelector(n.href))
      .filter(Boolean) as Element[];
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = nav.findIndex((n) => n.href === "#" + e.target.id);
            if (i >= 0) setActive(i);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    scrollToSection(href);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[transform,opacity] duration-500 ${
        pastHero || open
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-full opacity-0"
      }`}
    >
      <div
        className={`relative border-b transition-colors duration-500 ${
          scrolled
            ? "border-line bg-ink/90 backdrop-blur-sm"
            : "border-transparent"
        }`}
      >
        <div className="container-x grid h-16 grid-cols-2 items-center md:grid-cols-[1fr_auto_1fr]">
          <button
            onClick={() => go("#top")}
            aria-label="Home"
            data-cursor
            className="justify-self-start"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.webp"
              alt="Descience Open Source Club"
              className="h-9 w-auto"
            />
          </button>

          {/* Commit-timeline nav */}
          <nav className="hidden justify-self-center md:block">
            <div className="relative flex items-end gap-6 px-4">
              {/* Background rail anchored precisely between first and last dot centers */}
              <span className="pointer-events-none absolute bottom-[4.5px] left-8 right-8 h-[2px] bg-line rounded-full" />
              {/* Active filled progress line on the track itself */}
              <span
                ref={barRef}
                className="pointer-events-none absolute bottom-[4.5px] left-8 right-8 h-[2px] origin-left bg-gradient-to-r from-accent via-primary to-primary-soft rounded-full"
                style={{ transform: "scaleX(0)", willChange: "transform" }}
              />
              {nav.map((item, i) => {
                const isActive = i === active;
                const isPassed = active >= i;
                return (
                  <button
                    key={item.href}
                    onClick={() => go(item.href)}
                    className="group flex flex-col items-center gap-2 relative z-10"
                  >
                    <span
                      className={`font-mono text-[11px] font-bold uppercase tracking-[0.14em] transition-colors duration-300 ${
                        isActive
                          ? "text-primary-dark"
                          : isPassed
                            ? "text-fg"
                            : "text-muted group-hover:text-fg"
                      }`}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`relative z-10 h-[9px] w-[9px] rounded-full border transition-all duration-300 ${
                        isActive
                          ? "scale-125 border-primary bg-primary shadow-[0_0_8px_rgba(76,175,80,0.6)]"
                          : isPassed
                            ? "border-primary bg-primary-soft"
                            : "border-line bg-surface group-hover:border-primary"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Full-height Fused Top Bar CTA */}
          <div className="hidden h-16 items-center justify-self-end md:flex">
            <div className="flex h-full items-stretch border-x border-line">
              <a
                href="/enquiry"
                className="flex items-center bg-primary/10 px-6 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-primary-dark transition-colors hover:bg-primary/20 hover:text-primary-dark"
              >
                Get in touch
              </a>
              <a
                href="http://membership.descienceosclub.com/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center bg-primary-dark px-6 font-mono text-[11px] font-bold uppercase tracking-[0.14em] !text-white hover:!text-white transition-colors hover:bg-primary"
                style={{ color: "#ffffff" }}
              >
                Become a member
              </a>
            </div>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-2 justify-self-end md:hidden"
            aria-label="Menu"
          >
            <span
              className={`h-px w-6 bg-fg transition-transform duration-300 ${
                open ? "translate-y-[4.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-px w-6 bg-fg transition-transform duration-300 ${
                open ? "-translate-y-[4.5px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-ink/97 backdrop-blur-xl transition-all duration-500 md:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="container-x flex h-full flex-col justify-center gap-2">
          {nav.map((item, i) => (
            <button
              key={item.href}
              onClick={() => go(item.href)}
              style={{ transitionDelay: open ? `${i * 55 + 120}ms` : "0ms" }}
              className={`display flex items-center gap-4 border-b border-line py-4 text-left text-4xl font-semibold transition-all duration-500 ${
                open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
            >
              <span className="font-mono text-xs text-primary-dark">
                0{i + 1}
              </span>
              {item.label}
            </button>
          ))}
          <div className="mt-8 flex flex-col gap-3">
            <a
              href="/enquiry"
              className="btn btn-ghost justify-center"
            >
              Get in touch
            </a>
            <a
              href="http://membership.descienceosclub.com/"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary justify-center"
            >
              Become a member
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
