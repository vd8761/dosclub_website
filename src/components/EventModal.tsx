"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { getSmoother } from "./SmoothScroll";
import {
  formatEventDate,
  formatEventTime,
  isPast,
  locationLine,
  MODE_LABEL,
  type ClubEvent,
} from "@/lib/events";

const STATUS_STYLE: Record<string, string> = {
  full: "border-transparent bg-ink-2 text-muted",
  cancelled: "border-transparent bg-ink-2 text-muted line-through",
  completed: "border-transparent bg-ink-2 text-muted",
};

export default function EventModal({
  event,
  onClose,
}: {
  event: ClubEvent;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const past = isPast(event);

  /* Escape to dismiss, and keep Tab inside the dialog. */
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;

      const focusables = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    const returnTo = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();

    // Freeze the page behind the dialog. `overflow: hidden` alone does not
    // stop ScrollSmoother, which drives its own transform.
    const smoother = getSmoother();
    smoother?.paused(true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      smoother?.paused(false);
      document.body.style.overflow = prevOverflow;
      returnTo?.focus?.();
    };
  }, [onKeyDown]);

  // Only ever rendered from a click handler, so we are always on the
  // client here - no SSR guard needed beyond this check.
  if (typeof document === "undefined") return null;

  const heading = `event-title-${event.id}`;
  const canRegister =
    !past && event.status === "scheduled" && !!event.registerUrl;

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={heading}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-deep/60 backdrop-blur-sm"
      />

      {/* Panel */}
      <div
        ref={panel}
        className="relative flex max-h-[92svh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-line bg-surface shadow-[0_40px_120px_-40px_rgba(12,51,70,0.7)] sm:rounded-3xl"
      >
        {/* --------- Header --------- */}
        <div className="relative shrink-0 border-b border-line">
          {event.cover?.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.cover.url}
              alt={event.cover.alt ?? ""}
              className="h-40 w-full object-cover object-top sm:h-56"
            />
          )}

          <button
            ref={closeBtn}
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface/90 text-muted transition-colors hover:text-fg"
          >
            <span aria-hidden>✕</span>
          </button>

          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-line px-4 py-2 font-mono text-xs text-muted">
                {MODE_LABEL[event.mode]}
              </span>
              {event.level && (
                <span className="rounded-full border border-line px-4 py-2 font-mono text-xs text-muted">
                  {event.level}
                </span>
              )}
              {event.domain && (
                <span className="rounded-full border border-line px-4 py-2 font-mono text-xs text-muted">
                  {event.domain}
                </span>
              )}
              {(past || event.status !== "scheduled") && (
                <span
                  className={`rounded-full border px-4 py-2 font-mono text-xs ${
                    STATUS_STYLE[event.status] ??
                    "border-transparent bg-ink-2 text-muted"
                  }`}
                >
                  {event.status === "scheduled" ? "Past" : event.status}
                </span>
              )}
            </div>

            <h2
              id={heading}
              className="display mt-6 text-3xl font-semibold sm:text-4xl"
            >
              {event.title}
            </h2>
            {event.summary && (
              <p className="mt-4 text-muted">{event.summary}</p>
            )}
          </div>
        </div>

        {/* --------- Scrollable body --------- */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6 sm:p-8">
          {/* Facts */}
          <dl className="grid gap-6 sm:grid-cols-2">
            <Fact label="When">
              {formatEventDate(event)}
              <span className="mt-2 block text-muted">
                {formatEventTime(event)}
              </span>
            </Fact>

            <Fact label="Where">
              {locationLine(event)}
              {event.address && (
                <span className="mt-2 block text-muted">{event.address}</span>
              )}
              {event.mapUrl && (
                <a
                  href={event.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-primary-dark underline underline-offset-4"
                >
                  View map
                </a>
              )}
            </Fact>

            {event.price && <Fact label="Price">{event.price}</Fact>}

            {typeof event.seatsLeft === "number" && (
              <Fact label="Seats">
                {event.seatsLeft > 0
                  ? `${event.seatsLeft} left`
                  : "Fully booked"}
                {typeof event.seats === "number" && (
                  <span className="mt-2 block text-muted">
                    of {event.seats}
                  </span>
                )}
              </Fact>
            )}
          </dl>

          {event.description && (
            <Section title="About this session">
              <div
                className="prose-event text-muted"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            </Section>
          )}

          {event.agenda.length > 0 && (
            <Section title="Agenda">
              <ol className="flex flex-col gap-4">
                {event.agenda.map((item, i) => (
                  <li
                    key={i}
                    className="flex gap-4 border-l-2 border-line pl-6"
                  >
                    <div>
                      {item.time && (
                        <p className="font-mono text-xs text-primary-dark">
                          {item.time}
                        </p>
                      )}
                      <p className="mt-2 font-medium">{item.title}</p>
                      {item.detail && (
                        <p className="mt-2 text-sm text-muted">{item.detail}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {event.takeaways.length > 0 && (
            <Section title="What you'll walk away with">
              <ul className="flex flex-col gap-2">
                {event.takeaways.map((t) => (
                  <li key={t} className="flex gap-4 text-muted">
                    <span aria-hidden className="text-primary">
                      +
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {event.prerequisites.length > 0 && (
            <Section title="Before you come">
              <ul className="flex flex-col gap-2">
                {event.prerequisites.map((t) => (
                  <li key={t} className="flex gap-4 text-muted">
                    <span aria-hidden className="text-muted">
                      -
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {event.hosts.length > 0 && (
            <Section title={event.hosts.length > 1 ? "Hosts" : "Host"}>
              <ul className="flex flex-col gap-4">
                {event.hosts.map((h) => (
                  <li key={h.name} className="flex items-center gap-4">
                    <span
                      aria-hidden
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs text-white"
                    >
                      {h.name
                        .split(" ")
                        .slice(0, 2)
                        .map((p) => p[0])
                        .join("")
                        .toUpperCase()}
                    </span>
                    <span>
                      <span className="block font-medium">{h.name}</span>
                      {(h.title || h.org) && (
                        <span className="block text-sm text-muted">
                          {[h.title, h.org].filter(Boolean).join(" - ")}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {event.tags.length > 0 && (
            <Section title="Topics">
              <div className="flex flex-wrap gap-2">
                {event.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-line px-4 py-2 font-mono text-xs text-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* --------- Sticky action bar --------- */}
        <div className="flex shrink-0 flex-wrap items-center gap-4 border-t border-line bg-ink-soft p-6 sm:px-8">
          {canRegister ? (
            <a
              href={event.registerUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              Register <span aria-hidden>{"->"}</span>
            </a>
          ) : past && event.recordingUrl ? (
            <a
              href={event.recordingUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              Watch the recording <span aria-hidden>{"->"}</span>
            </a>
          ) : (
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
              {event.status === "cancelled"
                ? "This session was cancelled"
                : event.status === "full"
                  ? "This session is full"
                  : past
                    ? "This session has ended"
                    : "Registration opens soon"}
            </span>
          )}

          {!past && event.mode !== "in_person" && event.joinUrl && (
            <a
              href={event.joinUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost"
            >
              Join link
            </a>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Fact({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        {label}
      </dt>
      <dd className="mt-2">{children}</dd>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 border-t border-line pt-8">
      <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}
