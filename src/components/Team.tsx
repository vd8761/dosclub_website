"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import RevealText from "./ui/RevealText";
import { team } from "@/data/site";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

export default function Team() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-member]", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.12,
        scrollTrigger: { trigger: "[data-team]", start: "top 80%" },
      });
    },
    { scope: root },
  );

  return (
    <section id="team" ref={root} className="section">
      <div className="container-x">
        <p className="label mb-6">/ 05 - The people</p>
        <h2 className="display max-w-3xl text-4xl leading-[1.02] sm:text-5xl lg:text-6xl xl:text-7xl">
          <RevealText
            text="Mentors who've shipped, helping you"
            as="span"
            className="block"
            scrub
          />
          <RevealText
            text="do the same."
            as="span"
            className="block text-gradient"
            scrub
          />
        </h2>

        <div
          data-team
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {team.map((m) => (
            <article
              key={m.name}
              data-member
              className="glass group flex flex-col rounded-3xl p-8 transition-transform duration-500 hover:-translate-y-1.5"
            >
              <div
                className="flex h-20 w-20 items-center justify-center rounded-2xl font-display text-2xl font-semibold text-ink"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-violet), var(--color-cyan))",
                }}
              >
                {initials(m.name)}
              </div>
              <h3 className="display mt-8 text-2xl font-semibold">{m.name}</h3>
              <p className="mt-1 text-sm text-green-dark">{m.role}</p>
              <p className="mt-4 text-sm text-muted">{m.title}</p>
              <span className="mt-6 h-px w-full bg-line" />
              <span className="label mt-6 inline-flex items-center gap-2 transition-colors group-hover:text-fg">
                Connect <span className="text-green">{"->"}</span>
              </span>
            </article>
          ))}

          {/* Join the team card */}
          <article
            data-member
            className="flex flex-col justify-between rounded-3xl border border-dashed border-line p-8"
          >
            <div>
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-line text-3xl text-muted">
                +
              </div>
              <h3 className="display mt-8 text-2xl font-semibold">
                Become a lead
              </h3>
              <p className="mt-4 text-sm text-muted">
                Passionate about teaching and open source? Help us run domains,
                workshops and the community.
              </p>
            </div>
            <a
              href="#join"
              className="label mt-6 inline-flex items-center gap-2 text-fg"
            >
              Reach out <span className="text-green">{"->"}</span>
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
