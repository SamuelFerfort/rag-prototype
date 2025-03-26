import { memoryRepository } from "@/lib/db/memory";
import MemoryEditor from "./components/memory-editor";
import { getCurrentUser } from "@/lib/session";

export default async function MemoryPage({
  params,
}: {
  params: Promise<{ id: string; memoryId: string }>;
}) {
  const { id: projectId, memoryId } = await params;
  // This already redirects if there is no user
  await getCurrentUser();

  const memory = await memoryRepository.findById(memoryId);

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-white z-[9999]">
      <MemoryEditor
        projectId={projectId}
        memoryId={memoryId}
        initialTitle={memory?.name ?? ""}
        initialContent={memory?.content ?? ""}
        categoryId={memory?.project.category.id ?? ""}
        projectName={memory?.project.name ?? ""}
      />
    </div>
  );
}
