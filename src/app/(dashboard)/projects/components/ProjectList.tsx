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
    <div className="space-y-8 w-full text-black">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
            Proyectos
          </h1>
        
        </div>
        <div className="flex w-full md:w-auto gap-3 mt-3 md:mt-0">
          <Input
            placeholder="Buscar"
            className="w-full md:w-64 border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            onClick={() => setOpen(true)}
            className="cursor-pointer text-white"
          >
            Nuevo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
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
