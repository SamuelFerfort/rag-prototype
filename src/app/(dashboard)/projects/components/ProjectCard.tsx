import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { MoreVertical, User, FolderOpen, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { ProjectWithRelations } from "@/lib/types/projects"

export function ProjectCard({ project }: { project: ProjectWithRelations }) {
  return (
    <Card className="w-full group">
      <CardHeader className="flex flex-row justify-between items-start space-y-0">
        <Link href={`/projects/${project.id}`} className="font-medium hover:underline">
          {project.name}
        </Link>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pb-2">
        <Badge variant={project.status === "ACTIVO" ? "default" : "secondary"} className="rounded-full">
          {project.status === "ACTIVO" ? "Activo" : "Inactivo"}
        </Badge>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{project.clientName || "Sin cliente asignado"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FolderOpen className="h-4 w-4" />
          <span>{project.category.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>{project._count?.memories ?? 0} Memorias</span>
        </div>
      </CardFooter>
    </Card>
  )
}

