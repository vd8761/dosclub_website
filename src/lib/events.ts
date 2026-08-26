/**
 * The shape the site renders events in, plus the mapping from a CMS
 * Delivery API entry onto it.
 *
 * Every field beyond title/start is optional: the UI degrades section by
 * section, so a half-filled CMS entry still renders correctly.
 */

export type EventMode = "in_person" | "online" | "hybrid";
export type EventStatus = "scheduled" | "full" | "cancelled" | "completed";

export type EventHost = {
  name: string;
  title?: string;
  org?: string;
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
  /** HTML, from the CMS `rich_text` field. */
  description?: string;
  cover?: { url: string; alt?: string } | null;
  startAt: string | null;
  endAt?: string | null;
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
  /* Open Source Friday sessions add the project they work on. Optional on
     every other kind of entry, and simply absent for plain events. */
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
 *
 * All formatters pin both locale and time zone. These strings are produced
 * during server rendering and again during hydration; if they depended on
 * the visitor's locale or zone the two passes would disagree and React
 * would throw a hydration mismatch.
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
  const d = parse(e.endAt) ?? parse(e.startAt);
  return d ? d.getTime() < Date.now() : false;
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
 * CMS mapping
 * ------------------------------------------------------------------- */

type Json = Record<string, unknown>;

const str = (v: unknown): string | undefined => {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t || undefined;
};

const num = (v: unknown): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() && Number.isFinite(Number(v))) {
    return Number(v);
  }
  return null;
};

/** Accepts a JSON array, or a newline/comma separated string. */
const list = (v: unknown): string[] => {
  if (Array.isArray(v))
    return v.map((x) => str(x)).filter((x): x is string => !!x);
  const s = str(v);
  if (!s) return [];
  return s
    .split(/\r?\n|,/)
    .map((x) => x.trim())
    .filter(Boolean);
};

const hosts = (v: unknown): EventHost[] => {
  if (!Array.isArray(v)) return [];
  return v
    .map((raw): EventHost | null => {
      if (typeof raw === "string") return str(raw) ? { name: raw.trim() } : null;
      if (raw && typeof raw === "object") {
        const o = raw as Json;
        const name = str(o.name);
        if (!name) return null;
        return { name, title: str(o.title), org: str(o.org) };
      }
      return null;
    })
    .filter((h): h is EventHost => h !== null);
};

const agenda = (v: unknown): AgendaItem[] => {
  if (!Array.isArray(v)) return [];
  return v
    .map((raw): AgendaItem | null => {
      if (!raw || typeof raw !== "object") return null;
      const o = raw as Json;
      const title = str(o.title);
      if (!title) return null;
      return { title, time: str(o.time), detail: str(o.detail) };
    })
    .filter((a): a is AgendaItem => a !== null);
};

/** A `media` field arrives either as an object or as a bare URL string. */
const media = (v: unknown): ClubEvent["cover"] => {
  if (typeof v === "string") return str(v) ? { url: v } : null;
  if (v && typeof v === "object") {
    const o = v as Json;
    const url = str(o.url) ?? str(o.src);
    if (!url) return null;
    return { url, alt: str(o.alt) ?? str(o.alt_text) };
  }
  return null;
};

const MODES = new Set<EventMode>(["in_person", "online", "hybrid"]);
const STATUSES = new Set<EventStatus>([
  "scheduled",
  "full",
  "cancelled",
  "completed",
]);

/** A single entry from `GET /v1/content/event`. */
export type DeliveryEntry = {
  id: string;
  slug: string | null;
  data: unknown;
  published_at?: string | null;
};

export function mapEntry(entry: DeliveryEntry): ClubEvent | null {
  const d = (entry.data ?? {}) as Json;
  const title = str(d.title);
  if (!title) return null; // an entry with no title is not renderable

  const rawMode = str(d.mode);
  const mode: EventMode =
    rawMode && MODES.has(rawMode as EventMode)
      ? (rawMode as EventMode)
      : "in_person";

  const rawStatus = str(d.status);
  const status: EventStatus =
    rawStatus && STATUSES.has(rawStatus as EventStatus)
      ? (rawStatus as EventStatus)
      : "scheduled";

  return {
    id: entry.id,
    slug: entry.slug ?? entry.id,
    title,
    summary: str(d.summary),
    description: str(d.description),
    cover: media(d.cover),
    startAt: str(d.start_at) ?? null,
    endAt: str(d.end_at) ?? null,
    timezone: str(d.timezone) ?? DEFAULT_TZ,
    mode,
    venue: str(d.venue),
    address: str(d.address),
    mapUrl: str(d.map_url),
    joinUrl: str(d.join_url),
    domain: str(d.domain),
    level: str(d.level),
    tags: list(d.tags),
    hosts: hosts(d.hosts),
    agenda: agenda(d.agenda),
    prerequisites: list(d.prerequisites),
    takeaways: list(d.takeaways),
    seats: num(d.seats),
    seatsLeft: num(d.seats_left),
    price: str(d.price),
    project: str(d.project),
    repoUrl: str(d.repo_url),
    issuesUrl: str(d.issues_url),
    registerUrl: str(d.register_url),
    recordingUrl: str(d.recording_url),
    status,
    featured: d.featured === true,
  };
}

/** Upcoming first (soonest to furthest), then past (most recent first). */
export function sortEvents(list: ClubEvent[]): ClubEvent[] {
  const time = (e: ClubEvent) =>
    parse(e.startAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;
  const upcoming = list
    .filter((e) => !isPast(e))
    .sort((a, b) => time(a) - time(b));
  const past = list.filter(isPast).sort((a, b) => time(b) - time(a));
  return [...upcoming, ...past];
}
