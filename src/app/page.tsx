import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import Stats from "@/components/Stats";
import Manifesto from "@/components/Manifesto";
import Domains from "@/components/Domains";
import Journey from "@/components/Journey";
import EventsSection from "@/components/EventsSection";
import EventsSectionSkeleton from "@/components/EventsSectionSkeleton";
import Team from "@/components/Team";
import Partners from "@/components/Partners";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import { getEvents } from "@/lib/events";
import { Suspense } from "react";

// Incremental static regeneration: visitors are always served the cached
// copy immediately, and Next refreshes it in the background once the copy
// is older than this many seconds. Nobody waits on the database. The
// Suspense fallbacks below only surface on a cold cache.
export const revalidate = 60;

export default function Home() {
  // Kicked off but deliberately not awaited: the shell renders straight
  // away and the two event-dependent spots stream in on their own.
  const sessionsPromise = getEvents();

  return (
    <>
      <Navbar />
      <SmoothScroll>
        <main>
          <Hero sessionsPromise={sessionsPromise} />
          <Marquee />
          <About />
          <Stats />
          <Manifesto />
          <Domains />
          <Journey />
          <Suspense fallback={<EventsSectionSkeleton />}>
            <EventsSection sessionsPromise={sessionsPromise} />
          </Suspense>
          <Team />
          <Partners />
          <Faq />
        </main>
        <Footer />
      </SmoothScroll>
    </>
  );
}
