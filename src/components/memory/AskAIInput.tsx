"use client";

import type React from "react";

import { useState } from "react";
import { askAI } from "@/lib/actions/ai";
import { Button } from "@/components/ui/button";
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
    <form onSubmit={handleSubmit} className="w-full">
      <div className="border  p-4">
        <div className="bg-[#f3f3f3] rounded-md p-4">
          <textarea
            placeholder="Escribir aquí sobre lo que quieres escribir en este apartado..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none resize-none"
            rows={2}
            disabled={isLoading}
          />
        </div>
        <div className="flex justify-end mt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className=" text-white cursor-pointer flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <mask
                    id="mask0_92_269"
                    style={{ maskType: "alpha" }}
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="24"
                    height="24"
                  >
                    <rect width="24" height="24" fill="#D9D9D9" />
                  </mask>
                  <g mask="url(#mask0_92_269)">
                    <path
                      d="M4.4 21L3 19.6L10.525 12.05L6 10.925L10.95 7.85L10.525 2L15 5.775L20.4 3.575L18.225 9L22 13.45L16.15 13.05L13.05 18L11.925 13.475L4.4 21ZM5 8L3 6L5 4L7 6L5 8ZM18 21L16 19L18 17L20 19L18 21Z"
                      fill="white"
                    />
                  </g>
                </svg>
                Generar texto
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
