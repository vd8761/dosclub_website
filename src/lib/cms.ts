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
import { events as fallbackEvents } from "@/data/site";
import { DEFAULT_TZ } from "./events";

const API_URL = process.env.CMS_API_URL?.replace(/\/+$/, "");
const API_KEY = process.env.CMS_API_KEY;
/** Content type API ID in the CMS. Override if you name it differently. */
const EVENT_TYPE = process.env.CMS_EVENT_TYPE ?? "event";

export const cmsConfigured = Boolean(API_URL && API_KEY);

type DeliveryList = { data?: DeliveryEntry[] };

/**
 * Fetch published events. Falls back to the bundled sample data whenever
 * the CMS is unconfigured or unreachable, so the site never renders an
 * empty section because of an outage.
 */
export async function getEvents(): Promise<{
  events: ClubEvent[];
  source: "cms" | "fallback";
}> {
  if (!cmsConfigured) return { events: localEvents(), source: "fallback" };

  try {
    const url = new URL(`${API_URL}/v1/content/${EVENT_TYPE}`);
    url.searchParams.set("limit", "50");
    url.searchParams.set("sort", "-published_at");

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      // Not using Cache Components, so this is the supported revalidation
      // model: serve cached for 5 minutes, then refresh in the background.
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error(
        `[cms] ${EVENT_TYPE} fetch failed: ${res.status} ${res.statusText}`,
      );
      return { events: localEvents(), source: "fallback" };
    }

    const body = (await res.json()) as DeliveryList;
    const mapped = (body.data ?? [])
      .map(mapEntry)
      .filter((e): e is ClubEvent => e !== null);

    // An empty but successful response is a legitimate state (no events
    // published yet) - don't paper over it with sample data.
    return { events: sortEvents(mapped), source: "cms" };
  } catch (err) {
    console.error("[cms] events request threw:", err);
    return { events: localEvents(), source: "fallback" };
  }
}

/* ---------------------------------------------------------------------
 * Fallback
 *
 * Maps the bundled sample events onto the same shape. Only the fields that
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

function localEvents(): ClubEvent[] {
  const mapped = fallbackEvents.map<ClubEvent>((e) => {
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
