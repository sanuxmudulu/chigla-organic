import { loadClips } from "../data";
import { Card, PageHeader } from "../ui";
import { DEFAULT_SCHEDULE as S } from "@/lib/config";

export default async function ContentPage() {
  const { clips, error } = await loadClips();
  const cols = Array.from({ length: S.hooks }, (_, i) => i);
  return (
    <>
      <PageHeader
        title="Content"
        sub="Read live from the Drive folder Content/ClipN. Files are sorted by name: the 1st is hook 1, and so on."
      />
      {error && (
        <Card>
          <p className="text-sm text-red-500">{error}</p>
        </Card>
      )}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500">
                <th className="py-2 pr-4 font-medium">Clip</th>
                {cols.map((h) => (
                  <th key={h} className="py-2 pr-4 font-medium">
                    Hook {h + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clips.map((c) => (
                <tr key={c.clip} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="py-2 pr-4 font-medium">{c.folderName}</td>
                  {cols.map((h) => {
                    const v = c.videos[h];
                    return (
                      <td key={h} className="py-2 pr-4">
                        {v ? (
                          <span title={v.name}>
                            <span className="block max-w-32 truncate">{v.name}</span>
                            <span className="text-xs text-zinc-500">
                              {v.size ? (v.size / 1e6).toFixed(1) + " MB" : ""}
                            </span>
                          </span>
                        ) : (
                          <span className="text-amber-600">missing</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {clips.length === 0 && (
                <tr>
                  <td colSpan={cols.length + 1} className="py-4 text-zinc-500">
                    No ClipN folders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
