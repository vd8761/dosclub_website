"use client";

import { CSSProperties, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import RevealText from "./ui/RevealText";
import Magnetic from "./ui/Magnetic";
import AsciiField from "./AsciiField";
import CodePane from "./CodePane";
import HeroProof from "./HeroProof";
import { scrollToSection } from "./SmoothScroll";
import { events } from "@/data/site";

/** The ribbon reads the top of the events list - keep events[0] current. */
const nextEvent = events[0];

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

        // The pane drifts a little faster than the copy, for depth
        gsap.to("[data-hero-pane]", {
          yPercent: -22,
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
    { scope: root },
  );

  return (
    <section
      id="top"
      ref={root}
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pt-24"
    >
      {/* Structural grid - gives the empty space a reason to be there */}
      <div
        aria-hidden
        className="grid-bg grid-mask-wide pointer-events-none absolute inset-0 -z-30"
      />

      {/* Ambient blobs - gradient only, no filter (see .blob in globals.css) */}
      <div
        data-blob="1"
        className="blob -left-32 top-8 -z-20 h-[36rem] w-[36rem] opacity-30"
        style={{ "--blob-rgb": "var(--rgb-primary)" } as CSSProperties}
      />
      <div
        data-blob="2"
        className="blob -right-24 bottom-0 -z-20 h-[34rem] w-[34rem] opacity-25"
        style={{ "--blob-rgb": "var(--rgb-accent)" } as CSSProperties}
      />

      {/* Interactive ASCII source field (mouse + scroll reactive) */}
      <AsciiField className="grid-mask absolute inset-0 -z-10" />

      <div
        data-hero-content
        className="container-x relative z-10 grid items-center gap-16 lg:grid-cols-12 lg:gap-8"
      >
        {/* ---------------- Left: the pitch ---------------- */}
        <div className="lg:col-span-7">
          <div data-hero-fade className="mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.webp"
              alt="Descience Open Source Club"
              className="h-14 w-auto md:h-16"
            />
          </div>

          {/* Next-event ribbon */}
          {nextEvent && (
            <button
              data-hero-fade
              onClick={() => scrollToSection("#events")}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-4 py-2 text-left transition-colors hover:border-accent"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                Next up
              </span>
              <span className="text-sm font-medium">{nextEvent.title}</span>
              <span className="font-mono text-[11px] text-muted">
                {nextEvent.date}
              </span>
            </button>
          )}

          <h1 className="display max-w-[14ch] text-5xl sm:text-6xl md:text-7xl lg:text-6xl xl:text-7xl">
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
            className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg"
          >
            A student-driven community where curious minds become confident
            builders - through workshops, real projects and the open source
            world.
          </p>

          <div
            data-hero-fade
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Magnetic>
              <button
                onClick={() => scrollToSection("#join")}
                className="btn btn-primary"
              >
                Join the club
                <span aria-hidden>{"->"}</span>
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

          {/* Social proof, above the fold */}
          <div data-hero-fade className="mt-8">
            <HeroProof />
          </div>
        </div>

        {/* ---------------- Right: the artifact ---------------- */}
        <div data-hero-fade data-hero-pane className="lg:col-span-5 lg:pl-8">
          <CodePane />

          <div className="label mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>Web</span>
            <span className="text-primary">/</span>
            <span>Cloud</span>
            <span className="text-accent">/</span>
            <span>Open Source</span>
            <span className="text-primary-soft">/</span>
            <span>Mentorship</span>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        data-hero-fade
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
      >
        <span className="label">Scroll</span>
        <span className="relative h-12 w-px overflow-hidden bg-line">
          <span className="absolute inset-x-0 top-0 h-4 animate-[scrollcue_1.8s_ease-in-out_infinite] bg-primary-soft" />
        </span>
      </div>
    </section>
  );
}
