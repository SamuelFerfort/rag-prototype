"use client";

import { useState } from "react";
import QuillEditor from "@/components/quill-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { toast } from "sonner";
import { updateMemory } from "@/lib/actions/memories";
import { useRouter } from "next/navigation";

interface MemoryEditorProps {
  projectId: string;
  memoryId: string;
  initialTitle: string;
  initialContent: string;
}

export default function MemoryEditor({
  projectId,
  memoryId,
  initialTitle,
  initialContent,
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
      toast.error("Please enter a title for this memory");
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
        throw new Error(result.error || "Failed to save memory");
      }

      setIsDirty(false);
      toast.success("Memory saved successfully");
      router.refresh(); // Refresh the page to get updated data
    } catch (error) {
      console.error("Error saving memory:", error);
      toast.error("Failed to save memory");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <Input
          type="text"
          placeholder="Enter memory title..."
          value={title}
          onChange={handleTitleChange}
          className="text-2xl font-bold mb-4"
        />
      </CardHeader>
      <CardContent>
        <QuillEditor
          content={content}
          onChange={handleContentChange}
          placeholder="Start typing or paste your content here..."
        />
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {isDirty ? "Unsaved changes" : "All changes saved"}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className="px-4"
          >
            {isSaving ? "Saving..." : "Save Memory"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
