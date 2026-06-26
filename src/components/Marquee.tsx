"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { keywords } from "@/data/site";

export default function Marquee() {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const row = [...keywords, ...keywords];

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (!track.current) return;

      // Skew the marquee based on scroll velocity, easing back to flat when idle.
      const skewTo = gsap.quickTo(track.current, "skewX", {
        duration: 0.4,
        ease: "power3",
      });
      let target = 0;

      ScrollTrigger.create({
        onUpdate: (self) => {
          target = gsap.utils.clamp(-10, 10, self.getVelocity() / -180);
        },
      });

      const tick = () => {
        target = gsap.utils.interpolate(target, 0, 0.08);
        skewTo(target);
      };
      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="relative overflow-hidden border-y border-line bg-ink-soft py-5"
    >
      <div ref={track} className="marquee-track">
        {row.map((word, i) => (
          <span
            key={i}
            className="display flex shrink-0 items-center gap-8 px-8 text-2xl font-medium md:text-4xl"
          >
            <span className={i % 2 ? "text-gradient-2" : "text-fg"}>
              {word}
            </span>
            <span className="text-green" aria-hidden>
              *
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
