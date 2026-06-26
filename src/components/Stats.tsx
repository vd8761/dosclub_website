"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { stats } from "@/data/site";

export default function Stats() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>("[data-counter]");
      items.forEach((el) => {
        const num = el.querySelector<HTMLElement>(".num");
        const end = Number(el.dataset.value);
        if (!num) return;
        const obj = { v: 0 };
        gsap.to(obj, {
          v: end,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
          onUpdate: () => {
            num.textContent = Math.floor(obj.v).toString();
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <section className="border-y border-line bg-ink-soft">
      <div
        ref={root}
        className="container-x grid grid-cols-2 gap-px lg:grid-cols-4"
      >
        {stats.map((s) => (
          <div
            key={s.label}
            data-counter
            data-value={s.value}
            className="flex flex-col gap-2 py-12 pr-6 lg:py-16"
          >
            <div className="display text-5xl font-semibold md:text-6xl">
              <span className="num text-gradient">0</span>
              <span className="text-gradient">{s.suffix}</span>
            </div>
            <p className="label">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
