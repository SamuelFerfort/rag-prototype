import { Card, CardContent } from "@/components/ui/card"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import type { Memory } from "@prisma/client"

interface MemoryCardProps {
  memory: Memory
  projectId: string
}

export default function MemoryCard({ memory, projectId }: MemoryCardProps) {
  return (
    <Link href={`/projects/${projectId}/memory/${memory.id}`}>
      <Card className="h-full transition-all duration-200 hover:bg-zinc-50">
        <CardContent className="p-4">
          <h3 className="font-medium text-zinc-900 mb-2">{memory.name}</h3>
          <p className="text-zinc-500 text-sm line-clamp-2">
            {memory.content
              ? memory.content.replace(/<[^>]*>/g, "").slice(0, 80) + (memory.content.length > 80 ? "..." : "")
              : "Sin contenido"}
          </p>
          <div className="flex items-center mt-3 text-xs text-zinc-400">
            <CalendarIcon className="h-3 w-3 mr-1" />
            {format(new Date(memory.createdAt), "dd/MM/yyyy")}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

