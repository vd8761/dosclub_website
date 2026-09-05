"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import RevealText from "./ui/RevealText";
import { studentTeams } from "@/data/site";

/**
 * The people section.
 *
 * These are the students who came through the club, grouped into the
 * colour-named teams they build in - not the mentors. Each card is that
 * team's group photo; the club is the room full of people, so the photos
 * do the talking and the copy stays out of the way.
 */
export default function Team() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-team-card]", {
        y: 32,
        opacity: 0,
        duration: 0.7,
        ease: "expo.out",
        stagger: 0.06,
        scrollTrigger: { trigger: "[data-team]", start: "top 82%" },
      });
    },
    { scope: root },
  );

  return (
    <section id="team" ref={root} className="section section-flush-t">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="label mb-6">/ 05 - The people</p>
            <h2 className="display max-w-3xl text-4xl leading-[1.02] sm:text-5xl lg:text-6xl xl:text-7xl">
              <RevealText
                text="Ten teams. One"
                as="span"
                className="block"
                scrub
              />
              <RevealText
                text="open source club."
                as="span"
                className="block text-gradient"
                scrub
              />
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-relaxed text-muted md:text-right">
            Every member joins a colour team. They learn together, ship
            together, and carry each other through the hard parts.
          </p>
        </div>

        <div
          data-team
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {studentTeams.map((t, i) => (
            <figure
              key={t.slug}
              data-team-card
              className="group relative overflow-hidden rounded-3xl border border-line bg-ink-2"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={`/team/${t.slug}.jpeg`}
                  alt={`Team ${t.name}`}
                  fill
                  // Four across at xl, three at lg, two at sm, one below.
                  sizes="(min-width: 1280px) 23vw, (min-width: 1024px) 31vw, (min-width: 640px) 47vw, 92vw"
                  // Only the first row is anywhere near the fold; the rest
                  // stay lazy so they never compete with the page load.
                  loading={i < 4 ? "eager" : "lazy"}
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                {/* Legibility scrim for the caption. */}
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 via-black/25 to-transparent"
                />
              </div>

              <figcaption className="absolute inset-x-0 bottom-0 flex items-center gap-2.5 p-4">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-white/60"
                  style={{ background: t.swatch }}
                />
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-white">
                  Team {t.name}
                </span>
              </figcaption>
            </figure>
          ))}

          {/* Join card - same footprint as a team tile. */}
          <div
            data-team-card
            className="flex flex-col justify-between rounded-3xl border border-dashed border-line p-6"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line text-2xl text-muted">
                +
              </div>
              <h3 className="display mt-5 text-xl font-semibold">
                Your team next
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Every intake forms new colour teams. Join the club and you get
                one - along with the people in it.
              </p>
            </div>
            <Link
              href="/enquiry"
              className="label mt-6 inline-flex items-center gap-2 text-fg transition-colors hover:text-primary"
            >
              Get in touch <span className="text-primary">{"->"}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
