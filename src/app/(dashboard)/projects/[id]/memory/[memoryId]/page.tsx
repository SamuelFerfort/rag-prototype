import { memoryRepository } from "@/lib/db/memory";
import MemoryEditor from "./memory-editor";
export default async function MemoryPage({
  params,
}: {
  params: Promise<{ id: string; memoryId: string }>;
}) {
  const { id, memoryId } = await params;

  const memory = await memoryRepository.findById(memoryId);

  return (
    <div className="max-w-4xl mx-auto py-6">
      <MemoryEditor
        projectId={id}
        memoryId={memoryId}
        initialTitle={memory?.name ?? ""}
        initialContent={memory?.content ?? ""}
      />
    </div>
  );
}
