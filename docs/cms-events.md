# Events — CMS setup

The `04 - Events` section is driven entirely by the CMS Delivery API. This
document is the contract: create the content type exactly as specified and the
website will render it without further code changes.

Until `CMS_API_URL` / `CMS_API_KEY` are set, the site falls back to the sample
events in `src/data/site.ts`, so nothing breaks before the CMS is wired up.

---

## 1. Connection

In the CMS admin, for this website's **Site (workspace)**:

1. **Settings → API keys → Create key**
2. Scopes: **`content.read`** (add **`media.read`** if event covers are stored
   in CMS media).
3. Copy the key into the website's `.env`:

```bash
CMS_API_URL=https://your-cms-host        # no trailing slash; local dev: http://localhost:4000
CMS_API_KEY=<the delivery key>
CMS_EVENT_TYPE=event                     # only change if the type API ID differs
```

These are **server-only**. Never prefix them with `NEXT_PUBLIC_` — that would
ship the key to the browser.

The site calls:

```
GET {CMS_API_URL}/v1/content/event?limit=50&sort=-published_at
Authorization: Bearer {CMS_API_KEY}
```

Responses are cached for 5 minutes and then revalidated in the background, so
publishing in the CMS shows up on the site within ~5 minutes without a redeploy.

---

## 2. Content type

**Name:** Events · **API ID:** `event` · **URL field:** `slug`

Only `title` and `start_at` are truly required — every other field degrades
gracefully, and the popup simply omits sections it has no data for.

### Core

| API ID | Type | Required | Notes |
|---|---|---|---|
| `title` | `text` | ✅ | Shown in the list row and as the dialog heading. |
| `slug` | `slug` | ✅ | Generated from title. |
| `summary` | `long_text` | | 1–2 lines under the dialog heading. Keep under ~160 chars. |
| `description` | `rich_text` | | The full write-up. Rendered as HTML — see §4. |
| `cover` | `media` | | Banner across the top of the dialog. Landscape, ≥1200px wide. |

### When

| API ID | Type | Required | Notes |
|---|---|---|---|
| `start_at` | `datetime` | ✅ | Drives ordering, the date rail, and past/upcoming. |
| `end_at` | `datetime` | | Enables a time *range*. Also decides when an event counts as past. |
| `timezone` | `text` | | IANA zone, default `Asia/Kolkata`. Used for **all** display formatting. |

### Where

| API ID | Type | Required | Notes |
|---|---|---|---|
| `mode` | `enum` | | `in_person` · `online` · `hybrid`. Defaults to `in_person`. |
| `venue` | `text` | | Place name, e.g. `PERI Institute of Technology`. |
| `address` | `long_text` | | Full street address, shown under the venue. |
| `map_url` | `url` | | Renders a "View map" link. |
| `join_url` | `url` | | Meeting link. Only shown for `online` / `hybrid`, and only before the event. |

### Classification

| API ID | Type | Required | Notes |
|---|---|---|---|
| `domain` | `enum` | | **Must match the site's domains exactly**: `Web Development` · `Cloud Computing` · `Open Source` · `Digital Skills`. Shown as the badge on the list row. |
| `level` | `enum` | | `Beginner` · `Intermediate` · `All levels`. |
| `tags` | `multi_enum` | | Free topic tags, shown at the bottom of the dialog. |
| `featured` | `boolean` | | Reserved for emphasis; not yet used in the layout. |

### People

| API ID | Type | Required | Notes |
|---|---|---|---|
| `hosts` | `json` | | Array of host objects — see §3. |

### Registration

| API ID | Type | Required | Notes |
|---|---|---|---|
| `status` | `enum` | | `scheduled` · `full` · `cancelled` · `completed`. Defaults to `scheduled`. |
| `price` | `text` | | e.g. `Free`. Free text so `Free for members` also works. |
| `seats` | `number` | | Total capacity. |
| `seats_left` | `number` | | Remaining. `0` renders as "Fully booked". |
| `register_url` | `url` | | Drives the primary button. **No URL means no Register button.** |
| `recording_url` | `url` | | For past events — replaces Register with "Watch the recording". |

### Detail (what makes the popup worth opening)

| API ID | Type | Required | Notes |
|---|---|---|---|
| `agenda` | `json` | | Array of agenda items — see §3. |
| `takeaways` | `json` | | Array of strings: what attendees walk away with. |
| `prerequisites` | `json` | | Array of strings: what to bring / install beforehand. |

> `takeaways` and `prerequisites` also accept a newline- or comma-separated
> string, so a `long_text` field works if JSON authoring is awkward.

---

## 3. JSON field shapes

**`hosts`**

```json
[
  { "name": "Sivaraj Saminathan", "title": "Programmer Analyst", "org": "Touchmark DesScience" },
  { "name": "G Pavithren", "title": "Senior Programmer Analyst" }
]
```

`name` is required; entries without one are dropped. `title` and `org` are
joined with a dash. A bare array of strings (`["Ada Lovelace"]`) also works.

**`agenda`**

```json
[
  { "time": "10:00", "title": "Setup & introductions", "detail": "Get your environment running." },
  { "time": "11:00", "title": "Components and state" },
  { "time": "14:00", "title": "Build session", "detail": "Ship a working page in pairs." }
]
```

`title` is required; `time` and `detail` are optional.

**`takeaways` / `prerequisites`**

```json
["A working local dev setup", "Your first component in production"]
```

---

## 4. Notes and gotchas

- **`description` is injected as HTML.** The CMS is a trusted, authenticated
  source, so this is safe as configured — but it does mean anyone with publish
  rights can inject markup into the page. Keep publish permissions tight. If
  you later accept event content from untrusted contributors, sanitise it
  before rendering.
- **Enum values are matched literally.** `mode` and `status` must be the exact
  lowercase snake_case strings above; anything unrecognised silently falls back
  to `in_person` / `scheduled`.
- **Times are formatted in the event's `timezone`**, with a pinned `en-GB`
  locale. This is deliberate: the same string has to be produced during server
  rendering and again in the browser, and anything locale- or
  viewer-timezone-dependent would cause a hydration mismatch.
- **Past events are detected from `end_at`, falling back to `start_at`.** They
  sort below upcoming ones and render dimmed.
- **An empty but successful API response renders the empty state**, not the
  sample data. Sample data only appears when the CMS is unconfigured or the
  request fails.
- The site requests `limit=50`. Pagination is not wired up; if you expect more
  than 50 published events, that needs adding.
