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

export default function Events({ events }: { events: ClubEvent[] }) {
  const root = useRef<HTMLElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);

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
    { scope: root, dependencies: [events.length] },
  );

  const open = events.find((e) => e.id === openId) ?? null;
  const upcoming = events.filter((e) => !isPast(e)).length;

  return (
    <section
      id="events"
      ref={root}
      className="section section-flush-t section-none-b"
    >
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
            Hands-on sessions led by working engineers.{" "}
            {upcoming > 0
              ? `${upcoming} coming up - open one for the full details.`
              : "Open one for the full details."}
          </p>
        </div>

        {events.length === 0 ? (
          <p className="mt-12 border-t border-line pt-8 text-muted">
            No sessions are scheduled right now. Check back soon.
          </p>
        ) : (
          <ul data-events className="mt-12 flex flex-col gap-4">
            {events.map((e) => {
              const { day, month } = formatEventDayMonth(e);
              const past = isPast(e);

              return (
                <li key={e.id} data-event>
                  <button
                    type="button"
                    onClick={() => setOpenId(e.id)}
                    aria-haspopup="dialog"
                    className={`group grid w-full grid-cols-[auto_1fr] items-center gap-6 rounded-2xl border border-line bg-surface p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-[0_24px_64px_-48px_rgba(12,51,70,0.6)] md:grid-cols-[auto_1fr_auto] md:p-8 ${
                      past ? "opacity-65" : ""
                    }`}
                  >
                    {/* Date rail */}
                    <span
                      className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl font-mono leading-none ${
                        past
                          ? "bg-ink-2 text-muted"
                          : "bg-deep text-[color:var(--color-on-deep)]"
                      }`}
                    >
                      <span className="text-xl font-medium">{day}</span>
                      <span className="mt-2 text-[10px] tracking-[0.14em]">
                        {month}
                      </span>
                    </span>

                    {/* Title + meta */}
                    <span className="min-w-0">
                      <span className="display block truncate text-xl font-semibold md:text-2xl">
                        {e.title}
                      </span>
                      <span className="mt-2 block text-sm text-muted">
                        {[formatEventTime(e), locationLine(e), e.hosts[0]?.name]
                          .filter(Boolean)
                          .join("  ·  ")}
                      </span>
                    </span>

                    {/* Badges + affordance */}
                    <span className="col-span-2 flex flex-wrap items-center gap-2 md:col-span-1 md:justify-end">
                      {e.status === "full" && !past && (
                        <span className="rounded-full bg-ink-2 px-4 py-2 font-mono text-xs text-muted">
                          Full
                        </span>
                      )}
                      {e.status === "cancelled" && (
                        <span className="rounded-full bg-ink-2 px-4 py-2 font-mono text-xs text-muted">
                          Cancelled
                        </span>
                      )}
                      <span className="rounded-full border border-line px-4 py-2 font-mono text-xs text-muted">
                        {e.domain ?? MODE_LABEL[e.mode]}
                      </span>
                      <span
                        aria-hidden
                        className="font-mono text-sm text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      >
                        {"->"}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {open && <EventModal event={open} onClose={() => setOpenId(null)} />}
    </section>
  );
}
