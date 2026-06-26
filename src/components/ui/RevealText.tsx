"use client";

import { createElement, ElementType, ReactNode, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
  start?: string;
  /** Tie the reveal to scroll position instead of playing once. */
  scrub?: boolean;
  /** Split granularity for the mask reveal. */
  splitBy?: "word" | "char";
};

/**
 * Masked reveal of text on scroll. Each unit (word or character) sits in an
 * overflow-hidden box and slides up from below — optionally scrubbed so it
 * animates continuously as the user scrolls. Spaces are rendered as real text
 * nodes so lines wrap naturally between words.
 */
export default function RevealText({
  text,
  as = "span",
  className,
  delay = 0,
  stagger,
  start = "top 88%",
  scrub = false,
  splitBy = "word",
}: Props) {
  const ref = useRef<HTMLElement>(null);

  const units = splitBy === "char" ? Array.from(text) : text.split(" ");
  const step = stagger ?? (splitBy === "char" ? 0.025 : 0.045);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const inners = ref.current?.querySelectorAll(".reveal-inner");
      if (!inners?.length) return;

      gsap.fromTo(
        inners,
        { yPercent: 120 },
        {
          yPercent: 0,
          duration: 1,
          ease: scrub ? "none" : "expo.out",
          stagger: step,
          delay: scrub ? 0 : delay,
          scrollTrigger: scrub
            ? {
                trigger: ref.current,
                start: "top 90%",
                end: "top 40%",
                scrub: true,
              }
            : { trigger: ref.current, start },
        }
      );
    },
    { scope: ref, dependencies: [text] }
  );

  const children: ReactNode[] = [];
  units.forEach((unit, i) => {
    if (splitBy === "char" && unit === " ") {
      children.push(" ");
      return;
    }
    children.push(
      createElement(
        "span",
        { key: i, className: "reveal-word" },
        createElement("span", { className: "reveal-inner" }, unit)
      )
    );
    // real space between words so the line can wrap
    if (splitBy === "word") children.push(" ");
  });

  return createElement(as, { ref, className }, children);
}
