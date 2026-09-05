/**
 * The one loading indicator used everywhere events are still resolving:
 * the landing page events section, the hero ribbon slot, and the /events
 * route. Keeping it in a single place means every "waiting on events"
 * state in the site looks identical.
 *
 * Pure CSS/SVG, no client JS - it renders inside Suspense fallbacks, which
 * are server-rendered and streamed.
 */

const SIZES = {
  sm: "h-4 w-4 border-[1.5px]",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-[3px]",
} as const;

export function Loader({
  size = "md",
  className = "",
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`relative inline-flex shrink-0 ${className}`}
    >
      {/* Track + a single lit arc. border-t/-r coloured against a faint
          full ring reads as a spinner without needing keyframes of our own. */}
      <span
        className={`${SIZES[size]} animate-spin rounded-full border-line border-t-primary border-r-accent`}
      />
    </span>
  );
}

/** Loader plus a caption, centred - for empty regions waiting on data. */
export function LoadingBlock({
  label = "Loading events",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 py-16 text-center ${className}`}
    >
      <Loader size="lg" />
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
        {label}
        <span className="loading-dots" aria-hidden />
      </p>
    </div>
  );
}

/** Neutral shimmering block used to stand in for text/media while loading. */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block rounded-lg bg-ink-2/70 animate-pulse ${className}`}
    />
  );
}

export default Loader;
