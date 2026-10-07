import type { PostStatus } from "@/lib/post-log";

export type SessionView = {
  title: string;
  rows: { n: number; time: string; status: PostStatus }[];
};

// Yellow = not posted yet, green = posted, red = the post failed.
const STYLE: Record<PostStatus, string> = {
  pending: "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200",
  success: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200",
  failed: "bg-red-100 text-red-900 dark:bg-red-950/60 dark:text-red-200",
};
const LABEL: Record<PostStatus, string> = {
  pending: "Not posted yet",
  success: "Posted",
  failed: "Failed",
};

export function SessionRows({ rows }: { rows: SessionView["rows"] }) {
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.n} className={`flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-base ${STYLE[r.status]}`}>
          <span className="font-semibold">Post {r.n}</span>
          <span className="flex items-center gap-4">
            <span className="hidden text-sm opacity-80 sm:inline">{LABEL[r.status]}</span>
            <span>{r.time}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
