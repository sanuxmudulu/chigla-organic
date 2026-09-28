import { listClips, type DriveClip } from "@/lib/drive";

// Page-friendly wrapper: never throws, so a Drive problem shows as a message instead of a crash.
export async function loadClips(): Promise<{ clips: DriveClip[]; error?: string }> {
  try {
    return { clips: await listClips() };
  } catch (e) {
    return { clips: [], error: (e as Error).message };
  }
}
