"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import RevealText from "./ui/RevealText";
import { faqs } from "@/data/site";

export default function Faq() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(0);

  useGSAP(
    () => {
      gsap.from("[data-faq]", {
        y: 24,
        opacity: 0,
        duration: 0.7,
        ease: "expo.out",
        stagger: 0.07,
        scrollTrigger: { trigger: "[data-faqlist]", start: "top 82%" },
      });
    },
    { scope: root }
  );

  return (
    <section id="faq" ref={root} className="section">
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="label mb-6">/ 07 — FAQ</p>
          <h2 className="display text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.05]">
            <RevealText text="Questions?" as="span" className="block" scrub />
            <RevealText
              text="Answered."
              as="span"
              className="block text-gradient"
              scrub
            />
          </h2>
          <p className="mt-6 max-w-xs text-muted">
            Everything you might want to know before jumping in.
          </p>
        </div>

        <div
          data-faqlist
          className="flex flex-col gap-3 lg:col-span-8 lg:col-start-5"
        >
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                data-faq
                key={i}
                className="overflow-hidden rounded-xl border border-line bg-surface"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-medium md:text-lg">{f.q}</span>
                  <span
                    className={`relative grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${
                      isOpen
                        ? "border-transparent bg-green-dark text-white"
                        : "border-line text-green-dark"
                    }`}
                  >
                    <span className="absolute h-px w-3 bg-current" />
                    <span
                      className={`absolute h-3 w-px bg-current transition-transform duration-300 ${
                        isOpen ? "scale-y-0" : ""
                      }`}
                    />
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-sm leading-relaxed text-muted">
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
