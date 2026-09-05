import Loader, { Skeleton } from "./ui/Loader";

/**
 * Streamed placeholder for the landing page events section.
 *
 * It mirrors the real section's frame - same id, same spacing, same header
 * copy, same lead-plus-list grid - so when the data arrives the swap is
 * just content filling in, not the page jumping. The heading is plain text
 * here rather than the animated RevealText, since fallbacks are rendered
 * on the server.
 */
export default function EventsSectionSkeleton() {
  return (
    <section
      id="events"
      className="section relative mt-12 overflow-hidden border-t border-line bg-gradient-to-b from-ink via-ink-soft to-ink md:mt-20 lg:mt-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-accent/15 via-primary/10 to-transparent blur-3xl"
      />

      <div className="container-x">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <div className="mb-4 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-primary-dark">
              / 04 - Events
            </div>
            <h2 className="display text-4xl leading-[1.02] sm:text-5xl lg:text-6xl xl:text-7xl">
              <span className="block">Workshops, webinars &amp;</span>
              <span className="block text-gradient">build sessions.</span>
            </h2>
          </div>
          <div className="flex max-w-sm flex-col items-start gap-4 md:items-end">
            <p className="text-sm leading-relaxed text-muted md:text-right">
              Hands-on sessions, Open Source Fridays and live masterclasses led
              by working engineers and mentors.
            </p>
            <span className="inline-flex items-center gap-2 font-mono text-xs text-muted">
              <Loader size="sm" />
              Loading events
              <span className="loading-dots" aria-hidden />
            </span>
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-8">
          {/* Lead card */}
          <article className="glass overflow-hidden rounded-3xl">
            {/* Wrapper clips the placeholder's own corner radius, so it
                reads as a flat cover area like the real image does. */}
            <div className="aspect-[16/7] w-full overflow-hidden border-b border-line">
              <Skeleton className="h-full w-full" />
            </div>
            <div className="p-6 md:p-8">
              <div className="flex items-start gap-5">
                <Skeleton className="h-16 w-16 shrink-0 rounded-2xl" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-6 w-32 rounded-full" />
                  <Skeleton className="mt-3 h-7 w-11/12" />
                  <Skeleton className="mt-2 h-4 w-32" />
                </div>
              </div>
              <div className="mt-5 space-y-2">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-10/12" />
              </div>
              <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-52 sm:col-span-2" />
              </div>
              <div className="mt-7 flex gap-3 border-t border-line/80 pt-5">
                <Skeleton className="h-10 w-32 rounded-xl" />
                <Skeleton className="h-10 w-36 rounded-xl" />
              </div>
            </div>
          </article>

          {/* Supporting list */}
          <div className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between border-b border-line pb-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                Also on the calendar
              </span>
              <Skeleton className="h-3 w-20" />
            </div>
            {[0, 1].map((i) => (
              <div
                key={i}
                className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-2xl border border-line bg-surface/70 p-4"
              >
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="min-w-0">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-2 h-4 w-10/12" />
                  <Skeleton className="mt-2 h-3 w-7/12" />
                </div>
              </div>
            ))}
            <Skeleton className="mt-auto h-14 rounded-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
