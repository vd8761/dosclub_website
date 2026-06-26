"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

// Coding / open-source glyphs the accent morphs between, on a loop.
const SHAPES = [
  "M42 38 L24 60 L42 82 M78 38 L96 60 L78 82 M68 30 L52 90", // </>
  "M50 32 C42 32 44 50 33 60 C44 70 42 88 50 88 M70 32 C78 32 76 50 87 60 C76 70 78 88 70 88", // { }
  "M22 34 L98 34 L98 86 L22 86 Z M37 54 L50 64 L37 74 M58 76 L80 76", // terminal >_
  "M54 30 C41 44 41 76 54 90 M66 30 C79 44 79 76 66 90", // ( )
];

export default function MorphAccent({
  className = "",
  stroke = "rgba(255,255,255,0.18)",
}: {
  className?: string;
  stroke?: string;
}) {
  const path = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const tl = gsap.timeline({
        repeat: -1,
        defaults: { duration: 2.6, ease: "power2.inOut" },
      });
      SHAPES.slice(1)
        .concat(SHAPES[0])
        .forEach((d) => tl.to(path.current, { morphSVG: d }));

      const spin = gsap.to(path.current, {
        rotation: 360,
        duration: 80,
        repeat: -1,
        ease: "none",
        svgOrigin: "60 60",
      });

      // Pause while off screen so it costs nothing elsewhere.
      const svg = path.current?.ownerSVGElement;
      if (!svg) return;
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            tl.play();
            spin.play();
          } else {
            tl.pause();
            spin.pause();
          }
        },
        { threshold: 0 },
      );
      io.observe(svg);
      return () => io.disconnect();
    },
    { scope: path },
  );

  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        ref={path}
        d={SHAPES[0]}
        stroke={stroke}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
