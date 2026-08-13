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
import Team from "@/components/Team";
import Partners from "@/components/Partners";
import Faq from "@/components/Faq";
import Join from "@/components/Join";
import Footer from "@/components/Footer";
import LoopEnd from "@/components/LoopEnd";
import { getEvents } from "@/lib/cms";

export default async function Home() {
  const { events } = await getEvents();

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
