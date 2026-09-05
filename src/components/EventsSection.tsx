import EventsShowcase from "./EventsShowcase";
import type { ClubEvent } from "@/lib/events";

/**
 * Suspense boundary payload for the landing page events section.
 *
 * The page hands down the *unawaited* getEvents() promise so the rest of
 * the page can render and stream immediately; only this subtree waits on
 * the database, showing <EventsSectionSkeleton /> in the meantime.
 */
export default async function EventsSection({
  sessionsPromise,
}: {
  sessionsPromise: Promise<ClubEvent[]>;
}) {
  const sessions = await sessionsPromise;
  return <EventsShowcase sessions={sessions} />;
}
