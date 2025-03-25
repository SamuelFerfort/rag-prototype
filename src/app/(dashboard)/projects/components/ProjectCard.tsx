import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { MoreVertical, User, FolderOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ProjectWithRelations } from "@/lib/types/projects";

export function ProjectCard({ project }: { project: ProjectWithRelations }) {
  return (
    <Card className="w-full border border-zinc-200 hover:border-zinc-300 transition-colors group">
      <CardHeader className="pb-2 flex flex-row justify-between items-start space-y-0">
        <Link
          href={`/projects/${project.id}`}
          className="font-medium text-base text-zinc-900 hover:underline"
        >
          {project.name}
        </Link>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center gap-1 mb-2">
          <Badge
            variant="outline"
            className={`${
              project.status === "ACTIVO"
                ? "bg-zinc-100 text-zinc-800 border-zinc-200"
                : "bg-zinc-50 text-zinc-600 border-zinc-200"
            } rounded-full px-2 py-0.5 text-xs`}
          >
            {project.status === "ACTIVO" ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start pt-0 space-y-2">
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <User className="h-4 w-4" />
          <span>{project.clientName || "Sin cliente asignado"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <FolderOpen className="h-4 w-4" />
          <span>{project.category.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <FileText className="h-4 w-4" />
          <span>{project._count?.memories ?? 0} Memorias</span>
        </div>
      </CardFooter>
    </Card>
  );
}
