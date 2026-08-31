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

/**
 * ============================================================================
 * TODO: HERO EVENT STATUS RIBBON SPECIFICATION
 * ============================================================================
 * The "Next up" badge in the Hero section displays live event status with strict rules:
 *
 * 1. ONLY display this badge if there is an "Ongoing" or "Upcoming" event available.
 * 2. If ONLY past/completed events exist in the CMS, do NOT show the Hero event badge at all.
 * 3. If CMS is DOWN or unconfigured, do NOT show the Hero event badge.
 * 4. When visible, clicking smooth-scrolls the user down to the #events section.
 * ============================================================================
 */

/** The ribbon reads the top of the events list - keep events[0] current. */
const nextEvent = events[0];

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
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

        // Safe intro animation without scrollTrigger opacity clashes
        gsap.from("[data-hero-fade]", {
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: "expo.out",
          delay: 0.2,
          stagger: 0.08,
          clearProps: "opacity,transform",
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      id="top"
      ref={root}
      className="relative flex min-h-[100svh] w-full flex-col justify-center overflow-hidden pt-24 pb-16 md:pt-28 md:pb-16 lg:py-0"
    >
      {/* Structural grid - gives the empty space a reason to be there */}
      <div
        aria-hidden
        className="grid-bg grid-mask-wide pointer-events-none absolute inset-0 -z-30"
      />

      {/* Ambient blobs - gradient only, no filter (see .blob in globals.css) */}
      <div
        data-blob="1"
        className="blob -left-32 top-8 -z-20 h-[44rem] w-[44rem] opacity-35"
        style={{ "--blob-rgb": "var(--rgb-primary)" } as CSSProperties}
      />
      <div
        data-blob="2"
        className="blob -right-24 bottom-0 -z-20 h-[42rem] w-[42rem] opacity-30"
        style={{ "--blob-rgb": "var(--rgb-accent)" } as CSSProperties}
      />

      {/* Interactive ASCII source field (mouse + scroll reactive) */}
      <AsciiField className="grid-mask absolute inset-0 -z-10" />

      <div
        data-hero-content
        className="mx-auto w-full max-w-[1720px] px-6 sm:px-12 lg:px-16 relative z-10 grid items-center gap-12 lg:grid-cols-12 lg:gap-12 xl:gap-20 2xl:gap-24"
      >
        {/* ---------------- Left: the pitch ---------------- */}
        <div className="lg:col-span-7 2xl:col-span-7">
          <div data-hero-fade className="mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.webp"
              alt="Descience Open Source Club"
              className="h-16 w-auto sm:h-20 lg:h-20 2xl:h-24"
            />
          </div>

          {/* Next-event ribbon */}
          {nextEvent && (
            <button
              data-hero-fade
              onClick={() => scrollToSection("#events")}
              className="group mb-6 inline-flex cursor-pointer items-center gap-3 rounded-full border border-line bg-surface/90 px-5 py-2.5 text-left shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:bg-surface hover:shadow-md"
            >
              <span className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-primary-dark">
                Next up
              </span>
              <span className="text-sm sm:text-base font-semibold text-fg group-hover:text-accent-dark">
                {nextEvent.title}
              </span>
              <span className="font-mono text-xs text-muted">
                {nextEvent.date}
              </span>
              <span
                aria-hidden
                className="font-mono text-xs text-primary transition-transform duration-300 group-hover:translate-x-0.5"
              >
                {"->"}
              </span>
            </button>
          )}

          <h1 className="display max-w-[14ch] text-6xl sm:text-7xl md:text-8xl lg:text-7xl xl:text-8xl 2xl:text-[6.5rem] leading-[0.96] tracking-tight font-bold">
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
            className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg lg:text-xl"
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
              <a
                href="http://membership.descienceosclub.com/"
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary !py-4 !px-9 text-base font-semibold shadow-lg"
              >
                Join the club
                <span aria-hidden>{"->"}</span>
              </a>
            </Magnetic>
            <Magnetic>
              <button
                onClick={() => scrollToSection("#domains")}
                className="btn btn-ghost !py-4 !px-9 text-base font-semibold"
              >
                Explore domains
              </button>
            </Magnetic>
          </div>

          {/* Social proof, above the fold */}
          <div data-hero-fade className="mt-10">
            <HeroProof />
          </div>
        </div>

        {/* ---------------- Right: the artifact (desktop only) ---------------- */}
        <div data-hero-fade data-hero-pane className="hidden lg:block lg:col-span-5 2xl:col-span-5 w-full">
          <CodePane />

          <div className="label mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-semibold">
            <span>AI Engineering</span>
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
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
      >
        <span className="label text-[11px] font-bold">Scroll</span>
        <span className="relative h-10 w-px overflow-hidden bg-line">
          <span className="absolute inset-x-0 top-0 h-4 animate-[scrollcue_1.8s_ease-in-out_infinite] bg-primary-soft" />
        </span>
      </div>
    </section>
  );
}
