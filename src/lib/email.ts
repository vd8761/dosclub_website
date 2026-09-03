/**
 * Transactional email delivery via the Resend HTTP REST API.
 * Supports:
 *   - ADMIN_EMAIL (destination for incoming enquiries)
 *   - FROM_EMAIL (sender address)
 *   - FROM_NAME (sender display name)
 *   - REPLY_TO_MAIL (optional default reply-to override)
 *   - MAIL_CC (optional comma-separated CC recipients)
 *   - MAIL_BCC (optional comma-separated BCC recipients)
 *   - RESEND_API_KEY (authorization bearer token)
 */

import { site } from "@/data/site";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export const RESEND_API_KEY = process.env.RESEND_API_KEY;

export const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL ||
  process.env.ENQUIRY_TO_EMAIL ||
  "info@touchmarkdes.com";

export const FROM_EMAIL =
  process.env.FROM_EMAIL ||
  process.env.RESEND_FROM ||
  "no-reply@touchmarkdes.com";

export const FROM_NAME =
  process.env.FROM_NAME || site.name || "Descience Open Source Club";

export const REPLY_TO_MAIL = process.env.REPLY_TO_MAIL;

export const MAIL_CC = process.env.MAIL_CC;
export const MAIL_BCC = process.env.MAIL_BCC;

export const emailConfigured = Boolean(RESEND_API_KEY);

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export type SendOptions = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
};

export function parseRecipients(val?: string): string[] | undefined {
  if (!val) return undefined;
  const list = val
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter((s) => Boolean(s) && s.includes("@"));
  return list.length > 0 ? list : undefined;
}

export async function sendEmail(opts: SendOptions): Promise<SendResult> {
  if (!RESEND_API_KEY) {
    return { ok: false, error: "RESEND_API_KEY is not configured" };
  }

  try {
    const payload: Record<string, unknown> = {
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    };

    if (opts.replyTo) {
      payload.reply_to = opts.replyTo;
    }

    if (opts.cc && opts.cc.length > 0) {
      payload.cc = opts.cc;
    }

    if (opts.bcc && opts.bcc.length > 0) {
      payload.bcc = opts.bcc;
    }

    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const body = (await res.json().catch(() => null)) as {
      id?: string;
      message?: string;
      statusCode?: number;
    } | null;

    if (!res.ok) {
      return {
        ok: false,
        error: body?.message ?? `Resend error HTTP ${res.status}`,
      };
    }

    return { ok: true, id: body?.id ?? "" };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error contacting Resend",
    };
  }
}

/* ---------------------------------------------------------------------
 * Branded Dark-Theme Email Templates
 * Tailored to match DOSClub's cyber-studio dark aesthetic:
 *   - Deep background: #07151e
 *   - Container card: #0d212d (1px border #1c394a, radius 18px)
 *   - Highlights: Emerald (#14b8a6) & Warm Orange (#f97316)
 *   - Typography: Clean Segoe UI / Apple System, #f1f7fa headers, #8ba2b0 labels
 * ------------------------------------------------------------------- */

export function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paragraph(s: string): string {
  return esc(s).replace(/\r?\n/g, "<br />");
}

export type Enquiry = {
  name: string;
  email: string;
  category?: string;
  phone?: string;
  organization?: string;
  message: string;
  experience?: string;
  interests?: string[];
};

function renderShell(badge: string, heading: string, intro: string, contentHtml: string, actionHtml?: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(heading)}</title>
</head>
<body style="margin:0;padding:32px 16px;background-color:#07151e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#cbd5e1;line-height:1.6;-webkit-font-smoothing:antialiased;">
  <div style="max-width:600px;margin:0 auto;background-color:#0d212d;border:1px solid #1c394a;border-radius:20px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.5);">
    
    <!-- Top Brand Header Bar -->
    <div style="padding:28px 36px;background:linear-gradient(135deg, #0f2736 0%, #0a1b26 100%);border-bottom:1px solid #1c394a;">
      <div style="display:inline-block;padding:4px 12px;background-color:rgba(20,184,166,0.12);border:1px solid rgba(20,184,166,0.35);border-radius:100px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;font-weight:700;color:#14b8a6;letter-spacing:0.12em;text-transform:uppercase;">
        ${esc(badge)}
      </div>
      <h1 style="margin:14px 0 0;font-size:24px;font-weight:700;color:#f1f7fa;line-height:1.25;letter-spacing:-0.02em;">
        ${esc(heading)}
      </h1>
      <p style="margin:8px 0 0;font-size:14px;color:#8ba2b0;line-height:1.5;">
        ${intro}
      </p>
    </div>

    <!-- Main Content Body -->
    <div style="padding:32px 36px;">
      ${contentHtml}
      ${actionHtml ? `<div style="margin-top:28px;padding-top:24px;border-top:1px solid #1c394a;">${actionHtml}</div>` : ""}
    </div>

    <!-- Footer Bar -->
    <div style="padding:20px 36px;background-color:#091924;border-top:1px solid #162f3e;font-size:12px;color:#6d8494;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
        <span>${esc(site.name)}</span>
        <a href="${esc(site.url)}" target="_blank" style="color:#14b8a6;text-decoration:none;font-weight:600;">
          ${esc(site.url.replace(/^https?:\/\//, ""))} &rarr;
        </a>
      </div>
    </div>

  </div>
</body>
</html>`;
}

function renderRow(label: string, valueHtml: string): string {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #183344;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#8ba2b0;width:130px;vertical-align:top;">
      ${esc(label)}
    </td>
    <td style="padding:10px 0 10px 16px;border-bottom:1px solid #183344;font-size:14px;color:#f1f7fa;vertical-align:top;">
      ${valueHtml}
    </td>
  </tr>`;
}

function renderSummaryTable(e: Enquiry): string {
  const interestsList = e.interests && e.interests.length > 0 ? e.interests.join(", ") : undefined;

  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
    ${e.category ? renderRow("Category / Track", `<span style="display:inline-block;padding:3px 10px;background-color:#163547;border:1px solid #234d66;border-radius:6px;font-size:12px;color:#14b8a6;font-weight:600;">${esc(e.category)}</span>`) : ""}
    ${renderRow("Full Name", `<strong style="color:#ffffff;">${esc(e.name)}</strong>`)}
    ${renderRow("Email Address", `<a href="mailto:${esc(e.email)}" style="color:#14b8a6;text-decoration:none;font-weight:600;">${esc(e.email)}</a>`)}
    ${e.phone ? renderRow("Phone", esc(e.phone)) : ""}
    ${e.organization ? renderRow("Institution / Org", esc(e.organization)) : ""}
    ${e.experience ? renderRow("Experience Level", esc(e.experience)) : ""}
    ${interestsList ? renderRow("Interests", `<span style="color:#f97316;">${esc(interestsList)}</span>`) : ""}
  </table>

  <!-- Message Callout Box -->
  <div style="margin-top:20px;padding:16px 20px;background-color:#102837;border:1px solid #1d4054;border-radius:12px;">
    <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#8ba2b0;margin-bottom:8px;">
      Message / Objective
    </div>
    <div style="font-size:14px;line-height:1.65;color:#f1f7fa;">
      ${paragraph(e.message)}
    </div>
  </div>`;
}

function renderSummaryText(e: Enquiry): string {
  return [
    e.category ? `TRACK:          ${e.category}` : "",
    `NAME:           ${e.name}`,
    `EMAIL:          ${e.email}`,
    e.phone ? `PHONE:          ${e.phone}` : "",
    e.organization ? `ORGANIZATION:   ${e.organization}` : "",
    e.experience ? `EXPERIENCE:     ${e.experience}` : "",
    e.interests?.length ? `INTERESTS:      ${e.interests.join(", ")}` : "",
    "",
    "MESSAGE / OBJECTIVE:",
    "--------------------------------------------------",
    e.message,
    "--------------------------------------------------",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Creates the Admin notification email.
 */
export function adminEmail(e: Enquiry) {
  const categoryTag = e.category ? ` [${e.category}]` : "";
  const subject = `[DOSClub Enquiry]${categoryTag} ${e.name}`;

  const actionHtml = `<a href="mailto:${esc(e.email)}?subject=Re:%20Your%20DOSClub%20Enquiry" target="_blank" style="display:inline-block;padding:12px 24px;background-color:#14b8a6;color:#07151e;font-size:13px;font-weight:700;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;text-transform:uppercase;letter-spacing:0.08em;text-decoration:none;border-radius:8px;">
    Reply to ${esc(e.name)} &rarr;
  </a>`;

  return {
    subject,
    html: renderShell(
      "/ 04 - Incoming Enquiry",
      `New enquiry received from ${e.name}`,
      `A visitor has submitted an enquiry through the DOSClub website. Details are outlined below:`,
      renderSummaryTable(e),
      actionHtml,
    ),
    text: [
      `[DOSClub] New Enquiry from ${e.name}`,
      "==================================================",
      "",
      renderSummaryText(e),
      "",
      `Direct reply address: ${e.email}`,
    ].join("\n"),
  };
}

/**
 * Creates the courtesy copy email delivered to the user.
 */
export function enquirerEmail(e: Enquiry) {
  const firstName = e.name.trim().split(/\s+/)[0] || "there";
  const subject = `We've received your enquiry - ${site.name}`;

  const actionHtml = `<p style="margin:0;font-size:13px;color:#8ba2b0;line-height:1.6;">
    If you need to make corrections or add materials, feel free to reply directly to this email or contact us at
    <a href="mailto:${esc(ADMIN_EMAIL)}" style="color:#14b8a6;text-decoration:none;font-weight:600;">${esc(ADMIN_EMAIL)}</a>.
  </p>`;

  return {
    subject,
    html: renderShell(
      "/ Confirmation",
      `Thanks for reaching out, ${firstName}!`,
      `We've received your enquiry. A club mentor or coordinator will review your application and get back to you shortly (usually within 1&ndash;2 business days). Here is a copy for your records:`,
      renderSummaryTable(e),
      actionHtml,
    ),
    text: [
      `Hi ${firstName},`,
      "",
      `Thank you for reaching out to ${site.name}!`,
      `We've received your submission. A mentor will review it and get back to you shortly.`,
      "",
      "HERE IS A COPY OF YOUR SUBMISSION:",
      "==================================================",
      "",
      renderSummaryText(e),
      "",
      `If you have questions, reply to this email or write to ${ADMIN_EMAIL}.`,
      "",
      `- ${site.name}`,
      site.url,
    ].join("\n"),
  };
}
