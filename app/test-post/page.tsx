import { loadClips } from "@/lib/clips";
import { isConfigured } from "@/lib/uploadpost";
import { Card, PageHeader } from "../ui";
import { TestPostForm } from "./form";

export default async function TestPostPage() {
  const { clips, error } = await loadClips();
  const videos = clips.flatMap((c) =>
    c.videos.map((v) => ({ id: v.id, name: v.name, label: `Clip ${c.clip} · ${v.name}` })),
  );
  return (
    <>
      <PageHeader
        title="Send a test"
        sub="Send one video to your accounts to check everything works. Test posts are private, so only you can see them."
      />
      {error && (
        <Card>
          <p className="text-base text-red-600">Can&apos;t read Google Drive: {error}</p>
        </Card>
      )}
      <Card>
        <TestPostForm videos={videos} configured={isConfigured()} />
      </Card>
    </>
  );
}
