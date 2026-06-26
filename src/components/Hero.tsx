"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import RevealText from "./ui/RevealText";
import Magnetic from "./ui/Magnetic";
import AsciiField from "./AsciiField";
import { scrollToSection } from "./SmoothScroll";

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Scroll-scrubbed parallax on the hero content
        gsap.to("[data-hero-content]", {
          yPercent: -10,
          opacity: 0.35,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        // Drifting blobs
        gsap.to("[data-blob='1']", {
          x: 80,
          y: -40,
          duration: 9,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
        gsap.to("[data-blob='2']", {
          x: -70,
          y: 50,
          duration: 11,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      // Intro fade for the meta row + scroll cue
      if (!window.matchMedia("(prefers-reduced-motion: no-preference)").matches)
        return;
      gsap.from("[data-hero-fade]", {
        opacity: 0,
        y: 24,
        duration: 1,
        ease: "expo.out",
        delay: 0.5,
        stagger: 0.12,
      });
    },
    { scope: root }
  );

  return (
    <section
      id="top"
      ref={root}
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pt-28"
    >
      {/* Gradient blobs */}
      <div
        data-blob="1"
        className="absolute -left-32 top-10 -z-20 h-[36rem] w-[36rem] rounded-full opacity-30 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, var(--color-green), transparent 60%)",
        }}
      />
      <div
        data-blob="2"
        className="absolute -right-24 bottom-0 -z-20 h-[34rem] w-[34rem] rounded-full opacity-25 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, var(--color-moss), transparent 60%)",
        }}
      />

      {/* Interactive ASCII source field (mouse + scroll reactive) */}
      <AsciiField className="grid-mask absolute inset-0 -z-10" />

      <div data-hero-content className="container-x relative z-10">
        <div data-hero-fade className="label mb-7 flex items-center gap-3">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-lime" />
          Descience Open Source Club
        </div>

        <h1 className="display max-w-[16ch] text-[clamp(2.8rem,9vw,8.5rem)]">
          <RevealText
            text="Learn. Build."
            as="span"
            className="block"
            splitBy="char"
          />
          <RevealText
            text="Ship in the open."
            as="span"
            className="block text-gradient"
            delay={0.15}
          />
        </h1>

        <p
          data-hero-fade
          className="mt-8 max-w-xl text-base leading-relaxed text-muted md:text-lg"
        >
          A student-driven community where curious minds become confident
          builders — through workshops, real projects and the open source world.
        </p>

        <div data-hero-fade className="mt-10 flex flex-wrap items-center gap-4">
          <Magnetic>
            <button
              onClick={() => scrollToSection("#join")}
              className="btn btn-primary"
            >
              Join the club
              <span aria-hidden>→</span>
            </button>
          </Magnetic>
          <Magnetic>
            <button
              onClick={() => scrollToSection("#domains")}
              className="btn btn-ghost"
            >
              Explore domains
            </button>
          </Magnetic>
        </div>

        <div
          data-hero-fade
          className="label mt-16 flex flex-wrap items-center gap-x-6 gap-y-2"
        >
          <span>Web</span>
          <span className="text-violet">/</span>
          <span>Cloud</span>
          <span className="text-cyan">/</span>
          <span>Open Source</span>
          <span className="text-lime">/</span>
          <span>Mentorship</span>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        data-hero-fade
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
      >
        <span className="label">Scroll</span>
        <span className="relative h-12 w-px overflow-hidden bg-line">
          <span className="absolute inset-x-0 top-0 h-4 animate-[scrollcue_1.8s_ease-in-out_infinite] bg-lime" />
        </span>
      </div>
    </section>
  );
}
