"use client";

import { FormEvent, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { site, socials } from "@/data/site";

export default function Join() {
  const root = useRef<HTMLElement>(null);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  useGSAP(
    () => {
      gsap.from("[data-join-head]", {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
    },
    { scope: root }
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Club enquiry from ${form.name}`);
    const body = encodeURIComponent(
      `${form.message}\n\n— ${form.name} (${form.email})`
    );
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  const field =
    "w-full rounded-xl border border-line bg-ink-soft px-4 py-3.5 text-sm text-fg placeholder:text-muted/60 outline-none transition-colors focus:border-violet";

  return (
    <section id="join" ref={root} className="section">
      <div className="container-x">
        <div className="glass relative overflow-hidden rounded-[2rem] p-8 md:p-14 lg:p-20">
          {/* decorative glow */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full opacity-30 blur-[120px]"
            style={{
              background:
                "radial-gradient(circle, var(--color-violet), transparent 60%)",
            }}
          />

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div data-join-head>
              <p className="label mb-6">/ 08 — Join us</p>
              <h2 className="display text-[clamp(2.4rem,6vw,5rem)] leading-[0.98]">
                Ready to build
                <br />
                <span className="text-gradient">in the open?</span>
              </h2>
              <p className="mt-6 max-w-md text-muted">
                Tell us a little about yourself. Whether you&apos;re a total
                beginner or a seasoned builder, there&apos;s a place for you
                here.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    className="rounded-full border border-line px-4 py-2 font-mono text-xs text-muted transition-colors hover:border-cyan hover:text-fg"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>

            {sent ? (
              <div className="flex flex-col items-start justify-center">
                <span className="text-5xl">✦</span>
                <h3 className="display mt-6 text-3xl font-semibold">
                  Almost there!
                </h3>
                <p className="mt-3 max-w-sm text-muted">
                  Your email app should be opening. If it doesn&apos;t, write to
                  us at{" "}
                  <a href={`mailto:${site.email}`} className="text-green-dark">
                    {site.email}
                  </a>
                  .
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-4">
                <input
                  required
                  placeholder="Your name"
                  className={field}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                  required
                  type="email"
                  placeholder="Your email"
                  className={field}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <textarea
                  required
                  rows={4}
                  placeholder="How can we help?"
                  className={`${field} resize-none`}
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                />
                <button type="submit" className="btn btn-primary mt-2 justify-center">
                  Send message <span aria-hidden>→</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
