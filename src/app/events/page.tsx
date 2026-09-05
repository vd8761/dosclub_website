import type { Metadata } from "next";
import { getEvents } from "@/lib/events";
import EventsTimeline from "@/components/EventsTimeline";

export const metadata: Metadata = {
  title: "Events Timeline | Descience Open Source Club",
  description:
    "Explore all past, ongoing, and upcoming workshops, webinars, build clinics, and sessions hosted by Descience Open Source Club.",
};

// Same stale-while-revalidate deal as the landing page: serve the cached
// timeline instantly, refresh it in the background. loading.tsx only shows
// on a cold cache.
export const revalidate = 60;

export default async function EventsPage() {
  const sessions = await getEvents();

  return <EventsTimeline initialEvents={sessions} />;
}
