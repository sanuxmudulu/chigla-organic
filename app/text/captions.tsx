"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Caption } from "@/lib/content";
import { addCaptionAction, deleteCaptionAction, setCaptionActiveAction } from "../actions";
import { Card } from "../ui";

const field = "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base outline-none focus:border-indigo-500";

export function CaptionsCard({ captions }: { captions: Caption[] }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function run(work: () => Promise<{ ok: boolean; error?: string }>, onOk?: () => void) {
    setError(null);
    start(async () => {
      const r = await work();
      if (!r.ok) setError(r.error ?? "Something went wrong.");
      else {
        onOk?.();
        router.refresh();
      }
    });
  }

  return (
    <Card title={`Captions · ${captions.filter((c) => c.active).length} on`}>
      <div className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="Write a caption"
          className={field}
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-stone-500">{text.trim().length} / 2200</span>
          <button
            disabled={pending || !text.trim()}
            onClick={() => run(() => addCaptionAction(text), () => setText(""))}
            className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
          >
            Add
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <ul className="mt-6 divide-y divide-stone-200">
        {captions.map((c) => (
          <li key={c.id} className="flex items-start justify-between gap-3 py-3">
            <p className={`whitespace-pre-wrap text-base ${c.active ? "text-stone-900" : "text-stone-400 line-through"}`}>{c.text}</p>
            <div className="flex shrink-0 items-center gap-2">
              <label className="flex items-center gap-1.5 text-sm text-stone-600">
                <input
                  type="checkbox"
                  checked={c.active}
                  disabled={pending}
                  onChange={(e) => run(() => setCaptionActiveAction(c.id, e.target.checked))}
                />
                On
              </label>
              <button
                disabled={pending}
                onClick={() => window.confirm("Delete this caption?") && run(() => deleteCaptionAction(c.id))}
                className="rounded-full px-2 py-1 text-sm text-stone-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                aria-label="Delete caption"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
        {captions.length === 0 && <li className="py-3 text-base text-stone-500">No captions yet.</li>}
      </ul>
    </Card>
  );
}
