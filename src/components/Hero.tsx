"use client";

import { CSSProperties, Suspense, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import RevealText from "./ui/RevealText";
import Magnetic from "./ui/Magnetic";
import CodePane from "./CodePane";
import HeroProof from "./HeroProof";
import { scrollToSection } from "./SmoothScroll";
import HeroEventRibbon, {
  HeroEventRibbonFallback,
} from "./HeroEventRibbon";
import { type ClubEvent } from "@/lib/events";

export default function Hero({
  sessionsPromise,
}: {
  // Unawaited on purpose: the hero paints immediately and only the event
  // ribbon suspends while the query lands.
  sessionsPromise?: Promise<ClubEvent[]>;
}) {
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
      className="relative flex min-h-[100svh] w-full flex-col justify-center overflow-hidden pt-24 pb-12 sm:pt-28 sm:pb-16 lg:py-16 xl:py-20"
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

      <div
        data-hero-content
        className="mx-auto w-full max-w-[1560px] px-6 sm:px-10 lg:px-12 xl:px-16 relative z-10 grid items-center gap-8 lg:grid-cols-12 lg:gap-8 xl:gap-12 2xl:gap-16"
      >
        {/* ---------------- Left: the pitch ---------------- */}
        <div className="min-w-0 lg:col-span-7 2xl:col-span-7">
          <div data-hero-fade className="mb-4 lg:mb-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.webp"
              alt="Descience Open Source Club"
              className="h-12 w-auto sm:h-14 md:h-16 lg:h-14 xl:h-18 2xl:h-20"
            />
          </div>

          {/* Next-event / Ongoing ribbon - streams in behind its own
              boundary, so a slow events query never delays the hero. */}
          {sessionsPromise && (
            <div data-hero-fade className="min-w-0">
              <Suspense fallback={<HeroEventRibbonFallback />}>
                <HeroEventRibbon sessionsPromise={sessionsPromise} />
              </Suspense>
            </div>
          )}

          <h1 className="display max-w-[15ch] text-4xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl 2xl:text-7xl leading-[1.04] sm:leading-[1.0] lg:leading-[0.98] tracking-tight font-bold">
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
            className="mt-4 lg:mt-5 max-w-xl text-sm sm:text-base lg:text-base xl:text-lg leading-relaxed text-muted"
          >
            A student-driven community where curious minds become confident
            builders - through workshops, real projects and the open source
            world.
          </p>

          <div
            data-hero-fade
            className="mt-6 lg:mt-7 flex flex-wrap items-center gap-3 sm:gap-4"
          >
            <Magnetic>
              <a
                href="http://membership.descienceosclub.com/"
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary !py-3 !px-7 sm:!py-3.5 sm:!px-8 text-sm sm:text-base font-semibold shadow-lg"
              >
                Join the club
                <span aria-hidden>{"->"}</span>
              </a>
            </Magnetic>
            <Magnetic>
              <button
                onClick={() => scrollToSection("#domains")}
                className="btn btn-ghost !py-3 !px-7 sm:!py-3.5 sm:!px-8 text-sm sm:text-base font-semibold"
              >
                Explore domains
              </button>
            </Magnetic>
          </div>

          {/* Social proof, above the fold */}
          <div data-hero-fade className="mt-6 lg:mt-8">
            <HeroProof />
          </div>
        </div>

        {/* ---------------- Right: the artifact (desktop only) ---------------- */}
        <div data-hero-fade data-hero-pane className="hidden lg:block lg:col-span-5 2xl:col-span-5 w-full max-w-md xl:max-w-none justify-self-end">
          <CodePane />

          <div className="label mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-semibold">
            <span>AI Engg.</span>
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
