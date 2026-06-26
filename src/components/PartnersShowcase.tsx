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
      className={`group flex items-center justify-center rounded-2xl border bg-surface p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_60px_-32px_rgba(22,46,28,0.5)] ${
        featured ? "border-green/30" : "border-line hover:border-green/40"
      } ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={altFromSrc(src)}
        loading="lazy"
        className={`w-auto max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.04] ${
          featured ? "max-h-16" : "max-h-14"
        }`}
      />
    </div>
  );
}

function GroupHeader({ label, count }: { label: string; count?: number }) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <p className="label whitespace-nowrap">{label}</p>
      {count !== undefined && (
        <span className="font-mono text-xs text-green-dark">
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
    <section id="partners" className="section border-t border-line">
      <div className="container-x">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="label mb-6">/ 06 — Partners</p>
            <h2 className="display text-[clamp(2rem,5vw,4rem)] leading-[1.02]">
              <RevealText text="A network of" as="span" className="block" scrub />
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
          <div className="mt-20">
            <GroupHeader
              label="Institution partners"
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
          <div className="mt-16">
            <GroupHeader
              label="Industry partner"
              count={industry.length > 1 ? industry.length : undefined}
            />
            {industry.length === 1 ? (
              <div className="flex justify-center">
                <div className="w-full max-w-md">
                  <LogoTile src={industry[0]} className="h-40" featured />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {industry.map((src, i) => (
                  <LogoTile key={i} src={src} className="h-32" featured />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
