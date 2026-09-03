import type { Metadata } from "next";
import { getEvents, getOpenSourceFridays } from "@/lib/cms";
import EventsTimeline from "@/components/EventsTimeline";

export const metadata: Metadata = {
  title: "Events Timeline | Descience Open Source Club",
  description:
    "Explore all past, ongoing, and upcoming workshops, webinars, build clinics, and sessions hosted by Descience Open Source Club.",
};

/**
 * Vercel Edge Cache: 24-hour fallback revalidation.
 * Revalidations are triggered on-demand via CMS webhooks (/api/revalidate).
 */
export const revalidate = 86400;

export default async function EventsPage() {
  const { events } = await getEvents();
  const { events: ossFridaySessions } = await getOpenSourceFridays();
  const sessions = events.length > 0 ? events : ossFridaySessions;

  return <EventsTimeline initialEvents={sessions} />;
}
