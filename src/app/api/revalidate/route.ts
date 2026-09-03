import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function GET(req: NextRequest) {
  return handleRevalidate(req);
}

export async function POST(req: NextRequest) {
  return handleRevalidate(req);
}

async function handleRevalidate(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get("tag") ?? "cms-events";

  try {
    // Invalidate the tag cache in Next.js / Vercel Data Cache
    revalidateTag(tag, "default");
    // Invalidate the homepage and events paths
    revalidatePath("/");
    return NextResponse.json({
      revalidated: true,
      tag,
      now: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { revalidated: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
