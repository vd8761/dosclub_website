"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import EventModal from "./EventModal";
import Footer from "./Footer";
import {
  formatEventDate,
  formatEventDayMonth,
  formatEventTime,
  getEventStatus,
  locationLine,
  MODE_LABEL,
  sortEvents,
  type ClubEvent,
} from "@/lib/events";

type FilterStatus = "all" | "upcoming" | "ongoing" | "completed";

/* ---------------------------------------------------------------------
 * Icons - inline so the timeline carries no icon dependency and the
 * glyphs inherit currentColor instead of an emoji font's own palette.
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
const IconSearch = ({ className = "" }) => (
  <svg {...iconProps} className={className}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </svg>
);
const IconArrow = ({ className = "" }) => (
  <svg {...iconProps} className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/* ------------------------------------------------------------------- */

const STATUS_CHIP: Record<string, string> = {
  upcoming: "border-primary/40 bg-primary/10 text-primary-dark",
  ongoing: "border-accent/40 bg-accent/15 text-accent-dark",
  completed: "border-line bg-ink-2 text-muted",
};

function yearOf(e: ClubEvent): string {
  if (!e.startAt) return "Undated";
  const d = new Date(e.startAt);
  if (Number.isNaN(d.getTime())) return "Undated";
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    timeZone: e.timezone,
  }).format(d);
}

export default function EventsTimeline({
  initialEvents,
}: {
  initialEvents: ClubEvent[];
}) {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  // Ongoing first, then upcoming (soonest first), then past (most recent first).
  const sorted = useMemo(() => sortEvents(initialEvents), [initialEvents]);

  const counts = useMemo(() => {
    const c = {
      all: initialEvents.length,
      upcoming: 0,
      ongoing: 0,
      completed: 0,
    };
    for (const e of initialEvents) c[getEventStatus(e)] += 1;
    return c;
  }, [initialEvents]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sorted.filter((e) => {
      if (filter !== "all" && getEventStatus(e) !== filter) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        (e.summary?.toLowerCase().includes(q) ?? false) ||
        (e.project?.toLowerCase().includes(q) ?? false) ||
        (e.tags?.some((t) => t.toLowerCase().includes(q)) ?? false) ||
        (e.hosts?.some((h) => h.name.toLowerCase().includes(q)) ?? false) ||
        (e.venue?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [sorted, filter, search]);

  // Year headings act as the timeline's chapter markers. sortEvents already
  // fixed the order, so grouping just walks the list and opens a new bucket
  // whenever the year label changes.
  const groups = useMemo(() => {
    const out: { year: string; events: ClubEvent[] }[] = [];
    for (const e of filtered) {
      const year = yearOf(e);
      const last = out[out.length - 1];
      if (last && last.year === year) last.events.push(e);
      else out.push({ year, events: [e] });
    }
    return out;
  }, [filtered]);

  // The one event worth putting above the fold: whatever is live right now,
  // otherwise the next one on the calendar.
  const spotlight = useMemo(
    () =>
      sorted.find((e) => getEventStatus(e) === "ongoing") ??
      sorted.find((e) => getEventStatus(e) === "upcoming") ??
      null,
    [sorted],
  );

  const activeEvent = initialEvents.find((e) => e.id === openId) ?? null;
  const isFiltered = filter !== "all" || search.trim().length > 0;

  return (
    <div className="min-h-screen bg-ink text-fg">
      {/* ---------------- Sticky top bar ---------------- */}
      <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur-md">
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-mono text-xs text-muted transition-colors hover:text-fg"
          >
            <span
              aria-hidden
              className="inline-block transition-transform duration-200 group-hover:-translate-x-1"
            >
              &larr;
            </span>
            <span className="hidden sm:inline">Back to home</span>
            <span className="sm:hidden">Home</span>
          </Link>

          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-fg">
            Events
          </span>

          <a
            href="https://osf.descienceosclub.com/"
            target="_blank"
            rel="noreferrer noopener"
            className="hidden items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 font-mono text-[11px] font-medium text-primary-dark transition-colors hover:bg-primary/20 sm:inline-flex"
          >
            Register for a session
            <IconArrow className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      {/* ---------------- Page header ---------------- */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="grid-bg grid-mask pointer-events-none absolute inset-0 -z-20"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-48 left-1/2 -z-10 h-96 w-[52rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-accent/15 via-primary/10 to-transparent blur-3xl"
        />

        <div className="container-x py-14 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end">
            <div>
              <div className="mb-5 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-primary-dark">
                / Timeline archive
              </div>
              <h1 className="display text-4xl leading-[1.02] sm:text-5xl lg:text-6xl xl:text-7xl">
                <span className="block">Every session,</span>
                <span className="block text-gradient">start to finish.</span>
              </h1>
              <p className="mt-6 max-w-xl text-muted">
                A chronological record of the workshops, webinars, build clinics
                and Open Source Fridays run by Descience Open Source Club - the
                ones coming up, the one happening now, and everything already
                shipped.
              </p>
            </div>

            {/* Stat tiles */}
            <dl className="grid grid-cols-3 gap-3">
              {[
                { label: "Total", value: counts.all, tone: "text-fg" },
                {
                  label: "Upcoming",
                  value: counts.upcoming,
                  tone: "text-primary-dark",
                },
                {
                  label: "Completed",
                  value: counts.completed,
                  tone: "text-muted",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-line bg-surface/70 px-4 py-5"
                >
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                    {s.label}
                  </dt>
                  <dd
                    className={`display mt-2 text-3xl font-semibold tabular-nums ${s.tone}`}
                  >
                    {String(s.value).padStart(2, "0")}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* ---------------- Spotlight ---------------- */}
          {spotlight && (
            <SpotlightCard
              event={spotlight}
              onOpen={() => setOpenId(spotlight.id)}
            />
          )}
        </div>
      </section>

      {/* ---------------- Sticky filter toolbar ---------------- */}
      <div className="sticky top-16 z-30 border-b border-line bg-ink/90 backdrop-blur-md">
        <div className="container-x flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "all", label: "All" },
                { id: "upcoming", label: "Upcoming" },
                { id: "ongoing", label: "Ongoing" },
                { id: "completed", label: "Completed" },
              ] as { id: FilterStatus; label: string }[]
            ).map((t) => {
              const active = filter === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFilter(t.id)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] transition-all ${
                    active
                      ? "border border-accent bg-accent/15 font-semibold text-fg"
                      : "border border-line bg-surface/60 text-muted hover:border-accent/50 hover:text-fg"
                  }`}
                >
                  {t.label}
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] tabular-nums ${
                      active ? "bg-accent/25 text-fg" : "bg-ink-2 text-muted"
                    }`}
                  >
                    {counts[t.id]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative lg:w-80">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, tag, host, venue..."
              aria-label="Search events"
              className="w-full rounded-full border border-line bg-surface/70 py-2 pl-9 pr-9 font-mono text-xs text-fg transition-colors placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted hover:text-fg"
              >
                &#10005;
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- Timeline ---------------- */}
      <main className="container-x py-12 md:py-16">
        <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          Showing {filtered.length} of {counts.all} events
          {isFiltered && (
            <button
              type="button"
              onClick={() => {
                setFilter("all");
                setSearch("");
              }}
              className="ml-3 border-b border-dashed border-muted/60 text-accent-dark hover:text-fg"
            >
              reset
            </button>
          )}
        </p>

        {filtered.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-surface/50 p-10 text-center">
            <p className="font-mono text-sm text-muted">
              No events match the current filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setFilter("all");
                setSearch("");
              }}
              className="btn btn-ghost mt-5 !py-2 font-mono !text-xs"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* The spine. Sits under the nodes, which are centred on it. */}
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-4 left-[7px] top-4 w-px bg-gradient-to-b from-primary/70 via-accent/40 to-line md:left-[calc(7rem+1.5rem+7px)]"
            />

            {groups.map((group) => (
              <section key={group.year} className="relative">
                {/* Year marker */}
                <div className="relative flex items-center gap-4 py-6 md:gap-6">
                  <span className="display order-2 text-2xl font-semibold text-muted md:order-1 md:w-28 md:shrink-0 md:text-right">
                    {group.year}
                  </span>
                  <span className="order-1 z-10 flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full border border-line bg-ink md:order-2">
                    <span className="h-[5px] w-[5px] rounded-full bg-muted" />
                  </span>
                </div>

                <ul className="space-y-6">
                  {group.events.map((e) => (
                    <TimelineRow
                      key={e.id}
                      event={e}
                      onOpen={() => setOpenId(e.id)}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* ---------------- CTA strip + site footer ---------------- */}
      <div className="border-t border-line bg-surface/40">
        <div className="container-x flex flex-col items-center justify-between gap-4 py-10 sm:flex-row">
          <p className="text-center font-mono text-xs text-muted sm:text-left">
            Want to run a session with us, or suggest a topic?
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/enquiry"
              className="btn btn-ghost !py-2 font-mono !text-xs"
            >
              Get in touch
            </Link>
            <Link href="/" className="btn btn-primary !py-2 font-mono !text-xs">
              Back to home
            </Link>
          </div>
        </div>
      </div>

      <Footer />

      {activeEvent && (
        <EventModal event={activeEvent} onClose={() => setOpenId(null)} />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------
 * Spotlight - the live or next-up event, given room to breathe.
 * ------------------------------------------------------------------- */

function SpotlightCard({
  event: e,
  onOpen,
}: {
  event: ClubEvent;
  onOpen: () => void;
}) {
  const status = getEventStatus(e);
  const live = status === "ongoing";
  const { day, month } = formatEventDayMonth(e);
  const time = formatEventTime(e);

  return (
    <article className="glass mt-12 overflow-hidden rounded-3xl border border-line md:mt-16">
      <div className="grid gap-6 p-6 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:gap-8 md:p-8">
        <div
          className={`flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl font-mono leading-none text-white ${
            live
              ? "bg-gradient-to-br from-accent to-accent-dark"
              : "bg-gradient-to-br from-primary to-primary-dark"
          }`}
        >
          <span className="text-2xl font-bold">{day}</span>
          <span className="mt-1.5 text-[10px] uppercase tracking-[0.16em]">
            {month}
          </span>
        </div>

        <div className="min-w-0">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] ${STATUS_CHIP[status]}`}
          >
            {live && (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            )}
            {live ? "Happening now" : "Next up"}
          </span>
          <h2 className="display mt-3 text-2xl font-bold leading-tight sm:text-3xl">
            {e.title}
          </h2>
          {e.summary && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
              {e.summary}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <IconClock className="h-3.5 w-3.5" />
              {formatEventDate(e)}
              {time ? ` - ${time}` : ""}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <IconPin className="h-3.5 w-3.5" />
              {locationLine(e) || "Online"}
            </span>
            {e.hosts[0]?.name && (
              <span className="inline-flex items-center gap-1.5">
                <IconUser className="h-3.5 w-3.5" />
                {e.hosts[0].name}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 md:w-44">
          {live && e.joinUrl ? (
            <a
              href={e.joinUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn-primary !bg-accent hover:!bg-accent-dark justify-center !py-2.5 font-mono !text-xs font-semibold"
            >
              Join live
              <IconArrow className="h-3.5 w-3.5" />
            </a>
          ) : e.registerUrl ? (
            <a
              href={e.registerUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn-primary justify-center !py-2.5 font-mono !text-xs font-semibold"
            >
              Register
              <IconArrow className="h-3.5 w-3.5" />
            </a>
          ) : null}
          <button
            type="button"
            onClick={onOpen}
            className="btn btn-ghost justify-center !py-2.5 font-mono !text-xs"
          >
            Full details
          </button>
        </div>
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------------
 * One row on the timeline.
 * ------------------------------------------------------------------- */

function TimelineRow({
  event: e,
  onOpen,
}: {
  event: ClubEvent;
  onOpen: () => void;
}) {
  const status = getEventStatus(e);
  const upcoming = status === "upcoming";
  const ongoing = status === "ongoing";
  const { day, month } = formatEventDayMonth(e);

  return (
    <li className="group relative flex items-start gap-4 md:gap-6">
      {/* Date gutter - hidden below md, where the card carries the date */}
      <span className="hidden w-28 shrink-0 flex-col items-end pt-6 text-right font-mono leading-none md:flex">
        <span className="display text-2xl font-semibold text-fg">{day}</span>
        <span className="mt-1.5 text-[10px] uppercase tracking-[0.16em] text-muted">
          {month}
        </span>
      </span>

      {/* Node on the spine */}
      <span
        className={`relative z-10 mt-7 flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full border-2 bg-ink transition-transform duration-300 group-hover:scale-125 ${
          ongoing
            ? "animate-pulse border-accent shadow-[0_0_12px_rgba(21,147,195,0.55)]"
            : upcoming
              ? "border-primary shadow-[0_0_12px_rgba(76,175,80,0.45)]"
              : "border-line"
        }`}
      >
        <span
          className={`h-[5px] w-[5px] rounded-full ${
            ongoing ? "bg-accent" : upcoming ? "bg-primary" : "bg-muted/60"
          }`}
        />
      </span>

      {/* Card */}
      <article
        className={`min-w-0 flex-1 rounded-2xl border border-line bg-surface/80 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_20px_56px_-40px_rgba(12,51,70,0.6)] sm:p-6 ${
          status === "completed" ? "opacity-80 hover:opacity-100" : ""
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Mobile date - the gutter is hidden below md */}
            <span className="rounded-lg border border-line bg-ink-2/60 px-2.5 py-1 font-mono text-[11px] font-semibold text-fg md:hidden">
              {day} {month}
            </span>
            <span className="rounded-full border border-line bg-ink/60 px-3 py-1 font-mono text-[11px] text-muted">
              {e.tags?.[0] ?? e.domain ?? e.level ?? MODE_LABEL[e.mode]}
            </span>
            {e.project && (
              <span className="truncate font-mono text-[11px] text-accent-dark">
                #{e.project}
              </span>
            )}
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] ${STATUS_CHIP[status]}`}
          >
            {ongoing && (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            )}
            {status}
          </span>
        </div>

        <h3 className="display mt-3 text-lg font-bold leading-tight transition-colors group-hover:text-primary-dark sm:text-xl">
          {e.title}
        </h3>

        {e.summary && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
            {e.summary}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <IconClock className="h-3.5 w-3.5" />
            {formatEventTime(e) || "Time TBA"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconPin className="h-3.5 w-3.5" />
            {locationLine(e) || "Online"}
          </span>
          {e.hosts[0]?.name && (
            <span className="inline-flex items-center gap-1.5">
              <IconUser className="h-3.5 w-3.5" />
              {e.hosts[0].name}
            </span>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line/70 pt-4">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-accent-dark transition-colors hover:text-fg"
          >
            View agenda &amp; details
            <IconArrow className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>

          {upcoming && e.registerUrl ? (
            <a
              href={e.registerUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn-primary !px-4 !py-1.5 font-mono !text-[11px] font-semibold"
            >
              Register
            </a>
          ) : ongoing && e.joinUrl ? (
            <a
              href={e.joinUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn-primary !bg-accent hover:!bg-accent-dark !px-4 !py-1.5 font-mono !text-[11px] font-semibold"
            >
              Join live
            </a>
          ) : e.recordingUrl ? (
            <a
              href={e.recordingUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="font-mono text-[11px] text-accent-dark hover:text-fg"
            >
              Watch recording
            </a>
          ) : (
            <span className="font-mono text-[11px] text-muted">
              {upcoming ? "Registration opening soon" : "Concluded"}
            </span>
          )}
        </div>
      </article>
    </li>
  );
}
