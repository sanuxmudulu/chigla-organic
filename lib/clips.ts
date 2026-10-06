import { listClips, type DriveClip } from "./drive.ts";

// Pages use this instead of listClips directly: a Drive problem becomes a message, not a crash.
export async function loadClips(): Promise<{ clips: DriveClip[]; error?: string }> {
  try {
    return { clips: await listClips() };
  } catch (e) {
    return { clips: [], error: (e as Error).message };
  }
}
