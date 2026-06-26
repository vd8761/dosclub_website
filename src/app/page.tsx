import Navbar from "@/components/Navbar";
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

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Stats />
        <Manifesto />
        <Domains />
        <Journey />
        <Events />
        <Team />
        <Partners />
        <Faq />
        <Join />
      </main>
      <Footer />
    </>
  );
}
