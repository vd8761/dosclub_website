"use client";

import { CSSProperties, ReactNode, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

type TextTag = "span" | "p" | "h1" | "h2" | "h3";

type Props = {
  text: string;
  as?: TextTag;
  className?: string;
  /** Light text on a dark background. */
  dark?: boolean;
};

/**
 * Words fade from dim -> full color one after another, scrubbed to scroll.
 * The classic "read-along" highlight effect.
 */
export default function ScrollHighlightText({
  text,
  as = "p",
  className,
  dark = false,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const setNode = (node: HTMLElement | null) => {
    ref.current = node;
  };
  const words = text.split(" ");

  useGSAP(
    () => {
      const wordEls = ref.current?.querySelectorAll(".hl-word");
      if (!wordEls?.length) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (dark) {
        if (reduce) {
          gsap.set(wordEls, { opacity: 1 });
          return;
        }
        gsap.fromTo(
          wordEls,
          { opacity: 0.22 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.5,
            scrollTrigger: {
              trigger: ref.current,
              start: "top 78%",
              end: "bottom 58%",
              scrub: true,
            },
          },
        );
        return;
      }

      if (reduce) return;
      const lit =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--color-fg")
          .trim() || "#16261a";
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
    { scope: ref, dependencies: [text] },
  );

  const wordStyle: CSSProperties | undefined = dark
    ? { color: "#eef3e5", opacity: 0.22 }
    : undefined;

  const children: ReactNode = words.map((word, i) => (
    <span key={i} className="hl-word" style={wordStyle}>
      {word}{" "}
    </span>
  ));

  switch (as) {
    case "span":
      return (
        <span ref={setNode} className={className}>
          {children}
        </span>
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
    case "p":
    default:
      return (
        <p ref={setNode} className={className}>
          {children}
        </p>
      );
  }
}
