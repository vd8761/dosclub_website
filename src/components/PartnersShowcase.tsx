"use client";

import RevealText from "./ui/RevealText";

function altFromSrc(src: string) {
  const file = src.split("/").pop() ?? "";
  return decodeURIComponent(file)
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

function LogoTile({
  src,
  className = "",
  featured = false,
}: {
  src: string;
  className?: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`group relative flex items-center justify-center overflow-hidden rounded-2xl border bg-surface p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-[0_20px_50px_-24px_rgba(12,51,70,0.35)] ${
        featured ? "border-primary/30" : "border-line"
      } ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={altFromSrc(src)}
        loading="lazy"
        className="h-full w-full max-h-full max-w-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
}

function GroupHeader({ label, count }: { label: string; count?: number }) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <p className="label whitespace-nowrap">{label}</p>
      {count !== undefined && (
        <span className="font-mono text-xs text-primary-dark">
          [{String(count).padStart(2, "0")}]
        </span>
      )}
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export default function PartnersShowcase({
  institutions,
  industry,
}: {
  institutions: string[];
  industry: string[];
}) {
  return (
    <section
      id="partners"
      className="section section-none-b border-t border-line"
    >
      <div className="container-x">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="label mb-6">/ 06 - Partners</p>
            <h2 className="display text-4xl leading-[1.02] sm:text-5xl lg:text-6xl xl:text-7xl">
              <RevealText
                text="A network of"
                as="span"
                className="block"
                scrub
              />
              <RevealText
                text="partners."
                as="span"
                className="block text-gradient"
                scrub
              />
            </h2>
          </div>
          <p className="text-muted lg:col-span-4 lg:pb-2">
            The institutions and industry building open source talent alongside
            us.
          </p>
        </div>

        {/* Institution partners */}
        {institutions.length > 0 && (
          <div className="mt-12">
            <GroupHeader
              label="Academic Partners"
              count={institutions.length}
            />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {institutions.map((src, i) => (
                <LogoTile key={i} src={src} className="h-28 md:h-32" />
              ))}
            </div>
          </div>
        )}

        {/* Industry partner */}
        {industry.length > 0 && (
          <div className="mt-12">
            <GroupHeader
              label="Industry & Corporate Network"
              count={industry.length}
            />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {industry.map((src, i) => (
                <LogoTile key={i} src={src} className="h-28 md:h-32" />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
