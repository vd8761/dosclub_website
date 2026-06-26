"use client";

import { ReactNode, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

type TextTag = "span" | "p" | "h1" | "h2" | "h3";

type Props = {
  text: string;
  as?: TextTag;
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
 * overflow-hidden box and slides up from below - optionally scrubbed so it
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
  const setNode = (node: HTMLElement | null) => {
    ref.current = node;
  };

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
        },
      );
    },
    { scope: ref, dependencies: [text] },
  );

  const children: ReactNode[] = [];
  units.forEach((unit, i) => {
    if (splitBy === "char" && unit === " ") {
      children.push(" ");
      return;
    }
    children.push(
      <span key={i} className="reveal-word">
        <span className="reveal-inner">{unit}</span>
      </span>,
    );
    // real space between words so the line can wrap
    if (splitBy === "word") children.push(" ");
  });

  switch (as) {
    case "p":
      return (
        <p ref={setNode} className={className}>
          {children}
        </p>
      );
    case "h1":
      return (
        <h1 ref={setNode} className={className}>
          {children}
        </h1>
      );
    case "h2":
      return (
        <h2 ref={setNode} className={className}>
          {children}
        </h2>
      );
    case "h3":
      return (
        <h3 ref={setNode} className={className}>
          {children}
        </h3>
      );
    case "span":
    default:
      return (
        <span ref={setNode} className={className}>
          {children}
        </span>
      );
  }
}
