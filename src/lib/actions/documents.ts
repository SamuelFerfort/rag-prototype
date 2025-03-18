"use server";

import { processDocument } from "../services/langchain";

/**
 * Upload and process a document
 */
export async function uploadDocument(filename: string, content: string) {
  if (!content || content.trim().length === 0) {
    throw new Error("Document content cannot be empty");
  }

  // Generate a unique ID based on filename and timestamp
  const timestamp = Date.now();
  const cleanFilename = filename.replace(/\W+/g, "_").toLowerCase();
  const docId = `doc_${cleanFilename}_${timestamp}`;

  try {
    // Process document using LangChain
    const result = await processDocument(content, {
      id: docId,
      filename,
      source: "upload",
      timestamp: new Date().toISOString(),
    });

    return {
      id: docId,
      filename,
      chunkCount: result.chunkCount,
      timestamp,
    };
  } catch (error: any) {
    console.error("Document upload error:", error);
    throw new Error(
      `Failed to upload document: ${error?.message || "Unknown error"}`,
    );
  }
}
