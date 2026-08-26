# Enquiry email — Resend setup

The "Join us" form no longer opens the visitor's mail client. It posts to
`POST /api/enquiry`, which delivers two emails through the
[Resend](https://resend.com) HTTP API:

1. **To the club** (`ENQUIRY_TO_EMAIL`) — the enquiry, with `Reply-To` set to
   the enquirer, so hitting reply in that inbox writes straight back to them.
2. **To the enquirer** — a copy of what they sent, for their records.

No SMTP, and no SDK: the REST endpoint is a single `fetch`, so nothing was
added to `package.json`.

---

## 1. Configuration

```bash
RESEND_API_KEY=re_...                     # https://resend.com/api-keys
RESEND_FROM=no-reply@touchmarkdes.com     # verified sending address
ENQUIRY_TO_EMAIL=info@touchmarkdes.com    # where enquiries land
```

All three are **server-only**. `RESEND_API_KEY` can send mail on your behalf —
never give it a `NEXT_PUBLIC_` prefix, and never reference it from a client
component.

`RESEND_FROM` and `ENQUIRY_TO_EMAIL` have the values above as built-in
defaults, so only `RESEND_API_KEY` is strictly required. Set them explicitly
anyway — an env var is easier to find than a default in a source file.

### Prerequisites in Resend

1. **Verify the `touchmarkdes.com` domain** (Domains → Add domain), including
   the SPF and DKIM records. Sending from an unverified domain fails with a
   `403`.
2. Create an API key with **Sending access**. Full access is not needed.
3. Add a **DMARC** record if the domain does not have one. Gmail and Yahoo
   require it for bulk senders, and it materially improves inbox placement for
   everyone else.

### The From header

Mail goes out as:

```
Descience Open Source Club <no-reply@touchmarkdes.com>
```

The display name is `site.name` from `src/data/site.ts` — change the site name
there and the sender name follows automatically.

> **Note:** the sending domain (`touchmarkdes.com`) differs from the club's
> public address shown on the page (`site.email`, currently
> `info@descienceosclub.com`). That is intentional and works fine, but
> recipients will see two different domains. If that is not wanted, either
> point `site.email` at the touchmarkdes address or verify
> `descienceosclub.com` in Resend and send from there.

---

## 2. Endpoint contract

`POST /api/enquiry`, JSON body:

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | ✅ | Max 100 chars. |
| `email` | string | ✅ | Max 254 chars, shape-checked only. |
| `message` | string | ✅ | Max 4000 chars. Line breaks preserved. |
| `experience` | string | | Max 60 chars. |
| `interests` | string[] | | Max 12 entries, 60 chars each. |
| `company` | string | | **Honeypot** — see below. Must be empty. |

Responses:

| Status | Body | Meaning |
|---|---|---|
| `200` | `{ ok: true, copySent: boolean }` | Delivered. `copySent: false` means the club got it but the enquirer's copy bounced. |
| `400` | `{ error }` | Validation failed. The message is written for the visitor and is shown verbatim. |
| `429` | `{ error }` | Rate limited. |
| `502` | `{ error }` | Resend rejected the send to the club. |
| `503` | `{ error }` | `RESEND_API_KEY` is not set. |

The **club send decides the response**. A failed courtesy copy is logged and
reported as `copySent: false`, but never fails the request — the enquiry has
already reached the people who need it.

---

## 3. Abuse handling

- **Honeypot.** The form carries a hidden `company` field. Humans never see it
  (it is `hidden` and `aria-hidden`, and skipped by tabbing), so anything that
  fills it is a bot. Those requests get a `200` and are silently dropped —
  returning an error would just teach the bot which field to leave alone.
- **Rate limit.** 5 submissions per IP per hour. This is **in-process and
  best-effort**: it survives neither a restart nor a second instance. It exists
  to blunt a naive script. If the form is ever seriously abused, put a real
  limiter at the edge (Cloudflare, Vercel WAF, or a shared store).
- **Input sanitising.** Control characters are stripped from every field, and
  line breaks are collapsed to spaces everywhere except the message body — so a
  value cannot inject a newline into the subject line or the `Reply-To` header.
- **HTML escaping.** Everything user-supplied is escaped before it reaches the
  HTML template. The message's line breaks are converted to `<br />` *after*
  escaping.

---

## 4. Local development

Without `RESEND_API_KEY` the endpoint returns `503` and the form shows
"Email isn't configured yet." — validation, the honeypot and the rate limit
all still work, so the flow can be exercised without sending mail.

To send for real from localhost, put a key in `.env.local` (git-ignored) and
restart the dev server. Resend delivers from localhost fine; there is no
allowlist to configure.

Note that Resend restricts unverified accounts to sending **only to the
address that owns the account**, so the enquirer copy will fail (`copySent:
false`) until the domain is verified.

---

## 5. Where the code lives

| File | Role |
|---|---|
| `src/lib/email.ts` | Resend transport + both email templates (HTML and plain text). |
| `src/app/api/enquiry/route.ts` | Validation, honeypot, rate limit, send orchestration. |
| `src/components/Join.tsx` | The form, its submit/error/success states. |
