"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import RevealText from "./ui/RevealText";
import { studentTeams } from "@/data/site";

type StudentTeam = (typeof studentTeams)[number];

/**
 * The people section.
 *
 * These are the students who came through the club, grouped into the
 * colour-named teams they build in - not the mentors. The artwork already
 * names each team, so there is no caption or swatch: the image is the
 * card. Tiles are square and the photos are shown whole, never cropped,
 * and any tile opens full size.
 */
export default function Team() {
  const root = useRef<HTMLElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const [zoomed, setZoomed] = useState<StudentTeam | null>(null);

  /**
   * Whether the closing card starts a row of its own.
   *
   * The column count is whatever the grid resolved to at this width, so
   * it is read back from the computed style rather than assumed. If the
   * photos fill their last row exactly, the card lands alone on the next
   * one and stretches across the full width instead of sitting as a lone
   * narrow tile; otherwise it slots into the gap like any other card.
   */
  const [cardFillsRow, setCardFillsRow] = useState(false);

  useEffect(() => {
    const el = grid.current;
    if (!el) return;

    const measure = () => {
      const columns = window
        .getComputedStyle(el)
        .gridTemplateColumns.split(" ")
        .filter(Boolean).length;
      if (!columns) return;
      setCardFillsRow(studentTeams.length % columns === 0);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      gsap.fromTo(
        "[data-team-card]",
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "expo.out",
          stagger: 0.06,
          clearProps: "opacity,transform",
          immediateRender: false,
          scrollTrigger: {
            trigger: "[data-team]",
            start: "top 82%",
            once: true,
          },
        },
      );
    },
    { scope: root },
  );

  return (
    <section id="team" ref={root} className="section section-flush-t">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="label mb-6">/ 05 - The people</p>
            <h2 className="display max-w-3xl text-4xl leading-[1.02] sm:text-5xl lg:text-6xl xl:text-7xl">
              <RevealText
                text="Colour teams. One"
                as="span"
                className="block"
                scrub
              />
              <RevealText
                text="open source club."
                as="span"
                className="block text-gradient"
                scrub
              />
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-relaxed text-muted md:text-right">
            Every member joins a colour team. They learn together, ship
            together, and carry each other through the hard parts.
          </p>
        </div>

        <div
          data-team
          ref={grid}
          className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4"
        >
          {studentTeams.map((t, i) => (
            <button
              key={t.name}
              type="button"
              data-team-card
              onClick={() => setZoomed(t)}
              aria-label={`View Team ${t.name} full size`}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-[0_24px_60px_-40px_rgba(12,51,70,0.5)] sm:rounded-3xl"
            >
              {/* object-contain, so the whole group is always visible. The
                  artwork is near-square, so a square tile leaves only a
                  hairline of padding. */}
              <Image
                src={t.image}
                alt={`Team ${t.name}`}
                fill
                sizes="(min-width: 1280px) 23vw, (min-width: 640px) 31vw, 46vw"
                // Only the first row is anywhere near the fold.
                loading={i < 4 ? "eager" : "lazy"}
                className="object-contain p-1 transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </button>
          ))}

          {/* Closing card. Spans the row when it would otherwise sit alone
              on one; slots in normally when it shares a row with photos. */}
          <div
            data-team-card
            className={`flex flex-col justify-between rounded-2xl border border-dashed border-line p-5 sm:rounded-3xl sm:p-6 ${
              cardFillsRow ? "col-span-full sm:flex-row sm:items-center" : ""
            }`}
          >
            <div className={cardFillsRow ? "sm:max-w-md" : ""}>
              <h3 className="display text-lg font-semibold sm:text-xl">
                Your team next
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Every intake forms new colour teams. Join the club and you get
                one - along with the people in it.
              </p>
            </div>
            <Link
              href="/enquiry"
              className="label mt-5 inline-flex items-center gap-2 text-fg transition-colors hover:text-primary sm:mt-6 sm:whitespace-nowrap"
            >
              Get in touch <span className="text-primary">{"->"}</span>
            </Link>
          </div>
        </div>
      </div>

      {zoomed && <TeamLightbox team={zoomed} onClose={() => setZoomed(null)} />}
    </section>
  );
}

/* ---------------------------------------------------------------------
 * Full-size view.
 * ------------------------------------------------------------------- */

function TeamLightbox({
  team,
  onClose,
}: {
  team: StudentTeam;
  onClose: () => void;
}) {
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [onKeyDown]);

  // The lightbox only ever renders in response to a click, so there is no
  // server pass to guard against beyond this.
  if (typeof document === "undefined") return null;

  // Portalled to the body: `position: fixed` inside #smooth-content would
  // resolve against ScrollSmoother's transformed element, not the viewport.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Team ${team.name}`}
      onClick={onClose}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/95 p-4 backdrop-blur-sm sm:p-8"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface/90 text-muted transition-colors hover:text-fg"
      >
        <span aria-hidden>✕</span>
      </button>

      <Image
        src={team.image}
        alt={`Team ${team.name}`}
        width={1254}
        height={1210}
        sizes="(min-width: 768px) 70vw, 92vw"
        // Stop the backdrop's click-to-close from firing on the image.
        onClick={(e) => e.stopPropagation()}
        className="h-auto max-h-[88vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
      />
    </div>,
    document.body,
  );
}
