"use client";

import { useState } from "react";

type Video = { id: string; name: string; label: string };
const PLATFORMS = ["tiktok", "instagram", "youtube", "facebook"] as const;

const input =
  "w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700";
const btn =
  "rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800";

export function TestForm({ videos, configured }: { videos: Video[]; configured: boolean }) {
  const [fileId, setFileId] = useState(videos[0]?.id ?? "");
  const [platforms, setPlatforms] = useState<string[]>(["tiktok"]);
  const [title, setTitle] = useState("Test post #test");
  const [pageId, setPageId] = useState("");
  const [tiktokPrivacy, setTiktokPrivacy] = useState("SELF_ONLY");
  const [youtubePrivacy, setYoutubePrivacy] = useState("private");
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<unknown>(null);
  const [requestId, setRequestId] = useState("");

  const toggle = (p: string) =>
    setPlatforms((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));

  async function send(dryRun: boolean) {
    const video = videos.find((v) => v.id === fileId);
    setBusy(true);
    setOut(null);
    try {
      const res = await fetch("/api/test-post", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fileId,
          fileName: video?.name,
          platforms,
          title,
          facebookPageId: pageId || undefined,
          tiktokPrivacy,
          youtubePrivacy,
          dryRun,
        }),
      });
      const j = await res.json();
      setOut(j);
      setRequestId(j?.body?.request_id ?? "");
    } catch (e) {
      setOut({ error: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function checkStatus() {
    setBusy(true);
    try {
      const res = await fetch(`/api/test-post/status?request_id=${encodeURIComponent(requestId)}`);
      setOut(await res.json());
    } finally {
      setBusy(false);
    }
  }

  if (videos.length === 0)
    return (
      <p className="text-sm text-zinc-500">
        No videos in the Drive clip folders yet. Upload at least one .mp4 to test.
      </p>
    );

  return (
    <div className="space-y-4">
      {!configured && (
        <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Real sending is off until UPLOAD_POST_API_KEY and UPLOAD_POST_USER are filled in .env.local. Dry run still
          works.
        </p>
      )}
      <label className="block space-y-1 text-sm">
        <span className="text-zinc-500">Video</span>
        <select className={input} value={fileId} onChange={(e) => setFileId(e.target.value)}>
          {videos.map((v) => (
            <option key={v.id} value={v.id} className="text-black">
              {v.label}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap gap-4 text-sm">
        {PLATFORMS.map((p) => (
          <label key={p} className="flex items-center gap-2 capitalize">
            <input type="checkbox" checked={platforms.includes(p)} onChange={() => toggle(p)} />
            {p}
          </label>
        ))}
      </div>
      <label className="block space-y-1 text-sm">
        <span className="text-zinc-500">Caption (also the YouTube title)</span>
        <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block space-y-1 text-sm">
          <span className="text-zinc-500">TikTok privacy</span>
          <select className={input} value={tiktokPrivacy} onChange={(e) => setTiktokPrivacy(e.target.value)}>
            {["SELF_ONLY", "PUBLIC_TO_EVERYONE", "MUTUAL_FOLLOW_FRIENDS", "FOLLOWER_OF_CREATOR"].map((o) => (
              <option key={o} className="text-black">
                {o}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-zinc-500">YouTube privacy</span>
          <select className={input} value={youtubePrivacy} onChange={(e) => setYoutubePrivacy(e.target.value)}>
            {["private", "unlisted", "public"].map((o) => (
              <option key={o} className="text-black">
                {o}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-zinc-500">Facebook Page ID (needed for Facebook)</span>
          <input className={input} value={pageId} onChange={(e) => setPageId(e.target.value)} />
        </label>
      </div>
      <div className="flex flex-wrap gap-3">
        <button disabled={busy} onClick={() => send(true)} className={btn}>
          Dry run (sends nothing)
        </button>
        <button
          disabled={busy || !configured}
          onClick={() => send(false)}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {busy ? "Working..." : "Post for real"}
        </button>
        {requestId && (
          <button disabled={busy} onClick={checkStatus} className={btn}>
            Check status
          </button>
        )}
      </div>
      {out !== null && (
        <pre className="max-h-96 overflow-auto rounded-md bg-zinc-100 p-4 text-xs dark:bg-zinc-950">
          {JSON.stringify(out, null, 2)}
        </pre>
      )}
    </div>
  );
}
