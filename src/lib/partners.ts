import fs from "node:fs";
import path from "node:path";

const IMAGE_RE = /\.(png|jpe?g|svg|webp|avif|gif)$/i;

/**
 * Reads every image in `public/partners/<folder>` at build/render time (server).
 * Drop a logo into the folder and it shows up automatically on the next
 * build (or instantly on dev refresh) - no code changes needed.
 */
export function listPartnerLogos(folder: string): string[] {
  const dir = path.join(process.cwd(), "public", "partners", folder);
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => IMAGE_RE.test(f) && !f.startsWith("."))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((f) => `/partners/${folder}/${encodeURIComponent(f)}`);
  } catch {
    return [];
  }
}
