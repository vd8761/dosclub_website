import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import Stats from "@/components/Stats";
import Manifesto from "@/components/Manifesto";
import Domains from "@/components/Domains";
import Journey from "@/components/Journey";
import OpenSourceFriday from "@/components/OpenSourceFriday";
import Team from "@/components/Team";
import Partners from "@/components/Partners";
import Faq from "@/components/Faq";
import Join from "@/components/Join";
import Footer from "@/components/Footer";
import LoopEnd from "@/components/LoopEnd";
import { getEvents, getOpenSourceFridays } from "@/lib/cms";

/**
 * Re-render the page in the background every 60 seconds when visited.
 * If CMS is available, fresh events are pulled; if CMS is unreachable,
 * cached data is served.
 */
export const revalidate = 60;

export default async function Home() {
  const { events } = await getEvents();
  const { events: ossFridaySessions } = await getOpenSourceFridays();
  const sessions = events.length > 0 ? events : ossFridaySessions;

  return (
    <>
      <Navbar />
      <SmoothScroll>
        <main>
          <Hero />
          <Marquee />
          <About />
          <Stats />
          <Manifesto />
          <Domains />
          <Journey />
          <OpenSourceFriday sessions={sessions} />
          <Team />
          <Partners />
          <Faq />
        </main>
        <Footer />
      </SmoothScroll>
    </>
  );
}
