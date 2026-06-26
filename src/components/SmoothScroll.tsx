"use client";

import { ReactNode, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { ScrollSmoother } from "@/lib/gsap";

// Shared ScrollSmoother instance so nav links can drive smooth scrolling.
let smoother: ScrollSmoother | null = null;

export function scrollToSection(target: string) {
  if (smoother) {
    smoother.scrollTo(target, true, "top 76px");
  } else if (typeof document !== "undefined") {
    document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  }
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    try {
      smoother = ScrollSmoother.create({
        wrapper: wrapper.current!,
        content: content.current!,
        smooth: 1.4,
        effects: true,
        smoothTouch: 0.1,
      });
    } catch (err) {
      // If smoothing fails to init, fall back to native scrolling rather
      // than leaving the page unscrollable.
      console.error("ScrollSmoother init failed, using native scroll:", err);
      smoother = null;
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { smoother?: ScrollSmoother }).smoother = smoother;
    }

    return () => {
      smoother?.kill();
      smoother = null;
    };
  }, []);

  return (
    <div id="smooth-wrapper" ref={wrapper}>
      <div id="smooth-content" ref={content}>
        {children}
      </div>
    </div>
  );
}
