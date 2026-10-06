"use client";

import { useState } from "react";

type Video = { id: string; name: string; label: string };
const PLATFORMS = ["tiktok", "instagram", "youtube", "facebook"] as const;

const field = "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base outline-none focus:border-indigo-500";
const secondary = "rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100 disabled:opacity-50";
const primary = "rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50";

export function TestPostForm({ videos, configured }: { videos: Video[]; configured: boolean }) {
  const [fileId, setFileId] = useState(videos[0]?.id ?? "");
  const [platforms, setPlatforms] = useState<string[]>(["tiktok"]);
  const [title, setTitle] = useState("Test post");
  const [pageId, setPageId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [details, setDetails] = useState<unknown>(null);
  const [requestId, setRequestId] = useState("");

  const toggle = (p: string) =>
    setPlatforms((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));

  async function send(dryRun: boolean) {
    const video = videos.find((v) => v.id === fileId);
    setBusy(true);
    setMessage(null);
    setDetails(null);
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
          dryRun,
        }),
      });
      const j = await res.json();
      setDetails(j);
      setRequestId(j?.body?.request_id ?? "");
      if (dryRun) setMessage({ ok: true, text: "Nothing was sent. Here is what would have gone out." });
      else if (res.ok) setMessage({ ok: true, text: "Sent! It can take a few minutes to show up on the platforms." });
      else setMessage({ ok: false, text: j?.error ?? "Something went wrong. Details are below." });
    } catch (e) {
      setMessage({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function checkStatus() {
    setBusy(true);
    try {
      const res = await fetch(`/api/test-post/status?request_id=${encodeURIComponent(requestId)}`);
      setDetails(await res.json());
      setMessage(null);
    } finally {
      setBusy(false);
    }
  }

  if (videos.length === 0)
    return <p className="text-base text-stone-600">No videos found in Drive yet. Add at least one video to test.</p>;

  return (
    <div className="space-y-6">
      {!configured && (
        <p className="rounded-xl bg-amber-50 p-4 text-base text-amber-900">
          Sending is off until the posting account is connected. Checking still works.
        </p>
      )}

      <div className="space-y-2">
        <label className="text-sm font-semibold text-stone-700">1. Choose a video</label>
        <select className={field} value={fileId} onChange={(e) => setFileId(e.target.value)}>
          {videos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-stone-700">2. Choose where it goes</p>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => {
            const on = platforms.includes(p);
            return (
              <button
                key={p}
                type="button"
                onClick={() => toggle(p)}
                className={`rounded-full border px-4 py-2 text-sm font-medium capitalize ${
                  on ? "border-indigo-600 bg-indigo-600 text-white" : "border-stone-300 bg-white text-stone-600"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-stone-700">3. Caption</label>
        <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      {platforms.includes("facebook") && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-stone-700">Facebook Page ID</label>
          <input className={field} value={pageId} onChange={(e) => setPageId(e.target.value)} />
          <p className="text-sm text-stone-500">Facebook needs the ID of the Page the video goes to.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <button disabled={busy || platforms.length === 0} onClick={() => send(true)} className={secondary}>
          Check first (sends nothing)
        </button>
        <button disabled={busy || !configured || platforms.length === 0} onClick={() => send(false)} className={primary}>
          {busy ? "Working..." : "Send test post"}
        </button>
        {requestId && (
          <button disabled={busy} onClick={checkStatus} className={secondary}>
            Check status
          </button>
        )}
      </div>

      {message && (
        <p className={`rounded-xl p-4 text-base ${message.ok ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-800"}`}>
          {message.text}
        </p>
      )}

      {details !== null && (
        <details className="text-sm text-stone-500">
          <summary className="cursor-pointer">Technical details</summary>
          <pre className="mt-2 max-h-96 overflow-auto rounded-xl bg-stone-100 p-4 text-xs">
            {JSON.stringify(details, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
