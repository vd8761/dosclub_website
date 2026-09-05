import Footer from "@/components/Footer";
import { LoadingBlock, Skeleton } from "@/components/ui/Loader";

/**
 * Instant loading state for /events. It reproduces the real page's frame -
 * top bar, header block, filter row, timeline spine - so navigating here
 * shows the layout immediately and only the rows pop in.
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-ink text-fg">
      <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur-md">
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <span className="font-mono text-xs text-muted">&larr; Back to home</span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-fg">
            Events
          </span>
          <Skeleton className="hidden h-8 w-48 rounded-full sm:block" />
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="grid-bg grid-mask pointer-events-none absolute inset-0 -z-20"
        />
        <div className="container-x py-14 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end">
            <div>
              <div className="mb-5 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-primary-dark">
                / Timeline archive
              </div>
              <h1 className="display text-4xl leading-[1.02] sm:text-5xl lg:text-6xl xl:text-7xl">
                <span className="block">Every session,</span>
                <span className="block text-gradient">start to finish.</span>
              </h1>
              <Skeleton className="mt-6 h-4 w-full max-w-xl" />
              <Skeleton className="mt-2 h-4 w-10/12 max-w-xl" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-[104px] rounded-2xl" />
              ))}
            </div>
          </div>

          <Skeleton className="mt-12 h-[168px] rounded-3xl md:mt-16" />
        </div>
      </section>

      <div className="border-b border-line bg-ink/90">
        <div className="container-x flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {/* Widths roughly match the real filter labels so the row does
                not resize when the page swaps in. */}
            {["w-20", "w-32", "w-28", "w-32"].map((w, i) => (
              <Skeleton key={i} className={`h-8 rounded-full ${w}`} />
            ))}
          </div>
          <Skeleton className="h-9 w-full rounded-full lg:w-80" />
        </div>
      </div>

      <main className="container-x py-12 md:py-16">
        <LoadingBlock label="Loading the events timeline" />
      </main>

      <Footer />
    </div>
  );
}
