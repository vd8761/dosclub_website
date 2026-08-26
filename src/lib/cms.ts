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
  source: "cms" | "fallback";
};

/**
 * Fetches one content type and maps it onto `ClubEvent`.
 *
 * Returns `null` on every failure path so each caller can decide what its
 * own fallback should be.
 */
async function fetchType(type: string): Promise<ClubEvent[] | null> {
  if (!cmsConfigured) return null;

  try {
    const url = new URL(`${API_URL}/v1/content/${type}`);
    url.searchParams.set("limit", "50");
    url.searchParams.set("sort", "-published_at");

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      // Not using Cache Components, so this is the supported revalidation
      // model: serve cached for 5 minutes, then refresh in the background.
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error(`[cms] ${type} fetch failed: ${res.status} ${res.statusText}`);
      return null;
    }

    const body = (await res.json()) as DeliveryList;
    return (body.data ?? [])
      .map(mapEntry)
      .filter((e): e is ClubEvent => e !== null);
  } catch (err) {
    console.error(`[cms] ${type} request threw:`, err);
    return null;
  }
}

/**
 * Fetch published events. Falls back to the bundled sample data whenever
 * the CMS is unconfigured or unreachable, so the site never renders an
 * empty section because of an outage.
 */
export async function getEvents(): Promise<EventsResult> {
  const mapped = await fetchType(EVENT_TYPE);
  if (mapped === null) {
    return { events: sampleEvents(fallbackEvents), source: "fallback" };
  }

  // An empty but successful response is a legitimate state (no events
  // published yet) - don't paper over it with sample data.
  return { events: sortEvents(mapped), source: "cms" };
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
  const mapped = await fetchType(OSS_FRIDAY_TYPE);
  if (mapped === null) {
    return { events: sampleOssFridays(), source: "fallback" };
  }
  return { events: sortEvents(mapped), source: "cms" };
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
