"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { journey } from "@/data/site";

export default function Journey() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Rail draws as you scroll the steps.
      gsap.from("[data-line-fill]", {
        scaleY: 0,
        ease: "none",
        transformOrigin: "top",
        scrollTrigger: {
          trigger: "[data-steps]",
          start: "top 68%",
          end: "bottom 80%",
          scrub: true,
        },
      });

      // Per step: content fades in, the node ring + check draw on, fill pops.
      gsap.utils.toArray<HTMLElement>("[data-step]").forEach((el) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: "top 80%" },
        });
        tl.from(el.querySelector("[data-content]"), {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "expo.out",
        })
          .fromTo(
            el.querySelector("[data-ring]"),
            { drawSVG: "0%" },
            { drawSVG: "100%", duration: 0.7, ease: "power2.inOut" },
            0,
          )
          .fromTo(
            el.querySelector("[data-fill]"),
            { scale: 0, transformOrigin: "50% 50%" },
            { scale: 1, duration: 0.5, ease: "back.out(2)" },
            0.2,
          )
          .fromTo(
            el.querySelector("[data-check]"),
            { drawSVG: "0%" },
            { drawSVG: "100%", duration: 0.45, ease: "power2.out" },
            0.5,
          );
      });
    },
    { scope: root },
  );

  return (
    <section id="journey" ref={root} className="section overflow-hidden">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4 lg:sticky lg:top-28 lg:h-fit">
            <p className="label mb-6">/ 03 - How it works</p>
            <h2 className="display text-4xl leading-[1.02] sm:text-5xl lg:text-6xl xl:text-7xl">
              Your path from
              <span className="text-gradient"> first commit</span> to
              contributor.
            </h2>
            <p className="mt-6 max-w-sm text-muted">
              Four simple steps. No prerequisites, no pressure - just momentum.
            </p>
          </div>

          <div data-steps className="relative lg:col-span-7 lg:col-start-6">
            {/* progress rail */}
            <span className="absolute left-6 top-6 h-[calc(100%-3rem)] w-px bg-line" />
            <span
              data-line-fill
              className="absolute left-6 top-6 h-[calc(100%-3rem)] w-px bg-gradient-to-b from-forest via-green to-leaf"
            />

            <div className="flex flex-col gap-16">
              {journey.map((s) => (
                <div
                  key={s.no}
                  data-step
                  className="relative flex items-start gap-6 md:gap-10"
                >
                  {/* SVG node */}
                  <div className="relative z-10 shrink-0">
                    <svg viewBox="0 0 48 48" className="h-12 w-12">
                      <circle
                        cx="24"
                        cy="24"
                        r="22"
                        fill="var(--color-ink)"
                        stroke="var(--color-line)"
                        strokeWidth="1"
                      />
                      <circle
                        data-fill
                        cx="24"
                        cy="24"
                        r="22"
                        fill="var(--color-green)"
                        opacity="0.14"
                      />
                      <circle
                        data-ring
                        cx="24"
                        cy="24"
                        r="22"
                        fill="none"
                        stroke="var(--color-green)"
                        strokeWidth="1.6"
                      />
                      <path
                        data-check
                        d="M15 24.5 L21.5 31 L33 17.5"
                        fill="none"
                        stroke="var(--color-green-dark)"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  {/* content + parallax ghost number */}
                  <div className="relative flex-1 pt-1.5">
                    <span
                      data-speed="0.88"
                      aria-hidden
                      className="display pointer-events-none absolute -top-8 right-0 text-[5.5rem] font-bold leading-none text-transparent opacity-70 md:-top-12 md:text-[8rem]"
                      style={{ WebkitTextStroke: "1px var(--color-stroke)" }}
                    >
                      {s.no}
                    </span>
                    <div data-content className="relative">
                      <h3 className="display text-2xl font-semibold md:text-3xl">
                        {s.title}
                      </h3>
                      <p className="mt-3 max-w-md text-muted">{s.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
