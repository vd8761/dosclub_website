"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { domains } from "@/data/site";

/** Resting tilt of each card in the deck, front to back. */
const TILT = [-3, 2.5, -1.5, 3.5];
/** Each card sits this much smaller and lower than the one in front. */
const SCALE_STEP = 0.05;
const Y_STEP = 14;

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
        y: depth * Y_STEP,
        scale: 1 - depth * SCALE_STEP,
        rotate: tiltAt(depth),
        opacity: 1,
      });

      // Initial deck: card 0 on top, the rest fanned behind it.
      cards.forEach((card, i) => gsap.set(card, seat(i)));

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: root.current,
          start: "top 15%",
          end: () => "+=" + cards.length * 280,
          pin: pin.current,
          pinSpacing: true,
          scrub: 0.4,
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
            x: i % 2 === 0 ? "65%" : "-65%",
            y: -50,
            rotate: i % 2 === 0 ? 14 : -14,
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
    <section id="domains" ref={root} className="section py-16 md:py-24">
      <div ref={pin} className="container-x">
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
          <div className="lg:col-span-7">
            <div className="relative mx-auto h-[380px] sm:h-[420px] w-full max-w-[34rem]">
              {domains.map((d, i) => (
                <article
                  key={d.no}
                  data-card
                  className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-3xl border border-line bg-surface p-7 sm:p-9 shadow-[0_32px_80px_-48px_rgba(12,51,70,0.45)]"
                  style={{
                    zIndex: domains.length - i,
                    transformOrigin: "center center",
                  }}
                >
                  {/* accent hairline */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-1.5"
                    style={{ background: d.accent }}
                  />

                  {/* watermark index */}
                  <span
                    aria-hidden
                    className="display pointer-events-none absolute -right-2 -top-6 text-[8rem] sm:text-[9.5rem] font-bold leading-none text-transparent opacity-80 select-none"
                    style={{ WebkitTextStroke: "1px var(--color-stroke)" }}
                  >
                    {d.no}
                  </span>

                  <div className="relative">
                    <span
                      className="inline-block h-3.5 w-3.5 rounded-full ring-4 ring-ink-2"
                      style={{ background: d.accent }}
                    />
                    <h3 className="display mt-5 text-2xl sm:text-3xl font-bold">
                      {d.title}
                    </h3>
                    <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted">
                      {d.body}
                    </p>
                  </div>

                  <div className="relative flex flex-wrap gap-2 pt-4 border-t border-line/60">
                    {d.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-line bg-ink/50 px-3.5 py-1.5 font-mono text-xs font-medium text-muted"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
