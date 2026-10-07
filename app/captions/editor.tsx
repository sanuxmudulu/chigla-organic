"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Caption } from "@/lib/content";
import { addCaptionAction, deleteCaptionAction, setCaptionActiveAction } from "../actions";
import { Card } from "../ui";

const field = "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base outline-none focus:border-indigo-500";

export function CaptionsEditor({ captions }: { captions: Caption[] }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function run(work: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    start(async () => {
      const r = await work();
      if (!r.ok) setError(r.error ?? "Something went wrong.");
      else router.refresh();
    });
  }

  return (
    <>
      <Card title="Add a caption">
        <div className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Write the caption exactly as it should appear on the post"
            className={field}
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-stone-500">{text.trim().length} / 2200</span>
            <button
              disabled={pending || !text.trim()}
              onClick={() =>
                run(async () => {
                  const r = await addCaptionAction(text);
                  if (r.ok) setText("");
                  return r;
                })
              }
              className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              Add caption
            </button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </Card>

      <Card title={`All captions (${captions.length})`}>
        {captions.length === 0 ? (
          <p className="text-base text-stone-600">No captions yet. Add the first one above.</p>
        ) : (
          <ul className="divide-y divide-stone-200">
            {captions.map((c) => (
              <li key={c.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
                <p className={`text-base whitespace-pre-wrap ${c.active ? "text-stone-900" : "text-stone-400 line-through"}`}>
                  {c.text}
                </p>
                <div className="flex shrink-0 items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-stone-600">
                    <input
                      type="checkbox"
                      checked={c.active}
                      disabled={pending}
                      onChange={(e) => run(() => setCaptionActiveAction(c.id, e.target.checked))}
                    />
                    Active
                  </label>
                  <button
                    disabled={pending}
                    onClick={() => {
                      if (window.confirm("Delete this caption?")) run(() => deleteCaptionAction(c.id));
                    }}
                    className="rounded-full border border-stone-300 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
