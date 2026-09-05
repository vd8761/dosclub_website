"use client";

import { use } from "react";
import {
  formatEventDate,
  formatEventDayMonth,
  getHeroRibbonEvent,
  type ClubEvent,
} from "@/lib/events";
import { scrollToSection } from "./SmoothScroll";
import { Loader } from "./ui/Loader";

/**
 * The "Ongoing / Next up" ticket in the hero.
 *
 * It is the only part of the hero that needs event data, so it consumes
 * the promise directly and sits behind its own Suspense boundary. That
 * keeps the hero itself instant while the events query resolves.
 */
export default function HeroEventRibbon({
  sessionsPromise,
}: {
  sessionsPromise: Promise<ClubEvent[]>;
}) {
  const sessions = use(sessionsPromise);
  const heroRibbon = getHeroRibbonEvent(sessions);
  if (!heroRibbon) return null;

  const { event, isOngoing } = heroRibbon;
  const { day, month } = formatEventDayMonth(event);

  return (
    <div className="mb-4 flex min-w-0 lg:mb-5">
      {/*
        Two weights for two contexts.

        On a phone the hero is one column of stacked elements, so a white
        card here reads as the loudest thing on the screen - louder than
        the headline it sits above. There it is stripped back to a line of
        text: a coloured marker, the label, and the title. From sm up,
        where the hero has room to breathe, it fills out into the ticket -
        date block, surface, border, hover lift.
      */}
      <button
        onClick={() => scrollToSection("#events")}
        className="group flex min-w-0 max-w-full cursor-pointer items-center gap-2 rounded-2xl border border-transparent py-0.5 pl-0.5 pr-1 text-left transition-all duration-300 sm:items-stretch sm:gap-3 sm:border-line sm:bg-surface/90 sm:p-1.5 sm:pr-4 sm:shadow-sm sm:backdrop-blur-sm sm:hover:-translate-y-0.5 sm:hover:border-accent sm:hover:shadow-md"
      >
        {/* Date block - the ticket stub, desktop only. */}
        <span
          className={`hidden w-12 shrink-0 flex-col items-center justify-center rounded-xl py-1.5 font-mono leading-none text-white sm:flex ${
            isOngoing
              ? "bg-gradient-to-br from-accent to-accent-dark"
              : "bg-gradient-to-br from-primary to-primary-dark"
          }`}
        >
          <span className="text-base font-bold">{day}</span>
          <span className="mt-1 text-[9px] uppercase tracking-[0.14em]">
            {month}
          </span>
        </span>

        {/* On phones the marker carries the status colour the date block
            carries everywhere else. */}
        <span
          aria-hidden
          className={`h-1.5 w-1.5 shrink-0 rounded-full sm:hidden ${
            isOngoing ? "animate-pulse bg-accent" : "bg-primary"
          }`}
        />

        <span className="flex min-w-0 flex-col justify-center sm:py-0.5">
          <span className="flex min-w-0 items-center gap-1.5">
            {isOngoing && (
              <span className="hidden h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-accent sm:block" />
            )}
            <span
              className={`shrink-0 font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] sm:text-[10.5px] ${
                isOngoing ? "text-accent-dark" : "text-primary-dark"
              }`}
            >
              {isOngoing ? "Happening now" : (heroRibbon.label ?? "Next up")}
            </span>
            {/* The date is already in the stub on desktop; on a phone it
                is width the title needs more. */}
            <span className="hidden truncate font-mono text-[10.5px] text-muted sm:inline">
              · {formatEventDate(event)}
            </span>
          </span>
          <span className="mt-0.5 truncate text-xs font-medium text-fg transition-colors group-hover:text-accent-dark sm:text-sm sm:font-semibold">
            {event.title}
          </span>
        </span>

        <span
          aria-hidden
          className="flex shrink-0 items-center font-mono text-xs text-primary transition-transform duration-300 group-hover:translate-x-0.5"
        >
          {"->"}
        </span>
      </button>
    </div>
  );
}

/** Same footprint as the real pill, so the hero does not reflow on swap. */
export function HeroEventRibbonFallback() {
  return (
    <div className="mb-4 flex lg:mb-5">
      <span className="flex min-w-0 items-center gap-2 rounded-2xl border border-transparent py-0.5 pl-0.5 pr-1 sm:items-stretch sm:gap-3 sm:border-line sm:bg-surface/70 sm:p-1.5 sm:pr-4 sm:shadow-sm">
        <span className="hidden w-12 shrink-0 items-center justify-center rounded-xl bg-ink-2 py-1.5 sm:flex">
          <Loader size="sm" />
        </span>
        <span className="sm:hidden">
          <Loader size="sm" />
        </span>
        <span className="flex flex-col justify-center sm:py-0.5">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted sm:text-[10.5px]">
            Loading events
            <span className="loading-dots" aria-hidden />
          </span>
          <span className="mt-0.5 hidden h-4 w-32 rounded bg-ink-2/70 sm:block" aria-hidden />
        </span>
      </span>
    </div>
  );
}
