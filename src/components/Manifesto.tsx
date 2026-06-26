import ScrollHighlightText from "./ui/ScrollHighlightText";

export default function Manifesto() {
  return (
    <section className="section overflow-hidden">
      <div className="container-x">
        <p className="label mb-10">/ Manifesto</p>
        <ScrollHighlightText
          as="h2"
          text="We believe the best way to learn is to build — in the open, in good company, one commit at a time."
          className="display max-w-5xl text-[clamp(1.9rem,5.5vw,4.5rem)] leading-[1.08]"
        />
      </div>
    </section>
  );
}
