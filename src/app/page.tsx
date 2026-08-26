import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import Stats from "@/components/Stats";
import Manifesto from "@/components/Manifesto";
import Domains from "@/components/Domains";
import Journey from "@/components/Journey";
import Events from "@/components/Events";
import OpenSourceFriday from "@/components/OpenSourceFriday";
import Team from "@/components/Team";
import Partners from "@/components/Partners";
import Faq from "@/components/Faq";
import Join from "@/components/Join";
import Footer from "@/components/Footer";
import LoopEnd from "@/components/LoopEnd";
import { getEvents, getOpenSourceFridays } from "@/lib/cms";

/**
 * Re-render the page every 5 minutes.
 *
 * The fetch in `getEvents` carries its own `revalidate`, but that only
 * governs a SUCCESSFUL response. If the CMS is down at build time the
 * request throws, we fall back to sample data, and nothing would ever
 * schedule a retry. This makes the page itself revalidate regardless.
 */
export const revalidate = 300;

export default async function Home() {
  // Two independent Delivery API reads - fire them together rather than
  // letting the second wait on the first.
  const [{ events }, { events: ossFridaySessions }] = await Promise.all([
    getEvents(),
    getOpenSourceFridays(),
  ]);

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
          <Events events={events} />
          <OpenSourceFriday sessions={ossFridaySessions} />
          <Team />
          <Partners />
          <Faq />
          <Join />
        </main>
        <Footer />
        <LoopEnd />
      </SmoothScroll>
    </>
  );
}
