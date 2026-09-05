/**
 * The shape the site renders events in, along with formatting and status helpers.
 *
 * All Event UI components (Hero ribbon, Landing page events section, and Events timeline)
 * read from this interface.
 */

import { getDb } from "./db";
import { sampleClubEvents } from "@/data/events";

export type EventMode = "in_person" | "online" | "hybrid";
export type EventStatus =
  | "scheduled"
  | "full"
  | "cancelled"
  | "completed"
  | "ongoing"
  | "live";

export type EventHost = {
  name: string;
  title?: string;
  org?: string;
  avatar?: string;
};

export type AgendaItem = {
  time?: string;
  title: string;
  detail?: string;
};

export type ClubEvent = {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  description?: string;
  cover?: { url: string; alt?: string } | null;
  startAt: string | null;
  endAt?: string | null;
  displayTime?: string;
  timezone: string;
  mode: EventMode;
  venue?: string;
  address?: string;
  mapUrl?: string;
  joinUrl?: string;
  domain?: string;
  level?: string;
  tags: string[];
  hosts: EventHost[];
  agenda: AgendaItem[];
  prerequisites: string[];
  takeaways: string[];
  seats?: number | null;
  seatsLeft?: number | null;
  price?: string;
  project?: string;
  repoUrl?: string;
  issuesUrl?: string;
  registerUrl?: string;
  recordingUrl?: string;
  status: EventStatus;
  featured: boolean;
};

export const DEFAULT_TZ = "Asia/Kolkata";

/* ---------------------------------------------------------------------
 * Formatting
 * ------------------------------------------------------------------- */

function parse(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatEventDate(e: ClubEvent): string {
  const d = parse(e.startAt);
  if (!d) return "Date to be announced";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: e.timezone,
  }).format(d);
}

/** Short day/month used by the list rail, e.g. `07` / `MAY`. */
export function formatEventDayMonth(e: ClubEvent): {
  day: string;
  month: string;
} {
  const d = parse(e.startAt);
  if (!d) return { day: "--", month: "TBA" };
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: e.timezone }).format(
      d,
    );
  return {
    day: fmt({ day: "2-digit" }),
    month: fmt({ month: "short" }).toUpperCase(),
  };
}

export function formatEventTime(e: ClubEvent): string {
  if (e.displayTime && e.displayTime.trim()) {
    return e.displayTime.trim();
  }
  const start = parse(e.startAt);
  if (!start) return "";
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: e.timezone,
    }).format(d);
  const end = parse(e.endAt);
  const zone = e.timezone === DEFAULT_TZ ? "IST" : e.timezone;
  return end ? `${fmt(start)} - ${fmt(end)} ${zone}` : `${fmt(start)} ${zone}`;
}

export function isPast(e: ClubEvent): boolean {
  const end = parse(e.endAt);
  if (end) return end.getTime() < Date.now();
  const start = parse(e.startAt);
  return start ? start.getTime() < Date.now() : false;
}

export function getEventStatus(
  e: ClubEvent,
): "upcoming" | "ongoing" | "completed" {
  if (e.status === "completed") return "completed";
  if (e.status === "ongoing" || e.status === "live") return "ongoing";

  const now = Date.now();
  const start = parse(e.startAt)?.getTime();
  const end = parse(e.endAt)?.getTime();

  if (end && now > end) return "completed";
  if (start && now >= start && (!end || now <= end)) return "ongoing";
  if (start && now < start) return "upcoming";
  if (isPast(e)) return "completed";
  return "upcoming";
}

export const MODE_LABEL: Record<EventMode, string> = {
  in_person: "In person",
  online: "Online",
  hybrid: "Hybrid",
};

/** Where the event happens, in one line. */
export function locationLine(e: ClubEvent): string {
  if (e.mode === "online") return "Online";
  return e.venue || MODE_LABEL[e.mode];
}

/* ---------------------------------------------------------------------
 * Sorting & Filtering Helpers
 * ------------------------------------------------------------------- */

/** Ongoing first, then upcoming (soonest to furthest), then past (most recent first). */
export function sortEvents(list: ClubEvent[]): ClubEvent[] {
  const time = (e: ClubEvent) =>
    parse(e.startAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;

  const ongoing = list
    .filter((e) => getEventStatus(e) === "ongoing")
    .sort((a, b) => time(a) - time(b));

  const upcoming = list
    .filter((e) => getEventStatus(e) === "upcoming")
    .sort((a, b) => time(a) - time(b));

  const past = list
    .filter((e) => getEventStatus(e) === "completed")
    .sort(
      (a, b) =>
        (parse(b.endAt)?.getTime() ?? time(b)) -
        (parse(a.endAt)?.getTime() ?? time(a)),
    );

  return [...ongoing, ...upcoming, ...past];
}

export type FeaturedCardItem = {
  event: ClubEvent;
  faded: boolean;
};

/**
 * Selects exactly up to 3 featured events matching Scenarios A through E.
 */
export function selectFeaturedEvents(sessions: ClubEvent[]): FeaturedCardItem[] {
  const time = (e: ClubEvent) =>
    parse(e.startAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;
  const endTime = (e: ClubEvent) =>
    parse(e.endAt)?.getTime() ?? time(e);

  const ongoing = sessions
    .filter((e) => getEventStatus(e) === "ongoing")
    .sort((a, b) => time(a) - time(b));

  const upcoming = sessions
    .filter((e) => getEventStatus(e) === "upcoming")
    .sort((a, b) => time(a) - time(b));

  const completed = sessions
    .filter((e) => getEventStatus(e) === "completed")
    .sort((a, b) => endTime(b) - endTime(a));

  const active = [...ongoing, ...upcoming];

  // Scenario A: completed available AND 2+ active available
  if (completed.length > 0 && active.length >= 2) {
    return [
      { event: completed[0], faded: true },
      { event: active[0], faded: false },
      { event: active[1], faded: false },
    ];
  }

  // Scenario B & C: completed available AND exactly 1 active available
  if (completed.length > 0 && active.length === 1) {
    const pastToTake = completed.slice(0, 2).map((e) => ({ event: e, faded: true }));
    return [...pastToTake, { event: active[0], faded: false }];
  }

  // Scenario D: 0 completed AND 3+ active available
  if (completed.length === 0 && active.length >= 3) {
    return active.slice(0, 3).map((e) => ({ event: e, faded: false }));
  }

  // Scenario E: completed available AND 0 active available
  if (completed.length > 0 && active.length === 0) {
    return completed.slice(0, 3).map((e) => ({ event: e, faded: false }));
  }

  // Fallback (e.g. fewer than 3 total events):
  const combined = [
    ...active.map((e) => ({ event: e, faded: false })),
    ...completed.map((e) => ({ event: e, faded: active.length > 0 })),
  ];
  return combined.slice(0, 3);
}

export type HeroRibbonEvent = {
  event: ClubEvent;
  isOngoing: boolean;
  label?: string;
};

/**
 * Determines the event to feature on the Hero ribbon:
 * 1. If an ongoing event exists, returns { event, isOngoing: true, label: "Ongoing" }
 * 2. Else if an upcoming event exists, returns { event, isOngoing: false, label: "Next up" }
 * 3. Else if active/featured event exists, returns { event, isOngoing: false, label: "Latest Episode" }
 * 4. Fallback to latest event in list
 */
export function getHeroRibbonEvent(sessions?: ClubEvent[]): HeroRibbonEvent | null {
  if (!sessions || sessions.length === 0) return null;

  const time = (e: ClubEvent) =>
    parse(e.startAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;

  // 1. Ongoing event available?
  const ongoing = sessions
    .filter((e) => getEventStatus(e) === "ongoing")
    .sort((a, b) => time(a) - time(b));

  if (ongoing.length > 0) {
    return { event: ongoing[0], isOngoing: true, label: "Ongoing" };
  }

  // 2. Upcoming event available?
  const upcoming = sessions
    .filter((e) => getEventStatus(e) === "upcoming")
    .sort((a, b) => time(a) - time(b));

  if (upcoming.length > 0) {
    return { event: upcoming[0], isOngoing: false, label: "Next up" };
  }

  // 3. Active/Featured event from DB
  const featured = sessions.filter((e) => e.featured);
  if (featured.length > 0) {
    return { event: featured[0], isOngoing: false, label: "Latest Episode" };
  }

  // 4. Default to first event
  return { event: sessions[0], isOngoing: false, label: "Latest Episode" };
}

/* ---------------------------------------------------------------------
 * Database Entity Mapping (Neon Postgres)
 * ------------------------------------------------------------------- */

type DbEpisode = {
  id: number;
  episode_number: number | null;
  title: string | null;
  description: string | null;
  meta_description: string | null;
  event_date: string | Date | null;
  event_time: string | null;
  presenter_name: string | null;
  presenter_designation: string | null;
  /** Null when the stored photo is an inline data URI - see the query. */
  presenter_photo_url: string | null;
  /** Hosted cover URL, or null when the cover is stored inline. */
  cover_url: string | null;
  /** Whether the episode has a cover at all, inline or hosted. */
  has_cover: boolean | null;
  event_mode: string | null;
  is_active: boolean | null;
  is_registration_open: boolean | null;
};

export function stripHtml(html?: string | null): string | undefined {
  if (!html) return undefined;
  const stripped = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  return stripped || undefined;
}

function mapDbEpisodeToClubEvent(ep: DbEpisode): ClubEvent {
  const isOnline = ep.event_mode?.toLowerCase() !== "in_person";
  const startAt = ep.event_date ? new Date(ep.event_date).toISOString() : null;
  const num = ep.episode_number ?? ep.id;

  // A hosted cover is used directly; an inline one is fetched by the
  // browser from the cover route rather than riding along in the payload.
  const coverUrl =
    ep.cover_url || (ep.has_cover ? `/api/events/${num}/cover` : undefined);

  let status: EventStatus = "scheduled";
  if (ep.is_active === false) {
    status = "completed";
  } else if (startAt) {
    const timeMs = new Date(startAt).getTime();
    const now = Date.now();
    if (now > timeMs + 2 * 3600_000) {
      status = "completed";
    } else if (now >= timeMs && now <= timeMs + 2 * 3600_000) {
      status = "ongoing";
    } else {
      status = "scheduled";
    }
  }

  const cleanSummary = ep.meta_description || stripHtml(ep.description);

  return {
    id: `ep-${num}`,
    slug: `episode-${num}`,
    title: ep.title || `Episode ${num}`,
    summary: cleanSummary,
    description: ep.description || undefined,
    cover: coverUrl ? { url: coverUrl, alt: ep.title || `Episode ${num}` } : null,
    startAt,
    displayTime: ep.event_time || undefined,
    timezone: DEFAULT_TZ,
    mode: isOnline ? "online" : "in_person",
    venue: isOnline ? undefined : "In person",
    domain: "Open Source",
    level: "All levels",
    tags: ["Open Source", "Open Source Friday", `Episode ${num}`],
    hosts: ep.presenter_name
      ? [
          {
            name: ep.presenter_name,
            title: ep.presenter_designation || undefined,
            avatar: ep.presenter_photo_url || undefined,
          },
        ]
      : [],
    agenda: [],
    prerequisites: ["Curiosity to learn and build in the open"],
    takeaways: cleanSummary ? [cleanSummary] : ["Practical industry insights"],
    seats: null,
    seatsLeft: null,
    project: `OSF-Ep${num}`,
    registerUrl: "https://osf.descienceosclub.com/",
    status,
    featured: Boolean(ep.is_active),
  };
}

/* ---------------------------------------------------------------------
 * Live Event Data Providers
 * ------------------------------------------------------------------- */

/**
 * Episode rows are read straight from the database on each render pass.
 *
 * There is deliberately no unstable_cache() layer here: the episodes table
 * stores presenter and cover images as base64 data URIs, which makes one
 * full read ~7.6MB - far over Next's 2MB data-cache entry limit, so the
 * entry would be rejected on every write. The caching that matters happens
 * a level up instead: both routes export `revalidate`, so the *rendered*
 * page is cached and served instantly while Next regenerates it in the
 * background. Readers never wait on this query.
 */
export async function fetchLiveEpisodes(): Promise<ClubEvent[] | null> {
  try {
    const sql = getDb();
    if (!sql) return null;

    const rows = (await sql`
      SELECT 
        id, episode_number, title, description, meta_description,
        event_date, event_time, presenter_name, presenter_designation,
        event_mode, is_active, is_registration_open,
        -- Images are stored as base64 data URIs. Selecting them would pull
        -- ~7.6MB per read for 8 rows, so inline ones are left in the
        -- database and served by /api/events/[id]/cover instead; only
        -- genuinely hosted URLs come back here.
        CASE
          WHEN presenter_photo_url LIKE 'data:%' THEN NULL
          ELSE presenter_photo_url
        END AS presenter_photo_url,
        CASE
          WHEN COALESCE(cover_photo_url, past_cover_photo_url) LIKE 'data:%'
            THEN NULL
          ELSE COALESCE(cover_photo_url, past_cover_photo_url)
        END AS cover_url,
        (COALESCE(cover_photo_url, past_cover_photo_url) IS NOT NULL)
          AS has_cover
      FROM episodes 
      ORDER BY episode_number DESC;
    `) as DbEpisode[];

    if (Array.isArray(rows) && rows.length > 0) {
      return rows.map(mapDbEpisodeToClubEvent);
    }
  } catch (error) {
    console.warn(
      "[events] Could not query Neon database, falling back to local dataset:",
      error,
    );
  }
  return null;
}

export async function getEvents(): Promise<ClubEvent[]> {
  const live = await fetchLiveEpisodes();
  if (live && live.length > 0) {
    return sortEvents(live);
  }
  return sortEvents(sampleClubEvents);
}

export async function getOpenSourceFridays(): Promise<ClubEvent[]> {
  return getEvents();
}
