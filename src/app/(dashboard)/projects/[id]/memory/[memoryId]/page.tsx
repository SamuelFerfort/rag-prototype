// src/app/(dashboard)/projects/[projectId]/memory/[id]/page.tsx
import { memoryRepository } from "@/lib/db/memory";
import { notFound } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";
import MemoryEditor from "./components/MemoryEditor";

export default async function MemoryPage({ 
  params 
}: { 
  params: Promise<{ id: string, memoryId: string }> 
}) {

  const {memoryId} = await params
  const userId = await getCurrentUserId();
  const memory = await memoryRepository.findById(memoryId);
  
  if (!memory) {
    notFound();
  }
  
  return (
    <div className="h-screen flex flex-col">
      <MemoryEditor 
        memory={{
          id: memory.id,
          name: memory.name,
          content: memory.content || "",
          projectId: memory.projectId,
          categoryId: memory.project.category.id,
          categoryName: memory.project.category.name
        }}
      />
    </div>
  );
}