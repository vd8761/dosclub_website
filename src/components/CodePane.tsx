"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

type Line = {
  /** Shell prompt lines are typed out; output lines just appear. */
  kind: "cmd" | "out" | "ok";
  text: string;
};

const SCRIPT: Line[] = [
  { kind: "cmd", text: "git clone descience-os/starter" },
  { kind: "out", text: "Cloning into 'starter'... done." },
  { kind: "cmd", text: "npm install && npm run dev" },
  { kind: "ok", text: "ready - localhost:3000" },
  { kind: "cmd", text: 'git commit -m "my first contribution"' },
  { kind: "ok", text: "1 file changed, 24 insertions(+)" },
];

const TYPE_SPEED = 0.028; // seconds per character

export default function CodePane() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const rows = gsap.utils.toArray<HTMLElement>("[data-row]");
      const caret =
        root.current?.querySelector<HTMLElement>("[data-caret]") ?? null;
      const outs = rows.map((r) => r.querySelector<HTMLElement>("[data-text]"));

      if (reduce) {
        rows.forEach((r, i) => {
          gsap.set(r, { autoAlpha: 1 });
          if (outs[i]) outs[i]!.textContent = SCRIPT[i].text;
        });
        gsap.set(caret, { autoAlpha: 0 });
        return;
      }

      gsap.set(rows, { autoAlpha: 0 });

      const tl = gsap.timeline({ delay: 0.9, repeat: -1, repeatDelay: 2.5 });

      SCRIPT.forEach((line, i) => {
        const row = rows[i];
        const out = outs[i];
        if (!row || !out) return;

        tl.set(row, { autoAlpha: 1 });

        if (line.kind === "cmd") {
          // Type character by character. One textContent write per frame,
          // and only ever on this single node.
          const state = { n: 0 };
          tl.to(state, {
            n: line.text.length,
            duration: line.text.length * TYPE_SPEED,
            ease: "none",
            onUpdate: () => {
              out.textContent = line.text.slice(0, Math.ceil(state.n));
            },
          });
          // move the caret to the end of the line just typed
          tl.add(() => {
            if (caret) row.appendChild(caret);
          });
        } else {
          tl.add(() => {
            out.textContent = line.text;
          });
          tl.to({}, { duration: 0.45 });
        }
      });

      // Reset for the loop
      tl.to(rows, { autoAlpha: 0, duration: 0.4, stagger: 0.03 }, "+=1.2");
      tl.add(() => {
        outs.forEach((o) => o && (o.textContent = ""));
      });

      // Blinking caret runs independently of the script
      if (caret) {
        gsap.to(caret, {
          opacity: 0,
          duration: 0.5,
          repeat: -1,
          yoyo: true,
          ease: "steps(1)",
        });
      }

      return () => {
        tl.kill();
      };
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden
      className="glass relative overflow-hidden rounded-2xl"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-line px-4 py-4">
        <span className="h-3 w-3 rounded-full bg-line" />
        <span className="h-3 w-3 rounded-full bg-line" />
        <span className="h-3 w-3 rounded-full bg-line" />
        <span className="ml-2 font-mono text-[11px] tracking-[0.08em] text-muted">
          ~/descience-os
        </span>
      </div>

      {/* Script */}
      <div className="flex min-h-[248px] flex-col gap-2 p-6 font-mono text-[12px] leading-relaxed md:min-h-[264px] md:text-[13px]">
        {SCRIPT.map((line, i) => (
          <p key={i} data-row className="flex items-start gap-2">
            <span
              className={
                line.kind === "cmd"
                  ? "shrink-0 text-primary"
                  : "shrink-0 text-transparent"
              }
            >
              $
            </span>
            <span
              data-text
              className={
                line.kind === "ok"
                  ? "text-primary-dark"
                  : line.kind === "cmd"
                    ? "text-fg"
                    : "text-muted"
              }
            />
            {i === 0 && (
              <span
                data-caret
                className="inline-block h-4 w-2 shrink-0 translate-y-[2px] bg-accent"
              />
            )}
          </p>
        ))}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t border-line px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary" />
          main
        </span>
        <span>open source</span>
      </div>
    </div>
  );
}
