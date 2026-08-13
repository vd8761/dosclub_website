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
          start: "top top",
          end: () => "+=" + cards.length * window.innerHeight * 0.75,
          pin: pin.current,
          pinSpacing: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // The timeline runs for (n - 1) units - one per flick - so the
            // front card index is progress across that range, rounded so
            // the indicator flips halfway through each flick.
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

        // Flick the front card away: it lifts, spins out to alternating
        // sides, and fades. Transform + opacity only, so it stays on the
        // compositor.
        tl.to(
          card,
          {
            x: i % 2 === 0 ? "62%" : "-62%",
            y: -72,
            rotate: i % 2 === 0 ? 16 : -16,
            scale: 0.9,
            opacity: 0,
            duration: 1,
          },
          i,
        );

        // Everything behind it steps forward one seat.
        cards.slice(i + 1).forEach((behind, k) => {
          tl.to(behind, { ...seat(k), duration: 1 }, i);
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="domains" ref={root} className="section section-flush-b">
      <div ref={pin} className="container-x">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* ---------------- Header + progress ---------------- */}
          <div className="lg:col-span-5">
            <p className="label mb-6">/ 02 - Focus areas</p>
            <h2 className="display text-4xl leading-[1] sm:text-5xl lg:text-6xl">
              Four domains.
              <br />
              <span className="text-gradient">One community.</span>
            </h2>
            <p className="mt-6 max-w-md text-muted">
              Pick a lane or explore them all. Every track blends learning with
              real, shippable work.
            </p>

            {/* Deck progress */}
            <div className="mt-10 flex items-center gap-4">
              <span className="font-mono text-sm text-muted">
                <span className="text-fg">
                  {String(active + 1).padStart(2, "0")}
                </span>
                {" / "}
                {String(domains.length).padStart(2, "0")}
              </span>
              <span className="flex gap-2">
                {domains.map((d, i) => (
                  <span
                    key={d.no}
                    className="h-1 w-8 rounded-full transition-colors duration-300"
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
            <div className="relative mx-auto aspect-square w-full max-w-[26rem]">
              {domains.map((d, i) => (
                <article
                  key={d.no}
                  data-card
                  className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-3xl border border-line bg-surface p-8 shadow-[0_32px_80px_-48px_rgba(12,51,70,0.6)]"
                  style={{
                    zIndex: domains.length - i,
                    transformOrigin: "center center",
                  }}
                >
                  {/* accent hairline */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-1"
                    style={{ background: d.accent }}
                  />

                  {/* watermark index */}
                  <span
                    aria-hidden
                    className="display pointer-events-none absolute -right-2 -top-6 text-[9rem] font-bold leading-none text-transparent"
                    style={{ WebkitTextStroke: "1px var(--color-stroke)" }}
                  >
                    {d.no}
                  </span>

                  <div className="relative">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ background: d.accent }}
                    />
                    <h3 className="display mt-6 text-3xl font-semibold">
                      {d.title}
                    </h3>
                    <p className="mt-4 text-muted">{d.body}</p>
                  </div>

                  <div className="relative flex flex-wrap gap-2">
                    {d.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-line px-4 py-2 font-mono text-xs text-muted"
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
