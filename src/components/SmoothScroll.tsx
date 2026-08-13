"use client";

import { ReactNode, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { ScrollSmoother } from "@/lib/gsap";

// Shared ScrollSmoother instance so nav links can drive smooth scrolling.
let smoother: ScrollSmoother | null = null;

export function getSmoother() {
  return smoother;
}

/** Jump straight to the top with no tweening, killing any momentum. */
export function jumpToTop() {
  if (smoother) {
    // scrollTo(target, smooth=false) moves the real scroll position AND
    // resets the smoother's internal target, so leftover momentum does
    // not immediately drag us back down.
    smoother.scrollTo(0, false);
    smoother.scrollTop(0);
  } else if (typeof window !== "undefined") {
    window.scrollTo(0, 0);
  }
}

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
        // `smooth` is how many seconds the content takes to catch up with
        // the real scroll position. 1.4s reads as heavy input lag - the
        // page keeps gliding long after the wheel stops. ~0.7s still feels
        // smooth but stays attached to the input.
        smooth: 0.7,
        effects: true,
        // Touch devices already scroll smoothly at the OS level. Layering
        // a JS smoother on top is the main cause of stutter on mobile.
        smoothTouch: 0,
        // Mobile browsers fire resize when the URL bar hides/shows;
        // without this every one of those triggers a full refresh.
        ignoreMobileResize: true,
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
