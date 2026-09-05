"use client";

import { useEffect, useRef, useState } from "react";
import { nav } from "@/data/site";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { getSmoother, scrollToSection } from "./SmoothScroll";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(-1);
  // The bar stays out of the way over the hero and drops in once the
  // landing view has been scrolled past.
  const [pastHero, setPastHero] = useState(false);
  const scrolledRef = useRef(false);
  const pastHeroRef = useRef(false);
  const barRef = useRef<HTMLSpanElement>(null);
  const railRef = useRef<HTMLSpanElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const stopsRef = useRef<{ x: number; y: number }[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  // Rail geometry, measured from the real dot positions (px, relative to the
  // nav track) so the line starts and ends dead-center on the outer dots.
  const [rail, setRail] = useState({ left: 0, width: 0 });

  // Scroll state + progress branch line.
  //
  // ScrollSmoother renders the page on a lagged, transformed copy of the
  // content, so window.scrollY is ahead of what the user actually sees.
  // Reading the rendered offset of #smooth-content keeps the bar locked to
  // the visible frame. Driving it from gsap's ticker (rather than the
  // scroll event) also keeps it moving through the smoother's easing tail,
  // where no scroll events fire.
  useEffect(() => {
    // Elements and heights are resolved once in measure(), never in the
    // ticker: a getElementById + offsetHeight per frame forces a layout on
    // every frame, and the style write at the end of update() invalidates
    // it again, so the two together thrash layout for the whole scroll.
    let contentEl: HTMLElement | null = null;
    let heroH = 0;
    let lastProgress = -1;

    // Progress is interpolated between the dots so the fill reaches dot i
    // exactly when section i becomes the active one.
    const update = () => {
      // ScrollSmoother drives #smooth-content with a gsap `y`, so gsap has
      // the current value cached - reading it costs nothing, where reading
      // the element's rect would force a layout. With no smoother (reduced
      // motion, or init failed) the page scrolls natively and scrollY is
      // the truth.
      const st =
        contentEl && getSmoother()
          ? -(gsap.getProperty(contentEl, "y") as number)
          : window.scrollY;

      // setState on every frame would re-render 60x/s; only push real flips.
      const nextScrolled = st > 30;
      const nextPastHero = st > heroH * 0.72;
      if (nextScrolled !== scrolledRef.current) {
        scrolledRef.current = nextScrolled;
        setScrolled(nextScrolled);
      }
      if (nextPastHero !== pastHeroRef.current) {
        pastHeroRef.current = nextPastHero;
        setPastHero(nextPastHero);
      }

      const bar = barRef.current;
      if (!bar) return;
      const stops = stopsRef.current;
      if (stops.length < 2) return;

      let progress = 0;
      if (st <= stops[0].y) {
        progress = 0;
      } else if (st >= stops[stops.length - 1].y) {
        progress = 1;
      } else {
        for (let i = 0; i < stops.length - 1; i++) {
          const a = stops[i];
          const b = stops[i + 1];
          if (st >= a.y && st <= b.y) {
            const t = (st - a.y) / Math.max(1, b.y - a.y);
            progress = a.x + (b.x - a.x) * t;
            break;
          }
        }
      }
      // Sub-pixel changes are invisible; skipping them keeps the compositor
      // idle when the page is barely moving.
      if (Math.abs(progress - lastProgress) < 0.0005) return;
      lastProgress = progress;
      bar.style.transform = `scaleX(${progress})`;
    };

    // Cache the scroll position at which each dot should be "reached",
    // plus that dot's fractional position along the rail.
    const measure = () => {
      contentEl = document.getElementById("smooth-content");
      heroH =
        document.getElementById("top")?.offsetHeight || window.innerHeight;
      lastProgress = -1;

      const track = trackRef.current;
      const dots = dotRefs.current;
      const firstDot = dots[0];
      const lastDot = dots[nav.length - 1];
      if (!track || !firstDot || !lastDot) return;

      const trackRect = track.getBoundingClientRect();
      const firstRect = firstDot.getBoundingClientRect();
      const lastRect = lastDot.getBoundingClientRect();
      const railLeft =
        firstRect.left + firstRect.width / 2 - trackRect.left;
      const railRight = lastRect.left + lastRect.width / 2 - trackRect.left;
      const railW = Math.max(1, railRight - railLeft);
      setRail({ left: railLeft, width: railW });

      const vh = window.innerHeight;
      const contentTop =
        document.getElementById("smooth-content")?.getBoundingClientRect()
          .top ?? 0;

      stopsRef.current = nav
        .map((item, i) => {
          const dot = dots[i];
          const section = document.querySelector(item.href) as HTMLElement | null;
          if (!dot || !section) return null;
          const dotRect = dot.getBoundingClientRect();
          const x =
            (dotRect.left + dotRect.width / 2 - trackRect.left - railLeft) /
            railW;
          // Same threshold the IntersectionObserver uses (-45% top margin),
          // so the fill and the active dot flip at the same instant.
          const y =
            section.getBoundingClientRect().top - contentTop - vh * 0.55;
          return { x: Math.min(Math.max(x, 0), 1), y };
        })
        .filter(Boolean) as { x: number; y: number }[];

      // The last sections may sit closer to the bottom than one viewport,
      // so their raw trigger point is past the maximum scroll and the bar
      // could never fill. Squeeze any unreachable stops into what is left.
      const maxScroll = Math.max(
        1,
        (document.getElementById("smooth-content")?.offsetHeight ||
          document.body.scrollHeight) - window.innerHeight,
      );
      const stops = stopsRef.current;
      for (let i = stops.length - 1, cap = maxScroll; i >= 0; i--) {
        if (stops[i].y > cap) stops[i].y = cap;
        cap = stops[i].y - 1;
      }

      update();
    };

    // Measure once layout settles, again after webfonts swap in (label
    // widths move the dots), and on every ScrollTrigger refresh, since that
    // is when section offsets are known to have changed.
    const raf = requestAnimationFrame(measure);
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(measure).catch(() => {});
    ScrollTrigger.addEventListener("refresh", measure);
    gsap.ticker.add(update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      ScrollTrigger.removeEventListener("refresh", measure);
      gsap.ticker.remove(update);
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
            <div ref={trackRef} className="relative flex items-end gap-6 px-4">
              {/* Rail runs from the first dot's center to the last dot's
                  center, measured at runtime. The dots are 9px tall and sit
                  on the container's baseline (items-end), so their centers
                  are 4.5px above the bottom edge. */}
              <span
                ref={railRef}
                className="pointer-events-none absolute bottom-[3.5px] h-[2px] rounded-full bg-line"
                style={{ left: rail.left, width: rail.width }}
              />
              {/* Active filled progress line, on the exact same track */}
              <span
                ref={barRef}
                className="pointer-events-none absolute bottom-[3.5px] h-[2px] origin-left rounded-full bg-gradient-to-r from-accent via-primary to-primary-soft"
                style={{
                  left: rail.left,
                  width: rail.width,
                  transform: "scaleX(0)",
                  willChange: "transform",
                }}
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
                      ref={(el) => {
                        dotRefs.current[i] = el;
                      }}
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
