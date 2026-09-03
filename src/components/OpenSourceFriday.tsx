"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import RevealText from "./ui/RevealText";
import EventModal from "./EventModal";
import {
  formatEventDayMonth,
  formatEventTime,
  isPast,
  locationLine,
  MODE_LABEL,
  type ClubEvent,
} from "@/lib/events";

/**
 * ============================================================================
 * TODO: CMS EVENTS INTEGRATION & DISPLAY SPECIFICATION
 * ============================================================================
 * The events section is intended to be driven by live CMS portal content.
 * Follow these exact rules when wiring CMS delivery data:
 *
 * 1. SCENARIO A: n past/completed events AND 2+ upcoming events available
 *    - Display 1 last completed event (faded appearance, registration disabled, button says "Completed").
 *    - Display 2 upcoming events (active appearance with active "Register" button if link available).
 *
 * 2. SCENARIO B: n past events AND 1 upcoming event available
 *    - Display past 2 completed events (faded, disabled "Completed" button).
 *    - Display the 1 upcoming event (active, register button).
 *
 * 3. SCENARIO C: n past events AND 1 ongoing event available
 *    - Display past 2 completed events (faded, disabled "Completed" button).
 *    - Display the 1 ongoing event (registration automatically disabled, button displays "Ongoing").
 *
 * 4. SCENARIO D: 0 past events AND 3 upcoming events available
 *    - Display all 3 upcoming events.
 *    - Show "Register" button if registration URL is provided by CMS; otherwise display "Upcoming".
 *
 * 5. SCENARIO E: n past events AND 0 upcoming events available
 *    - Display the last 3 completed events.
 *    - Do NOT fade anything in this state; display disabled button that says "Completed".
 *
 * 6. FALLBACK / OUTAGE:
 *    - If no events are returned from CMS or CMS is down/unreachable, render the bundled fallback events in `data/site.ts`.
 * ============================================================================
 */

type FilterTab = "all" | "upcoming" | "ongoing" | "completed";

export default function OpenSourceFriday({
  sessions,
}: {
  sessions: ClubEvent[];
}) {
  const root = useRef<HTMLElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("all");

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
    { scope: root, dependencies: [sessions.length, filter] },
  );

  const getStatus = (e: ClubEvent): "upcoming" | "ongoing" | "completed" => {
    if (e.status === "completed" || isPast(e)) return "completed";
    if (e.status === "live") return "ongoing";
    return "upcoming";
  };

  const filtered = sessions.filter((e) => {
    if (filter === "all") return true;
    return getStatus(e) === filter;
  });

  const open = sessions.find((e) => e.id === openId) ?? null;
  const upcomingCount = sessions.filter((e) => getStatus(e) === "upcoming").length;
  const ongoingCount = sessions.filter((e) => getStatus(e) === "ongoing").length;
  const completedCount = sessions.filter((e) => getStatus(e) === "completed").length;

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

          <div className="max-w-sm">
            <p className="text-sm leading-relaxed text-muted md:text-base">
              Hands-on sessions, Open Source Fridays and live masterclasses led by
              working engineers and mentors.
            </p>
          </div>
        </div>

        {/* ---------------- Filter Tabs ---------------- */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: "all", label: "All Events", count: sessions.length },
                { id: "upcoming", label: "Upcoming", count: upcomingCount },
                { id: "ongoing", label: "Ongoing", count: ongoingCount },
                { id: "completed", label: "Completed", count: completedCount },
              ] as const
            ).map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] transition-all duration-300 ${
                    active
                      ? "bg-fg text-ink shadow-md"
                      : "border border-line bg-surface/60 text-muted hover:border-accent hover:text-fg"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                      active ? "bg-ink/20 text-ink" : "bg-ink-2 text-muted"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <span className="font-mono text-xs text-muted">
            Showing {filtered.length} {filtered.length === 1 ? "event" : "events"}
          </span>
        </div>

        {/* ---------------- Events Grid ---------------- */}
        {filtered.length === 0 ? (
          <div className="mt-16 flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-surface/50 p-8 text-center">
            <p className="font-mono text-sm text-muted">
              No events found in this category right now.
            </p>
            <button
              onClick={() => setFilter("all")}
              className="btn btn-ghost mt-4 !py-2 !text-xs"
            >
              Show all events
            </button>
          </div>
        ) : (
          <div
            data-event-grid
            className="mt-8 flex flex-wrap justify-center gap-6"
          >
            {filtered.map((e) => {
              const { day, month } = formatEventDayMonth(e);
              const status = getStatus(e);
              const isUpcoming = status === "upcoming";
              const isOngoing = status === "ongoing";
              const isCompleted = status === "completed";

              return (
                <article
                  key={e.id}
                  data-event-card
                  className="glass group relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 transition-all duration-500 hover:-translate-y-2 hover:border-accent hover:shadow-[0_24px_64px_-32px_rgba(12,51,70,0.45)] w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] max-w-[360px]"
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
                          Register Now <span aria-hidden>{"->"}</span>
                        </a>
                      ) : (
                        <a
                          href="http://membership.descienceosclub.com/"
                          target="_blank"
                          rel="noreferrer noopener"
                          className="btn btn-primary w-full justify-center !py-2.5 !text-xs font-semibold shadow-sm hover:shadow-md"
                        >
                          Register <span aria-hidden>{"->"}</span>
                        </a>
                      )
                    ) : isOngoing ? (
                      e.joinUrl ? (
                        <a
                          href={e.joinUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="btn btn-primary w-full justify-center !bg-accent hover:!bg-accent-dark !py-2.5 !text-xs font-semibold"
                        >
                          Join Live <span aria-hidden>{"->"}</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setOpenId(e.id)}
                          className="btn btn-ghost w-full justify-center !py-2.5 !text-xs"
                        >
                          View Details
                        </button>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() => setOpenId(e.id)}
                        className="btn btn-ghost w-full justify-center !py-2.5 !text-xs text-muted hover:text-fg"
                      >
                        {e.recordingUrl ? "Watch Recording" : "View Recap"}
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
