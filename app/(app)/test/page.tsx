import { loadClips } from "../data";
import { Card, PageHeader } from "../ui";
import { TestForm } from "./form";
import { isConfigured } from "@/lib/uploadpost";

export default async function TestPage() {
  const { clips, error } = await loadClips();
  const videos = clips.flatMap((c) =>
    c.videos.map((v) => ({ id: v.id, name: v.name, label: `${c.folderName} / ${v.name}` })),
  );
  return (
    <>
      <PageHeader
        title="Test post"
        sub="Send one video from Drive to your connected test accounts. Use Dry run first to see exactly what would be sent."
      />
      {error && (
        <Card>
          <p className="text-sm text-red-500">{error}</p>
        </Card>
      )}
      <Card>
        <TestForm videos={videos} configured={isConfigured()} />
      </Card>
    </>
  );
}
