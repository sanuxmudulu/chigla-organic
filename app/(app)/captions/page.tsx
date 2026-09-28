import { Card, PageHeader } from "../ui";

export default function CaptionsPage() {
  return (
    <>
      <PageHeader title="Captions & hashtags" sub="Skeleton. Editing is wired up once the Supabase database exists." />
      <Card title="Captions (picked at random, never the same twice in a row per account)">
        <div className="rounded-md border border-dashed border-zinc-300 p-3 text-sm text-zinc-500 dark:border-zinc-700">
          Your captions will be listed here, with add and remove.
        </div>
      </Card>
      <Card title="Hashtags per clip">
        <p className="text-sm text-zinc-500">
          Each clip gets its own tag list. Every tag has an on/off box per platform, and the app picks a random handful
          for each post.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["#walmart", "#walmartfinds", "#halloween"].map((t) => (
            <span key={t} className="rounded-full border border-zinc-300 px-3 py-1 text-xs dark:border-zinc-700">
              {t} (example)
            </span>
          ))}
        </div>
      </Card>
    </>
  );
}
