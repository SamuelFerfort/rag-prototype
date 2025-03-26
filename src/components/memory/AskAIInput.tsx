"use client";

import { useState } from "react";
import { askAI } from "@/lib/actions/ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AskAIInputProps {
  projectId: string;
  categoryId?: string;
  onResponse: (answer: string) => void;
}

export function AskAIInput({
  projectId,
  categoryId,
  onResponse,
}: AskAIInputProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      toast.error("Please enter a question");
      return;
    }

    setIsLoading(true);
    try {
      const result = await askAI({
        query: query.trim(),
        projectId,
        categoryId,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      onResponse(result.answer || "");
      setQuery("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to get AI response"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center w-full">
      <Input
        type="text"
        placeholder="Ask AI about this project..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1"
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Thinking...
          </>
        ) : (
          "Ask AI"
        )}
      </Button>
    </form>
  );
}
