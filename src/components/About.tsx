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
    <section id="about" ref={root} className="section section-flush-b">
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

          <div className="flex flex-col justify-end lg:col-span-5">
            {/* Decorative Terminal Window */}
            <div className="flex-1 w-full min-h-[220px] mb-10 rounded-3xl border border-[#1c394a] bg-[#07151e] overflow-hidden flex flex-col relative group shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#14b8a6]/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              
              {/* Window Header */}
              <div className="h-10 border-b border-[#1c394a] bg-[#0d212d] flex items-center px-5 gap-2 relative z-10">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="font-mono text-[10px] text-[#8ba2b0] tracking-widest uppercase">terminal</span>
                </div>
              </div>
              
              {/* Terminal Content */}
              <div className="p-6 flex-1 font-mono text-xs sm:text-sm leading-loose relative z-10 flex flex-col justify-center">
                <p><span className="text-[#14b8a6] font-semibold">~/dos-club</span> <span className="text-[#0ea5e9]">❯</span> <span className="text-[#f1f7fa]">./start_journey.sh</span></p>
                <p className="mt-3 text-[#cbd5e1]">&gt; Initializing collaborative environment...</p>
                <p className="text-[#cbd5e1]">&gt; Connecting to expert mentors... <span className="text-[#27c93f]">Success</span></p>
                <p className="text-[#cbd5e1]">&gt; Bypassing gatekeepers... <span className="text-[#27c93f]">Done</span></p>
                <p className="mt-3 text-[#f1f7fa] font-semibold flex items-center gap-2">
                  Ready to ship better work. <span className="inline-block w-2 h-4 bg-[#14b8a6] animate-pulse" />
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6">
            <p className="text-muted leading-relaxed">
              Descience Open Source Club brings learners together to sharpen
              their skills with hands-on projects, expert mentorship and
              continuous feedback. No gatekeeping - just people helping people
              ship better work, in the open.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted">
              <span className="h-px w-12 bg-primary" />
              Powered by Touchmark Descience
            </div>
            </div>
          </div>
        </div>

        <div
          data-pillars
          className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4"
        >
          {pillars.map((p) => (
            <div
              key={p.no}
              data-pillar
              className="group relative bg-surface p-8 transition-colors duration-500 hover:bg-ink-soft"
            >
              <span className="label">{p.no}</span>
              <h3 className="display mt-8 text-xl font-semibold">{p.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                {p.body}
              </p>
              <span className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-primary to-accent transition-all duration-500 group-hover:w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
