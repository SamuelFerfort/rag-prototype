"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { FC } from "react";
import MemoriesTab from "./MemoriesTab";
import DetallesTab from "./DetallesTab";

interface ProjectTabsProps {
  projectId: string;
  projectName: string;
  memories: any[];
  documents: any[];
}

export function ProjectTabs({ projectId, projectName, memories, documents }: ProjectTabsProps) {
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
        <MemoriesTab projectId={projectId} memories={memories} />
      </TabsContent>
      
      <TabsContent value="detalles">
        <DetallesTab projectId={projectId} documents={documents} />
      </TabsContent>
    </Tabs>
  );
} 