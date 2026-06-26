"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import RevealText from "./ui/RevealText";
import { pillars } from "@/data/site";

export default function About() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-pillar]", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.12,
        scrollTrigger: { trigger: "[data-pillars]", start: "top 80%" },
      });
    },
    { scope: root },
  );

  return (
    <section id="about" ref={root} className="section">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <p className="label mb-8">/ 01 - About the club</p>
            <h2 className="display text-3xl leading-[1.05] sm:text-4xl lg:text-5xl xl:text-6xl">
              <RevealText
                text="We're an open source community built to help curious people grow - through collaboration, guidance and a lot of building."
                as="span"
                scrub
              />
            </h2>
          </div>

          <div className="flex flex-col justify-end gap-6 lg:col-span-5">
            <p className="text-muted leading-relaxed">
              Descience Open Source Club brings learners together to sharpen
              their skills with hands-on projects, expert mentorship and
              continuous feedback. No gatekeeping - just people helping people
              ship better work, in the open.
            </p>
            <div className="flex items-center gap-3 text-sm text-muted">
              <span className="h-px w-12 bg-violet" />
              Powered by Touchmark DesScience
            </div>
          </div>
        </div>

        <div
          data-pillars
          className="mt-20 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4"
        >
          {pillars.map((p) => (
            <div
              key={p.no}
              data-pillar
              className="group relative bg-surface p-8 transition-colors duration-500 hover:bg-ink-soft"
            >
              <span className="label">{p.no}</span>
              <h3 className="display mt-8 text-xl font-semibold">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {p.body}
              </p>
              <span className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-violet to-cyan transition-all duration-500 group-hover:w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
