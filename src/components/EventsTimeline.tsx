"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import EventModal from "./EventModal";
import {
  formatEventDate,
  formatEventTime,
  getEventStatus,
  locationLine,
  MODE_LABEL,
  sortEvents,
  type ClubEvent,
} from "@/lib/events";

type FilterStatus = "all" | "upcoming" | "ongoing" | "completed";

export default function EventsTimeline({
  initialEvents,
}: {
  initialEvents: ClubEvent[];
}) {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  // Sort events: ongoing first, then upcoming (soonest first), then past completed
  const sorted = useMemo(() => sortEvents(initialEvents), [initialEvents]);

  const upcomingCount = useMemo(
    () => initialEvents.filter((e) => getEventStatus(e) === "upcoming").length,
    [initialEvents],
  );
  const ongoingCount = useMemo(
    () => initialEvents.filter((e) => getEventStatus(e) === "ongoing").length,
    [initialEvents],
  );
  const completedCount = useMemo(
    () => initialEvents.filter((e) => getEventStatus(e) === "completed").length,
    [initialEvents],
  );

  const filteredEvents = useMemo(() => {
    return sorted.filter((e) => {
      const status = getEventStatus(e);
      if (filter !== "all" && status !== filter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = e.title.toLowerCase().includes(q);
        const matchTag = e.tags?.some((t) => t.toLowerCase().includes(q));
        const matchHost = e.hosts?.some((h) => h.name.toLowerCase().includes(q));
        const matchVenue = e.venue?.toLowerCase().includes(q);
        if (!matchTitle && !matchTag && !matchHost && !matchVenue) return false;
      }

      return true;
    });
  }, [sorted, filter, search]);

  const activeEvent = initialEvents.find((e) => e.id === openId) ?? null;

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden flex flex-col bg-ink text-fg select-none-or-normal">
      {/* Background ambient lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-accent/10 via-primary/10 to-transparent blur-3xl"
      />

      {/* ---------------- Fixed Header Bar ---------------- */}
      <header className="shrink-0 h-16 border-b border-line bg-ink/90 backdrop-blur-md px-6 md:px-10 flex items-center justify-between z-30">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-mono text-xs text-muted hover:text-fg transition-colors"
          >
            <span
              className="inline-block transition-transform duration-200 group-hover:-translate-x-1"
              aria-hidden
            >
              &larr;
            </span>
            <span>Back to Home</span>
          </Link>
          <span className="text-line">/</span>
          <span className="font-mono text-xs font-semibold text-fg tracking-wide uppercase">
            Events Timeline
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[11px] font-medium text-primary-dark">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            {initialEvents.length} Total Events
          </span>
        </div>
      </header>

      {/* ---------------- Viewport Content (Non-scrollable outer container) ---------------- */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sticky Sidebar: Overview & Filters */}
        <aside className="shrink-0 w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-line bg-surface/30 p-6 md:p-8 flex flex-col justify-between overflow-y-auto lg:overflow-visible">
          <div className="space-y-6">
            <div>
              <div className="mb-3 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-primary-dark">
                / Timeline Archive
              </div>
              <h1 className="display text-2xl sm:text-3xl font-bold leading-tight">
                Workshops & Sessions.
              </h1>
              <p className="mt-2 text-xs text-muted leading-relaxed">
                Chronological timeline of all live build clinics, workshops, and
                Open Source Fridays hosted by DOSClub.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events, tags, hosts..."
                className="w-full rounded-xl border border-line bg-ink-2/80 px-3.5 py-2.5 pl-9 text-xs text-fg placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-mono transition-all"
              />
              <span className="absolute left-3 top-3 text-xs text-muted">🔍</span>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-2.5 text-xs text-muted hover:text-fg"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter Buttons */}
            <div className="space-y-1.5">
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                Filter by Status
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "all", label: "All Events", count: initialEvents.length },
                  { id: "upcoming", label: "Upcoming", count: upcomingCount },
                  { id: "ongoing", label: "Ongoing", count: ongoingCount },
                  { id: "completed", label: "Completed", count: completedCount },
                ].map((t) => {
                  const active = filter === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFilter(t.id as FilterStatus)}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-mono transition-all ${
                        active
                          ? "border border-accent bg-accent/15 text-fg font-semibold shadow-sm"
                          : "border border-line/60 bg-surface/40 text-muted hover:border-line hover:text-fg"
                      }`}
                    >
                      <span>{t.label}</span>
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                          active ? "bg-accent/30 text-fg" : "bg-ink-2 text-muted"
                        }`}
                      >
                        {t.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="hidden lg:block pt-6 border-t border-line/60 text-xs text-muted font-mono">
            Scroll down the timeline to explore past and upcoming sessions.
          </div>
        </aside>

        {/* Right Area: The Scrollable Vertical Timeline Container */}
        <main className="flex-1 h-full overflow-y-auto px-4 sm:px-8 md:px-14 py-8 md:py-12 relative custom-scrollbar">
          {/* Vertical Timeline Track / Spine Line */}
          <div
            aria-hidden
            className="absolute left-7 sm:left-11 md:left-16 top-6 bottom-6 w-[2px] bg-gradient-to-b from-primary via-accent to-line/30 pointer-events-none"
          />

          {filteredEvents.length === 0 ? (
            <div className="ml-10 md:ml-20 flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-surface/40 p-8 text-center">
              <p className="font-mono text-sm text-muted">
                No events match the selected criteria.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFilter("all");
                  setSearch("");
                }}
                className="btn btn-ghost mt-4 !py-2 !text-xs font-mono"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="space-y-8 relative">
              {filteredEvents.map((e, index) => {
                const status = getEventStatus(e);
                const isUpcoming = status === "upcoming";
                const isOngoing = status === "ongoing";
                const isCompleted = status === "completed";

                return (
                  <div key={e.id} className="relative flex items-start group">
                    {/* Glowing Node on the vertical line */}
                    <div
                      className={`absolute left-7 sm:left-11 md:left-16 -translate-x-1/2 mt-6 h-5 w-5 rounded-full border-2 bg-ink z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-125 ${
                        isUpcoming
                          ? "border-primary shadow-[0_0_12px_rgba(20,184,166,0.6)]"
                          : isOngoing
                            ? "border-accent shadow-[0_0_12px_rgba(249,115,22,0.7)] animate-pulse"
                            : "border-line text-muted"
                      }`}
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${
                          isUpcoming
                            ? "bg-primary"
                            : isOngoing
                              ? "bg-accent"
                              : "bg-line"
                        }`}
                      />
                    </div>

                    {/* Timeline Event Card */}
                    <div className="ml-12 sm:ml-16 md:ml-24 flex-1">
                      <article className="glass relative overflow-hidden rounded-3xl p-6 sm:p-7 border border-line transition-all duration-300 hover:border-accent hover:shadow-[0_16px_48px_-20px_rgba(12,51,70,0.35)]">
                        {/* Header Row: Date + Status Badge */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/60 pb-4">
                          <div className="flex items-center gap-2.5 font-mono text-xs">
                            <span className="inline-block rounded-lg bg-surface px-2.5 py-1 font-semibold text-fg border border-line">
                              {formatEventDate(e)}
                            </span>
                            <span className="text-muted hidden sm:inline">•</span>
                            <span className="text-muted flex items-center gap-1">
                              <span>🕒</span>
                              <span>{formatEventTime(e) || "TBA"}</span>
                            </span>
                          </div>

                          {/* Status Pill */}
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

                        {/* Middle Content */}
                        <div className="mt-4 space-y-3">
                          {/* Tags / Pills */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-line bg-ink/70 px-3 py-0.5 font-mono text-[11px] text-muted">
                              {e.tags?.[0] ?? e.domain ?? e.level ?? MODE_LABEL[e.mode]}
                            </span>
                            {e.level && e.tags?.[0] && (
                              <span className="rounded-full border border-line bg-ink/70 px-3 py-0.5 font-mono text-[11px] text-accent-dark">
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
                          <h2 className="display text-xl sm:text-2xl font-bold leading-tight text-fg transition-colors group-hover:text-primary-dark">
                            {e.title}
                          </h2>

                          {/* Description or Summary */}
                          {(e.summary || e.description) && (
                            <p className="text-sm text-muted line-clamp-2 leading-relaxed">
                              {e.summary || e.description}
                            </p>
                          )}

                          {/* Meta details */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted font-mono pt-2">
                            <span className="flex items-center gap-1.5">
                              <span>📍</span>
                              <span>{locationLine(e) || "Online"}</span>
                            </span>
                            {e.hosts[0]?.name && (
                              <span className="flex items-center gap-1.5">
                                <span>👤</span>
                                <span>
                                  Host: <strong className="text-fg font-medium">{e.hosts[0].name}</strong>
                                </span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Footer Action Buttons */}
                        <div className="mt-6 pt-4 border-t border-line/60 flex flex-wrap items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => setOpenId(e.id)}
                            className="btn btn-ghost !py-2 !px-4 !text-xs font-mono hover:bg-surface"
                          >
                            View Agenda & Details
                          </button>

                          <div>
                            {isUpcoming ? (
                              e.registerUrl ? (
                                <a
                                  href={e.registerUrl}
                                  target="_blank"
                                  rel="noreferrer noopener"
                                  className="btn btn-primary !py-2 !px-5 !text-xs font-semibold shadow-sm hover:shadow-md font-mono"
                                >
                                  Register <span aria-hidden>{"->"}</span>
                                </a>
                              ) : (
                                <span className="font-mono text-xs text-primary-dark px-3 py-1.5">
                                  Registration Opening Soon
                                </span>
                              )
                            ) : isOngoing ? (
                              e.joinUrl ? (
                                <a
                                  href={e.joinUrl}
                                  target="_blank"
                                  rel="noreferrer noopener"
                                  className="btn btn-primary !bg-accent hover:!bg-accent-dark !py-2 !px-5 !text-xs font-semibold font-mono"
                                >
                                  Join Live <span aria-hidden>{"->"}</span>
                                </a>
                              ) : (
                                <span className="font-mono text-xs text-accent-dark px-3 py-1.5">
                                  Live in Progress
                                </span>
                              )
                            ) : (
                              <span className="font-mono text-xs text-muted px-3 py-1.5">
                                Event Concluded
                              </span>
                            )}
                          </div>
                        </div>
                      </article>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {activeEvent && (
        <EventModal event={activeEvent} onClose={() => setOpenId(null)} />
      )}
    </div>
  );
}
