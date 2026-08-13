"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const IDLE_RING = "rgba(21,147,195,0.75)"; // accent
const ACTIVE_RING = "rgba(76,175,80,0.9)"; // primary

export default function CustomCursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (!ring.current || !dot.current) return;

    gsap.set([ring.current, dot.current], { xPercent: -50, yPercent: -50 });

    const ringX = gsap.quickTo(ring.current, "x", {
      duration: 0.55,
      ease: "power3",
    });
    const ringY = gsap.quickTo(ring.current, "y", {
      duration: 0.55,
      ease: "power3",
    });
    const dotX = gsap.quickTo(dot.current, "x", {
      duration: 0.12,
      ease: "power3",
    });
    const dotY = gsap.quickTo(dot.current, "y", {
      duration: 0.12,
      ease: "power3",
    });

    const move = (e: MouseEvent) => {
      ringX(e.clientX);
      ringY(e.clientY);
      dotX(e.clientX);
      dotY(e.clientY);
    };

    // `mouseover` fires continuously as the pointer crosses elements. Only
    // spawn a tween when the hover state actually flips, otherwise we build
    // a new tween dozens of times a second for no visible change.
    let hot = false;
    const over = (e: MouseEvent) => {
      const interactive = !!(e.target as HTMLElement)?.closest(
        "a, button, [data-cursor]",
      );
      if (interactive === hot) return;
      hot = interactive;
      gsap.to(ring.current, {
        scale: interactive ? 1.9 : 1,
        borderColor: interactive ? ACTIVE_RING : IDLE_RING,
        duration: 0.3,
        // "auto", NOT true: `true` kills every tween on this element,
        // including the quickTo x/y that makes the ring follow the mouse -
        // so the cursor froze the moment you hovered anything.
        overwrite: "auto",
      });
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] hidden md:block">
      <div
        ref={ring}
        className="absolute left-0 top-0 h-8 w-8 rounded-full border"
        style={{ borderColor: IDLE_RING }}
      />
      <div
        ref={dot}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-primary"
      />
    </div>
  );
}
