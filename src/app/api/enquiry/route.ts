/**
 * POST /api/enquiry - receives the "Join us" form and delivers it by email.
 *
 * Two sends per submission:
 *   1. the club inbox (ADMIN_EMAIL), with Reply-To set to the enquirer
 *   2. a copy to the enquirer themselves
 *
 * The admin send is what decides the response. A failed courtesy copy is
 * logged but never fails the request - the enquiry has already been
 * delivered to the people who need it.
 */

import {
  ADMIN_EMAIL,
  adminEmail,
  emailConfigured,
  enquirerEmail,
  sendEmail,
  type Enquiry,
} from "@/lib/email";

/** Sends live mail, so it must never be prerendered or cached. */
export const dynamic = "force-dynamic";

const LIMITS = {
  name: 100,
  email: 254,
  message: 4000,
  experience: 60,
  interest: 60,
  interests: 12,
} as const;

/** Deliberately permissive - real validation is the delivery attempt. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Payload = Record<string, unknown>;

/** Codepoints this sanitiser treats specially. */
const TAB = 9;
const LF = 10;
const CR = 13;
const DEL = 127;

const NEWLINE = String.fromCharCode(LF);

/**
 * Drops control characters, which could otherwise forge extra header lines
 * or wreck the plain-text layout.
 *
 * Single-line by default: tabs and line breaks become spaces, so a value
 * cannot inject a newline into a subject or a Reply-To. `multiline` keeps
 * line breaks, which only the message body wants.
 */
function text(v: unknown, max: number, multiline = false): string {
  if (typeof v !== "string") return "";

  let out = "";

  for (const ch of v) {
    const code = ch.codePointAt(0)!;

    // Browsers submit textarea values with CRLF; dropping the CR leaves LF.
    if (code === CR) continue;

    if (code === LF || code === TAB) {
      out += multiline && code === LF ? NEWLINE : " ";
      continue;
    }

    if (code < 32 || code === DEL) continue; // every other control char
    out += ch;
  }

  return out.trim().slice(0, max);
}

function parse(body: Payload): { enquiry: Enquiry } | { error: string } {
  const name = text(body.name, LIMITS.name);
  const email = text(body.email, LIMITS.email);
  const message = text(body.message, LIMITS.message, true);
  const experience = text(body.experience, LIMITS.experience);

  if (!name) return { error: "Please tell us your name." };
  if (!EMAIL_RE.test(email)) return { error: "That email doesn't look right." };
  if (!message) return { error: "Please add a short message." };

  const interests = Array.isArray(body.interests)
    ? body.interests
        .map((i) => text(i, LIMITS.interest))
        .filter(Boolean)
        .slice(0, LIMITS.interests)
    : [];

  return { enquiry: { name, email, message, experience, interests } };
}

/* ---------------------------------------------------------------------
 * Rate limiting
 *
 * In-process and best-effort: it survives neither a restart nor a second
 * instance. It exists to blunt a naive script, not to be a real control -
 * put a proper limiter at the edge if this ever gets abused.
 * ------------------------------------------------------------------- */

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  // Opportunistic sweep so the map cannot grow without bound.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }

  return recent.length > MAX_PER_WINDOW;
}

function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/* ------------------------------------------------------------------- */

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return Response.json({ error: "Malformed request." }, { status: 400 });
  }

  // Honeypot: a field hidden from humans. Anything that fills it is a bot,
  // so accept the request and drop it silently rather than teach the bot.
  if (text(body.company, 100)) {
    return Response.json({ ok: true });
  }

  const parsed = parse(body);
  if ("error" in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  if (rateLimited(clientIp(req))) {
    return Response.json(
      { error: "Too many enquiries from here. Please try again later." },
      { status: 429 },
    );
  }

  if (!emailConfigured) {
    console.error("[enquiry] RESEND_API_KEY is not set - cannot send");
    return Response.json(
      { error: "Email isn't configured yet. Please write to us directly." },
      { status: 503 },
    );
  }

  const { enquiry } = parsed;

  const admin = adminEmail(enquiry);
  const copy = enquirerEmail(enquiry);

  const [toAdmin, toEnquirer] = await Promise.all([
    sendEmail({
      to: ADMIN_EMAIL,
      subject: admin.subject,
      html: admin.html,
      text: admin.text,
      replyTo: enquiry.email,
    }),
    sendEmail({
      to: enquiry.email,
      subject: copy.subject,
      html: copy.html,
      text: copy.text,
    }),
  ]);

  if (!toAdmin.ok) {
    console.error("[enquiry] admin send failed:", toAdmin.error);
    return Response.json(
      { error: "We couldn't send that just now. Please try again." },
      { status: 502 },
    );
  }

  if (!toEnquirer.ok) {
    // Not fatal - the club has the enquiry either way.
    console.error("[enquiry] enquirer copy failed:", toEnquirer.error);
  }

  return Response.json({ ok: true, copySent: toEnquirer.ok });
}
