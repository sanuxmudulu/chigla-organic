// What happened to each scheduled post. Written by the poster (not built yet) into the
// post_log table (see supabase/post log.sql).
import { select } from "./db.ts";

export type PostStatus = "pending" | "success" | "failed";

// One post = four rows (one per platform). Red if any platform failed, green if all four
// succeeded, yellow otherwise.
export async function getPostStatuses(
  date: string,
): Promise<{ statuses: Partial<Record<number, PostStatus>>; error?: string }> {
  try {
    const rows = await select<{ post_number: number; platform: string; status: PostStatus }>(
      "post_log",
      `post_date=eq.${date}&select=post_number,platform,status`,
    );
    const byPost = new Map<number, PostStatus[]>();
    for (const r of rows) byPost.set(r.post_number, [...(byPost.get(r.post_number) ?? []), r.status]);
    const statuses: Partial<Record<number, PostStatus>> = {};
    for (const [n, list] of byPost) {
      statuses[n] = list.includes("failed")
        ? "failed"
        : list.length === 4 && list.every((s) => s === "success")
          ? "success"
          : "pending";
    }
    return { statuses };
  } catch (e) {
    return { statuses: {}, error: (e as Error).message };
  }
}
