"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { domains } from "@/data/site";

/** Resting tilt of each card in the deck, front to back (kept flat/minimal to eliminate horizontal page wiggle). */
const TILT = [0, 0, 0, 0];
/** Each card sits this much smaller and lower than the one in front. */
const SCALE_STEP = 0.04;
const Y_STEP = 12;

const tiltAt = (depth: number) => TILT[depth % TILT.length];

export default function Domains() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]");
      if (!cards.length) return;

      /** Where a card sits when it is `depth` positions back in the deck. */
      const seat = (depth: number) => ({
        x: 0,
        y: depth * Y_STEP,
        scale: 1 - depth * SCALE_STEP,
        rotate: 0,
        opacity: 1,
      });

      // Initial deck: card 0 on top, the rest fanned behind it.
      cards.forEach((card, i) => gsap.set(card, seat(i)));

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const isMobile = window.innerWidth < 768;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current,
          start: isMobile ? "top 5%" : "top 8%",
          end: () => "+=" + cards.length * (isMobile ? 220 : 250),
          pin: true,
          pinSpacing: true,
          scrub: true, // 1:1 direct tracking - completely eliminates ghost scrolling & rubber-band pull
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const i = gsap.utils.clamp(
              0,
              cards.length - 1,
              Math.round(self.progress * (cards.length - 1)),
            );
            setActive((prev) => (prev === i ? prev : i));
          },
        },
      });

      cards.forEach((card, i) => {
        // The last card stays - there is nothing behind it to reveal.
        if (i === cards.length - 1) return;

        tl.to(
          card,
          {
            x: 0,
            y: -75,
            rotate: 0,
            scale: 0.92,
            opacity: 0,
            duration: 1,
          },
          i,
        );

        cards.slice(i + 1).forEach((behind, k) => {
          tl.to(behind, { ...seat(k), duration: 1 }, i);
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="domains" ref={root} className="section pt-6 pb-16 md:py-24 overflow-hidden">
      <div className="container-x">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* ---------------- Header + progress ---------------- */}
          <div className="lg:col-span-5">
            <p className="label mb-4 text-primary-dark">/ 02 - Focus areas</p>
            <h2 className="display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              Four domains.
              <br />
              <span className="text-gradient">One community.</span>
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
              Pick a lane or explore them all. Every track blends comprehensive
              learning with real-world, shippable projects.
            </p>

            {/* Deck progress */}
            <div className="mt-8 flex items-center gap-4">
              <span className="font-mono text-sm font-semibold text-muted">
                <span className="text-primary-dark">
                  {String(active + 1).padStart(2, "0")}
                </span>
                {" / "}
                {String(domains.length).padStart(2, "0")}
              </span>
              <span className="flex gap-2">
                {domains.map((d, i) => (
                  <span
                    key={d.no}
                    className="h-1.5 w-10 rounded-full transition-all duration-300"
                    style={{
                      background:
                        i <= active ? d.accent : "var(--color-ink-2)",
                    }}
                  />
                ))}
              </span>
            </div>
          </div>

          {/* ---------------- The deck ---------------- */}
          <div className="lg:col-span-7 w-full overflow-hidden sm:overflow-visible">
            <div className="relative mx-auto h-[350px] xs:h-[360px] sm:h-[420px] md:h-[440px] w-full max-w-[21.5rem] xs:max-w-[24rem] sm:max-w-[32rem] md:max-w-[34rem] lg:max-w-[36rem]">
              {domains.map((d, i) => {
                // Domain-specific graphical telemetry rendering
                const renderVisualContent = () => {
                  switch (d.no) {
                    case "01": // AI Engineer
                      return (
                        <div className="flex flex-col gap-2 sm:gap-2.5">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 sm:gap-2 text-[10.5px] sm:text-xs font-bold text-primary-dark">
                              <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary animate-pulse" />
                              NEURAL VECTOR LATENTS
                            </span>
                            <span className="font-mono text-[9px] sm:text-[10px] text-muted font-bold tracking-wider">
                              dim: 1536-d
                            </span>
                          </div>

                          <div className="grid grid-cols-6 gap-1.5 sm:gap-2 items-end h-7 sm:h-9 px-2 py-1 bg-ink/40 rounded-xl border border-line/40">
                            {[65, 88, 100, 75, 92, 60].map((val, idx) => (
                              <div key={idx} className="flex flex-col items-center gap-1">
                                <div
                                  className="w-full rounded-t-md bg-gradient-to-t from-primary/40 to-primary transition-all duration-500"
                                  style={{ height: `${val * 0.22}px` }}
                                />
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between border-t border-line/60 pt-1.5 sm:pt-2 text-[10px] sm:text-[11px] font-mono">
                            <span className="text-fg/90">
                              RAG Sim: <span className="font-bold text-primary-dark">0.984</span>
                            </span>
                            <span className="rounded-md bg-primary/10 px-1.5 sm:px-2 py-0.5 font-bold text-primary-dark">
                              4.2k tokens/s
                            </span>
                          </div>
                        </div>
                      );

                    case "02": // Cloud Computing
                      return (
                        <div className="flex flex-col gap-2 sm:gap-2.5">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 sm:gap-2 text-[10.5px] sm:text-xs font-bold text-accent-dark">
                              <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-accent animate-pulse" />
                              INFRA TOPOLOGY
                            </span>
                            <span className="rounded bg-accent/10 px-1.5 sm:px-2 py-0.5 font-mono text-[9px] sm:text-[10px] font-bold text-accent-dark">
                              us-east-1a
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                            <div className="flex flex-col gap-0.5 rounded-lg sm:rounded-xl border border-line bg-surface/80 p-1.5 sm:p-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] sm:text-[10px] font-bold text-fg">k8s-pod-1</span>
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              </div>
                              <span className="font-mono text-[8.5px] sm:text-[9px] text-muted">CPU: 12%</span>
                            </div>
                            <div className="flex flex-col gap-0.5 rounded-lg sm:rounded-xl border border-line bg-surface/80 p-1.5 sm:p-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] sm:text-[10px] font-bold text-fg">k8s-pod-2</span>
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              </div>
                              <span className="font-mono text-[8.5px] sm:text-[9px] text-muted">CPU: 18%</span>
                            </div>
                            <div className="flex flex-col gap-0.5 rounded-lg sm:rounded-xl border border-line bg-surface/80 p-1.5 sm:p-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] sm:text-[10px] font-bold text-accent-dark">alb-edge</span>
                                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                              </div>
                              <span className="font-mono text-[8.5px] sm:text-[9px] text-primary font-bold">200 OK</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-line/60 pt-1.5 sm:pt-2 text-[10px] sm:text-[11px] font-mono">
                            <span className="text-fg/90">Uptime: 99.99%</span>
                            <span className="text-muted">Latency: 14ms</span>
                          </div>
                        </div>
                      );

                    case "03": // Open Source
                      return (
                        <div className="flex flex-col gap-2 sm:gap-2.5">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 sm:gap-2 text-[10.5px] sm:text-xs font-bold text-primary">
                              <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary animate-pulse" />
                              VERSION PIPELINE
                            </span>
                            <span className="font-mono text-[9px] sm:text-[10px] font-bold text-muted">
                              branch: main
                            </span>
                          </div>

                          <div className="rounded-xl border border-line/60 bg-ink/40 p-2 sm:p-2.5 font-mono text-[9.5px] sm:text-[11px] leading-relaxed text-fg/90">
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-primary font-bold">●</span>
                              <span className="truncate">git commit -m &quot;feat: core engine&quot;</span>
                            </div>
                            <div className="flex items-center gap-2 pl-3 text-muted truncate">
                              <span className="truncate">│ ├─ PR #142 passed CI</span>
                            </div>
                            <div className="flex items-center gap-2 pl-3 font-semibold text-accent-dark truncate">
                              <span className="truncate">└─ Merged into master ✓</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-line/60 pt-1.5 sm:pt-2 text-[10px] sm:text-[11px] font-mono">
                            <span className="text-fg/90">Commits: 1,840</span>
                            <span className="text-primary font-bold">24 Contributors</span>
                          </div>
                        </div>
                      );

                    case "04": // Digital Skills
                    default:
                      return (
                        <div className="flex flex-col gap-2 sm:gap-2.5">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 sm:gap-2 text-[10.5px] sm:text-xs font-bold text-primary-dark">
                              <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary animate-pulse" />
                              GROWTH MATRIX
                            </span>
                            <span className="rounded bg-primary/10 px-1.5 sm:px-2 py-0.5 font-mono text-[9px] sm:text-[10px] font-bold text-primary-dark">
                              Level 4.0
                            </span>
                          </div>

                          <div className="flex flex-col gap-1 sm:gap-1.5 rounded-xl border border-line/60 bg-ink/40 p-2 sm:p-2.5">
                            <div>
                              <div className="flex items-center justify-between text-[9.5px] sm:text-[10.5px] font-semibold text-fg">
                                <span>System Architecture</span>
                                <span className="font-mono text-primary-dark">85%</span>
                              </div>
                              <div className="mt-1 h-1.5 w-full rounded-full bg-line overflow-hidden">
                                <div className="h-full w-[85%] rounded-full bg-primary" />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-[9.5px] sm:text-[10.5px] font-semibold text-fg">
                                <span>Engineering Leadership</span>
                                <span className="font-mono text-accent-dark">90%</span>
                              </div>
                              <div className="mt-1 h-1.5 w-full rounded-full bg-line overflow-hidden">
                                <div className="h-full w-[90%] rounded-full bg-accent" />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-line/60 pt-1.5 sm:pt-2 text-[10px] sm:text-[11px] font-mono">
                            <span className="text-fg/90">Mentorship: 1-on-1</span>
                            <span className="font-bold text-primary-dark">Career Ready 🚀</span>
                          </div>
                        </div>
                      );
                  }
                };

                // Domain-specific SVG icon & ASCII pattern
                const renderIconAndAscii = () => {
                  switch (d.no) {
                    case "01": // AI Engineer
                      return {
                        ascii: "[ AI_NODE // 0x7F ]",
                        icon: (
                          <svg className="h-4.5 w-4.5 sm:h-5 sm:w-5 md:h-6 md:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                            <circle cx="12" cy="12" r="4" />
                          </svg>
                        ),
                      };
                    case "02": // Cloud Computing
                      return {
                        ascii: "< DEPLOY :: INFRA >",
                        icon: (
                          <svg className="h-4.5 w-4.5 sm:h-5 sm:w-5 md:h-6 md:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                            <path d="M12 13v6m-3-3 3-3 3 3" />
                          </svg>
                        ),
                      };
                    case "03": // Open Source
                      return {
                        ascii: "{ GIT_TREE => PULL }",
                        icon: (
                          <svg className="h-4.5 w-4.5 sm:h-5 sm:w-5 md:h-6 md:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="18" r="3" />
                            <circle cx="6" cy="6" r="3" />
                            <path d="M13 6h3a2 2 0 0 1 2 2v7" />
                            <line x1="6" x2="6" y1="9" y2="21" />
                          </svg>
                        ),
                      };
                    case "04": // Digital Skills
                    default:
                      return {
                        ascii: "// DEV_GROWTH.exe",
                        icon: (
                          <svg className="h-4.5 w-4.5 sm:h-5 sm:w-5 md:h-6 md:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m16 18 2-2-4-4" />
                            <path d="M8 6 6 8l4 4" />
                            <rect width="18" height="18" x="3" y="3" rx="2" />
                            <path d="m9 15 6-6" />
                          </svg>
                        ),
                      };
                  }
                };

                const { icon, ascii } = renderIconAndAscii();

                return (
                  <article
                    key={d.no}
                    data-card
                    className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-line bg-surface p-4 xs:p-5 sm:p-7 md:p-8 shadow-[0_32px_80px_-48px_rgba(12,51,70,0.45)]"
                    style={{
                      zIndex: domains.length - i,
                      transformOrigin: "center center",
                    }}
                  >
                    {/* Top hairline indicator */}
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-1.5"
                      style={{ background: d.accent }}
                    />

                    {/* Watermark index */}
                    <span
                      aria-hidden
                      className="display pointer-events-none absolute -right-2 -top-6 text-[5.5rem] xs:text-[6.5rem] sm:text-[8rem] md:text-[9.5rem] font-bold leading-none text-transparent opacity-50 sm:opacity-75 select-none"
                      style={{ WebkitTextStroke: "1px var(--color-stroke)" }}
                    >
                      {d.no}
                    </span>

                    {/* Header Row: Icon + ASCII Badge & Title */}
                    <div className="relative">
                      <div className="flex items-center justify-between gap-2">
                        <div
                          className="flex h-8 w-8 xs:h-9 xs:w-9 sm:h-12 sm:w-12 items-center justify-center rounded-lg xs:rounded-xl sm:rounded-2xl border border-line bg-ink/40 text-fg shadow-sm"
                          style={{ color: d.accent }}
                        >
                          {icon}
                        </div>

                        <span className="font-mono text-[8.5px] xs:text-[9px] sm:text-[10.5px] uppercase tracking-wider sm:tracking-widest text-muted/80 border border-line/60 bg-ink-2/40 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full truncate">
                          {ascii}
                        </span>
                      </div>

                      <h3 className="display mt-2 xs:mt-2.5 sm:mt-4 text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                        {d.title}
                      </h3>
                      <p className="mt-0.5 xs:mt-1 text-[11.5px] xs:text-xs sm:text-sm leading-relaxed text-muted line-clamp-2">
                        {d.body}
                      </p>
                    </div>

                    {/* Middle Graphic Telemetry Card */}
                    <div className="relative my-1 xs:my-1.5 sm:my-2 rounded-lg xs:rounded-xl sm:rounded-2xl border border-line bg-ink-2/40 p-2.5 xs:p-3 sm:p-4 shadow-sm select-none">
                      {renderVisualContent()}
                    </div>

                    {/* Footer Tags */}
                    <div className="relative flex flex-wrap gap-1 sm:gap-2 pt-1.5 sm:pt-2 border-t border-line/60">
                      {d.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-line bg-ink/60 px-2 sm:px-3 py-0.5 font-mono text-[10px] sm:text-xs font-medium text-muted"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
