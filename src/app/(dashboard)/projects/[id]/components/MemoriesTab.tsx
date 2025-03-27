"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Calendar, MoreVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { NewMemoryDialog } from "./NewMemoryDialog";
import Link from "next/link";
import type { Memory } from "@prisma/client";
import MemoryCard from "./MemoryCard";
interface MemoriesTabProps {
  projectId: string;
  memories: Memory[];
}

export default function MemoriesTab({ projectId, memories }: MemoriesTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Memory cards */}
      {memories.map((memory) => (
       <MemoryCard key={memory.id} memory={memory} projectId={projectId} />
      ))}

      {/* Add new memory card */}
      <Card className="border shadow-sm flex flex-col items-center justify-center h-[220px] cursor-pointer hover:bg-accent/50 transition-colors">
        <NewMemoryDialog projectId={projectId}>
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Plus className="h-8 w-8" />
            <p>Nueva memoria</p>
          </div>
        </NewMemoryDialog>
      </Card>
    </div>
  );
} 