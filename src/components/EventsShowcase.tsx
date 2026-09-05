"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import RevealText from "./ui/RevealText";
import EventModal from "./EventModal";
import {
  formatEventDate,
  formatEventDayMonth,
  formatEventTime,
  getEventStatus,
  locationLine,
  sortEvents,
  type ClubEvent,
} from "@/lib/events";

/* ---------------------------------------------------------------------
 * Icons - inline, inheriting currentColor, matching the /events page.
 * ------------------------------------------------------------------- */

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const IconClock = ({ className = "" }) => (
  <svg {...iconProps} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
const IconPin = ({ className = "" }) => (
  <svg {...iconProps} className={className}>
    <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);
const IconUser = ({ className = "" }) => (
  <svg {...iconProps} className={className}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </svg>
);
const IconArrow = ({ className = "" }) => (
  <svg {...iconProps} className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const STATUS_CHIP: Record<string, string> = {
  upcoming: "border-primary/40 bg-primary/10 text-primary-dark",
  ongoing: "border-accent/40 bg-accent/15 text-accent-dark",
  completed: "border-line bg-ink-2 text-muted",
};

/** Supporting rows shown when the section is stacked (below lg): 1 + 3. */
const STACKED_ROWS = 3;
/** Gap between rows in the supporting list, in px (matches gap-3). */
const ROW_GAP = 12;
/** Gap between the list and the header rule / footer link (gap-4). */
const COLUMN_GAP = 16;
/** Used before a row has been laid out and can be measured. */
const FALLBACK_ROW_H = 84;

const STATUS_LABEL: Record<string, string> = {
  upcoming: "Upcoming",
  ongoing: "Happening now",
  completed: "Completed",
};

/* ------------------------------------------------------------------- */

/**
 * The events block on the landing page.
 *
 * Rather than three equal cards, this leads with one event at full size -
 * the live one, or the next one up - and lists the rest beside it. That
 * matches how people actually read the section: they want to know what is
 * next, then glance at what else is around.
 *
 * The /events page owns the full chronological timeline; this is the
 * shop window for it.
 */
export default function EventsShowcase({
  sessions,
}: {
  sessions: ClubEvent[];
}) {
  const root = useRef<HTMLElement>(null);
  const leadRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const chromeRef = useRef<HTMLDivElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  // How many supporting rows fit beside the lead card. Starts at the
  // stacked count so the first paint is never taller than the settled
  // layout; the effect below measures and adjusts.
  const [visibleCount, setVisibleCount] = useState(STACKED_ROWS);

  // sortEvents puts whatever is live first, then upcoming soonest-first,
  // then the most recent past. The head of that list is exactly the event
  // that deserves the lead card, and the tail is the list beside it.
  const ordered = useMemo(() => sortEvents(sessions), [sessions]);
  const lead = ordered[0];
  const rest = useMemo(() => ordered.slice(1), [ordered]);

  const upcomingCount = useMemo(
    () => sessions.filter((e) => getEventStatus(e) === "upcoming").length,
    [sessions],
  );

  /**
   * Match the supporting list's height to the lead card.
   *
   * Side by side, the right column should end level with the card beside
   * it rather than running past it or leaving dead space, so the row count
   * comes from measured heights instead of a hard-coded number. Stacked
   * (below lg) there is nothing to match, so a fixed count keeps the
   * section from becoming a wall of events.
   */
  useEffect(() => {
    if (rest.length === 0) return;

    const sideBySide = window.matchMedia("(min-width: 1024px)");

    const measure = () => {
      if (!sideBySide.matches) {
        setVisibleCount(STACKED_ROWS);
        return;
      }

      const leadH = leadRef.current?.offsetHeight ?? 0;
      const chromeH = chromeRef.current?.offsetHeight ?? 0;
      const row = listRef.current?.firstElementChild as HTMLElement | null;
      const rowH = row?.offsetHeight ?? FALLBACK_ROW_H;
      if (!leadH || !rowH) return;

      // Two column gaps: header rule -> list, and list -> footer link.
      const available = leadH - chromeH - COLUMN_GAP * 2;
      const fits = Math.floor((available + ROW_GAP) / (rowH + ROW_GAP));
      setVisibleCount(Math.max(1, Math.min(rest.length, fits)));
    };

    measure();

    // The lead card's height moves with its cover image and text wrapping,
    // so watch the card itself rather than only window resizes.
    const observer = new ResizeObserver(measure);
    if (leadRef.current) observer.observe(leadRef.current);
    sideBySide.addEventListener("change", measure);
    return () => {
      observer.disconnect();
      sideBySide.removeEventListener("change", measure);
    };
  }, [rest.length]);

  const visible = rest.slice(0, visibleCount);
  const hiddenCount = rest.length - visible.length;

  useGSAP(
    () => {
      // Deliberately fromTo, not from, and deliberately not rendered until
      // the trigger fires. A `from` tween hides its targets the moment it
      // is created and works out the end state by reading the element -
      // so anything that re-reads it while it is still hidden (a
      // ScrollTrigger refresh, which this section causes several of as it
      // streams in and its cover image lands) can record "invisible" as
      // the destination and leave the card stranded at opacity 0.
      // Explicit end values plus immediateRender:false mean the worst case
      // is an un-animated card, never a missing one.
      gsap.fromTo(
        "[data-event-card]",
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "expo.out",
          stagger: 0.09,
          // Leave no inline opacity/transform behind to strand anything.
          clearProps: "opacity,transform",
          immediateRender: false,
          scrollTrigger: {
            trigger: "[data-event-grid]",
            start: "top 85%",
            once: true,
          },
        },
      );

      // This section streams in after the rest of the page, replacing a
      // skeleton of a different height, and the row count below settles a
      // frame later still. Every ScrollTrigger on the page was measured
      // against the layout that came before all that, so without a refresh
      // this card's own trigger can sit at a scroll position that is never
      // reached - leaving it stuck at opacity 0, invisible.
      const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => cancelAnimationFrame(raf);
    },
    // visible.length is a dependency because the row count settles a frame
    // after mount: without it the tween is built against three rows and the
    // ones added afterwards are never part of it.
    { scope: root, dependencies: [ordered.length, visible.length] },
  );

  const open = sessions.find((e) => e.id === openId) ?? null;

  return (
    <section
      id="events"
      ref={root}
      className="section relative mt-12 overflow-hidden border-t border-line bg-gradient-to-b from-ink via-ink-soft to-ink md:mt-20 lg:mt-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-accent/15 via-primary/10 to-transparent blur-3xl"
      />

      <div className="container-x">
        {/* ---------------- Header ---------------- */}
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

          <div className="flex max-w-sm flex-col items-start gap-4 md:items-end">
            <p className="text-sm leading-relaxed text-muted md:text-right">
              Hands-on sessions, Open Source Fridays and live masterclasses led
              by working engineers and mentors.
            </p>
            <Link
              href="/events"
              className="group inline-flex items-center gap-2 font-mono text-xs font-medium text-accent-dark transition-colors hover:text-fg sm:text-sm"
            >
              <span>
                View all {sessions.length} events
              </span>
              <IconArrow className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* ---------------- Content ---------------- */}
        {!lead ? (
          <div className="mt-14 flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-surface/50 p-8 text-center">
            <p className="font-mono text-sm text-muted">
              No featured events scheduled right now.
            </p>
            <Link
              href="/events"
              className="btn btn-ghost mt-4 !py-2 font-mono !text-xs"
            >
              Browse event timeline &rarr;
            </Link>
          </div>
        ) : (
          <div
            data-event-grid
            className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-8"
          >
            <div ref={leadRef} className="flex min-w-0">
              <LeadCard event={lead} onOpen={() => setOpenId(lead.id)} />
            </div>

            <div className="flex min-w-0 flex-col gap-4">
              <div
                ref={chromeRef}
                className="flex items-baseline justify-between border-b border-line pb-3"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                  Also on the calendar
                </span>
                <span className="font-mono text-[11px] tabular-nums text-muted">
                  {upcomingCount > 0
                    ? `${String(upcomingCount).padStart(2, "0")} upcoming`
                    : "Archive"}
                </span>
              </div>

              {rest.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/40 p-8 text-center">
                  <p className="font-mono text-xs text-muted">
                    Nothing else lined up yet.
                  </p>
                  <Link
                    href="/events"
                    className="mt-3 font-mono text-xs text-accent-dark hover:text-fg"
                  >
                    See past sessions &rarr;
                  </Link>
                </div>
              ) : (
                <ul ref={listRef} className="flex flex-col gap-3">
                  {visible.map((event) => (
                    <CompactRow
                      key={event.id}
                      event={event}
                      onOpen={() => setOpenId(event.id)}
                    />
                  ))}
                </ul>
              )}

              <Link
                href="/events"
                className="group mt-auto flex items-center justify-between rounded-2xl border border-dashed border-line bg-surface/40 px-5 py-4 transition-colors hover:border-accent hover:bg-surface/70"
              >
                <span className="font-mono text-xs text-muted transition-colors group-hover:text-fg">
                  {hiddenCount > 0
                    ? `${hiddenCount} more on the full timeline`
                    : "The full timeline, past and upcoming"}
                </span>
                <IconArrow className="h-4 w-4 text-accent-dark transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {open && <EventModal event={open} onClose={() => setOpenId(null)} />}
    </section>
  );
}

/* ---------------------------------------------------------------------
 * The lead event - full width of its column, cover art when there is one.
 * ------------------------------------------------------------------- */

function LeadCard({
  event: e,
  onOpen,
}: {
  event: ClubEvent;
  onOpen: () => void;
}) {
  const status = getEventStatus(e);
  const live = status === "ongoing";
  const upcoming = status === "upcoming";
  const { day, month } = formatEventDayMonth(e);

  return (
    <article
      data-event-card
      className="glass group relative flex w-full flex-col overflow-hidden rounded-3xl transition-all duration-500 hover:border-accent hover:shadow-[0_28px_72px_-40px_rgba(12,51,70,0.5)]"
    >
      {/* Cover art. Served as a real URL by the cover route, so it loads
          lazily instead of riding along in the page payload. It spans the
          full card width and is capped in height, so a tall source image
          crops from the bottom rather than pushing the card out of shape -
          event posters put the title and speaker at the top. */}
      {e.cover?.url && (
        <div className="w-full overflow-hidden border-b border-line bg-ink-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={e.cover.url}
            alt={e.cover.alt ?? ""}
            loading="lazy"
            decoding="async"
            // The cover has no reserved height, so its arrival shifts
            // everything below it. Re-measuring keeps the scroll triggers
            // on this page honest.
            onLoad={() => ScrollTrigger.refresh()}
            className="max-h-[180px] w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03] sm:max-h-[260px]"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5 sm:p-6 md:p-8">
        <div className="flex items-start gap-4 sm:gap-5">
          <span
            className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl font-mono leading-none shadow-sm sm:h-16 sm:w-16 ${
              live
                ? "bg-gradient-to-br from-accent to-accent-dark text-white"
                : upcoming
                  ? "bg-gradient-to-br from-primary to-primary-dark text-white"
                  : "bg-ink-2 text-muted"
            }`}
          >
            <span className="text-xl font-bold">{day}</span>
            <span className="mt-1.5 text-[10px] uppercase tracking-[0.16em]">
              {month}
            </span>
          </span>

          <div className="min-w-0 flex-1">
            <h3 className="display break-words text-xl font-bold leading-tight transition-colors group-hover:text-primary-dark sm:text-2xl md:text-3xl">
              {e.title}
            </h3>
            <p className="mt-1.5 font-mono text-xs text-muted">
              {formatEventDate(e)}
            </p>
          </div>
        </div>

        {e.summary && (
          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted sm:mt-5">
            {e.summary}
          </p>
        )}

        {/* Meta - one item per line so long venue names do not collide. */}
        <dl className="mt-5 grid gap-2.5 font-mono text-xs text-muted sm:mt-6 sm:grid-cols-2">
          <div className="flex min-w-0 items-center gap-2">
            <IconClock className="h-4 w-4 shrink-0 text-accent-dark" />
            <dd className="truncate">{formatEventTime(e) || "Time TBA"}</dd>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <IconPin className="h-4 w-4 shrink-0 text-accent-dark" />
            <dd className="truncate">{locationLine(e) || "Online"}</dd>
          </div>
          {e.hosts[0]?.name && (
            <div className="flex min-w-0 items-center gap-2 sm:col-span-2">
              <IconUser className="h-4 w-4 shrink-0 text-accent-dark" />
              <dd className="truncate">
                {e.hosts[0].name}
                {e.hosts[0].title ? ` - ${e.hosts[0].title}` : ""}
              </dd>
            </div>
          )}
        </dl>

        {/* Stacked on phones: two buttons side by side in a 360px card
            leaves neither enough room to read, and the status chip would
            wrap into a lonely third row. */}
        <div className="mt-auto flex flex-col gap-3 border-t border-line/80 pt-5 sm:flex-row sm:flex-wrap sm:items-center">
          {live && e.joinUrl ? (
            <a
              href={e.joinUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn-primary !bg-accent hover:!bg-accent-dark w-full justify-center !py-2.5 font-mono !text-xs font-semibold sm:w-auto"
            >
              Join live
              <IconArrow className="h-3.5 w-3.5" />
            </a>
          ) : upcoming && e.registerUrl ? (
            <a
              href={e.registerUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn-primary w-full justify-center !py-2.5 font-mono !text-xs font-semibold sm:w-auto"
            >
              Register
              <IconArrow className="h-3.5 w-3.5" />
            </a>
          ) : null}

          <button
            type="button"
            onClick={onOpen}
            className="btn btn-ghost w-full justify-center !py-2.5 font-mono !text-xs sm:w-auto"
          >
            Agenda &amp; details
          </button>

          {/* Status sits with the actions, right-aligned - it is a fact
              about the event, not a label to slap over the artwork. */}
          <span
            className={`self-end inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] sm:ml-auto sm:self-auto ${STATUS_CHIP[status]}`}
          >
            {live && (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            )}
            {STATUS_LABEL[status]}
          </span>
        </div>
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------------
 * Supporting events - one compact, scannable row each.
 * ------------------------------------------------------------------- */

function CompactRow({
  event: e,
  onOpen,
}: {
  event: ClubEvent;
  onOpen: () => void;
}) {
  const status = getEventStatus(e);
  const live = status === "ongoing";
  const upcoming = status === "upcoming";
  const { day, month } = formatEventDayMonth(e);

  return (
    <li data-event-card>
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        className={`group grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-line bg-surface/70 p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:bg-surface hover:shadow-[0_18px_48px_-36px_rgba(12,51,70,0.6)] ${
          status === "completed" ? "opacity-75 hover:opacity-100" : ""
        }`}
      >
        <span
          className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl font-mono leading-none sm:h-12 sm:w-12 ${
            live
              ? "bg-accent/15 text-accent-dark"
              : upcoming
                ? "bg-primary/10 text-primary-dark"
                : "bg-ink-2 text-muted"
          }`}
        >
          <span className="text-base font-bold">{day}</span>
          <span className="mt-1 text-[9px] uppercase tracking-[0.14em]">
            {month}
          </span>
        </span>

        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                live
                  ? "animate-pulse bg-accent"
                  : upcoming
                    ? "bg-primary"
                    : "bg-muted/50"
              }`}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {STATUS_LABEL[status]}
            </span>
          </span>
          <span className="mt-1 block truncate text-sm font-semibold text-fg transition-colors group-hover:text-primary-dark">
            {e.title}
          </span>
          <span className="mt-1 block truncate font-mono text-[11px] text-muted">
            {[formatEventTime(e), locationLine(e)].filter(Boolean).join("  ·  ")}
          </span>
        </span>

        <IconArrow
          // Phones have no hover, so the affordance is always faintly there.
          className="h-4 w-4 shrink-0 text-muted opacity-60 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-accent-dark group-hover:opacity-100 sm:opacity-0"
        />
      </button>
    </li>
  );
}
