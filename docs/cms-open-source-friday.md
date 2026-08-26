# Open Source Friday — CMS setup

The `05 - Open Source Friday` section on the home page lists the next few
weekly contribution sessions. It reads from the CMS Delivery API through the
same connection as [Events](./cms-events.md) — same API key, same workspace,
a second content type.

Until the type exists (or if the CMS is unreachable) the section falls back to
the roster in `src/data/site.ts`, pinned onto the next real Fridays at render
time. Nothing breaks before the CMS is wired up, and the fallback never goes
stale.

---

## 1. Connection

Reuse the delivery key from `docs/cms-events.md` §1 — it is scoped to the
workspace, not to a content type, so no new key is needed. The only extra
variable is the type's API ID:

```bash
CMS_OSS_FRIDAY_TYPE=open_source_friday   # only change if the API ID differs
```

The site calls:

```
GET {CMS_API_URL}/v1/content/open_source_friday?limit=50&sort=-published_at
Authorization: Bearer {CMS_API_KEY}
```

Cached for 5 minutes and revalidated in the background, so a publish shows up
on the site within ~5 minutes without a redeploy.

---

## 2. Content type

Sidebar → **Settings → Content model → Create content type**.

**Name it `Open source friday`.** The API ID is derived from the name —
lowercased, each run of non-alphanumeric characters replaced with `_` — and it
is **permanent**. `Open source friday` gives `open_source_friday`, which is
what the site requests by default. Anything else means setting
`CMS_OSS_FRIDAY_TYPE` to match.

The same derivation applies to every field below, so type the **Name** column
exactly as written (`Start at` → `start_at`, `Repo URL` → `repo_url`).

Only `title` and `start_at` are required. Every other field degrades
gracefully — the card simply omits what it has no data for.

### Core

| API ID | Type | Required | Notes |
|---|---|---|---|
| `title` | `text` | ✅ | The session name, e.g. `First PR clinic`. Keep it short — it is a card heading. |
| `slug` | `slug` | ✅ | Generated from title. |
| `summary` | `long_text` | | One line under the title. Keep under ~90 chars; the card is narrow. |

### When

| API ID | Type | Required | Notes |
|---|---|---|---|
| `start_at` | `datetime` | ✅ | Drives the date rail, the time line and ordering. Sessions that have already ended are dropped from the section. |
| `end_at` | `datetime` | | Enables a time *range*, and decides when the session counts as past. |
| `timezone` | `text` | | IANA zone, default `Asia/Kolkata`. Used for **all** display formatting. |

### Where

| API ID | Type | Required | Notes |
|---|---|---|---|
| `mode` | `enum` | | `in_person` · `online` · `hybrid`. Defaults to `in_person`. |
| `venue` | `text` | | Place name. Shown on the card for anything that is not `online`. |
| `join_url` | `url` | | Meeting link. Renders a **Join** link when there is no `register_url`. |

### The project

This is what makes the section worth reading — which repository the session
actually works on.

| API ID | Type | Required | Notes |
|---|---|---|---|
| `project` | `text` | | Repository or project name, e.g. `descience-docs`. Rendered in mono under the title. |
| `repo_url` | `url` | | Renders a **Repo** link. |
| `issues_url` | `url` | | Renders a **Good first issues** link. Point it at a filtered issue list, e.g. `.../issues?q=is:open+label:"good first issue"`. |

### Classification

| API ID | Type | Required | Notes |
|---|---|---|---|
| `level` | `enum` | | `Beginner` · `Intermediate` · `All levels`. Shown as the pill in the card's top-right. |
| `tags` | `multi_enum` | | Free topic tags. Stored but not currently rendered on the card. |

### Registration

| API ID | Type | Required | Notes |
|---|---|---|---|
| `register_url` | `url` | | Renders a **Register** link, and takes precedence over `join_url`. |
| `status` | `enum` | | `scheduled` · `full` · `cancelled` · `completed`. Defaults to `scheduled`. |

> The section shares its data model with Events, so the remaining event fields
> (`cover`, `agenda`, `hosts`, `seats`, …) are accepted and mapped even though
> the card does not render all of them. `hosts` **is** rendered — see below.

### People

| API ID | Type | Required | Notes |
|---|---|---|---|
| `hosts` | `json` | | Array of host objects. The **first** host's `name` renders as "Led by …". Same shape as Events: `[{ "name": "G Pavithren", "title": "…", "org": "…" }]`. |

---

## 3. How the section behaves

- **Upcoming only.** Past sessions are filtered out. The point of the section
  is "here is the next one", and a weekly session accumulates past instances
  fast.
- **At most four** are shown, soonest first.
- **Empty is a real state.** If the type exists but nothing upcoming is
  published, the section shows "The next session is being scheduled" rather
  than sample data. Publish at least one future session once the type is live.
- **Cadence copy** ("Every Friday, 18:00 IST") comes from `ossFridayIntro` in
  `src/data/site.ts`, not the CMS. Change it there if the schedule changes.

---

## 4. Fallback behaviour

Before the type exists, the section renders the three sample sessions from
`ossFridays` in `src/data/site.ts`, pinned onto the next three Fridays at
18:00 IST computed at render time.

That means the fallback always looks current — but it is **not real data**.
Once the CMS type is published with at least one upcoming entry, the CMS wins
and the samples are never shown again.

A missing content type and a CMS outage are indistinguishable here: both log
to the server console and fall back. Check the server logs for
`[cms] open_source_friday fetch failed` if you expect CMS data and see samples.
