"use client";
import RichTextEditor from "@/components/rich-text-editor";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function MemoryPage({
  params,
}: {
  params: { id: string; memoryId: string };
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // In a full implementation, this would fetch the memory data from the server
  useEffect(() => {
    // Mock loading data - in a real implementation this would be a fetch from the API
    const loadMemory = async () => {
      if (params.memoryId !== "new") {
        // Load existing memory
        try {
          // This would be an API call in a real implementation
          // For now, just simulate a delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Mock data
          setTitle("Sample Memory Title");
          setContent(
            "<h1>Sample Memory Content</h1><p>This is a sample memory that would be loaded from the database.</p>"
          );
          setIsDirty(false);
          setLastSaved(new Date());
        } catch (error) {
          console.error("Error loading memory:", error);
          toast.error("Failed to load memory data");
        }
      }
    };

    loadMemory();
  }, [params.memoryId]);

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
      // This would send data to the server in a real implementation
      // For now, just simulate a network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsDirty(false);
      setLastSaved(new Date());
      toast.success("Memory saved successfully");
    } catch (error) {
      console.error("Error saving memory:", error);
      toast.error("Failed to save memory");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoSave = async () => {
    if (isDirty && title.trim()) {
      setIsSaving(true);
      try {
        // Simulate saving
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setIsDirty(false);
        setLastSaved(new Date());
        toast.success("Auto-saved");
      } catch (error) {
        console.error("Error auto-saving:", error);
        toast.error("Failed to auto-save");
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Auto-save every 60 seconds if content has changed
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirty && title.trim()) {
        handleAutoSave();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isDirty, title, content]);

  return (
    <div className="max-w-4xl mx-auto py-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>
            <Input
              type="text"
              placeholder="Enter memory title"
              value={title}
              onChange={handleTitleChange}
              className="text-xl font-bold border-none shadow-none focus-visible:ring-0 px-0 text-gray-800"
            />
          </CardTitle>
          {lastSaved && (
            <p className="text-sm text-muted-foreground">
              Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </CardHeader>

        <CardContent>
          <RichTextEditor
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
            <Button variant="outline" disabled={isSaving || !isDirty}>
              Cancel
            </Button>
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
    </div>
  );
}
