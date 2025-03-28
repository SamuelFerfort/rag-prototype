"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MemoriesTab from "./MemoriesTab";
import DetallesTab from "./DetallesTab";
import { ProjectTabsProps } from "@/lib/types/projects";
import { User } from "@prisma/client";
import { UserBasic } from "@/lib/types/users";

export function ProjectTabs({
  project,
  allUsers,
}: ProjectTabsProps & { allUsers: UserBasic[] }) {
  return (
    <Tabs defaultValue="memorias" className="w-full">
      <TabsList className="bg-background mb-6 rounded-full border">
        <TabsTrigger
          value="memorias"
          className=" data-[state=active]:bg-black data-[state=active]:text-white"
        >
          Memorias
        </TabsTrigger>
        <TabsTrigger
          value="detalles"
          className="data-[state=active]:bg-black data-[state=active]:text-white"
        >
          Detalles
        </TabsTrigger>
      </TabsList>

      <TabsContent value="memorias">
        <MemoriesTab projectId={project.id} memories={project.memories} />
      </TabsContent>

      <TabsContent value="detalles">
        <DetallesTab project={project} allUsers={allUsers} />
      </TabsContent>
    </Tabs>
  );
}
