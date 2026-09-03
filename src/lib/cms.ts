/**
 * Read-only client for the CMS Delivery API.
 *
 *   GET {CMS_API_URL}/v1/content/{type}
 *   Authorization: Bearer {CMS_API_KEY}
 *
 * The Delivery API only ever returns published entries, and the key is
 * scoped to a single workspace, so nothing here can reach another site or
 * any admin surface. The key is read on the server only - it must never be
 * exposed with a NEXT_PUBLIC_ prefix.
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";

import {
  mapEntry,
  sortEvents,
  type ClubEvent,
  type DeliveryEntry,
} from "./events";
import { events as fallbackEvents, ossFridays } from "@/data/site";
import { DEFAULT_TZ } from "./events";

const API_URL = process.env.CMS_API_URL?.replace(/\/+$/, "");
const API_KEY = process.env.CMS_API_KEY;

/** Content type API IDs in the CMS. Override if you name them differently. */
const EVENT_TYPE = process.env.CMS_EVENT_TYPE ?? "event";
const OSS_FRIDAY_TYPE =
  process.env.CMS_OSS_FRIDAY_TYPE ?? "open_source_friday";

export const cmsConfigured = Boolean(API_URL && API_KEY);

type DeliveryList = { data?: DeliveryEntry[] };

export type EventsResult = {
  events: ClubEvent[];
  source: "cms" | "cache" | "fallback";
};

const CACHE_DIR = path.join(os.tmpdir(), "dosclub-cms-cache");

declare global {
  // eslint-disable-next-line no-var
  var __cmsMemoryCache: Map<string, ClubEvent[]> | undefined;
}
const memoryCache = (globalThis.__cmsMemoryCache ??= new Map<string, ClubEvent[]>());

function readDiskCache(key: string): ClubEvent[] | null {
  try {
    const filePath = path.join(CACHE_DIR, `${key}.json`);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn(`[cms] could not read disk cache for ${key}:`, err);
  }
  return null;
}

function writeDiskCache(key: string, data: ClubEvent[]): void {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    const filePath = path.join(CACHE_DIR, `${key}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data), "utf-8");
  } catch (err) {
    console.warn(`[cms] could not write disk cache for ${key}:`, err);
  }
}

function getCached(key: string): ClubEvent[] | null {
  return memoryCache.get(key) ?? readDiskCache(key);
}

function setCached(key: string, data: ClubEvent[]): void {
  memoryCache.set(key, data);
  writeDiskCache(key, data);
}

/**
 * Fetches one content type and maps it onto `ClubEvent`.
 *
 * Returns `null` on every failure path so each caller can decide what its
 * own fallback should be.
 */
async function fetchType(
  type: string,
): Promise<{ events: ClubEvent[]; source: "cms" | "cache" } | null> {
  if (!cmsConfigured) {
    const cached = getCached(type);
    if (cached) return { events: cached, source: "cache" };
    return null;
  }

  try {
    const url = new URL(`${API_URL}/v1/content/${type}`);
    url.searchParams.set("limit", "50");
    url.searchParams.set("sort", "-published_at");

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      // Check for updates in the background every 60s when visited
      next: { revalidate: 60, tags: ["cms-events", `cms-${type}`] },
    });

    if (!res.ok) {
      console.error(`[cms] ${type} fetch failed: ${res.status} ${res.statusText}`);
      const cached = getCached(type);
      if (cached) {
        console.log(
          `[cms] Serving ${cached.length} cached events for ${type} (CMS returned ${res.status})`,
        );
        return { events: cached, source: "cache" };
      }
      return null;
    }

    const body = (await res.json()) as DeliveryList;
    const mapped = (body.data ?? [])
      .map(mapEntry)
      .filter((e): e is ClubEvent => e !== null);

    if (mapped.length > 0) {
      setCached(type, mapped);
    }

    return { events: mapped, source: "cms" };
  } catch (err) {
    console.error(`[cms] ${type} request threw:`, err);
    const cached = getCached(type);
    if (cached) {
      console.log(
        `[cms] Serving ${cached.length} cached events for ${type} (CMS unreachable)`,
      );
      return { events: cached, source: "cache" };
    }
    return null;
  }
}

/**
 * ============================================================================
 * TODO: CMS DELIVERY FILTERING & CARD COMPOSITION RULES
 * ============================================================================
 * When consuming live events from the CMS, format and slice according to:
 *
 * 1. n past AND 2+ upcoming available:
 *    - Return [1 most recent completed (faded, disabled button "Completed"), 2 upcoming (active, register button)]
 *
 * 2. n past AND 1 upcoming available:
 *    - Return [2 most recent completed (faded, disabled button "Completed"), 1 upcoming (active, register button)]
 *
 * 3. n past AND 1 ongoing available:
 *    - Return [2 most recent completed (faded, disabled button "Completed"), 1 ongoing (registration disabled, button "Ongoing")]
 *
 * 4. 0 past AND 3 upcoming available:
 *    - Return [3 upcoming events] (show "Register" button if register URL exists, else display "Upcoming")
 *
 * 5. n past AND 0 upcoming available:
 *    - Return [3 most recent completed events] (do NOT fade anything; show disabled button "Completed")
 *
 * 6. Hero Ribbon:
 *    - Pick the nearest "Ongoing" or "Upcoming" event for the Hero ribbon.
 *    - If ONLY past events exist OR CMS is unreachable/down, do NOT show the Hero event ribbon.
 *
 * 7. Outage / Unconfigured:
 *    - Fall back to hardcoded sample events in `data/site.ts`.
 * ============================================================================
 */
export async function getEvents(): Promise<EventsResult> {
  const result = await fetchType(EVENT_TYPE);
  if (result === null) {
    return { events: sampleEvents(fallbackEvents), source: "fallback" };
  }

  // An empty but successful response is a legitimate state (no events
  // published yet) - don't paper over it with sample data.
  return { events: sortEvents(result.events), source: result.source };
}

/**
 * Fetch published Open Source Friday sessions.
 *
 * A missing content type is the expected state until it is created in the
 * CMS, and it surfaces here the same way an outage does - as `null` from
 * `fetchType` - so the section shows the bundled sample sessions until
 * someone publishes real ones.
 */
export async function getOpenSourceFridays(): Promise<EventsResult> {
  const result = await fetchType(OSS_FRIDAY_TYPE);
  if (result === null) {
    return { events: sampleOssFridays(), source: "fallback" };
  }
  return { events: sortEvents(result.events), source: result.source };
}

/* ---------------------------------------------------------------------
 * Fallback
 *
 * Maps the bundled sample entries onto the same shape. Only the fields that
 * genuinely exist in `data/site.ts` are populated - the richer sections
 * (agenda, takeaways, hosts' titles) stay empty and the modal simply omits
 * them until real entries come from the CMS.
 * ------------------------------------------------------------------- */

const MONTHS: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

/** Parses "07 May 2024" + "10:00 - 16:00 IST" into ISO instants. */
function toIso(
  date: string,
  time: string | undefined,
  end: boolean,
): string | null {
  const m = /^(\d{1,2})\s+([A-Za-z]{3})[a-z]*\s+(\d{4})$/.exec(date.trim());
  if (!m) return null;
  const month = MONTHS[m[2].toLowerCase()];
  if (month === undefined) return null;

  const clock = time?.match(/(\d{1,2}):(\d{2})/g) ?? [];
  const picked = end ? clock[1] : clock[0];
  const [hh, mm] = picked ? picked.split(":").map(Number) : [end ? 17 : 10, 0];
  if (end && !clock[1]) return null;

  // The sample times are IST (UTC+5:30); build the instant explicitly
  // rather than relying on the build machine's local zone.
  const utc =
    Date.UTC(Number(m[3]), month, Number(m[1]), hh, mm) - 5.5 * 3600_000;
  return new Date(utc).toISOString();
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/* ---------------------------------------------------------------------
 * Open Source Friday fallback
 *
 * The roster in `data/site.ts` carries no dates on purpose - it is pinned
 * onto the next few real Fridays here. A hardcoded date would silently
 * empty the section the week after it passed.
 * ------------------------------------------------------------------- */

/** IST is UTC+5:30 year-round - no DST to account for. */
const IST_OFFSET_MS = 5.5 * 3600_000;
const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;

/** Sessions run 18:00-20:00 IST. */
const OSF_START_HOUR = 18;
const OSF_DURATION_MS = 2 * 3600_000;

/**
 * The instant of the next Friday at 18:00 IST that has not started yet.
 * Today counts only while it is still before 18:00 local time.
 */
function nextFridayStart(now: number): number {
  // Shifting by the offset makes the UTC getters read as IST wall clock.
  const ist = new Date(now + IST_OFFSET_MS);
  const FRIDAY = 5;
  const daysAhead = (FRIDAY - ist.getUTCDay() + 7) % 7;

  const at = (offsetDays: number) =>
    Date.UTC(
      ist.getUTCFullYear(),
      ist.getUTCMonth(),
      ist.getUTCDate() + offsetDays,
      OSF_START_HOUR,
    ) - IST_OFFSET_MS;

  const candidate = at(daysAhead);
  // If today *is* Friday but 18:00 IST has passed, roll to next week.
  return candidate > now ? candidate : at(daysAhead + 7);
}

function sampleOssFridays(): ClubEvent[] {
  const first = nextFridayStart(Date.now());

  return ossFridays.map<ClubEvent>((e, i) => {
    const start = first + i * WEEK_MS;
    const online = /online/i.test(e.location);
    return {
      id: slugify(e.title),
      slug: slugify(e.title),
      title: e.title,
      startAt: new Date(start).toISOString(),
      endAt: new Date(start + OSF_DURATION_MS).toISOString(),
      timezone: DEFAULT_TZ,
      mode: online ? "online" : "in_person",
      venue: online ? undefined : e.location,
      level: e.tag,
      tags: [e.tag],
      hosts: e.host ? [{ name: e.host }] : [],
      agenda: [],
      prerequisites: [],
      takeaways: [],
      seats: null,
      seatsLeft: null,
      project: e.project,
      status: "scheduled",
      featured: false,
    };
  });
}

/** The shape the bundled samples in `data/site.ts` are authored in. */
type SampleEntry = {
  title: string;
  date: string;
  time?: string;
  location: string;
  host?: string;
  tag: string;
};

function sampleEvents(entries: readonly SampleEntry[]): ClubEvent[] {
  const mapped = entries.map<ClubEvent>((e) => {
    const online = /online/i.test(e.location);
    return {
      id: slugify(e.title),
      slug: slugify(e.title),
      title: e.title,
      startAt: toIso(e.date, e.time, false),
      endAt: toIso(e.date, e.time, true),
      timezone: DEFAULT_TZ,
      mode: online ? "online" : "in_person",
      venue: online ? undefined : e.location,
      domain: e.tag,
      tags: [e.tag],
      hosts: e.host ? [{ name: e.host }] : [],
      agenda: [],
      prerequisites: [],
      takeaways: [],
      seats: null,
      seatsLeft: null,
      status: "scheduled",
      featured: false,
    };
  });
  return sortEvents(mapped);
}
