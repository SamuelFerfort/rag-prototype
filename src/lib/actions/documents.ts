"use server";

import { processDocument, processDocumentBuffer } from "../services/langchain";

type BinaryFilePayload = {
  type: string;
  name: string;
  size: number;
  buffer: number[];
};

/**
 * Upload and process a document
 */
export async function uploadDocument(
  filename: string,
  content: string,
  fileType: string = "txt",
) {
  try {
    // Generate document ID
    const timestamp = Date.now();
    const cleanFilename = filename.replace(/\W+/g, "_").toLowerCase();
    const docId = `doc_${cleanFilename}_${timestamp}`;

    // Handle binary files (PDF, DOCX)
    if (fileType === "pdf" || fileType === "docx") {
      // Parse the JSON payload
      let payload: BinaryFilePayload;
      try {
        payload = JSON.parse(content) as BinaryFilePayload;
      } catch (e) {
        throw new Error("Invalid binary file payload");
      }

      // Convert array back to buffer
      const buffer = new Uint8Array(payload.buffer).buffer;

      // Process with appropriate parser
      const result = await processDocumentBuffer(buffer, {
        id: docId,
        filename,
        type: fileType,
        timestamp: new Date().toISOString(),
      });

      return {
        id: docId,
        filename,
        chunkCount: result.chunkCount,
        timestamp,
      };
    }

    // Handle text files
    if (!content || content.trim().length === 0) {
      throw new Error("Document content cannot be empty");
    }

    // Process text document using LangChain
    const result = await processDocument(content, {
      id: docId,
      filename,
      type: fileType,
      timestamp: new Date().toISOString(),
    });

    return {
      id: docId,
      filename,
      chunkCount: result.chunkCount,
      timestamp,
    };
  } catch (error) {
    // Using error: unknown to satisfy TypeScript
    console.error("Document upload error:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to upload document");
  }
}
