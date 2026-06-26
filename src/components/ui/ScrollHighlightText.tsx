"use client";

import { createElement, ElementType, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
};

/**
 * Words fade from dim → full color one after another, scrubbed to scroll.
 * The classic "read-along" highlight effect.
 */
export default function ScrollHighlightText({
  text,
  as = "p",
  className,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const words = text.split(" ");

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const wordEls = ref.current?.querySelectorAll(".hl-word");
      if (!wordEls?.length) return;

      const styles = getComputedStyle(document.documentElement);
      const lit = styles.getPropertyValue("--color-fg").trim() || "#16261a";

      gsap.to(wordEls, {
        color: lit,
        opacity: 1,
        ease: "none",
        stagger: 0.5,
        scrollTrigger: {
          trigger: ref.current,
          start: "top 78%",
          end: "bottom 58%",
          scrub: true,
        },
      });
    },
    { scope: ref, dependencies: [text] }
  );

  return createElement(
    as,
    { ref, className },
    words.map((word, i) =>
      createElement("span", { key: i, className: "hl-word" }, word + " ")
    )
  );
}
