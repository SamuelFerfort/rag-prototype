import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ProjectFormState } from "@/helpers/zod/projects-schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitize an ID to be Pinecone-compatible (ASCII only)
 */
export function sanitizeId(id: string): string {
  // Remove any non-ASCII characters and replace spaces/special chars with underscores
  return id
    .normalize("NFD") // Normalize diacritics
    .replace(/[\u0300-\u036f]/g, "") // Remove accent marks
    .replace(/[^\x00-\x7F]/g, "") // Remove remaining non-ASCII chars
    .replace(/[\s.]+/g, "_") // Replace spaces and dots with underscores
    .replace(/[^a-zA-Z0-9_-]/g, "") // Remove any other special characters
    .substring(0, 512); // Ensure it's not too long
}

export const getFileType = (file: File): string => {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";

  if (file.type.includes("pdf") || extension === "pdf") return "pdf";
  if (file.type.includes("word") || extension === "docx" || extension === "doc")
    return "docx";
  if (file.type.includes("text") || extension === "txt") return "txt";
  if (extension === "md") return "md";

  return "txt"; // Default to text
};

export function handleError(error: unknown, defaultMessage: string) {
  console.error(error);

  const errorMessage = error instanceof Error ? error.message : defaultMessage;

  return {
    success: false,
    error: errorMessage,
  };
}

export function handleProjectError(
  error: unknown,
  defaultMessage: string
): ProjectFormState {
  console.error(error);
  const errorMessage = error instanceof Error ? error.message : defaultMessage;

  return {
    status: "error",
    message: errorMessage,
    errors: {},
  };
}

// Add this utility function in src/lib/utils.ts
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}