import { getDb } from "@/lib/db";

/**
 * Serves an episode's cover image as a real HTTP resource.
 *
 * The episodes table keeps its images as base64 data URIs. Inlining those
 * into the page meant every visit shipped megabytes of image bytes inside
 * the HTML (and again inside the RSC payload), which is what made the page
 * feel slow no matter how well the render itself was cached. Handing back
 * a URL instead lets the browser fetch the image lazily, in parallel, and
 * cache it independently of the page.
 */

export const revalidate = 3600;

/** `data:image/png;base64,AAAA...` -> bytes + content type. */
function decodeDataUri(
  value: string,
): { body: Buffer; contentType: string } | null {
  // [\s\S] rather than the /s flag, which the project's TS target rejects.
  const match = /^data:([^;,]+)(;base64)?,([\s\S]*)$/.exec(value.trim());
  if (!match) return null;
  const [, contentType, isBase64, payload] = match;
  return {
    body: Buffer.from(
      isBase64 ? payload : decodeURIComponent(payload),
      isBase64 ? "base64" : "utf8",
    ),
    contentType,
  };
}

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const episodeNumber = Number(id);
  if (!Number.isFinite(episodeNumber)) {
    return new Response("Bad episode id", { status: 400 });
  }

  const sql = getDb();
  if (!sql) return new Response("Not found", { status: 404 });

  let rows: { cover_photo_url: string | null; past_cover_photo_url: string | null }[];
  try {
    rows = (await sql`
      SELECT cover_photo_url, past_cover_photo_url
      FROM episodes
      WHERE episode_number = ${episodeNumber} OR id = ${episodeNumber}
      LIMIT 1;
    `) as typeof rows;
  } catch (error) {
    console.warn("[events] cover lookup failed:", error);
    return new Response("Not found", { status: 404 });
  }

  // Same preference order the event mapper uses.
  const raw = rows?.[0]?.cover_photo_url || rows?.[0]?.past_cover_photo_url;
  if (!raw) return new Response("Not found", { status: 404 });

  // Already a hosted URL - nothing to decode, just point the browser at it.
  if (!raw.startsWith("data:")) {
    return Response.redirect(raw, 307);
  }

  const decoded = decodeDataUri(raw);
  if (!decoded) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(decoded.body), {
    headers: {
      "Content-Type": decoded.contentType,
      "Content-Length": String(decoded.body.byteLength),
      // Covers change only when an episode is edited, and the URL is keyed
      // by episode, so a long cache with revalidation is safe here.
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
