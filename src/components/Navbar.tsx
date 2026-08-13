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
    let docH = 1;
    let heroH = 1;
    let ticking = false;

    const measure = () => {
      docH = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      heroH =
        document.getElementById("top")?.offsetHeight || window.innerHeight;
    };

    const update = () => {
      ticking = false;
      const st = window.scrollY;
      setScrolled(st > 30);
      // Reveal once most of the landing view is behind us.
      setPastHero(st > heroH * 0.72);
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${Math.min(st / docH, 1)})`;
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
            <div className="relative flex items-end gap-6 px-2">
              <span className="pointer-events-none absolute bottom-1 left-2 right-2 h-px bg-line" />
              {nav.map((item, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={item.href}
                    onClick={() => go(item.href)}
                    className="group flex flex-col items-center gap-2"
                  >
                    <span
                      className={`font-mono text-[10.5px] uppercase tracking-[0.14em] transition-colors duration-300 ${
                        isActive ? "text-fg" : "text-muted group-hover:text-fg"
                      }`}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`relative z-10 h-[9px] w-[9px] rounded-full border transition-all duration-300 ${
                        isActive
                          ? "scale-110 border-primary bg-primary"
                          : "border-line bg-ink group-hover:border-primary"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Live CTA */}
          <button
            onClick={() => go("#join")}
            className="hidden items-center gap-2 justify-self-end rounded-full bg-primary-dark px-6 py-2 text-white transition-colors hover:bg-primary md:inline-flex"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-soft opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-soft" />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em]">
              Join the club
            </span>
          </button>

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

        {/* Scroll progress branch line */}
        <span
          ref={barRef}
          className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-gradient-to-r from-accent to-primary"
          style={{ transform: "scaleX(0)", willChange: "transform" }}
        />
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
          <button
            onClick={() => go("#join")}
            className="btn btn-primary mt-8 justify-center"
          >
            Join the club
          </button>
        </nav>
      </div>
    </header>
  );
}
