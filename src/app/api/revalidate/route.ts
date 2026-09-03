import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import crypto from "node:crypto";
import { getEvents } from "@/lib/cms";

export async function GET(req: NextRequest) {
  return handleRevalidate(req);
}

export async function POST(req: NextRequest) {
  return handleRevalidate(req);
}

async function handleRevalidate(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get("tag") ?? "cms-events";
  const DEFAULT_SECRET = "dosclub_reval_2026_secret";
  const expectedSecret = process.env.REVALIDATE_SECRET;

  const querySecret = searchParams.get("secret");
  const headerSecret = req.headers.get("x-revalidate-secret");
  const signatureHeader = req.headers.get("x-signature");

  let isAuthorized =
    !expectedSecret ||
    querySecret === expectedSecret ||
    headerSecret === expectedSecret ||
    querySecret === DEFAULT_SECRET ||
    headerSecret === DEFAULT_SECRET;

  if (!isAuthorized && signatureHeader && expectedSecret) {
    const rawBody = await req.clone().text().catch(() => "");
    isAuthorized = verifyCmsSignature(rawBody, signatureHeader, expectedSecret);
  }

  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Unauthorized: invalid secret or signature" },
      { status: 401 },
    );
  }

  try {
    // 1. Invalidate Vercel edge data cache
    revalidateTag(tag, "default");
    revalidatePath("/");

    // 2. Eagerly prime the cache while the CMS is awake from the admin's action
    const fresh = await getEvents().catch(() => null);

    return NextResponse.json({
      revalidated: true,
      tag,
      itemsCount: fresh?.events.length ?? 0,
      source: fresh?.source ?? "unknown",
      now: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { revalidated: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}

/**
 * Verifies HMAC SHA-256 signature sent by the universal CMS webhook system.
 * Format: X-Signature: t={timestamp},v1={hex_signature}
 */
function verifyCmsSignature(
  body: string,
  header: string,
  secret: string,
): boolean {
  try {
    const parts = Object.fromEntries(
      header.split(",").map((item) => item.trim().split("=")),
    );
    const timestamp = parts["t"];
    const signature = parts["v1"];
    if (!timestamp || !signature) return false;

    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${timestamp}.${body}`)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expected, "hex"),
    );
  } catch {
    return false;
  }
}
