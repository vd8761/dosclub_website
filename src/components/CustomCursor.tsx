"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export default function CustomCursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (!ring.current || !dot.current) return;

    gsap.set([ring.current, dot.current], { xPercent: -50, yPercent: -50 });

    const ringX = gsap.quickTo(ring.current, "x", { duration: 0.55, ease: "power3" });
    const ringY = gsap.quickTo(ring.current, "y", { duration: 0.55, ease: "power3" });
    const dotX = gsap.quickTo(dot.current, "x", { duration: 0.12, ease: "power3" });
    const dotY = gsap.quickTo(dot.current, "y", { duration: 0.12, ease: "power3" });

    const move = (e: MouseEvent) => {
      ringX(e.clientX);
      ringY(e.clientY);
      dotX(e.clientX);
      dotY(e.clientY);
    };

    const over = (e: MouseEvent) => {
      const interactive = (e.target as HTMLElement)?.closest(
        "a, button, [data-cursor]"
      );
      gsap.to(ring.current, {
        scale: interactive ? 1.9 : 1,
        borderColor: interactive
          ? "rgba(31,81,48,0.9)"
          : "rgba(101,173,83,0.75)",
        duration: 0.3,
      });
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] hidden md:block">
      <div
        ref={ring}
        className="absolute left-0 top-0 h-9 w-9 rounded-full border"
        style={{ borderColor: "rgba(101,173,83,0.75)" }}
      />
      <div
        ref={dot}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-forest"
      />
    </div>
  );
}
