"use client";

import { FormEvent, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { site, socials, domains } from "@/data/site";

const STEPS = [
  {
    no: "01",
    title: "Say hello",
    body: "Tell us who you are and what you want to build. No CV, no test.",
  },
  {
    no: "02",
    title: "We reply",
    body: "A mentor gets back to you, usually within a couple of days.",
  },
  {
    no: "03",
    title: "Start building",
    body: "Pick a domain, join the next session, ship your first contribution.",
  },
];

const EXPERIENCE = ["Just starting", "Some projects", "Comfortable shipping"];

const field =
  "w-full rounded-xl border border-line bg-ink-soft px-4 py-4 text-sm text-fg placeholder:text-muted/60 outline-none transition-colors focus:border-accent";

const fieldLabel =
  "font-mono text-[11px] uppercase tracking-[0.14em] text-muted";

export default function Join() {
  const root = useRef<HTMLElement>(null);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    experience: EXPERIENCE[0],
  });
  const [interests, setInterests] = useState<string[]>([]);

  useGSAP(
    () => {
      gsap.from("[data-join-head]", {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 78%" },
      });
      gsap.from("[data-join-step]", {
        y: 24,
        opacity: 0,
        duration: 0.8,
        ease: "expo.out",
        stagger: 0.1,
        scrollTrigger: { trigger: "[data-join-steps]", start: "top 85%" },
      });
    },
    { scope: root },
  );

  const toggle = (title: string) =>
    setInterests((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Club enquiry from ${form.name}`);
    const body = encodeURIComponent(
      [
        form.message,
        "",
        `Experience: ${form.experience}`,
        `Interested in: ${interests.length ? interests.join(", ") : "Not specified"}`,
        "",
        `- ${form.name} (${form.email})`,
      ].join("\n"),
    );
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <section
      id="join"
      ref={root}
      className="section border-y border-line bg-ink-soft"
    >
      <div className="container-x">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-16">
          {/* ---------------- Left: the pitch ---------------- */}
          <div className="lg:col-span-5">
            <div data-join-head>
              <p className="label mb-6">/ 08 - Join us</p>
              <h2 className="display text-4xl leading-[0.98] sm:text-5xl lg:text-6xl">
                Ready to build
                <br />
                <span className="text-gradient">in the open?</span>
              </h2>
              <p className="mt-6 max-w-md text-muted">
                Whether you&apos;re a total beginner or a seasoned builder,
                there&apos;s a place for you here.
              </p>
            </div>

            {/* What happens next */}
            <ol data-join-steps className="mt-12 flex flex-col gap-6">
              {STEPS.map((s) => (
                <li
                  key={s.no}
                  data-join-step
                  className="flex gap-4 border-l-2 border-line pl-6"
                >
                  <div>
                    <p className="flex items-baseline gap-2">
                      <span className="font-mono text-xs text-primary-dark">
                        {s.no}
                      </span>
                      <span className="display font-semibold">{s.title}</span>
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {/* Direct contact */}
            <div className="mt-12 border-t border-line pt-8">
              <p className={fieldLabel}>Or reach us directly</p>
              <a
                href={`mailto:${site.email}`}
                className="mt-2 inline-block text-primary-dark transition-colors hover:text-accent"
              >
                {site.email}
              </a>
              <div className="mt-6 flex flex-wrap gap-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    className="rounded-full border border-line px-4 py-2 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-fg"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ---------------- Right: the form ---------------- */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-line bg-surface p-8 shadow-[0_24px_64px_-48px_rgba(12,51,70,0.5)] md:p-12">
              {sent ? (
                <div className="flex min-h-[400px] flex-col items-start justify-center">
                  <span
                    aria-hidden
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-mono text-xl text-white"
                  >
                    ✓
                  </span>
                  <h3 className="display mt-6 text-3xl font-semibold">
                    Almost there!
                  </h3>
                  <p className="mt-4 max-w-sm text-muted">
                    Your email app should be opening with everything filled in.
                    If it doesn&apos;t, write to us at{" "}
                    <a
                      href={`mailto:${site.email}`}
                      className="text-primary-dark underline underline-offset-4"
                    >
                      {site.email}
                    </a>
                    .
                  </p>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="btn btn-ghost mt-8"
                  >
                    Edit my details
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="flex flex-col gap-8">
                  {/* Identity */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="join-name" className={fieldLabel}>
                        Name
                      </label>
                      <input
                        id="join-name"
                        required
                        placeholder="Ada Lovelace"
                        className={field}
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="join-email" className={fieldLabel}>
                        Email
                      </label>
                      <input
                        id="join-email"
                        required
                        type="email"
                        placeholder="you@example.com"
                        className={field}
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Interests */}
                  <fieldset className="flex flex-col gap-4">
                    <legend className={fieldLabel}>
                      What are you into?{" "}
                      <span className="normal-case tracking-normal opacity-70">
                        (pick any)
                      </span>
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {domains.map((d) => {
                        const on = interests.includes(d.title);
                        return (
                          <button
                            key={d.no}
                            type="button"
                            aria-pressed={on}
                            onClick={() => toggle(d.title)}
                            className={`flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-xs transition-colors ${
                              on
                                ? "border-transparent bg-fg text-ink"
                                : "border-line text-muted hover:border-accent hover:text-fg"
                            }`}
                          >
                            <span
                              aria-hidden
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{
                                background: on ? d.accent : "var(--color-line)",
                              }}
                            />
                            {d.title}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  {/* Experience */}
                  <fieldset className="flex flex-col gap-4">
                    <legend className={fieldLabel}>Where are you now?</legend>
                    <div className="flex flex-wrap gap-2">
                      {EXPERIENCE.map((x) => {
                        const on = form.experience === x;
                        return (
                          <button
                            key={x}
                            type="button"
                            aria-pressed={on}
                            onClick={() => setForm({ ...form, experience: x })}
                            className={`rounded-full border px-4 py-2 font-mono text-xs transition-colors ${
                              on
                                ? "border-transparent bg-primary-dark text-white"
                                : "border-line text-muted hover:border-accent hover:text-fg"
                            }`}
                          >
                            {x}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  {/* Message */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="join-message" className={fieldLabel}>
                      Anything else?
                    </label>
                    <textarea
                      id="join-message"
                      required
                      rows={4}
                      placeholder="What do you want to learn or build with us?"
                      className={`${field} resize-none`}
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <button type="submit" className="btn btn-primary">
                      Send it <span aria-hidden>{"->"}</span>
                    </button>
                    <p className="text-xs text-muted">
                      Opens your email app - nothing is stored here.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
