import { loadClips } from "./data";
import { Badge, Card, PageHeader } from "./ui";
import { DEFAULT_SCHEDULE as S } from "@/lib/config";
import { isConfigured } from "@/lib/uploadpost";

const progress: [string, boolean][] = [
  ["Rotation logic (25 videos/day, no repeats)", true],
  ["Google Drive reader", true],
  ["Login + dashboard shell", true],
  ["Test post to Upload-Post", true],
  ["Database (Supabase): captions, hashtags, settings", false],
  ["Batch import: Drive to public video URLs", false],
  ["Auto-scheduler: send the plan to Upload-Post", false],
  ["Post status + retry view", false],
];

export default async function Overview() {
  const { clips, error } = await loadClips();
  const videos = clips.reduce((n, c) => n + c.videos.length, 0);
  const expected = S.clips * S.hooks;
  const postsPerDay = S.accounts * S.sessionTimes.length;
  const ready = isConfigured();

  return (
    <>
      <PageHeader title="Overview" sub="Where things stand. Numbers here are live." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card title="Google Drive">
          <div className="text-2xl font-semibold">
            {videos}/{expected}
          </div>
          <p className="mt-1 text-sm text-zinc-500">videos found in {clips.length} clip folders</p>
          <div className="mt-3">
            {error ? (
              <Badge ok={false}>Drive error</Badge>
            ) : (
              <Badge ok={videos === expected}>{videos === expected ? "Batch complete" : "Batch incomplete"}</Badge>
            )}
          </div>
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </Card>
        <Card title="Upload-Post">
          <div className="text-2xl font-semibold">{ready ? "Configured" : "Not set up"}</div>
          <p className="mt-1 text-sm text-zinc-500">API key + profile name in .env.local</p>
          <div className="mt-3">
            <Badge ok={ready}>{ready ? "Ready to test" : "Needs key"}</Badge>
          </div>
        </Card>
        <Card title="Daily plan">
          <div className="text-2xl font-semibold">{postsPerDay} posts</div>
          <p className="mt-1 text-sm text-zinc-500">
            per platform per day ({S.accounts} accounts x {S.sessionTimes.length} sessions), each sent to all 4 platforms
          </p>
        </Card>
      </div>
      <Card title="Build progress">
        <ul className="space-y-2 text-sm">
          {progress.map(([label, done]) => (
            <li key={label} className="flex items-center gap-2">
              <Badge ok={done}>{done ? "Done" : "To do"}</Badge>
              {label}
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
