import { buildLlmsTxt } from "@/lib/llms";

/**
 * /llms.txt, see `buildLlmsTxt`.
 *
 * The middleware never sees this path, its matcher skips everything with a file
 * extension. That is what keeps it from being redirected to `/de/llms.txt`.
 */

export const dynamic = "force-static";

export function GET(): Response {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // An hour, like the feed: the file only changes with a deploy.
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
