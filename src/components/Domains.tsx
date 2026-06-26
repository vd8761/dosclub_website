"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { domains } from "@/data/site";

export default function Domains() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const el = track.current;
        if (!el) return;
        const distance = () => el.scrollWidth - window.innerWidth;
        gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => "+=" + distance(),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      });
    },
    { scope: root }
  );

  return (
    <section
      id="domains"
      ref={root}
      className="relative overflow-hidden lg:h-screen"
    >
      <div
        ref={track}
        className="flex flex-col gap-6 px-5 py-20 md:px-8 lg:h-screen lg:flex-row lg:items-center lg:gap-8 lg:py-0 lg:pl-[8vw] lg:pr-[40vw]"
      >
        {/* Intro panel */}
        <div className="flex shrink-0 flex-col justify-center lg:h-screen lg:w-[34rem] lg:pr-12">
          <p className="label mb-6">/ 02 — Focus areas</p>
          <h2 className="display text-[clamp(2.2rem,6vw,4.5rem)] leading-[1]">
            Four domains.
            <br />
            <span className="text-gradient">One community.</span>
          </h2>
          <p className="mt-6 max-w-md text-muted">
            Pick a lane or explore them all. Every track blends learning with
            real, shippable work.
          </p>
          <p className="label mt-10 hidden items-center gap-3 lg:flex">
            Drag / scroll <span className="text-violet">→</span>
          </p>
        </div>

        {/* Domain cards */}
        {domains.map((d) => (
          <article
            key={d.no}
            className="glass group relative flex shrink-0 flex-col justify-between overflow-hidden rounded-3xl p-8 transition-transform duration-500 hover:-translate-y-1 md:p-10 lg:h-[30rem] lg:w-[26rem]"
          >
            <span
              aria-hidden
              className="display pointer-events-none absolute -right-4 -top-10 text-[10rem] font-bold leading-none text-transparent opacity-60"
              style={{ WebkitTextStroke: "1px var(--color-stroke)" }}
            >
              {d.no}
            </span>

            <div className="relative">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: d.accent }}
              />
              <h3 className="display mt-8 text-3xl font-semibold md:text-4xl">
                {d.title}
              </h3>
              <p className="mt-4 max-w-sm text-muted">{d.body}</p>
            </div>

            <div className="relative mt-8 flex flex-wrap gap-2">
              {d.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-line px-3 py-1.5 font-mono text-xs text-muted"
                >
                  {t}
                </span>
              ))}
            </div>

            <span
              className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
              style={{ background: d.accent }}
            />
          </article>
        ))}
      </div>
    </section>
  );
}
