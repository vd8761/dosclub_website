"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import RevealText from "./ui/RevealText";
import { ossFridayIntro } from "@/data/site";
import {
  formatEventDayMonth,
  formatEventTime,
  isPast,
  locationLine,
  type ClubEvent,
} from "@/lib/events";

/** How many upcoming sessions the home page lists before it stops. */
const MAX_SHOWN = 4;

const deep = "var(--color-on-deep)";
const deepMuted = "var(--color-on-deep-muted)";

export default function OpenSourceFriday({
  sessions,
}: {
  sessions: ClubEvent[];
}) {
  const root = useRef<HTMLElement>(null);

  // Only what's ahead. A weekly session's past instances are noise on the
  // home page - the point of the section is "here's the next one".
  const upcoming = sessions.filter((s) => !isPast(s)).slice(0, MAX_SHOWN);

  useGSAP(
    () => {
      gsap.from("[data-osf-card]", {
        y: 28,
        opacity: 0,
        duration: 0.8,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: "[data-osf-list]", start: "top 85%" },
      });
    },
    { scope: root, dependencies: [upcoming.length] },
  );

  return (
    <section
      id="open-source-friday"
      ref={root}
      className="section bg-deep text-[color:var(--color-on-deep)]"
    >
      <div className="container-x">
        {/* ---------------- Header ---------------- */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="label mb-6" style={{ color: deepMuted }}>
              / 05 - Open Source Friday
            </p>
            <h2 className="display text-4xl leading-[1.02] sm:text-5xl lg:text-6xl xl:text-7xl">
              <RevealText
                text="Every Friday,"
                as="span"
                className="block"
                scrub
              />
              <RevealText
                text="we ship together."
                as="span"
                className="block text-gradient-2"
                scrub
              />
            </h2>
          </div>
          <div className="max-w-xs">
            <p
              className="font-mono text-xs uppercase tracking-[0.14em]"
              style={{ color: deepMuted }}
            >
              {ossFridayIntro.cadence}
            </p>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: deepMuted }}>
              {ossFridayIntro.body}
            </p>
          </div>
        </div>

        {/* ---------------- Sessions ---------------- */}
        {upcoming.length === 0 ? (
          <p
            className="mt-12 border-t pt-8"
            style={{ borderColor: "rgba(232,241,245,0.16)", color: deepMuted }}
          >
            The next session is being scheduled. Check back soon - or join the
            community and we&apos;ll tell you first.
          </p>
        ) : (
          <ul
            data-osf-list
            className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            {upcoming.map((s) => {
              const { day, month } = formatEventDayMonth(s);
              const meta = [formatEventTime(s), locationLine(s)]
                .filter(Boolean)
                .join("  ·  ");

              return (
                <li
                  key={s.id}
                  data-osf-card
                  className="flex flex-col gap-5 rounded-2xl border p-6 transition-colors duration-300 hover:border-[color:var(--color-primary-soft)]"
                  style={{
                    borderColor: "rgba(232,241,245,0.16)",
                    background: "rgba(232,241,245,0.04)",
                  }}
                >
                  {/* Date + level */}
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary font-mono leading-none text-white">
                      <span className="text-lg font-medium">{day}</span>
                      <span className="mt-1.5 text-[10px] tracking-[0.14em]">
                        {month}
                      </span>
                    </span>
                    {s.level && (
                      <span
                        className="rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em]"
                        style={{
                          borderColor: "rgba(232,241,245,0.24)",
                          color: deepMuted,
                        }}
                      >
                        {s.level}
                      </span>
                    )}
                  </div>

                  {/* Title + project */}
                  <div className="min-w-0">
                    <h3 className="display text-xl font-semibold leading-snug">
                      {s.title}
                    </h3>
                    {s.project && (
                      <p className="mt-2 truncate font-mono text-xs text-[color:var(--color-primary-soft)]">
                        {s.project}
                      </p>
                    )}
                    {s.summary && (
                      <p
                        className="mt-3 text-sm leading-relaxed"
                        style={{ color: deepMuted }}
                      >
                        {s.summary}
                      </p>
                    )}
                  </div>

                  {/* Meta + links */}
                  <div className="mt-auto flex flex-col gap-3">
                    {meta && (
                      <p className="text-xs" style={{ color: deepMuted }}>
                        {meta}
                      </p>
                    )}
                    {s.hosts[0] && (
                      <p className="text-xs" style={{ color: deepMuted }}>
                        Led by{" "}
                        <span style={{ color: deep }}>{s.hosts[0].name}</span>
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
                      {(s.registerUrl || s.joinUrl) && (
                        <a
                          href={s.registerUrl ?? s.joinUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="font-mono text-xs text-[color:var(--color-primary-soft)] underline underline-offset-4 transition-colors hover:text-[color:var(--color-accent-soft)]"
                        >
                          {s.registerUrl ? "Register" : "Join"}{" "}
                          <span aria-hidden>{"->"}</span>
                        </a>
                      )}
                      {s.repoUrl && (
                        <a
                          href={s.repoUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="font-mono text-xs underline underline-offset-4 transition-colors hover:text-[color:var(--color-accent-soft)]"
                          style={{ color: deepMuted }}
                        >
                          Repo
                        </a>
                      )}
                      {s.issuesUrl && (
                        <a
                          href={s.issuesUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="font-mono text-xs underline underline-offset-4 transition-colors hover:text-[color:var(--color-accent-soft)]"
                          style={{ color: deepMuted }}
                        >
                          Good first issues
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
