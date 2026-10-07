// What happened to each scheduled post. Filled in by the poster once it is built and writes to
// the database (Supabase). Until then there is no log, so every post reads as "pending".

export type PostStatus = "pending" | "success" | "failed";

// Keyed by post number (1-25) for the given date (YYYY-MM-DD, New York).
export async function getPostStatuses(date: string): Promise<Partial<Record<number, PostStatus>>> {
  void date; // used once the log exists
  return {};
}
