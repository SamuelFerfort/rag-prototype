"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Calendar, MoreVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { NewMemoryDialog } from "./NewMemoryDialog";
import Link from "next/link";
import type { Memory } from "@prisma/client";

interface MemoriesTabProps {
  projectId: string;
  memories: Memory[];
}

export default function MemoriesTab({ projectId, memories }: MemoriesTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Memory cards */}
      {memories.map((memory) => (
        <Link href={`/projects/${projectId}/memory/${memory.id}`} key={memory.id}>
          <Card className="border shadow-sm h-full hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <h3 className="font-medium">{memory.name}</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {memory.content
                  ? memory.content.replace(/<[^>]*>/g, "").slice(0, 80) + (memory.content.length > 80 ? "..." : "")
                  : "Sin contenido"}
              </p>
            </CardContent>
            <CardFooter className="pt-2">
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                {format(new Date(memory.createdAt), "dd/MM/yyyy HH:mm:ss")}
              </div>
            </CardFooter>
          </Card>
        </Link>
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