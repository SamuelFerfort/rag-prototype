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
    <Card className="w-full">
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <Link
          href={`/projects/${project.id}`}
          className="font-bold text-lg hover:underline"
        >
          {project.name}
        </Link>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center gap-1 mb-2">
          <Badge
            variant="outline"
            className={`${
              project.status === "ACTIVO"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            } rounded-full px-2 py-0.5 text-xs`}
          >
            {project.status === "ACTIVO" ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start pt-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <User className="h-4 w-4" />
          <span>{project.clientName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <FolderOpen className="h-4 w-4" />
          <span>{project.category.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>{project._count?.memories ?? 0} Memorias</span>
        </div>
      </CardFooter>
    </Card>
  );
}
