import { CSSProperties } from "react";
import ScrollHighlightText from "./ui/ScrollHighlightText";
import MorphAccent from "./MorphAccent";

export default function Manifesto() {
  return (
    <section className="section-tight relative overflow-hidden bg-deep text-[color:var(--color-on-deep)]">
      <MorphAccent className="pointer-events-none absolute -right-8 top-12 h-72 w-72 opacity-60 md:h-[26rem] md:w-[26rem]" />
      <div
        className="blob -left-20 bottom-0 h-80 w-80 opacity-40"
        style={{ "--blob-rgb": "var(--rgb-primary)" } as CSSProperties}
      />

      <div className="container-x relative">
        <p className="label mb-8" style={{ color: "var(--color-on-deep-muted)" }}>
          / Manifesto
        </p>
        <ScrollHighlightText
          dark
          as="h2"
          text="We believe the best way to learn is to build - in the open, in good company, one commit at a time."
          className="display max-w-5xl text-3xl leading-[1.08] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
        />
      </div>
    </section>
  );
}
