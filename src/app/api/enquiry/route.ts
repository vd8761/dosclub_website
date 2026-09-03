/**
 * POST /api/enquiry - receives the "Join us" & Enquiry forms and delivers them via Resend API.
 *
 * Requirements implemented:
 *   - Verified Cloudflare Turnstile ("I'm not a robot") captcha token
 *   - Sends email to admin (ADMIN_EMAIL)
 *   - Sent from FROM_EMAIL with display name FROM_NAME
 *   - Supports REPLY_TO_MAIL, MAIL_CC, and MAIL_BCC
 *   - Sends a beautifully styled confirmation copy directly to the user
 */

import {
  ADMIN_EMAIL,
  adminEmail,
  emailConfigured,
  enquirerEmail,
  MAIL_BCC,
  MAIL_CC,
  parseRecipients,
  REPLY_TO_MAIL,
  sendEmail,
  type Enquiry,
} from "@/lib/email";

export const dynamic = "force-dynamic";

const LIMITS = {
  name: 100,
  email: 254,
  message: 4000,
  experience: 60,
  category: 60,
  phone: 30,
  organization: 120,
  interest: 60,
  interests: 12,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Payload = Record<string, unknown>;

const TAB = 9;
const LF = 10;
const CR = 13;
const DEL = 127;
const NEWLINE = String.fromCharCode(LF);

function text(v: unknown, max: number, multiline = false): string {
  if (typeof v !== "string") return "";

  let out = "";
  for (const ch of v) {
    const code = ch.codePointAt(0)!;
    if (code === CR) continue;

    if (code === LF || code === TAB) {
      out += multiline && code === LF ? NEWLINE : " ";
      continue;
    }

    if (code < 32 || code === DEL) continue;
    out += ch;
  }

  return out.trim().slice(0, max);
}

function parse(body: Payload): { enquiry: Enquiry } | { error: string } {
  const name = text(body.name, LIMITS.name);
  const email = text(body.email, LIMITS.email);
  const message = text(body.message, LIMITS.message, true);
  const category = text(body.category, LIMITS.category) || undefined;
  const phone = text(body.phone, LIMITS.phone) || undefined;
  const organization = text(body.organization, LIMITS.organization) || undefined;
  const experience = text(body.experience, LIMITS.experience) || undefined;

  if (!name) return { error: "Please tell us your name." };
  if (!EMAIL_RE.test(email)) return { error: "That email address doesn't look valid." };
  if (!message) return { error: "Please provide a short message or objective." };

  const interests = Array.isArray(body.interests)
    ? body.interests
        .map((i) => text(i, LIMITS.interest))
        .filter(Boolean)
        .slice(0, LIMITS.interests)
    : undefined;

  return {
    enquiry: {
      name,
      email,
      message,
      category,
      phone,
      organization,
      experience,
      interests,
    },
  };
}

/* ---------------------------------------------------------------------
 * Cloudflare Turnstile Verification
 * ------------------------------------------------------------------- */

async function verifyTurnstileToken(token: unknown, ip: string): Promise<boolean> {
  if (typeof token !== "string" || !token.trim()) {
    return false;
  }

  const secret =
    process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY ||
    "1x0000000000000000000000000000000AA"; // Cloudflare official test secret

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secret);
    formData.append("response", token.trim());
    if (ip && ip !== "unknown") {
      formData.append("remoteip", ip);
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      cache: "no-store",
    });

    const data = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    return Boolean(data.success);
  } catch (err) {
    console.error("[turnstile] Verification network error:", err);
    return false;
  }
}

/* ---------------------------------------------------------------------
 * Rate Limiting
 * ------------------------------------------------------------------- */

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 10;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

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
    return Response.json({ error: "Malformed request payload." }, { status: 400 });
  }

  // Honeypot check
  if (text(body.company, 100)) {
    return Response.json({ ok: true });
  }

  const ip = clientIp(req);

  // Cloudflare Turnstile Verification
  const isTurnstileValid = await verifyTurnstileToken(body.turnstileToken, ip);
  if (!isTurnstileValid) {
    return Response.json(
      {
        error:
          "Security check failed. Please complete the 'I am not a robot' verification before submitting.",
      },
      { status: 403 },
    );
  }

  const parsed = parse(body);
  if ("error" in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  if (rateLimited(ip)) {
    return Response.json(
      { error: "Too many enquiries from this address. Please try again in a bit." },
      { status: 429 },
    );
  }

  if (!emailConfigured) {
    console.error("[enquiry] RESEND_API_KEY is not configured in environment");
    return Response.json(
      { error: "Email service is temporarily unconfigured. Please write to us directly." },
      { status: 503 },
    );
  }

  const { enquiry } = parsed;

  const admin = adminEmail(enquiry);
  const copy = enquirerEmail(enquiry);

  // Determine reply-to targets
  const adminReplyTo = REPLY_TO_MAIL || enquiry.email;
  const userCopyReplyTo = REPLY_TO_MAIL || ADMIN_EMAIL;

  const [toAdmin, toEnquirer] = await Promise.all([
    sendEmail({
      to: ADMIN_EMAIL,
      subject: admin.subject,
      html: admin.html,
      text: admin.text,
      replyTo: adminReplyTo,
      cc: parseRecipients(MAIL_CC),
      bcc: parseRecipients(MAIL_BCC),
    }),
    sendEmail({
      to: enquiry.email,
      subject: copy.subject,
      html: copy.html,
      text: copy.text,
      replyTo: userCopyReplyTo,
    }),
  ]);

  if (!toAdmin.ok) {
    console.error("[enquiry] Admin notification delivery failed:", toAdmin.error);
    return Response.json(
      { error: `Delivery failed: ${toAdmin.error}. Please try again shortly.` },
      { status: 502 },
    );
  }

  if (!toEnquirer.ok) {
    console.warn("[enquiry] User confirmation copy delivery issue:", toEnquirer.error);
  }

  return Response.json({
    ok: true,
    copySent: toEnquirer.ok,
    adminDelivered: toAdmin.ok,
  });
}
