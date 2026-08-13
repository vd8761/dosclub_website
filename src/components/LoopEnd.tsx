"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { jumpToTop } from "./SmoothScroll";

/**
 * The last panel on the page. Scrolling through it fades a veil in; the
 * moment it bottoms out we jump the scroll position back to 0 behind the
 * veil and fade back out, so the page reads as an endless loop.
 *
 * Deliberately one-way: scrolling UP from the top does nothing special,
 * because wrapping backwards would trap anyone trying to reach the hero.
 */
export default function LoopEnd() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Rendered by the root layout so it sits outside #smooth-content.
    const veil = document.getElementById("loop-veil");
    if (!veil) return;

    // While the jump + fade-out is in flight we stop writing veil opacity
    // from the scrub, otherwise the reset to progress 0 would snap it off
    // mid-fade.
    let locked = false;

    const st = ScrollTrigger.create({
      trigger: root.current,
      // The panel is shorter than the viewport, so "top top" would resolve
      // BELOW "bottom bottom" - an inverted range that never runs. Start
      // when the panel first appears instead; "bottom bottom" is the
      // document end, since this is the last element on the page.
      start: "top bottom",
      end: "bottom bottom",
      onUpdate: (self) => {
        if (locked) return;

        // Hold the veil fully clear for the first three quarters, so you
        // scroll well past the footer before anything starts wiping. The
        // jump itself only fires at the very end of the range.
        const p = gsap.utils.clamp(0, 1, (self.progress - 0.75) / 0.25);
        gsap.set(veil, { opacity: p });

        // Only wrap on the way DOWN, and only once we've essentially
        // bottomed out. The smoother eases into the end, so it may never
        // report a clean 1.
        if (self.progress < 0.98 || self.direction !== 1) return;

        locked = true;
        jumpToTop();
        gsap.to(veil, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => {
            locked = false;
          },
        });
      },
    });

    return () => {
      st.kill();
      gsap.set(veil, { opacity: 0 });
    };
  }, []);

  return (
    <div
      ref={root}
      aria-hidden
      className="relative flex h-[40svh] select-none flex-col items-center justify-center gap-4 overflow-hidden bg-deep"
    >
      <span
        className="block h-8 w-px"
        style={{ background: "rgba(255,255,255,0.18)" }}
      />
      <p
        className="label whitespace-nowrap"
        style={{ color: "var(--color-on-deep-muted)" }}
      >
        Keep scrolling - back to the start
      </p>
    </div>
  );
}
