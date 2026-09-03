"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import RevealText from "./ui/RevealText";
import EventModal from "./EventModal";
import {
  formatEventDayMonth,
  formatEventTime,
  getEventStatus,
  locationLine,
  MODE_LABEL,
  selectFeaturedEvents,
  type ClubEvent,
} from "@/lib/events";

export default function OpenSourceFriday({
  sessions,
}: {
  sessions: ClubEvent[];
}) {
  const root = useRef<HTMLElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  // Exactly up to 3 featured events chosen strictly by Scenarios A-E
  const featuredCards = useMemo(
    () => selectFeaturedEvents(sessions),
    [sessions],
  );

  useGSAP(
    () => {
      gsap.from("[data-event-card]", {
        y: 32,
        opacity: 0,
        duration: 0.8,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: "[data-event-grid]", start: "top 85%" },
      });
    },
    { scope: root, dependencies: [featuredCards.length] },
  );

  const open = sessions.find((e) => e.id === openId) ?? null;

  return (
    <section
      id="events"
      ref={root}
      className="section relative overflow-hidden mt-12 md:mt-20 lg:mt-28 border-t border-line bg-gradient-to-b from-ink via-ink-soft to-ink"
    >
      {/* Background ambient lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-accent/15 via-primary/10 to-transparent blur-3xl"
      />

      <div className="container-x">
        {/* ---------------- Section Header ---------------- */}
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <div className="mb-4 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-primary-dark">
              / 04 - Events
            </div>
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

          <div className="flex flex-col items-start md:items-end gap-3 max-w-sm">
            <p className="text-sm leading-relaxed text-muted md:text-right">
              Hands-on sessions, Open Source Fridays and live masterclasses led by
              working engineers and mentors.
            </p>
          </div>
        </div>

        {/* ---------------- Section Subheader & View All Link ---------------- */}
        <div className="mt-12 flex items-center justify-between border-b border-line pb-6">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
            Featured Events ({featuredCards.length})
          </span>
          <Link
            href="/events"
            className="group inline-flex items-center gap-2 font-mono text-xs sm:text-sm font-medium text-accent hover:text-fg transition-colors"
          >
            <span>View all events</span>
            <span
              className="inline-block transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden
            >
              &rarr;
            </span>
          </Link>
        </div>

        {/* ---------------- Events Grid (Exactly up to 3 Featured Events) ---------------- */}
        {featuredCards.length === 0 ? (
          <div className="mt-16 flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-surface/50 p-8 text-center">
            <p className="font-mono text-sm text-muted">
              No featured events scheduled right now.
            </p>
            <Link
              href="/events"
              className="btn btn-ghost mt-4 !py-2 !text-xs font-mono"
            >
              Browse event timeline &rarr;
            </Link>
          </div>
        ) : (
          <div
            data-event-grid
            className="mt-8 flex flex-wrap justify-center gap-6"
          >
            {featuredCards.map(({ event: e, faded }) => {
              const { day, month } = formatEventDayMonth(e);
              const status = getEventStatus(e);
              const isUpcoming = status === "upcoming";
              const isOngoing = status === "ongoing";
              const isCompleted = status === "completed";

              return (
                <article
                  key={e.id}
                  data-event-card
                  className={`glass group relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 transition-all duration-500 hover:-translate-y-2 hover:border-accent hover:shadow-[0_24px_64px_-32px_rgba(12,51,70,0.45)] w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-[380px] ${
                    faded ? "opacity-65 saturate-75 hover:opacity-100 hover:saturate-100" : ""
                  }`}
                >
                  {/* Top Bar: Date + Status Badge */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      {/* Date Badge */}
                      <div
                        className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl font-mono leading-none shadow-sm ${
                          isUpcoming
                            ? "bg-gradient-to-br from-primary to-primary-dark text-white"
                            : isOngoing
                              ? "bg-gradient-to-br from-accent to-accent-dark text-white"
                              : "bg-ink-2 text-muted"
                        }`}
                      >
                        <span className="text-lg font-bold">{day}</span>
                        <span className="mt-1 text-[10px] tracking-[0.14em] uppercase">
                          {month}
                        </span>
                      </div>

                      {/* Status Tag */}
                      <div>
                        {isUpcoming && (
                          <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary-dark">
                            Upcoming
                          </span>
                        )}
                        {isOngoing && (
                          <span className="inline-flex items-center rounded-full border border-accent/40 bg-accent/15 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-accent-dark">
                            Ongoing
                          </span>
                        )}
                        {isCompleted && (
                          <span className="inline-flex items-center rounded-full bg-ink-2 px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-muted">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Domain / Category Pill */}
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-line bg-ink/70 px-3 py-1 font-mono text-[11px] text-muted">
                        {e.tags?.[0] ?? e.domain ?? e.level ?? MODE_LABEL[e.mode]}
                      </span>
                      {e.level && e.tags?.[0] && (
                        <span className="rounded-full border border-line bg-ink/70 px-3 py-1 font-mono text-[11px] text-accent-dark">
                          {e.level}
                        </span>
                      )}
                      {e.project && (
                        <span className="truncate font-mono text-[11px] text-accent-dark">
                          #{e.project}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="display mt-4 text-xl font-bold leading-tight text-fg transition-colors group-hover:text-primary-dark">
                      {e.title}
                    </h3>

                    {/* Meta info */}
                    <div className="mt-3 flex flex-col gap-1 text-xs text-muted">
                      <p className="flex items-center gap-2 font-mono">
                        <span>🕒</span>
                        <span>{formatEventTime(e) || "18:00 - 20:00 IST"}</span>
                      </p>
                      <p className="flex items-center gap-2 font-mono">
                        <span>📍</span>
                        <span>{locationLine(e) || "Online"}</span>
                      </p>
                      {e.hosts[0]?.name && (
                        <p className="mt-1 text-xs text-muted">
                          Host: <span className="text-fg font-medium">{e.hosts[0].name}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Section */}
                  <div className="mt-8 border-t border-line/80 pt-4 flex items-center justify-between gap-3">
                    {isUpcoming ? (
                      e.registerUrl ? (
                        <a
                          href={e.registerUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="btn btn-primary w-full justify-center !py-2.5 !text-xs font-semibold shadow-sm hover:shadow-md"
                        >
                          Register <span aria-hidden>{"->"}</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="btn btn-ghost w-full justify-center !py-2.5 !text-xs font-mono text-primary-dark border border-primary/30 bg-primary/10"
                        >
                          Upcoming
                        </button>
                      )
                    ) : isOngoing ? (
                      <button
                        type="button"
                        disabled
                        aria-disabled="true"
                        className="btn btn-ghost w-full justify-center !py-2.5 !text-xs border border-accent/40 bg-accent/15 text-accent-dark font-mono"
                      >
                        Ongoing
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        aria-disabled="true"
                        className="btn btn-ghost w-full justify-center !py-2.5 !text-xs !cursor-not-allowed opacity-60 border border-line/60 bg-ink-2/40 text-muted font-mono"
                      >
                        Completed
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {open && <EventModal event={open} onClose={() => setOpenId(null)} />}
    </section>
  );
}
