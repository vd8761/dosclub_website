"use client";

import { use } from "react";
import { formatEventDate, getHeroRibbonEvent, type ClubEvent } from "@/lib/events";
import { scrollToSection } from "./SmoothScroll";
import { Loader } from "./ui/Loader";

/**
 * The "Ongoing / Next up" pill in the hero.
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

  return (
    <div className="mb-4 flex lg:mb-5">
      <button
        onClick={() => scrollToSection("#events")}
        className="group inline-flex max-w-full cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-line bg-surface/90 px-3.5 py-1.5 text-left shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:bg-surface hover:shadow-md sm:rounded-full sm:px-4 sm:py-2"
      >
        {heroRibbon.isOngoing ? (
          <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-accent-dark sm:text-xs">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
            Ongoing
          </span>
        ) : (
          <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-primary-dark sm:text-xs">
            {heroRibbon.label ?? "Next up"}
          </span>
        )}
        <span className="text-xs font-semibold text-fg group-hover:text-accent-dark sm:text-sm">
          {heroRibbon.event.title}
        </span>
        <span className="font-mono text-[10.5px] text-muted sm:text-xs">
          {formatEventDate(heroRibbon.event)}
        </span>
        <span
          aria-hidden
          className="font-mono text-xs text-primary transition-transform duration-300 group-hover:translate-x-0.5"
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
      <span className="inline-flex items-center gap-3 rounded-2xl border border-line bg-surface/70 px-3.5 py-1.5 shadow-sm sm:rounded-full sm:px-4 sm:py-2">
        <Loader size="sm" />
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted sm:text-xs">
          Loading events
          <span className="loading-dots" aria-hidden />
        </span>
      </span>
    </div>
  );
}
