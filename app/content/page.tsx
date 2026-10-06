import { loadClips } from "@/lib/clips";
import { DEFAULT_SCHEDULE as S } from "@/lib/config";
import { Card, PageHeader, Pill } from "../ui";

export default async function VideosPage() {
  const { clips, error } = await loadClips();
  const hooks = Array.from({ length: S.hooks }, (_, i) => i);

  return (
    <>
      <PageHeader
        title="Videos"
        sub="These come straight from your Google Drive. Each clip folder should hold one video per hook. Add or rename files in Drive and this page updates."
      />

      {error && (
        <Card>
          <p className="text-base text-red-600">Can&apos;t read Google Drive: {error}</p>
        </Card>
      )}

      {!error && clips.length === 0 && (
        <Card>
          <p className="text-base text-stone-600">No clip folders found yet. Create folders named Clip1 to Clip5 in Drive.</p>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {clips.map((c) => {
          const missing = hooks.filter((h) => !c.videos[h]).length;
          return (
            <Card key={c.clip} title={`Clip ${c.clip}`}>
              <div className="mb-4">
                <Pill ok={missing === 0}>{missing === 0 ? "All 5 ready" : `${missing} missing`}</Pill>
              </div>
              <ol className="space-y-2">
                {hooks.map((h) => {
                  const v = c.videos[h];
                  return (
                    <li key={h} className="flex items-center justify-between gap-3 rounded-lg bg-stone-50 px-3 py-2 text-sm">
                      <span className="font-medium text-stone-700">Hook {h + 1}</span>
                      {v ? (
                        <span className="truncate text-stone-500" title={v.name}>
                          {v.name}
                        </span>
                      ) : (
                        <span className="font-medium text-amber-700">Missing</span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </Card>
          );
        })}
      </div>
    </>
  );
}
