/**
 * Transactional email via the Resend HTTP API.
 *
 *   POST https://api.resend.com/emails
 *   Authorization: Bearer {RESEND_API_KEY}
 *
 * Deliberately no SMTP and no SDK dependency - the REST endpoint is one
 * `fetch` and keeps the bundle (and the lockfile) unchanged.
 *
 * Every value here is read on the server only. `RESEND_API_KEY` must never
 * carry a NEXT_PUBLIC_ prefix; that would ship a send-capable credential to
 * the browser.
 */

import { site } from "@/data/site";

const ENDPOINT = "https://api.resend.com/emails";

const API_KEY = process.env.RESEND_API_KEY;

/** Verified sending identity. The display name is the website's name. */
const FROM_ADDRESS = process.env.RESEND_FROM ?? "no-reply@touchmarkdes.com";
const FROM = `${site.name} <${FROM_ADDRESS}>`;

/** Where enquiries land. */
export const ADMIN_EMAIL =
  process.env.ENQUIRY_TO_EMAIL ?? "info@touchmarkdes.com";

export const emailConfigured = Boolean(API_KEY);

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

type SendOptions = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  /** Set so a plain "Reply" from the admin inbox reaches the enquirer. */
  replyTo?: string;
};

export async function sendEmail(opts: SendOptions): Promise<SendResult> {
  if (!API_KEY) return { ok: false, error: "RESEND_API_KEY is not set" };

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
      // Transactional send - never serve this from a cache.
      cache: "no-store",
    });

    const body = (await res.json().catch(() => null)) as {
      id?: string;
      message?: string;
    } | null;

    if (!res.ok) {
      return {
        ok: false,
        error: body?.message ?? `Resend responded ${res.status}`,
      };
    }

    return { ok: true, id: body?.id ?? "" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "unknown" };
  }
}

/* ---------------------------------------------------------------------
 * Templates
 *
 * Table-free, inline-styled HTML with a plain-text twin. Anything derived
 * from user input goes through `esc` before it reaches the HTML version.
 * ------------------------------------------------------------------- */

export function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Preserves the enquirer's line breaks inside an HTML paragraph. */
function paragraph(s: string): string {
  return esc(s).replace(/\r?\n/g, "<br />");
}

const BRAND = "#2f8a36";
const DEEP = "#0c3346";
const MUTED = "#5b6f79";
const LINE = "#dfe7ed";

function shell(heading: string, intro: string, body: string): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#f4f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#10222b;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid ${LINE};border-radius:16px;overflow:hidden;">
      <div style="background:${DEEP};padding:24px 32px;">
        <p style="margin:0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#93aab5;">
          ${esc(site.name)}
        </p>
        <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;color:#e8f1f5;font-weight:600;">
          ${esc(heading)}
        </h1>
      </div>
      <div style="padding:32px;">
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:${MUTED};">
          ${intro}
        </p>
        ${body}
      </div>
      <div style="padding:20px 32px;border-top:1px solid ${LINE};">
        <p style="margin:0;font-size:12px;line-height:1.6;color:${MUTED};">
          ${esc(site.name)} &middot;
          <a href="${esc(site.url)}" style="color:${BRAND};text-decoration:none;">${esc(site.url.replace(/^https?:\/\//, ""))}</a>
        </p>
      </div>
    </div>
  </body>
</html>`;
}

/** One label/value row of the enquiry summary. */
function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid ${LINE};font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:${MUTED};white-space:nowrap;vertical-align:top;width:120px;">
      ${esc(label)}
    </td>
    <td style="padding:10px 0 10px 16px;border-bottom:1px solid ${LINE};font-size:15px;line-height:1.6;color:#10222b;">
      ${value}
    </td>
  </tr>`;
}

export type Enquiry = {
  name: string;
  email: string;
  message: string;
  experience: string;
  interests: string[];
};

function summaryTable(e: Enquiry): string {
  const interests = e.interests.length
    ? e.interests.join(", ")
    : "Not specified";
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
    ${row("Name", esc(e.name))}
    ${row("Email", `<a href="mailto:${esc(e.email)}" style="color:${BRAND};text-decoration:none;">${esc(e.email)}</a>`)}
    ${row("Experience", esc(e.experience))}
    ${row("Interests", esc(interests))}
    ${row("Message", paragraph(e.message))}
  </table>`;
}

function summaryText(e: Enquiry): string {
  return [
    `Name:       ${e.name}`,
    `Email:      ${e.email}`,
    `Experience: ${e.experience}`,
    `Interests:  ${e.interests.length ? e.interests.join(", ") : "Not specified"}`,
    "",
    "Message:",
    e.message,
  ].join("\n");
}

/** Notification to the club inbox. Reply-To is the enquirer. */
export function adminEmail(e: Enquiry) {
  return {
    subject: `New enquiry from ${e.name}`,
    html: shell(
      "New club enquiry",
      `Someone just submitted the join form on the website.`,
      summaryTable(e),
    ),
    text: [`New club enquiry`, "", summaryText(e)].join("\n"),
  };
}

/** The enquirer's own copy of what they sent. */
export function enquirerEmail(e: Enquiry) {
  const firstName = e.name.trim().split(/\s+/)[0] || "there";
  return {
    subject: `We got your enquiry - ${site.name}`,
    html: shell(
      "Thanks for reaching out",
      `Hi ${esc(firstName)}, we've received your enquiry and a mentor will get back to you, usually within a couple of days. Here's a copy for your records.`,
      `${summaryTable(e)}
      <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:${MUTED};">
        This is an automated copy - no need to reply. If you need to add
        anything, write to
        <a href="mailto:${esc(ADMIN_EMAIL)}" style="color:${BRAND};text-decoration:none;">${esc(ADMIN_EMAIL)}</a>.
      </p>`,
    ),
    text: [
      `Hi ${firstName},`,
      "",
      `We've received your enquiry and a mentor will get back to you, usually`,
      `within a couple of days. Here's a copy for your records.`,
      "",
      summaryText(e),
      "",
      `This is an automated copy - no need to reply. If you need to add`,
      `anything, write to ${ADMIN_EMAIL}.`,
      "",
      `- ${site.name}`,
    ].join("\n"),
  };
}
