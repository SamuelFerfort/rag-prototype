"use client";

import { ProjectWithRelations } from "@/lib/types/projects";
import { ProjectCard } from "./ProjectCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { NewProjectDialog } from "./NewProjectDialog";
import { ProjectCategory } from "@prisma/client";
import { UserBasic } from "@/lib/types/users";
export default function ProjectList({
  projects,
  categories,
  users,
}: {
  projects: ProjectWithRelations[];
  categories: ProjectCategory[];
  users: UserBasic[];
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Proyectos</h1>
          <p className="text-muted-foreground">
            Gestión de los proyectos y memorias
          </p>
        </div>
        <div className="flex w-full md:w-auto gap-4">
          <Input
            placeholder="Buscar"
            className="w-full md:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            onClick={() => setOpen(true)}
            className="bg-[#0f172a] hover:bg-[#1e293b]"
          >
            Nuevo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
        <Button
          variant="outline"
          className="h-full min-h-[240px] flex flex-col items-center justify-center gap-2 border-dashed"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-10 w-10 text-muted-foreground" />
          <span className="text-muted-foreground">Nuevo proyecto</span>
        </Button>
      </div>

      <NewProjectDialog
        open={open}
        onOpenChange={setOpen}
        categories={categories}
        users={users}
      />
    </div>
  );
}
