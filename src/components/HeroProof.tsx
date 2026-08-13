"use client";

import { stats, team } from "@/data/site";

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

/** Tints for the avatar chips, cycled. */
const CHIP = [
  "var(--color-primary)",
  "var(--color-accent)",
  "var(--color-primary-dark)",
];

// Matched by label so reordering `stats` is safe, with a positional
// fallback so a reworded label degrades rather than blanking the row.
const members = stats.find((s) => /member/i.test(s.label)) ?? stats[0];
const workshops = stats.find((s) => /workshop/i.test(s.label)) ?? stats[1];

export default function HeroProof() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
      {/* Stacked member chips */}
      <div className="flex items-center gap-4">
        <div className="flex -space-x-2">
          {team.map((m, i) => (
            <span
              key={m.name}
              title={m.name}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink font-mono text-[10px] font-medium text-white"
              style={{ background: CHIP[i % CHIP.length] }}
            >
              {initials(m.name)}
            </span>
          ))}
          <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-ink-2 font-mono text-[10px] font-medium text-muted">
            +
          </span>
        </div>
        {members && (
          <p className="text-sm text-muted">
            <span className="font-medium text-fg">
              {members.value}
              {members.suffix}
            </span>{" "}
            building together
          </p>
        )}
      </div>

      <span aria-hidden className="hidden h-4 w-px bg-line sm:block" />

      {workshops && (
        <p className="text-sm text-muted">
          <span className="font-medium text-fg">
            {workshops.value}
            {workshops.suffix}
          </span>{" "}
          workshops shipped
        </p>
      )}
    </div>
  );
}
