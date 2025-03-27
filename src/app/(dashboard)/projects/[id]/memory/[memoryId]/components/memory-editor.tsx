"use client";

import type React from "react";

import { useState } from "react";
import QuillEditor from "@/components/quill-editor";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateMemory } from "@/lib/actions/memories";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  X,
  ArrowUpFromLine,
} from "lucide-react";
import { AskAIInput } from "@/components/memory/AskAIInput";
import Link from "next/link";

interface MemoryEditorProps {
  projectId: string;
  memoryId: string;
  initialTitle: string;
  initialContent: string;
  categoryId: string;
  projectName: string;
}

export default function MemoryEditor({
  projectId,
  memoryId,
  initialTitle,
  initialContent,
  categoryId,
  projectName,
}: MemoryEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setIsDirty(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Por favor, ingrese un título para esta memoria");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateMemory({
        id: memoryId,
        name: title,
        content,
      });

      if (!result.success) {
        throw new Error("Error al guardar la memoria");
      }

      setIsDirty(false);
      toast.success("Memoria guardada correctamente");
      router.refresh(); // Refresh the page to get updated data
    } catch (error) {
      console.error("Error al guardar la memoria:", error);
      toast.error("Error al guardar la memoria");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAIResponse = (answer: string) => {
    // Insert the AI response at the current cursor position or at the end
    setContent((prevContent) => {
      if (!prevContent) return answer;
      return prevContent + "\n\n" + answer;
    });
    setIsDirty(true);
  };

  return (
    <div className="flex flex-col h-screen bg-white text-black">
      {/* Header */}
      <header className="border-b py-2 px-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <Link
              href={`/projects/${projectId}`}
              className="flex items-center gap-1"
            >
              <span className="text-base">{projectName}</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
            <h1 className="text-black font-bold text-xl">
              {title || "Nombre de la memoria"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              variant="default"
              className=" text-white rounded cursor-pointer "
            >
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
            <Button variant="ghost" size="icon" className="text-[#000000]">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-[#000000]">
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-[#000000]">
              <ArrowUpFromLine className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-[#000000]">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-[#000000]">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Editor content */}
      <div className="flex-1 max-w-4xl w-full mx-auto overflow-y-auto">
        <div className="mt-4 mb-10.5">
          <QuillEditor
            content={content}
            onChange={handleContentChange}
            placeholder="Escribe o pega tu contenido aquí..."
          />
        </div>

        {/* AI Input Section */}
        <AskAIInput
          projectId={projectId}
          categoryId={categoryId}
          onResponse={handleAIResponse}
          currentContent={content}
        />
      </div>
    </div>
  );
}
