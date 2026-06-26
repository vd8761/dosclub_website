"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { journey } from "@/data/site";

export default function Journey() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-line-fill]", {
        scaleY: 0,
        ease: "none",
        transformOrigin: "top",
        scrollTrigger: {
          trigger: "[data-steps]",
          start: "top 65%",
          end: "bottom 75%",
          scrub: true,
        },
      });

      gsap.utils.toArray<HTMLElement>("[data-step]").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 50,
          duration: 0.9,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 82%" },
        });
      });
    },
    { scope: root }
  );

  return (
    <section id="journey" ref={root} className="section">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4 lg:sticky lg:top-28 lg:h-fit">
            <p className="label mb-6">/ 03 — How it works</p>
            <h2 className="display text-[clamp(2.2rem,5vw,4rem)] leading-[1.02]">
              Your path from
              <span className="text-gradient"> first commit</span> to
              contributor.
            </h2>
            <p className="mt-6 max-w-sm text-muted">
              Four simple steps. No prerequisites, no pressure — just momentum.
            </p>
          </div>

          <div data-steps className="relative lg:col-span-7 lg:col-start-6">
            {/* progress rail */}
            <span className="absolute left-[1.15rem] top-2 h-[calc(100%-1rem)] w-px bg-line md:left-[1.4rem]" />
            <span
              data-line-fill
              className="absolute left-[1.15rem] top-2 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-violet via-cyan to-lime md:left-[1.4rem]"
            />

            <div className="flex flex-col gap-14">
              {journey.map((s) => (
                <div
                  key={s.no}
                  data-step
                  className="relative flex gap-6 pl-0 md:gap-10"
                >
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-ink font-mono text-sm md:h-12 md:w-12">
                    {s.no}
                  </div>
                  <div className="pt-1">
                    <h3 className="display text-2xl font-semibold md:text-3xl">
                      {s.title}
                    </h3>
                    <p className="mt-3 max-w-md text-muted">{s.body}</p>
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
