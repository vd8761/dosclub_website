"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import RevealText from "./ui/RevealText";
import { events } from "@/data/site";

export default function Events() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-event]", {
        y: 32,
        opacity: 0,
        duration: 0.8,
        ease: "expo.out",
        stagger: 0.1,
        scrollTrigger: { trigger: "[data-events]", start: "top 82%" },
      });
    },
    { scope: root },
  );

  return (
    <section id="events" ref={root} className="section">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="label mb-6">/ 04 - Events</p>
            <h2 className="display text-4xl leading-[1.02] sm:text-5xl lg:text-6xl xl:text-7xl">
              <RevealText
                text="Workshops, webinars &"
                as="span"
                className="block"
                scrub
              />
              <RevealText
                text="build sessions."
                as="span"
                className="block text-gradient"
                scrub
              />
            </h2>
          </div>
          <p className="max-w-xs text-muted">
            Hands-on sessions led by working engineers. Hover to peek at the
            details.
          </p>
        </div>

        <div data-events className="mt-16 border-t border-line">
          {events.map((e) => (
            <div
              key={e.title}
              data-event
              className="group grid grid-cols-1 gap-2 border-b border-line py-7 transition-colors duration-300 hover:bg-ink-soft md:grid-cols-12 md:items-center md:gap-6 md:py-9"
            >
              <div className="label md:col-span-3">
                {e.date}
                <span className="mt-1 block text-muted/70">{e.time}</span>
              </div>

              <div className="md:col-span-5">
                <h3 className="display text-2xl font-semibold transition-colors duration-300 group-hover:text-gradient md:text-4xl">
                  {e.title}
                </h3>
                <p className="mt-1 text-sm text-muted md:hidden">
                  {e.host} | {e.location}
                </p>
              </div>

              <div className="hidden text-sm text-muted md:col-span-3 md:block">
                {e.host}
                <span className="mt-1 block text-muted/70">{e.location}</span>
              </div>

              <div className="flex items-center justify-between md:col-span-1 md:justify-end">
                <span className="rounded-full border border-line px-3 py-1 font-mono text-xs text-muted">
                  {e.tag}
                </span>
                <span className="ml-3 text-violet opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:ml-0">
                  ^
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
